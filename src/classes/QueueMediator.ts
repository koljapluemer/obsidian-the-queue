import { getPluginContext } from "src/helpers/pluginContext"
import { QueueBar } from "./QueueBar"
import { NoteShuffler } from "./NoteShuffler"
import { ActiveNoteManager } from "./ActiveNoteManager"
import { TFile } from "obsidian"
import { QueueNote } from "./QueueNote"
import { QueueButton } from "src/types"

export class QueueMediator {
    queueBar: QueueBar
    noteShuffler: NoteShuffler
    activeNoteManager: ActiveNoteManager

    constructor(queueBar: QueueBar, noteShuffler: NoteShuffler, activeNoteManager: ActiveNoteManager) {
        this.queueBar = queueBar
        queueBar.setMediator(this)

        this.noteShuffler = noteShuffler
        noteShuffler.setMediator(this)

        this.activeNoteManager = activeNoteManager
        activeNoteManager.setMediator(this)
        
    }

    onNewActiveNote(note:QueueNote | null) {
        if (note) {
            this.queueBar.renderButtonsForNote(note.getButtons())
        } else {
            this.queueBar.renderButtonsForEmpty()
        }
    }

    requestNewNote() {
        console.info('new note requested')
    }

    onBarButtonClicked(btn: QueueButton) {
        console.info('button clicked', btn)
    }
}