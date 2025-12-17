import { TFile } from "obsidian"
import { QueueButton, QueueNoteData } from "src/types"

// every TFile may be converted to a QueueNote,
// which holds the actual properties that interests us directly
// (e.g. the interval, or the template)
// has a million methods used by other classes related to interactiong
// w/ a singular note
export class QueueNote {
    file: TFile
    qData: QueueNoteData
    buttonsWhenDue: QueueButton[]
    buttonsWhenNotDue: QueueButton[]
    constructor(file: TFile, qData: QueueNoteData) {
        this.file = file;
        this.qData = qData
    }

    // likely overwritten by derived classes
    public getButtons(): QueueButton[] {
        if (this.isDue()) {
            return this.buttonsWhenDue

        } else {
            return this.buttonsWhenNotDue
        }
    }

    public addScoreToHistory(btn: QueueButton) {
        this.qData.seen = new Date()
        // TODO: find a solid encoding for btn in history, and store
    }


    public isDue(): boolean {
        // considered due when due not set
        if (this.qData.due !== undefined && this.qData.due !== null) return this.qData.due < new Date()
        return true
    }

    
    public score(btn: QueueButton) {
        throw "scoring should be handled by derived class"
    }
}
