import { QueueNoteData, QueueNoteStage, QueueNoteTemplate } from "src/types"

export function getNoteDataFromFrontmatter(frontmatter: any): QueueNoteData {

    const noteData:QueueNoteData = {
        template: QueueNoteTemplate.Misc
    }

    const frontmatterQData = frontmatter["q"]
    
    const templateString = frontmatterQData["template"] || ""
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

    const stageString = frontmatterQData["stage"] || ""
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

    if (frontmatterQData["due"] !== undefined) noteData.due = new Date(frontmatterQData["due"])
    if (frontmatterQData["seen"] !== undefined) noteData.seen = new Date(frontmatterQData["seen"])
    if (frontmatterQData["interval"] !== undefined) noteData.interval = frontmatterQData["interval"]
    if (frontmatterQData["stability"] !== undefined) noteData.stability = frontmatterQData["stability"]
    if (frontmatterQData["difficulty"] !== undefined) noteData.difficulty = frontmatterQData["difficulty"]
    if (frontmatterQData["elapsed"] !== undefined) noteData.elapsed = frontmatterQData["elapsed"]
    if (frontmatterQData["scheduled"] !== undefined) noteData.scheduled = frontmatterQData["scheduled"]
    if (frontmatterQData["reps"] !== undefined) noteData.reps = frontmatterQData["reps"]
    if (frontmatterQData["lapses"] !== undefined) noteData.lapses = frontmatterQData["lapses"]
    if (frontmatterQData["state"] !== undefined) noteData.state = frontmatterQData["state"]


    return noteData
}

export function getNoteDataFromFrontmatterWithLegacyParadigm(frontmatter: any): QueueNoteData {
    const noteData:QueueNoteData = {
        template: QueueNoteTemplate.Misc
    }


    const templateString = frontmatter["q-type"] || ""
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
    if (queueData) {
        // due-at changes for learn ntoes
        if (noteData.template == QueueNoteTemplate.Learn) {
            const fsrsData = queueData["fsrs-data"]
            if (fsrsData) {
                const dueString = fsrsData["due"]
                if (dueString !== undefined) noteData.due = new Date(dueString)
                if (fsrsData["stability"] !== undefined) noteData.stability = fsrsData["stability"]
                if (fsrsData["difficulty"] !== undefined) noteData.difficulty = fsrsData["difficulty"]
                if (fsrsData["elapsed_days"] !== undefined) noteData.elapsed = fsrsData["elapsed_days"]
                if (fsrsData["scheduled_days"] !== undefined) noteData.scheduled = fsrsData["scheduled_days"]
                if (fsrsData["reps"] !== undefined) noteData.reps = fsrsData["reps"]
                if (fsrsData["lapses"] !== undefined) noteData.lapses = fsrsData["lapses"]
                if (fsrsData["state"] !== undefined) noteData.state = fsrsData["state"]
                if (fsrsData["last_review"] !== undefined) noteData.seen = new Date(fsrsData["last_review"])
            }

        } else {
            const dueString = queueData["due-at"]
            if (dueString) noteData.due = new Date(dueString)
        }
    }

    const intervalVal = frontmatter["q-interval"]
    noteData.interval = intervalVal

    return noteData
}