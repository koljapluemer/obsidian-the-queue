import {
	Plugin,
} from "obsidian";

import QueueSettingsTab from "./components/QueueSettingsTab";
import TheQueueModal from "./components/TheQueueModal";


interface TheQueueSettings {
	desiredRecallThreshold: number;
}

const DEFAULT_SETTINGS: Partial<TheQueueSettings> = {
	desiredRecallThreshold: 0.8,
};

export default class TheQueue extends Plugin {
	settings: TheQueueSettings;

	async onload() {
		// This creates an icon in the left ribbon.
		const queueInstantIconEl = this.addRibbonIcon(
			"dice",
			"Instant Queue",
			(evt: MouseEvent) => {
				new TheQueueModal(this.app, this.settings).open();
			}
		);
		// add settings tab
		await this.loadSettings();
		this.addSettingTab(new QueueSettingsTab(this.app, this));
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


