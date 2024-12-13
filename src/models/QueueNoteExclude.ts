import { QueueButton } from "src/types";
import { QueueNote } from "./QueueNote";

export class QueueNoteExclude extends QueueNote {
    buttonsWhenDue: QueueButton[] = [QueueButton.ShowNext]
    buttonsWhenNotDue: QueueButton[] = [QueueButton.ShowNext]
   
    public score(btn: QueueButton) {
        return
    }

    public isDue(allowNewLearns?: boolean, allowNewLongMedia?: boolean): boolean {
        return false
    }
}