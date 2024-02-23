import * as ebisu from "ebisu-js";

type QType =
	| "learn"
	| "learn-started"
	| "todo"
	| "habit"
	| "check"
	| "book"
	| "book-started"
	| "article"
	| "misc"
	| "exclude";

export default class QueueNote {
	qData: {
		model: any | null;
		lastSeen: Date | null;
		dueAt: Date;
		leechCount: number | null;
	};
	qInterval: number | null;
	qPriority: number | null;
	qTopic: string | null;
	qType: QType | null;
	qKeywords: Array<string> | null;

	constructor(
		qType?: QType | null,
		qTopic?: string | null,
		qKeywords?: Array<string> | null,
		qPriority?: number | null,
		qInterval?: number | null,
		qData?: {
			model: any | null;
			lastSeen: Date;
			dueAt: Date;
			leechCount: number | null;
		}
	) {
		this.qType = qType || null;
		this.qTopic = qTopic || null;
		this.qKeywords = qKeywords || null;
		this.qPriority = qPriority || null;
		this.qInterval = qInterval || null;
		this.qData = qData || {
			model: null,
			dueAt: new Date(),
			lastSeen: null,
			leechCount: null,
		};
	}

	getType(): QType {
		return this.qType || "misc";
	}

	getShouldBeExcluded(): boolean {
		return this.qType === "exclude";
	}

	getKeywords(): Array<string> {
		return this.qKeywords || [];
	}

	getIsCurrentlyDue(): boolean {
		const currentTime = new Date().toISOString();
		return currentTime > this.qData.dueAt.toISOString();
	}

	getPredictedRecall(): number {
		if (!this.qData.lastSeen || !this.qData.model) {
			console.error(
				"No last seen date for this note, returning recall % of 0"
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
}
