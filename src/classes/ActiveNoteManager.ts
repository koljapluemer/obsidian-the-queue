import { TFile } from "obsidian";
import { QueueNote } from "./QueueNote";
import { QueueMediator } from "./QueueMediator";
import { getPluginContext } from "src/helpers/pluginContext";

export class ActiveNoteManager {
    activeNote:QueueNote | null
    activeFile:TFile | null
    mediator: QueueMediator



    constructor(mediator:QueueMediator) {
        this.mediator = mediator
        mediator.activeNoteManager = this
        const context = getPluginContext()
        this.processNewFile(context.app.workspace.getActiveFile())


        // watching for new changes to open files
        context.plugin.registerEvent(context.app.workspace.on('file-open', async (file) => {
            this.processNewFile(file)
        }))
    }

    async processNewFile(file:TFile | null) {
        this.activeFile = file
        if (file) {
            this.activeNote = await QueueNote.createNoteFromFile(file)
        } else {
            this.activeNote = null
        }
        this.notifyNewActiveNote(this.activeNote)
    }

    notifyNewActiveNote(note:QueueNote | null) {
        if(this.mediator) {
            this.mediator.onNewActiveNote(this.activeNote)
        } else {
            console.warn('no mediator set')
        }
    }

    
}