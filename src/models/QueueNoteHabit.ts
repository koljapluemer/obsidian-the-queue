import { QueueButton } from "src/types";
import { QueueNote } from "./QueueNote";
import { dateInNrOfDaysAt3Am, dateTenMinutesFromNow, dateTomorrow3Am } from "src/helpers/dateUtils";

export class QueueNoteHabit extends QueueNote {

    buttonsWhenDue: QueueButton[] = [QueueButton.NotToday, QueueButton.Later, QueueButton.Done]
    buttonsWhenNotDue: QueueButton[] = [QueueButton.RegisterDone, QueueButton.ShowNext]

    public score(btn: QueueButton) {
        switch (btn) {
            case QueueButton.NotToday:
                this.qData.due = dateTomorrow3Am()
                break
            case QueueButton.RegisterDone:
            case QueueButton.Done:
                this.qData.due = dateInNrOfDaysAt3Am(this.qData.interval || 1)
                break
            case QueueButton.Later:
                this.qData.due = dateTenMinutesFromNow()
                break
            default:
                console.error(`Note type doesn't know this button`, btn)
        }
    }
}