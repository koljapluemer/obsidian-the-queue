import { Plugin } from "obsidian";

import QueueSettingsTab from "./elements/QueueSettingsTab";
import TheQueueModal from "./elements/TheQueueModal";

interface TheQueueSettings {
	desiredRecallThreshold: number;
}

const DEFAULT_SETTINGS: Partial<TheQueueSettings> = {
	desiredRecallThreshold: 0.8,
};

/** The outer plugin class.
 * Tasked with adding the ribbon button opening the modal, initializing the settings, and housekeeping like clearing up when closing.
 *
 */
export default class TheQueue extends Plugin {
	settings: TheQueueSettings;

	async onload() {
		// This creates an icon in the left ribbon.
		const queueInstantIconEl = this.addRibbonIcon(
			"dice",
			"Instant Queue",
			(evt: MouseEvent) => {
				/** Here, the modal where the action happens is opened; see class definition */
				new TheQueueModal(this.app, this.settings).open();
			}
		);
		// add settings tab
		await this.loadSettings();
		this.addSettingTab(new QueueSettingsTab(this.app, this));
		// event listener for file renames
		// this is important so that the same note can be opened in queue, even if it's renamed
		app.vault.on("rename", function (file, oldname) {
			// if old_name corresponds to localstorage.lastOpenedNoteName, update it localstorage
			if (localStorage.getItem("lastOpenedNoteName") === oldname) {
				localStorage.setItem("lastOpenedNoteName", file.name);
			}
		});
	}

	onunload() {}

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
