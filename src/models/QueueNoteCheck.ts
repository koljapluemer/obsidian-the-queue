import { QueueButton } from "src/types";
import { QueueNote } from "./QueueNote";
import { dateInNrOfDaysAt3Am } from "src/helpers/dateUtils";

export class QueueNoteCheck extends QueueNote {

    buttonsWhenDue = [QueueButton.CheckNo, QueueButton.CheckKindOf, QueueButton.CheckYes]
    buttonsWhenNoteDue = [QueueButton.CheckNo, QueueButton.CheckKindOf, QueueButton.CheckYes]

    public score(btn: QueueButton) {
        this.qData.due = dateInNrOfDaysAt3Am(this.qData.interval || 1)
    }
}