import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, TFile, Workspace } from 'obsidian';
import { setContentOfQueueBar, toggleFloatingQueueBar } from './sideEffects/queueButtonBar';
import { getButtonsForNote, getNoteFromFrontMatter } from './functions/noteUtils';
import { loadQueuePlugin } from './sideEffects/pluginLoad';
import { QueuePluginSettingsTab } from './classes/queuePluginSettingsTab';
import { getRandomFileFromVault } from './functions/fileUtils';

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
        loadQueuePlugin(this)
        this.addSettingTab(new QueuePluginSettingsTab(this.app, this));

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
