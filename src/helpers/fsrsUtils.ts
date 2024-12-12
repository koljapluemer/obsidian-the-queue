import { QueueButton, QueueNoteData, QueueNoteStage, QueueNoteTemplate } from "src/types"
import { Card, createEmptyCard, FSRS, FSRSParameters, generatorParameters, Rating, RecordLog, RecordLogItem, State } from "ts-fsrs"

function getQueueDataForFirstTimeLearningNote(): QueueNoteData {
    const card: Card = createEmptyCard()
    const note: QueueNoteData = {
        template: QueueNoteTemplate.Learn,
        stage: QueueNoteStage.Ongoing
    }

    note.due = card.due
    note.stability = card.stability
    note.difficulty = card.difficulty
    note.elapsed = card.elapsed_days
    note.scheduled = card.scheduled_days
    note.reps = card.reps
    note.lapses = card.lapses
    note.state = card.state
    note.seen = new Date()

    return note
}


export function adaptLearnNoteDataAccordingToScore(noteData: QueueNoteData, btn: QueueButton): QueueNoteData {

    if (!noteHasAllPropsNeededForLearning(noteData)) {
        console.warn('cannot interpret learning data, treating as new learn note')
        return getQueueDataForFirstTimeLearningNote()
    }
    let cardState: State = State.New
    switch (noteData.state) {
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
        due: noteData.due!,
        stability: noteData.stability!,
        difficulty: noteData.difficulty!,
        elapsed_days: noteData.elapsed!,
        scheduled_days: noteData.scheduled!,
        reps: noteData.reps!,
        lapses: noteData.lapses!,
        state: cardState,
        last_review: noteData.seen
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

    noteData.due = relevantLog.card.due
    noteData.stability = relevantLog.card.stability
    noteData.difficulty = relevantLog.card.difficulty
    noteData.elapsed = relevantLog.card.elapsed_days
    noteData.scheduled = relevantLog.card.scheduled_days
    noteData.reps = relevantLog.card.reps
    noteData.lapses = relevantLog.card.lapses
    noteData.state = relevantLog.card.state
    noteData.seen = relevantLog.card.last_review

    noteData.stage = QueueNoteStage.Ongoing
    
    return noteData
}

function noteHasAllPropsNeededForLearning(noteData: QueueNoteData): boolean {
    const allPropsSet =
        noteData.due !== undefined
        && noteData.stability !== undefined
        && noteData.difficulty !== undefined
        && noteData.elapsed !== undefined
        && noteData.scheduled !== undefined
        && noteData.reps !== undefined
        && noteData.lapses !== undefined
        && noteData.state !== undefined

    return allPropsSet

}