import { getPluginContext } from "src/helpers/pluginContext"
import { QueueBar } from "./QueueBar"
import { NoteShuffler } from "./NoteShuffler"
import { ActiveNoteManager } from "./ActiveNoteManager"
import { TFile } from "obsidian"
import { QueueNote } from "./QueueNote"
import { QueueButton } from "src/types"
import { openFile } from "src/helpers/vaultUtils"

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
        console.info('new note requested')
        const newRandomNote = await this.noteShuffler.getDueNote()
        console.info('got new note', newRandomNote)
        if (newRandomNote) {
            openFile(newRandomNote.file)
        }
    }

    onBarButtonClicked(btn: QueueButton) {
        console.info('button clicked', btn)
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
}