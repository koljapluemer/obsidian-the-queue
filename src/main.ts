import { Plugin, TFile } from 'obsidian';
import { QueueBar } from './classes/QueueBar';
import { NoteShuffler } from './classes/NoteShuffler';
import { ActiveNoteManager } from './classes/ActiveNoteManager';
import { setQueuePluginContext } from './helpers/pluginContext';
import { QueueMediator } from './classes/QueueMediator';


interface QueueSettings {
    mySetting: string;
}

const DEFAULT_SETTINGS: QueueSettings = {
    mySetting: 'default'
}


// acts as Mediator for main components
export default class QueuePlugin extends Plugin {

    queueBar: QueueBar

    async onload() {
        setQueuePluginContext(this)
        const mediator = new QueueMediator()

        this.queueBar = new QueueBar(this.app.workspace.containerEl, mediator)
        const noteShuffer = new NoteShuffler(mediator)
        const activeNoteManager = new ActiveNoteManager(mediator)

        this.addRibbonIcon('banana', 'Toggle Queue', (evt: MouseEvent) => {
            this.queueBar.toggle()
        });


    }
}


// export default class QueuePlugin extends Plugin {
//     settings: QueueSettings;
//     currentlyTargetedNote: QueueNote | null;
//     currentylTargetedFile: TFile | null;
//     notes: QueueNote[] = []
//     // streak stuff
//     currentTemplate: QueueNoteTemplate | null;
//     isStreakActive:boolean 
//     streakCounter:number

//     async setCurrentlyTargetedFile(file:TFile | null) {
//         // this.currentylTargetedFile = this.app.workspace.getActiveFile();
//         this.currentylTargetedFile = file;
//         this.currentlyTargetedNote = await getNoteFromFile(this.currentylTargetedFile)


//         if (this.currentylTargetedFile === null) setContentOfQueueBar(null, this)
//     }

//     async onload() {
//         this.isStreakActive = false
//         this.streakCounter = 0
//         loadQueuePlugin(this)
//         this.addSettingTab(new QueuePluginSettingsTab(this.app, this));
//     }

//     onunload() {
//     }

//     async loadSettings() {
//         this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
//     }

//     async saveSettings() {
//         await this.saveData(this.settings);
//     }

// }
