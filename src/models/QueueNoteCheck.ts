import { QueueButton } from "src/types";
import { QueueNote } from "./QueueNote";

export class QueueNoteCheck extends QueueNote {
    public getButtons(): QueueButton[] {
        return [QueueButton.CheckNo, QueueButton.CheckKindOf, QueueButton.CheckYes]
    }
}