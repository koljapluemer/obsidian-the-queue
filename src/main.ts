import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, TFile, Workspace } from 'obsidian';
import { toggleFloatingQueueBar } from './manageUI';

// Remember to rename these classes and interfaces!

interface QueueSettings {
    mySetting: string;
}

const DEFAULT_SETTINGS: QueueSettings = {
    mySetting: 'default'
}

export default class QueuePlugin extends Plugin {
    settings: QueueSettings;

    async onload() {
        await this.loadSettings();

        const ribbonIconEl = this.addRibbonIcon('banana', 'Toggle Queue', (evt: MouseEvent) => {
            toggleFloatingQueueBar()
        });
        this.addSettingTab(new SampleSettingTab(this.app, this));
    }



    onunload() {

    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}



class SampleSettingTab extends PluginSettingTab {
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