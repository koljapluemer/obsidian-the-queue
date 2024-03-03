import * as ebisu from "ebisu-js";
import { TFile } from "obsidian";
import { PromptType } from "./QueuePrompt";

export enum QType {
	learn = "learn",
	learnStarted = "learn-started",
	todo = "todo",
	todoDone = "todo-done",
	habit = "habit",
	check = "check",
	book = "book",
	bookStarted = "book-started",
	bookFinished = "book-finished",
	article = "article",
	misc = "misc",
	exclude = "exclude",
}

import QueueLog from "./QueueLog";

type TimeDurationString = "a bit later" | "day later" | "custom";

const scenarioHalfLives = {
	hard: 1 / 6,
	medium: 2,
	easy: 24,
	"0": 1 / 6,
	"1": 2,
	"2": 24,
};

/** Represents an Obsidian note's mirror for the Queue plugin */
export default class QueueNote {
	qData: {
		model: object | null;
		lastSeen: Date | null;
		dueAt: Date | null;
		leechCount: number | null;
	};
	qInterval: number | null;
	qPriority: number | null;
	qTopic: string | null;
	qType: QType | null;
	qKeywords: Array<string> | null;
	noteFile: TFile;
	nrOfLinks: number;
	isImprovable: boolean;

	constructor(
		noteFile: TFile,
		nrOfLinks: number,
		qType?: string | null,
		qTopic?: string | null,
		qKeywords?: Array<string> | null,
		qPriority?: number | null,
		qInterval?: number | null,
		qData?: {
			model: object | null;
			lastSeen: Date | null;
			dueAt: Date | null;
			leechCount: number | null;
		}
	) {
		this.qType = (qType as QType) || null;
		this.qTopic = qTopic || null;
		this.qKeywords = qKeywords || null;
		this.qPriority = qPriority || null;
		this.qInterval = qInterval || null;
		this.qData = qData || {
			model: null,
			dueAt: null,
			lastSeen: null,
			leechCount: null,
		};
		this.noteFile = noteFile;
		this.nrOfLinks = nrOfLinks;
		this.isImprovable = false;
	}

