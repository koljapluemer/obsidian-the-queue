import { QueueButton, QueueNoteStage } from "src/types";
import { QueueNote } from "./QueueNote";
import { dateTenMinutesFromNow, dateTomorrow3Am } from "src/helpers/dateUtils";

export class QueueNoteTodo extends QueueNote {
    buttonsWhenDue: QueueButton[] = [QueueButton.NotToday, QueueButton.Later, QueueButton.MadeProgress, QueueButton.Finished]
    buttonsWhenNotDue: QueueButton[] = [QueueButton.RegisterProg, QueueButton.Finished, QueueButton.ShowNext]
    buttonsWhenFinished: QueueButton[] = [QueueButton.ShowNext]

    public score(btn: QueueButton) {
        switch (btn) {
            case QueueButton.NotToday:
                this.qData.due = dateTomorrow3Am()
                break
            case QueueButton.Later:
                this.qData.due = dateTenMinutesFromNow()
                break
            case QueueButton.Done:
                this.qData.due = dateTomorrow3Am()
                break
            case QueueButton.Finished:
                this.qData.stage = QueueNoteStage.Finished
                this.qData.due = dateTomorrow3Am()
                break
            case QueueButton.RegisterProg:
                this.qData.due = dateTomorrow3Am()
                break
            case QueueButton.Finished:
                this.qData.stage = QueueNoteStage.Finished
                this.qData.due = dateTomorrow3Am()
                break
            case QueueButton.ShowNext:
                // pass
                break
            default:
                console.error(`Note type doesn't know this button`, btn)
        }
    }

    public getButtons(): QueueButton[] {
        switch (this.qData.stage) {
            case QueueNoteStage.Unstarted:
            case QueueNoteStage.Ongoing:
                if (this.isDue()) {
                    return this.buttonsWhenDue
                } else {
                    return this.buttonsWhenNotDue
                }
            case QueueNoteStage.Finished:
                return this.buttonsWhenFinished
            default:
                console.error('getButtons(): invalid note state')
                return [QueueButton.ShowNext]
        }
    }
}