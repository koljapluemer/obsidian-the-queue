import { QueueButton } from "src/types";
import { QueueNote } from "./QueueNote";

export class QueueNoteHabit extends QueueNote {
    public getButtons(): QueueButton[] {
        return [QueueButton.NotToday, QueueButton.Later, QueueButton.Done]
    }
}