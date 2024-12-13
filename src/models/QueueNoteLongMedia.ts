import { QueueButton } from "src/types";
import { QueueNote } from "./QueueNote";

export class QueueNoteLongMedia extends QueueNote {
    public getButtons(): QueueButton[] {
        return [QueueButton.NotToday, QueueButton.Later, QueueButton.Done, QueueButton.Finished]
    }
}