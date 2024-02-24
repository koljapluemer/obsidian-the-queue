import * as ebisu from "ebisu-js";
import { TFile } from "obsidian";

type QType =
	| "learn"
	| "learn-started"
	| "todo"
	| "todo-done"
	| "habit"
	| "check"
	| "book"
	| "book-started"
	| "book-finished"
	| "article"
	| "misc"
	| "exclude";

type TimeDurationString = "a bit later" | "day later" | "custom";

export default class QueueNote {
	qData: {
		model: any | null;
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

	constructor(
		noteFile: TFile,
		qType?: QType | null,
		qTopic?: string | null,
		qKeywords?: Array<string> | null,
		qPriority?: number | null,
		qInterval?: number | null,
		qData?: {
			model: any | null;
			lastSeen: Date | null;
			dueAt: Date | null;
			leechCount: number | null;
		},
	) {
		this.qType = qType || null;
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
	}

	// this handles the construction from dirty, real life data
	// we pass in just the metadata from an actual note, and here we do all the optional nulls and what not
	static createFromNoteFile(note: TFile): QueueNote {
		const metadata = app.metadataCache.getFileCache(note);
		const frontmatter = metadata?.frontmatter;
		let qNote: QueueNote;
		if (!frontmatter) {
			return new QueueNote(note);
		} else {
			const qType = frontmatter["q-type"] ?? null;
			const qTopic = frontmatter["q-topic"] ?? null;
			const qKeywords = frontmatter["q-keywords"] ?? null;
			const qPriority = frontmatter["q-priority"] ?? null;
			const qInterval = frontmatter["q-interval"] ?? null;

			const qData = frontmatter["q-data"];
			const model = qData?.["model"] ?? null;
			// TODO: remove "dueat" at some point, this is just legacy from my vault (and now Marta's)
			// (or handle this more elegantly, list of synoyms or something, but that's overkill for now)
			// if due at not set, set 10s into the past
			const dueAtString = qData?.["due-at"] || qData?.["dueat"] || null;
			let dueAt: Date | null = null;
			// convert from date format 2024-03-01T03:00:00.000Z to actual date
			if (dueAtString) {
				dueAt = new Date(dueAtString);
				if (dueAt.toString() === "Invalid Date") {
					console.error(`Invalid date string: ${dueAtString}`);
				}
			}
			const lastSeenString = qData?.["last-seen"] ?? null;
			let lastSeen: Date | null = null;
			if (lastSeenString) {
				lastSeen = new Date(lastSeenString);
				if (lastSeen.toString() === "Invalid Date") {
					console.error(`Invalid date string: ${lastSeenString}`);
				}
			}

			const leechCount = qData?.["leech-count"] ?? null;

			return new QueueNote(
				note,
				qType,
				qTopic,
				qKeywords,
				qPriority,
				qInterval,
				{
					model,
					dueAt,
					lastSeen,
					leechCount,
				}
			);
		}
	}

	getType(): QType {
		let typeOfNote = this.qType || "misc";
		// a finished book is not treated different from a 'misc' card
		if (typeOfNote === "book-finished") {
			typeOfNote = "misc";
		}
		return typeOfNote;
	}

	// we need this so notes metadata does not get filled for no reason
	getActuallyStoredType(): QType | null {
		return this.qType;
	}

	getShouldBeExcluded(): boolean {
		return this.qType === "exclude" || this.qType === "todo-done";
	}

	getKeywords(): Array<string> {
		return this.qKeywords || [];
	}

	getIsCurrentlyDue(): boolean {
		if (!this.qData.dueAt) {
			return true;
		}
		const currentTime = new Date();
		return currentTime > this.qData.dueAt;
	}

	getPredictedRecall(): number {
		if (!this.qData.lastSeen || !this.qData.model) {
			console.error(
				"No last seen string for this note, returning recall % of 0"
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
		if (!this.qData.lastSeen || !this.qData.model) {
			console.error(
				"There is no saved learning data for this note, cannot update recall."
			);
			return;
		}
		const elapsedTime =
			(new Date().getTime() - new Date(this.qData.lastSeen).getTime()) /
			1000 /
			60 /
			60;
		// TODO: validate if the math check out, and what that Math.max is actually doing
		this.qData.model = ebisu.updateRecall(
			this.qData.model,
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

	setModel(model: any): void {
		this.qData.model = model;
	}

	setLastSeen(lastSeen: Date): void {
		this.qData.lastSeen = lastSeen;
	}

	setDueAt(dueAt: Date): void {
		this.qData.dueAt = dueAt;
	}

	startLearning(): void {
		this.qType = "learn-started";
	}

	startReadingBook(): void {
		this.qType = "book-started";
	}

	finishReadingBook(): void {
		this.qType = "book-finished";
	}

	finishReadingArticle(): void {
		this.qType = "misc";
	}

	completeTodo(): void {
		this.qType = "todo-done";
	}

	incrementLeechCount(by: number): void {
		this.qData.leechCount = (this.qData.leechCount || 0) + by;
	}

	resetLeechCount(): void {
		// no need to reset if it's not set (implication is that it's 0, no need to spam metadata)
		if (this.qData.leechCount != null) {
			this.qData.leechCount = 0;
		}
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
					frontmatter["q-data"]["last-seen"] = this.getData().lastSeen;
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
}
