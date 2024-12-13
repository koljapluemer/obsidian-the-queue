import { QueueButton } from "src/types";
import { QueueNote } from "./QueueNote";
import { dateTomorrow3Am } from "src/helpers/dateUtils";

export class QueueNoteMisc extends QueueNote {

    buttonsWhenDue: QueueButton[] = [QueueButton.ShowNext]
    buttonsWhenNotDue: QueueButton[] = [QueueButton.ShowNext]

    public score(btn: QueueButton) {
        this.qData.due = dateTomorrow3Am()
    }
}