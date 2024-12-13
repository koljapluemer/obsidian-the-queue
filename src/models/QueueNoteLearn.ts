import { QueueButton } from "src/types";
import { QueueNote } from "./QueueNote";

export class QueueNoteLearn extends QueueNote {

    buttonsWhenDue: QueueButton[] = [QueueButton.Wrong, QueueButton.Hard, QueueButton.Correct, QueueButton.Easy]
    buttonsWhenNotDue: QueueButton[] = [QueueButton.RegisterRep, QueueButton.ShowNext]
   

}