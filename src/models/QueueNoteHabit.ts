import { QueueButton } from "src/types";
import { QueueNote } from "./QueueNote";

export class QueueNoteHabit extends QueueNote {

    buttonsWhenDue: QueueButton[] = [QueueButton.NotToday, QueueButton.Later, QueueButton.Done]
    buttonsWhenNotDue: QueueButton[] = [QueueButton.RegisterDone, QueueButton.ShowNext]
   
}