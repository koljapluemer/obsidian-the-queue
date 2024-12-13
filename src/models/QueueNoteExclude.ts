import { QueueButton } from "src/types";
import { QueueNote } from "./QueueNote";

export class QueueNoteExclude extends QueueNote {
    public getButtons(): QueueButton[] {
        return [QueueButton.ShowNext]
    }
}