import { QueueButton } from "src/types";
import { QueueNote } from "./QueueNote";

export class QueueNoteCheck extends QueueNote {

    buttonsWhenDue = [QueueButton.CheckNo, QueueButton.CheckKindOf, QueueButton.CheckYes]
    buttonsWhenNoteDue = [QueueButton.CheckNo, QueueButton.CheckKindOf, QueueButton.CheckYes]

    public score(btn: QueueButton) {
    }
}