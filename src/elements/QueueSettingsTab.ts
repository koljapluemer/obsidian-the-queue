import { App, PluginSettingTab, Setting } from "obsidian";
import TheQueue from "../main";

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
				"The Spaced Repetition Algorithm will only show cards where the predicted recall is below this value."
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
					const log = localStorage.getItem(
						`q-logs-${(app as any).appId}`
					);
					const blob = new Blob([log as any], {
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
					localStorage.setItem(
						`q-logs-${(app as any).appId}`,
						JSON.stringify([])
					);
				})
			);
	}
}
