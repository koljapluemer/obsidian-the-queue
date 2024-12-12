import { Plugin, TFile } from 'obsidian';
import { QueueBar } from './classes/QueueBar';
import { NoteShuffler } from './classes/NoteShuffler';
import { ActiveNoteManager } from './classes/ActiveNoteManager';
import { setQueuePluginContext } from './helpers/pluginContext';


interface QueueSettings {
    mySetting: string;
}

const DEFAULT_SETTINGS: QueueSettings = {
    mySetting: 'default'
}


// acts as Mediator for main components
export default class QueuePlugin extends Plugin {
    queueBar: QueueBar
    noteShuffer: NoteShuffler = new NoteShuffler()
    activeNoteManager: ActiveNoteManager = new ActiveNoteManager()

    async onload() {
        setQueuePluginContext(this)
        this.queueBar =  new QueueBar(this, this.app.workspace.containerEl)
        this.addRibbonIcon('banana', 'Toggle Queue', (evt: MouseEvent) => {
            this.queueBar.toggle()
        });

        this.registerEvent(this.app.workspace.on('file-open', async (file) => {
            this.activeNoteManager.onNewFileOpened(file)
        }))
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
