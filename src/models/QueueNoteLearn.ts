import { QueueButton } from "src/types";
import { QueueNote } from "./QueueNote";
import { adaptLearnNoteDataAccordingToScore } from "src/helpers/fsrsUtils";
import { dateTenMinutesFromNow } from "src/helpers/dateUtils";

export class QueueNoteLearn extends QueueNote {

    buttonsWhenDue: QueueButton[] = [QueueButton.Wrong, QueueButton.Hard, QueueButton.Correct, QueueButton.Easy]
    buttonsWhenNotDue: QueueButton[] = [QueueButton.RegisterRep, QueueButton.ShowNext]

    public score(btn: QueueButton) {
        if (this.isDue()) {
            this.qData = adaptLearnNoteDataAccordingToScore(this.qData, btn)
        } else {
            switch (btn) {
                case QueueButton.RegisterRep:
                    this.qData.due = dateTenMinutesFromNow()
                    this.qData.reps = this.qData.reps ? + 1 : 1
                    this.qData.seen = new Date()
                    break
                case QueueButton.ShowNext:
                // pass
            }
        }
    }

}