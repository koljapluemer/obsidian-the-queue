import { QueueButton, QueueNoteStage } from "src/types";
import { QueueNote } from "./QueueNote";
import { dateTenMinutesFromNow, dateTomorrow3Am } from "src/helpers/dateUtils";

export class QueueNoteShortMedia extends QueueNote {

    buttonsWhenDue: QueueButton[] = [QueueButton.NotToday, QueueButton.Later, QueueButton.Done, QueueButton.Finished]
    buttonsWhenNotDue: QueueButton[] = [QueueButton.RegisterDone, QueueButton.Finished, QueueButton.ShowNext]

    public score(btn: QueueButton) {
        if (this.isDue()) {
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
            }
        } else {
            switch (btn) {
                case QueueButton.RegisterDone:
                    this.qData.due = dateTomorrow3Am()
                    break
                case QueueButton.Finished:
                    this.qData.stage = QueueNoteStage.Finished
                    this.qData.due = dateTomorrow3Am()
                    break
                case QueueButton.ShowNext:
                // pass
            }
        }
    }
}