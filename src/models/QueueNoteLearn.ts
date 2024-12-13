import { QueueButton, QueueNoteStage } from "src/types";
import { QueueNote } from "./QueueNote";
import { adaptLearnNoteDataAccordingToScore, getQueueDataForFirstTimeLearningNote } from "src/helpers/fsrsUtils";
import { dateTenMinutesFromNow } from "src/helpers/dateUtils";

export class QueueNoteLearn extends QueueNote {

    buttonsWhenUnstarted: QueueButton[] = [QueueButton.StartLearning, QueueButton.NotToday]
    buttonsWhenDue: QueueButton[] = [QueueButton.Wrong, QueueButton.Hard, QueueButton.Correct, QueueButton.Easy]
    buttonsWhenNotDue: QueueButton[] = [QueueButton.RegisterRep, QueueButton.ShowNext]

    public score(btn: QueueButton) {
        if (this.isDue()) {
            this.qData = adaptLearnNoteDataAccordingToScore(this.qData, btn)
        } else {
            switch (btn) {
                case QueueButton.RegisterRep:
                    this.qData.due = dateTenMinutesFromNow()
                    this.qData.reps = this.qData.reps ? + 1 : 1
                    this.qData.seen = new Date()
                    break
                case QueueButton.ShowNext:
                    // pass
                    break
                case QueueButton.StartLearning:
                    this.qData = getQueueDataForFirstTimeLearningNote()
                default:
                    console.error(`Note type doesn't know this button`, btn)
            }
        }
    }

    public getButtons(): QueueButton[] {
        if (this.qData.stage === QueueNoteStage.Ongoing) {
            if (this.isDue()) {
                return this.buttonsWhenDue
            } else {
                return this.buttonsWhenNotDue
            }
        } else if (this.qData.stage === QueueNoteStage.Unstarted) {
            return this.buttonsWhenUnstarted
        } else {
            console.error('getButtons(): invalid note state')
            return []
        }
    }
}