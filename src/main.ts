import { Plugin, TFile } from 'obsidian';
import { QueuePluginSettingsTab } from './classes/queuePluginSettingsTab';
import { QueueNote, QueueNoteTemplate } from './types';
import { loadQueuePlugin } from './utils/pluginUtils';
import { setContentOfQueueBar } from './utils/uiUtils';
import { getNoteFromFile } from './utils/interfaceNotesWithVault';


interface QueueSettings {
    mySetting: string;
}

const DEFAULT_SETTINGS: QueueSettings = {
    mySetting: 'default'
}



export default class QueuePlugin extends Plugin {
    settings: QueueSettings;
    currentlyTargetedNote: QueueNote | null;
    currentylTargetedFile: TFile | null;
    notes: QueueNote[] = []
    // streak stuff
    currentTemplate: QueueNoteTemplate | null;
    isStreakActive:boolean 
    streakCounter:number

    async setCurrentlyTargetedFile(file:TFile | null) {
        // this.currentylTargetedFile = this.app.workspace.getActiveFile();
        this.currentylTargetedFile = file;
        this.currentlyTargetedNote = await getNoteFromFile(this.currentylTargetedFile)


        if (this.currentylTargetedFile === null) setContentOfQueueBar(null, this)
    }

    async onload() {
        this.isStreakActive = false
        this.streakCounter = 0
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
