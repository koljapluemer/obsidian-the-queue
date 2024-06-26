import { Plugin } from "obsidian";

import QueueSettingsTab from "./elements/QueueSettingsTab";
import QueueModal from "./elements/QueueModal";
import QueueLog from "./classes/QueueLog";

interface TheQueueSettings {
	improvablesKeyword: string;
	booksActiveMax: number;
	disableLeechPrompts: boolean;
	disableImprovablesPrompts: boolean;
	excludedFolders: string[];
}

const DEFAULT_SETTINGS: Partial<TheQueueSettings> = {
	improvablesKeyword: "needs-improvement",
	booksActiveMax: 5,
	disableLeechPrompts: false,
	disableImprovablesPrompts: false,
	excludedFolders: [],
};

/** The outer plugin class.
 * Tasked with adding the ribbon button opening the modal, initializing the settings, and housekeeping like clearing up when closing.
 *
 */
export default class TheQueue extends Plugin {
	settings: TheQueueSettings;

	async onload() {
		// This creates an icon in the left ribbon.
		this.addRibbonIcon("sticky-note", "Start your queue", (evt: MouseEvent) => {
			/** Here, the modal where the action happens is opened; see class definition */
			new QueueModal(this.app, this.settings).open();
		});
		// add settings tab
		await this.loadSettings();
		this.addSettingTab(new QueueSettingsTab(this.app, this));
		// event listener for file renames
		// this is important so that the same note can be opened in queue, even if it's renamed
		this.registerEvent(
			this.app.vault.on("rename", function (file, oldname) {
				// if old_name corresponds to localstorage.lastOpenedNoteName, update it localstorage
				if (localStorage.getItem("lastOpenedNoteName") === oldname) {
					localStorage.setItem("lastOpenedNoteName", file.name);
				}
			})
		);

		QueueLog.loadFromLocalStorage();
	}

	onunload() {
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
