import { QueueButton } from "src/types";
import { QueueNote } from "./QueueNote";

export class QueueNoteShortMedia extends QueueNote {

    buttonsWhenDue: QueueButton[] = [QueueButton.NotToday, QueueButton.Later, QueueButton.Done, QueueButton.Finished]
    buttonsWhenNotDue: QueueButton[] = [QueueButton.RegisterDone, QueueButton.Finished, QueueButton.ShowNext]

}