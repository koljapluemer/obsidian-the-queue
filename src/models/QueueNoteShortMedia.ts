import { QueueButton } from "src/types";
import { QueueNote } from "./QueueNote";

export class QueueNoteShortMedia extends QueueNote {
    public getButtons(): QueueButton[] {
        return [QueueButton.NotToday, QueueButton.Later, QueueButton.Done, QueueButton.Finished]
    }
}