	// this handles the construction from dirty, real life data
	// we pass in just the metadata from an actual note, and here we do all the optional nulls and what not
	static createFromNoteFile(note: TFile): QueueNote {
		const metadata = app.metadataCache.getFileCache(note);
		const frontmatter = metadata?.frontmatter;
		const nrOfLinks = metadata?.links?.length || 0;

		if (!frontmatter) {
			return new QueueNote(note, nrOfLinks);
		} else {
			let qType: QType | null = null;
			let qTopic: string | null = null;
			let qKeywords: Array<string> | null = null;
			let qPriority: number | null = null;
			let qInterval: number | null = null;
			let qData: {
				model: object | null;
				lastSeen: Date | null;
				dueAt: Date | null;
				leechCount: number | null;
			} | null = {
				model: null,
				lastSeen: null,
				dueAt: null,
				leechCount: null,
			};

			// check if frontmatter["q-type"] is string
			if (frontmatter["q-type"]) {
				// check if q-type corresponds to a valid value in the QType enum
				if (Object.values(QType).includes(frontmatter["q-type"])) {
					qType = frontmatter["q-type"];
				} else {
					console.warn(
						`Invalid q-type ${frontmatter["q-type"]} for note %c${note.basename}, treating as misc`,
						"color: orange"
					);
				}
			}
			// same for topic
			if (frontmatter["q-topic"] != null) {
				if (typeof frontmatter["q-topic"] === "string") {
					qTopic = frontmatter["q-topic"];
				} else {
					console.warn(
						`Invalid q-topic for note %c${note.basename}`,
						"color: orange"
					);
				}
			}
			// same for keywords, accept string array or string, always make array
			if (frontmatter["q-keywords"] != null) {
				if (Array.isArray(frontmatter["q-keywords"])) {
					qKeywords = frontmatter["q-keywords"];
				} else if (typeof frontmatter["q-keywords"] === "string") {
					qKeywords = [frontmatter["q-keywords"]];
				} else {
					console.warn(
						`Invalid q-keywords for note %c${note.basename}`,
						"color: orange"
					);
					qKeywords = null;
				}
			}
			// same for priority
			if (frontmatter["q-priority"] != null) {
				if (typeof frontmatter["q-priority"] === "number") {
					qPriority = frontmatter["q-priority"];
				} else {
					console.warn(
						`Invalid q-priority for note %c${note.basename}`,
						"color: orange"
					);
				}
			}

			// same for interval
			if (frontmatter["q-interval"] != null) {
				if (typeof frontmatter["q-interval"] === "number") {
					qInterval = frontmatter["q-interval"];
				} else {
					console.warn(
						`Invalid q-interval for note %c${note.basename}`,
						"color: orange"
					);
				}
			}

			// same for q-data.model, check for type object

			if (frontmatter["q-data"]) {
				if (frontmatter["q-data"]["model"] != null) {
					if (typeof frontmatter["q-data"].model === "object") {
						qData.model = frontmatter["q-data"]["model"];
					} else {
						console.warn(
							`Invalid q-data.model for note %c${note.basename}`,
							"color: orange"
						);
					}
				}
			}

			// same for q-data.last-seen, check for type string
			// but then convert to date
			if (frontmatter["q-data"]) {
				if (frontmatter["q-data"]["last-seen"] != null) {
					if (
						typeof frontmatter["q-data"]["last-seen"] === "string"
					) {
						// see if legitimate datestring:
						if (
							new Date(
								frontmatter["q-data"]["last-seen"]
							).toString() === "Invalid Date"
						) {
							console.warn(
								`Invalid date string for q-data.last-seen for note %c${note.basename}`,
								"color: orange"
							);
						} else {
							qData.lastSeen = new Date(
								frontmatter["q-data"]["last-seen"]
							);
						}
					}
				}
			}

			// same for q-data.due-at, check for type string

			// TODO: remove "dueat" at some point, this is just legacy from my vault (and now Marta's)
			// (or handle this more elegantly, list of synoyms or something, but that's overkill for now)
			// if due at not set, set 10s into the past
			if (frontmatter["q-data"]) {
				const dueAtString =
					frontmatter["q-data"]["due-at"] ||
					frontmatter["q-data"]["dueat"] ||
					null;
				if (dueAtString != null && typeof dueAtString === "string") {
					const dueAtDate = new Date(dueAtString);
					if (dueAtDate.toString() === "Invalid Date") {
						console.warn(
							`Invalid date string for q-data.due-at for note %c${note.basename}`,
							"color: orange"
						);
					} else {
						qData.dueAt = dueAtDate;
					}
				}
			}

			// check leech-count for type number
			if (frontmatter["q-data"]) {
				if (frontmatter["q-data"]["leech-count"] != null) {
					if (
						typeof frontmatter["q-data"]["leech-count"] === "number"
					) {
						qData.leechCount = frontmatter["q-data"]["leech-count"];
					} else {
						console.warn(
							`Invalid q-data.leech-count for note %c${note.basename}`,
							"color: orange"
						);
					}
				}
			}

			// console.info(
			// 	`Loaded note ${note.basename} from file, creating following object: \n qType: ${qType} \n qTopic: ${qTopic} \n qKeywords: ${qKeywords} \n qPriority: ${qPriority} \n qInterval: ${qInterval} \n qData: ${qData}`
			// );

			return new QueueNote(
				note,
				nrOfLinks,
				qType,
				qTopic,
				qKeywords,
				qPriority,
				qInterval,
				qData
			);
		}
	}

	async setIsImprovable() {
		// read note content:
		app.vault.read(this.noteFile).then((content) => {
			const settingsCookie = sessionStorage.getItem("the-queue-settings");
			if (settingsCookie != null) {
				const settings = JSON.parse(settingsCookie);
				// check if settings.improvablesKeyword is in the note
				if (content.includes(settings?.improvablesKeyword)) {
					this.isImprovable = true;
					// console.log(
					// `Note ${note.basename} is improvable, because it contains the keyword ${settings?.improvablesKeyword}`
					// );
				}
			}
		});
	}

