import { QueueNoteData, QueueNoteStage, QueueNoteTemplate } from "src/types"

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function getNoteDataFromFrontmatter(frontmatter: Record<string, unknown>): QueueNoteData {

    const noteData:QueueNoteData = {
        template: QueueNoteTemplate.Misc
    }

    const qData = frontmatter["q"];
    if (!isRecord(qData)) return noteData

    const templateString = typeof qData["template"] === 'string' ? qData["template"] : ""
    switch (templateString) {
        case 'learn':
            noteData.template = QueueNoteTemplate.Learn
            break
        case 'todo':
            noteData.template = QueueNoteTemplate.Todo
            break
        case 'habit':
            noteData.template = QueueNoteTemplate.Habit
            break
        case 'check':
            noteData.template = QueueNoteTemplate.Check
            break
        case 'shortmedia':
            noteData.template = QueueNoteTemplate.ShortMedia
            break
        case 'longmedia':
            noteData.template = QueueNoteTemplate.LongMedia
            break
        case 'exclude':
            noteData.template = QueueNoteTemplate.Exclude
            break
    }

    const stageString = typeof qData["stage"] === 'string' ? qData["stage"] : ""
    switch (stageString) {
        case 'unstarted':
            noteData.stage = QueueNoteStage.Unstarted
            break
        case 'ongoing':
            noteData.stage = QueueNoteStage.Ongoing
            break
        case 'finished':
            noteData.stage = QueueNoteStage.Finished
            break
        default:
            noteData.stage = QueueNoteStage.Unstarted
    }

    if (qData["due"] !== undefined) noteData.due = new Date(qData["due"] as string | number | Date)
    if (qData["seen"] !== undefined) noteData.seen = new Date(qData["seen"] as string | number | Date)
    if (typeof qData["interval"] === 'number') noteData.interval = qData["interval"]
    if (typeof qData["stability"] === 'number') noteData.stability = qData["stability"]
    if (typeof qData["difficulty"] === 'number') noteData.difficulty = qData["difficulty"]
    if (typeof qData["elapsed"] === 'number') noteData.elapsed = qData["elapsed"]
    if (typeof qData["scheduled"] === 'number') noteData.scheduled = qData["scheduled"]
    if (typeof qData["reps"] === 'number') noteData.reps = qData["reps"]
    if (typeof qData["lapses"] === 'number') noteData.lapses = qData["lapses"]
    if (typeof qData["state"] === 'number') noteData.state = qData["state"]


    return noteData
}

export function getNoteDataFromFrontmatterWithLegacyParadigm(frontmatter: Record<string, unknown>): QueueNoteData {
    const noteData:QueueNoteData = {
        template: QueueNoteTemplate.Misc
    }

    const templateString = typeof frontmatter["q-type"] === 'string' ? frontmatter["q-type"] : ""
    switch (templateString) {
        case 'learn-started':
        case 'learn':
            noteData.template = QueueNoteTemplate.Learn
            break
        case 'todo':
            noteData.template = QueueNoteTemplate.Todo
            break
        case 'habit':
            noteData.template = QueueNoteTemplate.Habit
            break
        case 'check':
            noteData.template = QueueNoteTemplate.Check
            break
        case 'article':
            noteData.template = QueueNoteTemplate.ShortMedia
            break
        case 'book-started':
        case 'book':
            noteData.template = QueueNoteTemplate.LongMedia
            break
        case 'exclude':
        case 'todo-finished':
            noteData.template = QueueNoteTemplate.Exclude
            break
    }

    // check stages
    switch (templateString) {
        case 'learn-started':
        case 'book-started':
            noteData.stage = QueueNoteStage.Ongoing
            break
        case 'book-finished':
            noteData.stage = QueueNoteStage.Finished
            break
        default:
            noteData.stage = QueueNoteStage.Unstarted
    }

    const queueData = frontmatter["q-data"]
    if (isRecord(queueData)) {
        // due-at changes for learn notes
        if (noteData.template == QueueNoteTemplate.Learn) {
            const fsrsData = queueData["fsrs-data"]
            if (isRecord(fsrsData)) {
                const dueString = fsrsData["due"]
                if (dueString !== undefined) noteData.due = new Date(dueString as string | number | Date)
                if (typeof fsrsData["stability"] === 'number') noteData.stability = fsrsData["stability"]
                if (typeof fsrsData["difficulty"] === 'number') noteData.difficulty = fsrsData["difficulty"]
                if (typeof fsrsData["elapsed_days"] === 'number') noteData.elapsed = fsrsData["elapsed_days"]
                if (typeof fsrsData["scheduled_days"] === 'number') noteData.scheduled = fsrsData["scheduled_days"]
                if (typeof fsrsData["reps"] === 'number') noteData.reps = fsrsData["reps"]
                if (typeof fsrsData["lapses"] === 'number') noteData.lapses = fsrsData["lapses"]
                if (typeof fsrsData["state"] === 'number') noteData.state = fsrsData["state"]
                if (fsrsData["last_review"] !== undefined) noteData.seen = new Date(fsrsData["last_review"] as string | number | Date)
            }

        } else {
            const dueString = queueData["due-at"]
            if (dueString !== undefined) noteData.due = new Date(dueString as string | number | Date)
        }
    }

    const intervalVal = frontmatter["q-interval"]
    if (typeof intervalVal === 'number') noteData.interval = intervalVal

    return noteData
}