import {
	App,
	PluginSettingTab,
	Setting,
	TAbstractFile,
	TFolder,
} from "obsidian";
import TheQueue from "../main";
import QueueLog from "../classes/QueueLog";

/** Settings Tab within the Community Plugin Settings */
export default class QueueSettingsTab extends PluginSettingTab {
	plugin: TheQueue;

	constructor(app: App, plugin: TheQueue) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		// Data export button (export q-log from localstorage as json)
		// Data reset button
		new Setting(containerEl)
			.setName("Local data logging")
			.addButton((button) =>
				button.setButtonText("Export logs").onClick(() => {
					const logs = localStorage.getItem(
						`q-logs-${(app as any).appId}`
					);
					const blob = new Blob([logs as any], {
						type: "application/json",
					});
					const url = URL.createObjectURL(blob);
					const a = document.createElement("a");
					a.href = url;
					// add date (2023-12-04) to filename
					a.download = `q-logs-${(app as any).appId}-${
						new Date().toISOString().split("T")[0]
					}.json`;
					a.click();
				})
			)
			.addButton((button) =>
				button.setButtonText("Reset logs").onClick(() => {
					QueueLog.resetLogs();
				})
			);

		// how many books active at the same time
		new Setting(containerEl)
			.setName("Active books")
			.setDesc("Number of books you want to read at the same time.")
			.addSlider((slider) =>
				slider
					.setLimits(1, 10, 1)
					.setValue(this.plugin.settings.booksActiveMax)
					.setDynamicTooltip()
					.onChange(async (value) => {
						this.plugin.settings.booksActiveMax = value;
						await this.plugin.saveSettings();
					})
			);

		// Allow checkboxes for disabling Leech and improvement prompts
		new Setting(containerEl)
			.setName("Disable leech prompts")
			.setDesc(
				"You will not see prompts to improve notes marked as leech."
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.disableLeechPrompts)
					.onChange(async (value) => {
						this.plugin.settings.disableLeechPrompts = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Disable improvement prompts")
			.setDesc(
				"You will not see prompts to improve notes marked `needs-improvement`."
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.disableImprovablesPrompts)
					.onChange(async (value) => {
						this.plugin.settings.disableImprovablesPrompts = value;
						await this.plugin.saveSettings();
					})
			);

		// list all folders in the vault as checkboxes to filter:
		const abstractFiles = this.app.vault.getAllLoadedFiles();
		const folders: TFolder[] = [];

		abstractFiles.forEach((folder: TAbstractFile) => {
			if (folder instanceof TFolder) {
				// check if it has grandparent
				// only include tier 1 folders, not deeper
				if (folder.parent && !folders.includes(folder.parent)) {
					folders.push(folder);
				}
			}
		});
		// heading
		this.containerEl.createEl("h2", {
			text: "Folders excluded from queue",
		});

		// make checkbox for each folder
		folders.forEach((folder) => {
			new Setting(containerEl).setName(folder.name).addToggle((toggle) =>
				toggle
					.setValue(
						this.plugin.settings.excludedFolders.includes(
							folder.path
						)
					)
					.onChange(async (value) => {
						if (value) {
							this.plugin.settings.excludedFolders.push(
								folder.path
							);
						} else {
							this.plugin.settings.excludedFolders =
								this.plugin.settings.excludedFolders.filter(
									(path) => path !== folder.path
								);
						}
						await this.plugin.saveSettings();
					})
			);
		});
	}
}