	getType(): QType {
		// a finished book is not treated different from a 'misc' note
		// unspecified (or illegal) types are also treated as 'misc'
		// TODO: check if this works
		let pragmaticType = this.qType || QType.misc;
		if (pragmaticType === QType.bookFinished) {
			pragmaticType = QType.misc;
		}
		return pragmaticType;
	}

	// we need this so notes metadata does not get filled for no reason
	getActuallyStoredType(): QType | null {
		return this.qType;
	}

	guessPromptType(): PromptType {
		if (this.getType() === "learn") {
			return "newLearns";
		}
		if (this.getType() === "learn-started") {
			return "startedLearnNoteMostCloseToForgetting";
		}
		if (this.getType() === "book") {
			return "newBooks";
		}
		if (this.getType() === "book-started") {
			return "dueStartedBooks";
		}
		if (this.getType() === "check") {
			return "dueChecks";
		}
		if (this.getType() === "habit") {
			return "dueHabits";
		}
		if (this.getType() === "todo") {
			return "dueTodos";
		}
		if (this.getType() === "article") {
			return "dueArticles";
		}
		return "dueMisc";
	}

	getShouldBeExcluded(): boolean {
		return this.qType === "exclude" || this.qType === "todo-done";
	}

	getKeywords(): Array<string> {
		return this.qKeywords || [];
	}

	getIsCurrentlyDue(): boolean {
		// if learn-started, check if predicted recall is below threshold
		if (this.getType() === QType.learnStarted) {
			const settingsCookie = sessionStorage.getItem("the-queue-settings");

			if (settingsCookie != null) {
				const settings = JSON.parse(settingsCookie);
				const desiredRecallThreshold = settings?.desiredRecallThreshold;
				if (desiredRecallThreshold != null) {
					const isDue =
						this.getPredictedRecall() <
						desiredRecallThreshold.valueOf();
					return isDue;
				}
			}
		}
		if (!this.qData.dueAt) {
			return true;
		}
		const currentTime = new Date();
		return currentTime > this.qData.dueAt;
	}

	getPredictedRecall(): number {
		if (!this.qData.lastSeen || !this.qData.model) {
			console.warn(
				`No last seen string for note ${this.noteFile.basename}, returning recall % of 0`
			);
			return 0;
		}
		const elapsedTime =
			(new Date().getTime() - new Date(this.qData.lastSeen).getTime()) /
			1000 /
			60 /
			60;

		return ebisu.predictRecall(this.qData.model, elapsedTime, true);
	}

	setNewModel(score: number): void {
		let model = this.qData.model;
		let lastSeen = this.qData.lastSeen;
		if (lastSeen == null || model == null) {
			console.warn(
				`There is no saved learning data for note ${this.noteFile.basename}, model may be distorted.`
			);
			model = ebisu.defaultModel(
				(scenarioHalfLives as any)[score.toString()]
			);
			lastSeen = new Date();
		}
		const elapsedTime =
			(new Date().getTime() - new Date(lastSeen).getTime()) /
			1000 /
			60 /
			60;
		// TODO: validate if the math check out, and what that Math.max is actually doing
		this.qData.model = ebisu.updateRecall(
			model,
			score,
			2,
			Math.max(elapsedTime, 0.01)
		);
		this.qData.lastSeen = new Date();
	}

	getInterval(): number {
		return this.qInterval || 1;
	}

	getActuallyStoredInterval(): number | null {
		return this.qInterval;
	}

	setModel(model: object): void {
		this.qData.model = model;
	}

	setLastSeen(lastSeen: Date): void {
		this.qData.lastSeen = lastSeen;
	}

	setDueAt(dueAt: Date): void {
		this.qData.dueAt = dueAt;
	}

	startLearning(): void {
		this.qType = QType.learnStarted;
	}

	startReadingBook(): void {
		this.qType = QType.bookStarted;
	}

	finishReadingBook(): void {
		this.qType = QType.bookFinished;
	}

