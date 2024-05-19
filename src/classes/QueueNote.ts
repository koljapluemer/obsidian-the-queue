
import { TFile } from "obsidian";
import { PromptType } from "./QueuePrompt";

import {
	createEmptyCard,
	formatDate,
	fsrs,
	generatorParameters,
	Rating,
	Grades,
	RecordLogItem,
	RecordLog,
} from "ts-fsrs";
const params = generatorParameters({ enable_fuzz: true });
const f = fsrs(params);

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
		lastSeen: Date | null;
		dueAt: Date | null;
		leechCount: number | null;
		fsrsData: object | null;
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
			lastSeen: Date | null;
			dueAt: Date | null;
			leechCount: number | null;
			fsrsData: object | null;
		}
	) {
		this.qType = (qType as QType) || null;
		this.qTopic = qTopic || null;
		this.qKeywords = qKeywords || null;
		this.qPriority = qPriority || null;
		this.qInterval = qInterval || null;
		this.qData = qData || {
			dueAt: null,
			lastSeen: null,
			leechCount: null,
			fsrsData: null,
		};
		this.noteFile = noteFile;
		this.nrOfLinks = nrOfLinks;
		this.isImprovable = false;
	}

	// this handles the construction from dirty, real life data
	// we pass in just the metadata from an actual note, and here we do all the optional nulls and what not
	static createFromNoteFile(note: TFile, app: any): QueueNote {
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
				lastSeen: Date | null;
				dueAt: Date | null;
				leechCount: number | null;
				fsrsData: object | null;
			} | null = {
				lastSeen: null,
				dueAt: null,
				leechCount: null,
				fsrsData: null,
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

			// same for q-data.fsrs-data, check for type object
			if (frontmatter["q-data"]) {
				if (frontmatter["q-data"]["fsrs-data"] != null) {
					if (
						typeof frontmatter["q-data"]["fsrs-data"] === "object"
					) {
						qData.fsrsData = frontmatter["q-data"]["fsrs-data"];
					} else {
						console.warn(
							`Invalid q-data.fsrs-data for note %c${note.basename}`,
							"color: orange"
						);
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

	async setIsImprovable(app: any, settings: any) {
		// read note content:
		app.vault.cachedRead(this.noteFile).then((content: any) => {
			// TODO: do not do this via cookie
			// check if settings.improvablesKeyword is in the note
			if (content.includes(settings.improvablesKeyword)) {
				this.isImprovable = true;
			} else {
				this.isImprovable = false;
			}
		});
	}

	getType(): QType {
		// a finished book is not treated different from a 'misc' note
		// unspecified (or illegal) types are also treated as 'misc'
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
			return "learnStarted";
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
		// if we ask fsrs, check this.qData.fsrsData.due
		if (this.getType() === QType.learnStarted) {
			if (this.qData.fsrsData) {
				const fsrsDue = this.qData.fsrsData.due;
				if (fsrsDue) {
					const currentTime = new Date();
					const dueDate = new Date(fsrsDue);
					return currentTime > dueDate;
				}
			}
			return false;
		}
		if (!this.qData.dueAt) {
			return true;
		}
		const currentTime = new Date();
		return currentTime > this.qData.dueAt;
	}

	setNewModel(score: number): void {
		let lastSeen = this.qData.lastSeen;
		// save previous seen date, if it's not null (otherwise set to now)
		// this is needed for fsrs later
		const seenBeforeThis = lastSeen || new Date();
		// FSRS
		// check if qData.fsrsData is set, if not, create a new one
		if (!this.qData.fsrsData) {
			this.qData.fsrsData = createEmptyCard(seenBeforeThis);
		}
		const fsrs_card = this.qData.fsrsData;

		const now = new Date();
		const potential_card_schedules: RecordLog = f.repeat(fsrs_card, now);
		const rating_dict = {
			1: Rating.Again,
			2: Rating.Hard,
			3: Rating.Good,
			4: Rating.Easy,
		};
		const rating: Rating = rating_dict[score];
		const fsrs_model: RecordLogItem = potential_card_schedules[rating];
		this.qData.fsrsData = fsrs_model.card;
	}

	getInterval(): number {
		return this.qInterval || 1;
	}

	getActuallyStoredInterval(): number | null {
		return this.qInterval;
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
		return this.getLeechCount() % 4 === 0 && this.getLeechCount() !== 0;
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

	getData(): any | null {
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
			this.setLastSeen(new Date());
			this.startLearning();
		}

		// learning notes that we have seen before
		if (this.getType() === "learn-started") {
			const scoreValueDict = {
				wrong: 1,
				hard: 2,
				correct: 3,
				easy: 4,
			} as any;
			let score = scoreValueDict[answer];
			// if 'undefined', set to 1(it's a new card)
			if (score === undefined) {
				score = 2;
			}
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
			} else if (answer === "not-today") {
				this.setDueLater("day later");
				this.incrementLeechCount(1);
			} else if (answer === "done") {
				this.setDueLater("day later");
				this.resetLeechCount();
			} else if (answer === "finished") {
				this.setDueLater("day later");
				this.resetLeechCount();
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

	save(app: any): void {
		if (!this.noteFile) {
			console.error("No note file to save to");
			return;
		}
		app.fileManager.processFrontMatter(
			this.noteFile,
			(frontmatter: any) => {
				if (this.getActuallyStoredType() != null) {
					frontmatter["q-type"] = this.getActuallyStoredType();
				}
				if (this.getActuallyStoredInterval() != null) {
					frontmatter["q-interval"] =
						this.getActuallyStoredInterval();
				}
				if (this.getActuallyStoredPriority() != null) {
					frontmatter["q-priority"] =
						this.getActuallyStoredPriority();
				}
				if (this.getData() != null) {
					function createEmptyQDataIfNeeded() {
						if (!frontmatter["q-data"]) {
							frontmatter["q-data"] = {};
						}
					}
					// nested if so we don't paste an empty object on the note
					// but we still check for every prop whether we actually need it
					if (this.getData().fsrsData != null) {
						createEmptyQDataIfNeeded();
						frontmatter["q-data"]["fsrs-data"] =
							this.getData().fsrsData || {};
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
			}
		);
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
