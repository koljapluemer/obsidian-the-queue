import { App, Notice, TFile } from "obsidian";


export interface QueueNoteOptions {
	dueAt?: Date;
	interval?: number;
	priority?: number;
	qType?: string;
	keywords?: Array<string>;
	data?: {
		lastSeen?: Date;
		dueAt?: Date;
		leechCount?: number;
		fsrsData?: object;
	};
}

export class QueueNote {
	constructor(
		public file: TFile,
		public app: App,
		private _qType?: string,
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

	// Check if the note is due
	isDue(): boolean {
		if (!this._data?.dueAt) {
			return true; // Assume it's due if no due date is set
		}
		const now = new Date();
		return now >= this._data.dueAt;
	}

	// Getters and setters for all properties

	get qType(): string | null {
		console.log("retunring qType", this._qType);
		return this._qType || null;
	}

	set qType(value: string | null) {
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

	setDueInNDays(n: number): void {
		const now = new Date();
		now.setDate(now.getDate() + n);
		this.dueAt = now;
	}

	// Static method to create a QueueNote from frontmatter
	static fromFile(file: TFile, app: App): QueueNote | null {
		const frontmatter = app.metadataCache.getFileCache(file)?.frontmatter;
		console.log("frontmatter", frontmatter);
		if (!frontmatter) {
			return null;
		}

		const qType: string = frontmatter["q-type"] || undefined;
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
		console.log("Saving updates...");
		const frontmatter = this.getFrontmatter();
		console.log("frontmatter to save:", frontmatter);
		console.log("frontmatter exists");
		frontmatter["q-type"] = this.qType;
		frontmatter["q-keywords"] = this.keywords;
		frontmatter["q-priority"] = this.priority;
		frontmatter["q-interval"] = this.interval;

		frontmatter["q-data"] = {
			// last-seen: timestamp right now
			"last-seen": new Date().toISOString(),
			"due-at": this.data?.dueAt?.toISOString() || undefined,
			"leech-count": this.data?.leechCount || undefined,
			"fsrs-data": this.data?.fsrsData || undefined,
		};

		await this.updateSpecifiedFrontmatter(this.file, frontmatter, this.app);
	}

	// Fetch frontmatter from the note
	getFrontmatter() {
		return (
			this.app.metadataCache.getFileCache(this.file)?.frontmatter || {}
		);
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

	// Helper function to recursively merge frontmatter updates
	deepMerge(target: any, source: any) {
		for (const key of Object.keys(source)) {
			// if value if undefined, skip
			if (source[key] === undefined || source[key] === null || source[key] === "") {
				continue;
			}

			if (
				source[key] &&
				typeof source[key] === "object" &&
				!Array.isArray(source[key])
			) {
				if (!target[key]) {
					target[key] = {};
				}
				this.deepMerge(target[key], source[key]);
			} else {
				target[key] = source[key];
			}
		}
	}

	async updateSpecifiedFrontmatter(
		file: TFile,
		updates: Record<string, any>,
		app: App
	) {
		try {
			// Use processFrontMatter to update or add properties
			await app.fileManager.processFrontMatter(file, (frontmatter) => {
				// Recursively merge updates into the current frontmatter
				this.deepMerge(frontmatter, updates);
			});

			new Notice("Frontmatter updated successfully");
		} catch (error) {
			new Notice(`Failed to update frontmatter: ${error.message}`);
		}
	}
}