	finishReadingArticle(): void {
		this.qType = QType.misc;
	}

	completeTodo(): void {
		this.qType = QType.todoDone;
	}

	incrementLeechCount(by: number): void {
		this.qData.leechCount = (this.qData.leechCount || 0) + by;
	}

	decrementLeechCount(by: number): void {
		if (this.qData.leechCount != null) {
			this.qData.leechCount = (this.qData.leechCount || 0) - by;
		}
	}

	resetLeechCount(): void {
		// no need to reset if it's not set (implication is that it's 0, no need to spam metadata)
		if (this.qData.leechCount != null) {
			this.qData.leechCount = 0;
		}
	}
	getLeechCount(): number {
		return this.qData.leechCount || 0;
	}

	getShouldReceiveLeechTreatment(): boolean {
		// true if leech count is divisible by 3 and not 0
		// TODO: adapt these nrs, maybe even make them a setting
		return this.getLeechCount() % 3 === 0 && this.getLeechCount() !== 0;
	}

	setDueLater(timeDuration: TimeDurationString): void {
		const currentTime = new Date();
		const newDueAt = new Date(currentTime);
		if (timeDuration === "a bit later") {
			newDueAt.setMinutes(currentTime.getMinutes() + 10);
		} else {
			// handles 'day later' and custom'
			// if interval is less than 1, convert to actual time and just add
			if (this.getInterval() < 1) {
				const minutesToAdd = this.getInterval() * 60 * 24;
				newDueAt.setMinutes(currentTime.getMinutes() + minutesToAdd);
			} else if (this.getInterval() >= 1) {
				// find the next 4am in local time and set it to that
				newDueAt.setHours(4);
				newDueAt.setMinutes(0);
				newDueAt.setSeconds(0);
				newDueAt.setMilliseconds(0);
				if (newDueAt < currentTime) {
					newDueAt.setDate(newDueAt.getDate() + 1);
				}
				if (timeDuration === "custom") {
					// calculate rest of the days with 24h
					newDueAt.setDate(
						newDueAt.getDate() + (this.getInterval() - 1)
					);
				}
			}
		}
		this.qData.dueAt = newDueAt;
	}

	incrementPriority(by: number): void {
		this.qPriority = this.getPriority() + by;
	}

	decrementPriority(by: number): void {
		this.qPriority = this.getPriority() - by;
	}

	getPriority(): number {
		return this.qPriority || 1;
	}

	getActuallyStoredPriority(): number | null {
		return this.qPriority;
	}

	getData(): object | null {
		return this.qData;
	}

	getTopic(): string | null {
		return this.qTopic;
	}

	getBasename(): string {
		return this.noteFile.basename;
	}

	getNoteFile(): TFile {
		return this.noteFile;
	}

	getNrOfLinks(): number {
		return this.nrOfLinks;
	}

