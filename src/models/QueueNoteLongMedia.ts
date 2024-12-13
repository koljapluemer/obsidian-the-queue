import { QueueButton, QueueNoteStage } from "src/types";
import { QueueNote } from "./QueueNote";
import { dateTenMinutesFromNow, dateTomorrow3Am } from "src/helpers/dateUtils";

export class QueueNoteLongMedia extends QueueNote {

    buttonsWhenUnstarted: QueueButton[] = [QueueButton.Started, QueueButton.NotToday]
    buttonsWhenDue: QueueButton[] = [QueueButton.NotToday, QueueButton.Later, QueueButton.Done, QueueButton.Finished]
    buttonsWhenNotDue: QueueButton[] = [QueueButton.RegisterDone, QueueButton.Finished, QueueButton.ShowNext]
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
            case QueueButton.RegisterDone:
                this.qData.due = dateTomorrow3Am()
                break
            case QueueButton.Finished:
                this.qData.stage = QueueNoteStage.Finished
                this.qData.due = dateTomorrow3Am()
                break
            case QueueButton.Started:
                this.qData.due = dateTomorrow3Am()
                this.qData.stage = QueueNoteStage.Ongoing
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
                return this.buttonsWhenUnstarted
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