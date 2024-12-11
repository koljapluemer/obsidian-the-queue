import { QueueButton, QueueNote } from "src/types";
import { Card, FSRS, FSRSParameters, generatorParameters, Rating, RecordLog, RecordLogItem, State } from "ts-fsrs";

// TODO: would love to use immutable data, but structuredClone has random issues :) 
export function getNoteDataForDueInDays(note: QueueNote, days: number): QueueNote {
    const now = new Date();
    if (days > 1) {
        const nextDay = new Date(now);
        // Set to the next day
        nextDay.setDate(now.getDate() + days);
        // Set time to 3:00 AM
        nextDay.setHours(3, 0, 0, 0);
        note.due = nextDay
    } else {
        const soon = new Date(now);
        soon.setTime(now.getTime() + (days * 24 * 60 * 60 * 1000))
        note.due = soon
    }
    return note
}

export function changeNoteDataAccordingToInteraction(note: QueueNote, btn: QueueButton): QueueNote {
    // managing due
    switch (btn) {
        case QueueButton.Correct:
        case QueueButton.Easy:
        case QueueButton.Hard:
        case QueueButton.Wrong:
            scoreLearningNote(note, btn)
            break
        case QueueButton.CheckKindOf:
        case QueueButton.CheckYes:
        case QueueButton.CheckNo:
        case QueueButton.Done:
            note = getNoteDataForDueInDays(note, note.interval || 1)
            break
        case QueueButton.Later:
            note = getNoteDataForDueInDays(note, 0.01)
            break
        case QueueButton.Finished:
        case QueueButton.ShowLess:
        case QueueButton.ShowMore:
        case QueueButton.ShowNext:
        case QueueButton.NotToday:
        default:
            note = getNoteDataForDueInDays(note, 1)
            break
    }

    console.log('scored note', note)
    return note

}


function scoreLearningNote(note: QueueNote, btn: QueueButton): QueueNote {
    if (note.due !== undefined && note.stability !== undefined && note.difficulty !== undefined && note.elapsed !== undefined && note.scheduled !== undefined && note.reps !== undefined && note.lapses !== undefined && note.state !== undefined) {
        let cardState: State = State.New
        // I'm not sure this is needed, or correct
        // can I just pass an int?
        switch (note.state) {
            case 0:
                cardState = State.New
            case 1:
                cardState = State.Learning
            case 2:
                cardState = State.Review
            case 3:
                cardState = State.Relearning
        }

        let fsrsCard: Card = {
            due: note.due,
            stability: note.stability,
            difficulty: note.difficulty,
            elapsed_days: note.elapsed,
            scheduled_days: note.scheduled,
            reps: note.reps,
            lapses: note.lapses,
            state: cardState,
            last_review: note.seen
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

        note.due = relevantLog.card.due
        note.stability = relevantLog.card.stability
        note.difficulty = relevantLog.card.difficulty
        note.elapsed = relevantLog.card.elapsed_days
        note.scheduled = relevantLog.card.scheduled_days
        note.reps = relevantLog.card.reps
        note.lapses = relevantLog.card.lapses
        note.state = relevantLog.card.state
        note.seen = relevantLog.card.last_review

    } else {
        console.error("couldn't parse note's fsrs data", note)
    }

    return note
}