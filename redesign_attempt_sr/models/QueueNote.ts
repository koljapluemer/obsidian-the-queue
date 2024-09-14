import { TFile, App } from "obsidian";
import { NoteTypeStrategy } from "../types/NoteTypeStrategy";

export type QType = "habit" | "misc" | "article";


export interface QueueNoteOptions {
	dueAt?: Date;
	interval?: number;
	priority?: number;
	qType?: QType;
	keywords?: Array<string>;
	data?: {
		lastSeen?: Date;
		dueAt?: Date;
		leechCount?: number;
		fsrsData?: object;
	};
}

export class QueueNote {
	private strategy: NoteTypeStrategy | null = null;

	constructor(
		public file: TFile,
		public app: App,
		private _qType?: QType,
		private _keywords?: Array<string>,
		private _priority?: number,
		private _interval?: number,
		private _data?: {
			lastSeen?: Date;
			dueAt?: Date;
			leechCount?: number;
			fsrsData?: object;
		}
	) {}

	// Set the strategy for this note
	setStrategy(strategy: NoteTypeStrategy): void {
		this.strategy = strategy;
	}

    getButtons(): HTMLElement[] {
        if (this.strategy) {
            return this.strategy.getButtons(this);
        }
        return [];
    }

	// Check if the note is due
	isDue(): boolean {
		if (!this._data?.dueAt) {
			return true; // Assume it's due if no due date is set
		}
		const now = new Date();
		return now >= this._data.dueAt;
	}

	// Getters and setters for all properties

	get qType(): QType | null {
		return this._qType || null;
	}

	set qType(value: QType | null) {
		this._qType = value || undefined;
	}

	get keywords(): Array<string> | null {
		return this._keywords || null;
	}

	set keywords(value: Array<string> | null) {
		this._keywords = value || undefined;
	}

	get priority(): number | null {
		return this._priority || null;
	}

	set priority(value: number | null) {
		this._priority = value !== null ? value : undefined;
	}

	get interval(): number | null {
		return this._interval || null;
	}

	set interval(value: number | null) {
		this._interval = value !== null ? value : undefined;
	}

	get data(): {
		lastSeen?: Date;
		dueAt?: Date;
		leechCount?: number;
		fsrsData?: object;
	} | null {
		return this._data || null;
	}

	set data(
		value: {
			lastSeen?: Date;
			dueAt?: Date;
			leechCount?: number;
			fsrsData?: object;
		} | null
	) {
		this._data = value || undefined;
	}

	get dueAt(): Date | null {
		return this._data?.dueAt || null;
	}

	set dueAt(value: Date | undefined) {
		if (!this._data) {
			this._data = {
				lastSeen: undefined,
				dueAt: undefined,
				leechCount: undefined,
				fsrsData: undefined,
			};
		}
		this._data.dueAt = value;
	}

	// Static method to create a QueueNote from frontmatter
	static fromFrontmatter(file: TFile, app: App): QueueNote | null {
		const frontmatter = app.metadataCache.getFileCache(file)?.frontmatter;
		if (!frontmatter) {
			return null;
		}

		const qType: QType = frontmatter["q-qType"] || undefined;
		const keywords: Array<string> = frontmatter["q-keywords"] || undefined;
		const priority: number = frontmatter["q-priority"] || undefined;
		const interval: number = frontmatter["q-interval"] || undefined;

		const data = {
			lastSeen: frontmatter["q-data"]?.["last-seen"]
				? new Date(frontmatter["q-data"]["last-seen"])
				: undefined,
			dueAt: frontmatter["q-data"]?.["due-at"]
				? new Date(frontmatter["q-data"]["due-at"])
				: undefined,
			leechCount: frontmatter["q-data"]?.["leech-count"] || undefined,
			fsrsData: frontmatter["q-data"]?.["fsrs-data"] || undefined,
		};

		return new QueueNote(
			file,
			app,
			qType,
			keywords,
			priority,
			interval,
			data
		);
	}

	// Save the updated note properties to the frontmatter
	async saveUpdates() {
		const frontmatter = this.getFrontmatter();
		if (frontmatter) {
			frontmatter["q-type"] = this.qType;
			frontmatter["q-keywords"] = this.keywords;
			frontmatter["q-priority"] = this.priority;
			frontmatter["q-interval"] = this.interval;

			frontmatter["q-data"] = {
				"last-seen": this.data?.lastSeen?.toISOString() || undefined,
				"due-at": this.data?.dueAt?.toISOString() || undefined,
				"leech-count": this.data?.leechCount || undefined,
				"fsrs-data": this.data?.fsrsData || undefined,
			};

			await this.saveFrontmatter(frontmatter);
		}
	}

	// Fetch frontmatter from the note
	getFrontmatter() {
		return (
			this.app.metadataCache.getFileCache(this.file)?.frontmatter || null
		);
	}

	// Save the updated frontmatter to the file
	async saveFrontmatter(frontmatter: any) {
		const content = await this.file.vault.read(this.file);
		const updatedContent = this.updateFrontmatter(content, frontmatter);
		await this.file.vault.modify(this.file, updatedContent);
	}

	// Helper method to update frontmatter in the content
	private updateFrontmatter(content: string, frontmatter: any): string {
		return content; // Placeholder logic for updating frontmatter
	}

	increasePriority(): void {
		// If priority is not set, assume it starts from 0
		const currentPriority = this.priority ?? 0;
		this.priority = currentPriority + 1;
	}

	decreasePriority(): void {
		const currentPriority = this.priority ?? 0;
		this.priority = Math.max(0, currentPriority - 1);
	}
}
