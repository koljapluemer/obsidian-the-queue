import { TFile } from "obsidian";
import { QueueNote } from "../models/QueueNote";
import { QueueMediator } from "./QueueMediator";
import { getPluginContext } from "src/helpers/pluginContext";
import { QueueButton } from "src/types";
import { saveNoteToVault } from "src/helpers/vaultUtils";
import { QueueNoteFactory } from "src/models/NoteFactory";

// knows which note and file are currently active
// to do this job, listens to new files being opened etc.
// keeps activeFile (TFile) and the active QueueNote
// apart from that, mostly signals changes up to the mediator
export class ActiveNoteManager {
    activeNote: QueueNote | null
    activeFile: TFile | null
    mediator: QueueMediator


    constructor(mediator: QueueMediator) {
        this.mediator = mediator
        mediator.activeNoteManager = this
        const context = getPluginContext()
        this.processNewFile(context.app.workspace.getActiveFile())


        // watching for new changes to open files
        context.plugin.registerEvent(context.app.workspace.on('file-open', async (file) => {
            this.processNewFile(file)
        }))
    }

    async processNewFile(file: TFile | null) {
        this.activeFile = file
        if (file) {
            this.activeNote = await QueueNoteFactory.createNoteFromFile(file)
        } else {
            this.activeNote = null
        }
        this.notifyNewActiveNote(this.activeNote)
    }

    notifyNewActiveNote(note: QueueNote | null) {
        if (this.mediator) {
            this.mediator.onNewActiveNote(this.activeNote)
        } else {
            console.warn('no mediator set')
        }
    }

    scoreAndSaveActive(btn: QueueButton) {
        if (this.activeNote) {
            this.activeNote.score(btn)
            saveNoteToVault(this.activeNote)
        }
    }

}

