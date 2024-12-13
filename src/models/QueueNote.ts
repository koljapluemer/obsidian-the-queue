import { TFile } from "obsidian"
import { adaptLearnNoteDataAccordingToScore } from "src/helpers/fsrsUtils"
import { QueueButton, QueueNoteData, QueueNoteStage, QueueNoteTemplate } from "src/types"

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


    public isDue(allowNewLearns = false, allowNewLongMedia = false): boolean {
        if (!allowNewLearns && this.qData.template === QueueNoteTemplate.Learn && this.qData.stage !== QueueNoteStage.Ongoing) {
            return false
        }
        if (!allowNewLongMedia && this.qData.template === QueueNoteTemplate.LongMedia && (!(this.qData.stage === QueueNoteStage.Ongoing || this.qData.stage === QueueNoteStage.Finished))) {
            return false
        }
        let isDue = true
        if (this.qData.due) {
            isDue = this.qData.due < new Date()
        }
        return isDue
    }

    
    public score(btn: QueueButton) {
        throw "scoring should be handled by derived class"
    }
}
