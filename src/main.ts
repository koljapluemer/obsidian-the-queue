import { Plugin } from 'obsidian';
import { loadQueuePlugin } from './sideEffects/pluginLoad';
import { QueuePluginSettingsTab } from './classes/queuePluginSettingsTab';
import { QueueNote } from './types';
import { setContentOfQueueBar } from './sideEffects/queueButtonBar';


interface QueueSettings {
    mySetting: string;
}

const DEFAULT_SETTINGS: QueueSettings = {
    mySetting: 'default'
}



export default class QueuePlugin extends Plugin {
    settings: QueueSettings;
    currentlyTargetedNote: QueueNote | null;
    notes: QueueNote[] = []

    setCurrentlyTargetedNote(newNote: QueueNote | null) {
        this.currentlyTargetedNote = newNote;
        if (newNote) {
            // setContentOfQueueBar(newNote.file, this)
        } else {
            setContentOfQueueBar(null, this)
        }
    }

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