	adaptByScore(answer: string) {
		if (this.getType() === "learn") {
			const model = ebisu.defaultModel(
				(scenarioHalfLives as any)[answer]
			);
			this.setModel(model);
			this.setLastSeen(new Date());
			this.startLearning();
		}

		// learning notes that we have seen before
		// TODO: make stuff like this robust against metadata being broken/missing (and think about what to even do)
		if (this.getType() === "learn-started") {
			// score: wrong = 0, correct = 1, easy = 2
			const score = answer === "wrong" ? 0 : answer === "correct" ? 1 : 2;
			// handle leech counting
			if (score === 0) {
				this.incrementLeechCount(1);
			} else {
				this.resetLeechCount();
			}
			this.setNewModel(score);
		}

		// note: "book" means *unstarted* book
		if (this.getType() === "book") {
			// if later, set in 10m
			if (answer === "later") {
				this.setDueLater("a bit later");
			} else {
				this.setDueLater("day later");
			}
			// only convert to started if answer is not "not-today" or "later"
			if (answer !== "not-today" && answer !== "later") {
				this.startReadingBook();
			}
		}

		if (this.getType() === "book-started") {
			if (answer === "later") {
				this.setDueLater("a bit later");
				this.incrementLeechCount(0.5);
			} else if (answer === "not-today") {
				this.setDueLater("day later");
				this.incrementLeechCount(1);
			} else if (answer === "done") {
				this.setDueLater("day later");
				this.resetLeechCount();
			} else if (answer === "finished") {
				this.setDueLater("day later");
				this.resetLeechCount();
				this.finishReadingBook();
			}
		}

		// article works essentially the same as book-started
		if (this.getType() === "article") {
			if (answer === "later") {
				this.setDueLater("a bit later");
				this.incrementLeechCount(0.5);
			} else {
				this.setDueLater("day later");
				this.incrementLeechCount(1);
			}
			// check if finished
			if (answer === "finished") {
				this.finishReadingArticle();
			}
		}

		if (this.getType() === "habit") {
			if (answer === "later") {
				this.setDueLater("a bit later");
				this.incrementLeechCount(0.5);
			} else if (answer === "not-today") {
				this.setDueLater("day later");
				this.incrementLeechCount(1);
			} else if (answer === "done") {
				this.setDueLater("custom");
				this.resetLeechCount();
			}
		}

		if (this.getType() === "check") {
			// note "kind-of" currently does nothing special
			if (answer === "no") {
				this.incrementLeechCount(1);
			} else if (answer === "yes") {
				this.resetLeechCount();
			}
			this.setDueLater("custom");
		}

		// just handle the special case of todo being completed (due is handled in the condition before)
		if (this.getType() === "todo") {
			if (answer === "later") {
				this.setDueLater("a bit later");
				this.incrementLeechCount(0.5);
			} else if (answer === "not-today") {
				this.setDueLater("day later");
				this.incrementLeechCount(1);
			} else if (answer === "completed") {
				this.completeTodo();
				this.resetLeechCount();
			}
		}

		if (this.getType() === "misc") {
			if (answer === "show-less") {
				this.decrementPriority(1);
			} else if (answer === "show-more") {
				this.incrementPriority(1);
			}
			this.setDueLater("day later");
		}

		QueueLog.addLog("note-done", {
			noteAfterScoring: this.getQueueValuesAsObj(),
			answer: answer,
		});
	}

	save(): void {
		if (!this.noteFile) {
			console.error("No note file to save to");
			return;
		}
		app.fileManager.processFrontMatter(this.noteFile, (frontmatter) => {
			if (this.getActuallyStoredType() != null) {
				frontmatter["q-type"] = this.getActuallyStoredType();
			}
			if (this.getActuallyStoredInterval() != null) {
				frontmatter["q-interval"] = this.getActuallyStoredInterval();
			}
			if (this.getActuallyStoredPriority() != null) {
				frontmatter["q-priority"] = this.getActuallyStoredPriority();
			}
			if (this.getData() != null) {
				function createEmptyQDataIfNeeded() {
					if (!frontmatter["q-data"]) {
						frontmatter["q-data"] = {};
					}
				}
				// nested if so we don't paste an empty object on the note
				// but we still check for every prop whether we actually need it
				if (this.getData().model != null) {
					createEmptyQDataIfNeeded();
					frontmatter["q-data"]["model"] = this.getData().model;
				}
				if (this.getData().lastSeen != null) {
					createEmptyQDataIfNeeded();
					frontmatter["q-data"]["last-seen"] =
						this.getData().lastSeen;
				}
				if (this.getData().leechCount != null) {
					createEmptyQDataIfNeeded();
					frontmatter["q-data"]["leech-count"] =
						this.getData().leechCount;
				}
				if (this.getData().dueAt != null) {
					createEmptyQDataIfNeeded();
					frontmatter["q-data"]["due-at"] = this.getData().dueAt;
				}
			}
		});
	}

	getQueueValuesAsObj(): object {
		return {
			name: this.noteFile.basename,
			qType: this.qType,
			qTopic: this.qTopic,
			qKeywords: this.qKeywords,
			qPriority: this.qPriority,
			qInterval: this.qInterval,
			qData: this.qData,
		};
	}
}
