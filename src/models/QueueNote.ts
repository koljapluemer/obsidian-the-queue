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
    constructor(file: TFile, qData: QueueNoteData) {
        this.file = file;
        this.qData = qData
    }


    public getButtons(): QueueButton[] {
        switch (this.qData.template) {
            case QueueNoteTemplate.Habit:
                return [QueueButton.NotToday, QueueButton.Later, QueueButton.Done]
            case QueueNoteTemplate.Learn:
                return [QueueButton.Wrong, QueueButton.Hard, QueueButton.Correct, QueueButton.Easy]
            case QueueNoteTemplate.Todo:
                return [QueueButton.NotToday, QueueButton.Later, QueueButton.Done, QueueButton.Finished]
            case QueueNoteTemplate.Check:
                return [QueueButton.CheckNo, QueueButton.CheckKindOf, QueueButton.CheckYes]
            case QueueNoteTemplate.ShortMedia:
                return [QueueButton.NotToday, QueueButton.Later, QueueButton.Done, QueueButton.Finished]
            case QueueNoteTemplate.LongMedia:
                return [QueueButton.NotToday, QueueButton.Later, QueueButton.Done, QueueButton.Finished]
            case QueueNoteTemplate.Exclude:
                return [QueueButton.ShowNext]
            default:
                return [QueueButton.ShowLess, QueueButton.ShowNext, QueueButton.ShowMore]
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

    // SCORING STUFF

    public score(btn: QueueButton) {
        // managing due
        switch (btn) {
            case QueueButton.Correct:
            case QueueButton.Easy:
            case QueueButton.Hard:
            case QueueButton.Wrong:
                this.qData = adaptLearnNoteDataAccordingToScore(this.qData, btn)
                break
            case QueueButton.CheckKindOf:
            case QueueButton.CheckYes:
            case QueueButton.CheckNo:
            case QueueButton.Done:
                this.setDueInDays(this.qData.interval || 1)
                break
            case QueueButton.Later:
                this.setDueInDays(0.01)
                break
            case QueueButton.Finished:
            case QueueButton.ShowLess:
            case QueueButton.ShowMore:
            case QueueButton.ShowNext:
            case QueueButton.NotToday:
            default:
                this.setDueInDays(1)
                break
        }
    }


    private setDueInDays(days: number) {
        const now = new Date();
        if (days > 1) {
            const nextDay = new Date(now);
            // Set to the next day
            nextDay.setDate(now.getDate() + days);
            // Set time to 3:00 AM
            nextDay.setHours(3, 0, 0, 0);
            this.qData.due = nextDay
        } else {
            const soon = new Date(now);
            soon.setTime(now.getTime() + (days * 24 * 60 * 60 * 1000))
            this.qData.due = soon
        }
    }
}
