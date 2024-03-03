import { App, PluginSettingTab, Setting } from "obsidian";
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

		new Setting(containerEl)
			.setName("Desired Recall Threshold")
			.setDesc(
				"The Spaced Repetition Algorithm will only show notes where the predicted recall is below this value."
			)
			.addSlider((slider) =>
				slider
					.setLimits(0.6, 0.97, 0.01)
					.setValue(this.plugin.settings.desiredRecallThreshold)
					.setDynamicTooltip()
					.onChange(async (value) => {
						this.plugin.settings.desiredRecallThreshold = value;
						await this.plugin.saveSettings();
					})
			);

		// Data export button (export q-log from localstorage as json)
		// Data reset button
		new Setting(containerEl)
			.setName("Local Data Logging")
			.addButton((button) =>
				button.setButtonText("Export Logs").onClick(() => {
					const logs = localStorage.getItem(
						`q-logs-${(app as any).appId}`
					);
					const blob = new Blob([logs as any], {
						type: "application/json",
					});
					const url = URL.createObjectURL(blob);
					const a = document.createElement("a");
					a.href = url;
					a.download = `q-logs-${(app as any).appId}.json`;
					a.click();
				})
			)
			.addButton((button) =>
				button.setButtonText("Reset Logs").onClick(() => {
					QueueLog.resetLogs();
				})
			);

		// how many books active at the same time
		new Setting(containerEl)
			.setName("Active Books")
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
			.setName("Disable Leech Prompts")
			.setDesc("You will not see prompts to improve notes marked as leech.")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.disableLeechPrompts)
					.onChange(async (value) => {
						this.plugin.settings.disableLeechPrompts = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Disable Improvement Prompts")
			.setDesc("You will not see prompts to improve notes marked `needs-improvement`.")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.disableImprovablesPrompts)
					.onChange(async (value) => {
						this.plugin.settings.disableImprovablesPrompts = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
