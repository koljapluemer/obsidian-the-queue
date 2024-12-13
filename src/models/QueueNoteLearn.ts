import { QueueButton } from "src/types";
import { QueueNote } from "./QueueNote";

export class QueueNoteLearn extends QueueNote {
    public getButtons(): QueueButton[] {
        return [QueueButton.Wrong, QueueButton.Hard, QueueButton.Correct, QueueButton.Easy]
    }
}