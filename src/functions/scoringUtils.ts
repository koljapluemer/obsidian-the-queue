import { QueueButton, QueueNote } from "src/types";

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
            console.log('appears to be learning stuff')
            // TODO: replace with an actual function
            note = getNoteDataForDueInDays(note, 1)
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

    return note
}