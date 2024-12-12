import { getPluginContext } from "src/helpers/pluginContext"
import { QueueBar } from "./QueueBar"
import { NoteShuffler } from "./NoteShuffler"
import { ActiveNoteManager } from "./ActiveNoteManager"
import { TFile } from "obsidian"
import { QueueNote } from "./QueueNote"
import { QueueButton } from "src/types"
import { openFile } from "src/helpers/vaultUtils"

// a kind of awkward state tracker, mediates between the other classes
// e.g. the button registers a click on "Correct" here,
// this mediator sees that the note is scored, saved, and a new one loaded
export class QueueMediator {
    queueBar: QueueBar
    noteShuffler: NoteShuffler
    activeNoteManager: ActiveNoteManager

    constructor() {
    }

    onNewActiveNote(note: QueueNote | null) {
        this.rerenderQueueBar()
    }

    async requestNewNote() {
        const newRandomNote = await this.noteShuffler.getDueNote()
        if (newRandomNote) {
            openFile(newRandomNote.file)
        }
    }

    onBarButtonClicked(btn: QueueButton) {
        this.activeNoteManager.scoreAndSaveActive(btn)
        if (this.activeNoteManager.activeNote) this.noteShuffler.removeNoteFromNotes(this.activeNoteManager.activeNote)
        this.requestNewNote()
    }


    rerenderQueueBar() {
        if (this.queueBar) {
            if (this.activeNoteManager.activeNote) {
                this.queueBar.renderButtonsForNote(this.activeNoteManager.activeNote.getButtons())
            } else {
                this.queueBar.renderButtonsForEmpty()
            }
        } else {
            console.warn('queue bar not yet loaded')
        }
    }

    onQueueBarOpened() {
        this.noteShuffler.loadNotes()
    }

    onQueueBarClosed() {

    }
}