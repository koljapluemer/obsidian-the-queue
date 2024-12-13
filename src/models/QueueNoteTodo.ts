import { QueueButton } from "src/types";
import { QueueNote } from "./QueueNote";

export class QueueNoteTodo extends QueueNote {
    public getButtons(): QueueButton[] {
        return [QueueButton.NotToday, QueueButton.Later, QueueButton.MadeProgress, QueueButton.Finished]
    }
}