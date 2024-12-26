import { QueueButton, QueueNoteStage } from "src/types";
import { QueueNote } from "./QueueNote";
import { dateTenMinutesFromNow, dateTomorrow3Am } from "src/helpers/dateUtils";
import { Card, createEmptyCard, FSRS, FSRSParameters, generatorParameters, Rating, RecordLog, RecordLogItem, State } from "ts-fsrs"

export class QueueNoteLearn extends QueueNote {

    buttonsWhenUnstarted: QueueButton[] = [QueueButton.StartLearning, QueueButton.NotToday]
    buttonsWhenDue: QueueButton[] = [QueueButton.Wrong, QueueButton.Hard, QueueButton.Correct, QueueButton.Easy]
    buttonsWhenNotDue: QueueButton[] = [QueueButton.RegisterRep, QueueButton.ShowNext]

    public score(btn: QueueButton) {
        switch (btn) {
            case QueueButton.Wrong:
            case QueueButton.Hard:
            case QueueButton.Correct:
            case QueueButton.Easy:
                this.adaptAccordingToFSRS(btn)
                break
            case QueueButton.RegisterRep:
                // set at least a bit in the future, but don't override if far in the future
                this.qData.due = this.isDue() ? dateTenMinutesFromNow() : this.qData.due
                this.qData.reps = this.qData.reps ? this.qData.reps + 1 : 1
                this.qData.seen = new Date()
                break
            case QueueButton.ShowNext:
                // pass
                break
            case QueueButton.StartLearning:
                this.setQDataAtStartOfFSRS()
                break
            case QueueButton.NotToday:
                this.qData.due = dateTomorrow3Am()
                break
            default:
                console.error(`Note type doesn't know this button`, btn)
        }
    }

    public getButtons(): QueueButton[] {
        if (this.qData.stage === QueueNoteStage.Ongoing) {
            if (this.isDue()) {
                return this.buttonsWhenDue
            } else {
                return this.buttonsWhenNotDue
            }
        } else if (this.qData.stage === QueueNoteStage.Unstarted) {
            return this.buttonsWhenUnstarted
        } else {
            console.error('getButtons(): invalid note state')
            return []
        }
    }


    private setQDataAtStartOfFSRS() {
        this.qData.stage = QueueNoteStage.Ongoing
        const card: Card = createEmptyCard()

        this.qData.due = card.due
        this.qData.stability = card.stability
        this.qData.difficulty = card.difficulty
        this.qData.elapsed = card.elapsed_days
        this.qData.scheduled = card.scheduled_days
        this.qData.reps = card.reps
        this.qData.lapses = card.lapses
        this.qData.state = card.state
        this.qData.seen = new Date()
    }


    private adaptAccordingToFSRS(btn: QueueButton) {

        if (!this.hasAllPropsSetNeededForFSRS()) {
            console.warn('cannot interpret learning data, treating as new learn note')
            this.setQDataAtStartOfFSRS()
        }
        let cardState: State = State.New
        switch (this.qData.state) {
            case 0:
                cardState = State.New
                break
            case 1:
                cardState = State.Learning
                break
            case 2:
                cardState = State.Review
                break
            case 3:
                cardState = State.Relearning
                break
        }


        let fsrsCard: Card = {
            due: this.qData.due!,
            stability: this.qData.stability!,
            difficulty: this.qData.difficulty!,
            elapsed_days: this.qData.elapsed!,
            scheduled_days: this.qData.scheduled!,
            reps: this.qData.reps!,
            lapses: this.qData.lapses!,
            state: cardState,
            last_review: this.qData.seen
        }

        const params: FSRSParameters = generatorParameters({ maximum_interval: 1000 });
        const f = new FSRS(params);
        const schedule_options: RecordLog = f.repeat(fsrsCard, new Date())

        let relevantLog: RecordLogItem
        switch (btn) {
            case QueueButton.Wrong:
                relevantLog = schedule_options[Rating.Again]
                break
            case QueueButton.Hard:
                relevantLog = schedule_options[Rating.Hard]
                break
            case QueueButton.Correct:
                relevantLog = schedule_options[Rating.Good]
                break
            case QueueButton.Easy:
            default:
                relevantLog = schedule_options[Rating.Easy]
                break
        }

        this.qData.due = relevantLog.card.due
        this.qData.stability = relevantLog.card.stability
        this.qData.difficulty = relevantLog.card.difficulty
        this.qData.elapsed = relevantLog.card.elapsed_days
        this.qData.scheduled = relevantLog.card.scheduled_days
        this.qData.reps = relevantLog.card.reps
        this.qData.lapses = relevantLog.card.lapses
        this.qData.state = relevantLog.card.state
        this.qData.seen = relevantLog.card.last_review

        this.qData.stage = QueueNoteStage.Ongoing

    }

    private hasAllPropsSetNeededForFSRS(): boolean {
        const allPropsSet =
            this.qData.due !== undefined
            && this.qData.stability !== undefined
            && this.qData.difficulty !== undefined
            && this.qData.elapsed !== undefined
            && this.qData.scheduled !== undefined
            && this.qData.reps !== undefined
            && this.qData.lapses !== undefined
            && this.qData.state !== undefined

        return allPropsSet

    }

}