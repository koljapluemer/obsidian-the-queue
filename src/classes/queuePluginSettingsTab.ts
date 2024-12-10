import { App, PluginSettingTab, Setting } from "obsidian";
import QueuePlugin from "src/main";

export class QueuePluginSettingsTab extends PluginSettingTab {
    plugin: QueuePlugin;

    constructor(app: App, plugin: QueuePlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;

        containerEl.empty();

        new Setting(containerEl)
            .setName('Setting #1')
            .setDesc('It\'s a secret')
            .addText(text => text
                .setPlaceholder('Enter your secret')
                .setValue(this.plugin.settings.mySetting)
                .onChange(async (value) => {
                    this.plugin.settings.mySetting = value;
                    await this.plugin.saveSettings();
                }));
    }
}