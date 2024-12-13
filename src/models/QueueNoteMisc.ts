import { QueueButton } from "src/types";
import { QueueNote } from "./QueueNote";

export class QueueNoteMisc extends QueueNote {
    public getButtons(): QueueButton[] {
        return [QueueButton.ShowLess, QueueButton.ShowNext, QueueButton.ShowMore]
    }
}