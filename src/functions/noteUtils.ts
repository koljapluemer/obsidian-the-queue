import { Notice, TFile } from "obsidian";
import { QueueButton, QueueNote, QueueNoteStage, QueueNoteTemplate } from "../types";
import { pickRandom } from "./arrayUtils";


export async function getNotesFromFiles(files: TFile[]): Promise<QueueNote[]> {
    try {
        const notes: QueueNote[] = []
        for (const file of files) {
            const note = await getNoteFromFile(file)
            if (note && note.template !== QueueNoteTemplate.Exclude) {
                notes.push(note)
            }
        }
        return notes
    } catch (error) {
        console.error('Error loading notes:', error);
        return []
    }
}


export function getRandomDueNoteFromNotes(notes: QueueNote[], justGetAnyNote = false): QueueNote | null {
    const noteTemplates = [QueueNoteTemplate.Learn, QueueNoteTemplate.Learn, QueueNoteTemplate.Todo, QueueNoteTemplate.Habit, QueueNoteTemplate.Check, QueueNoteTemplate.ShortMedia, QueueNoteTemplate.LongMedia, QueueNoteTemplate.Misc]
    const templateToPick = pickRandom(noteTemplates)
    const simplyAllDueNotes = notes.filter(note => isNoteDue(note))
    const notesWithDesiredTemplate = simplyAllDueNotes.filter(note => note.template === templateToPick)
    return pickRandom(notesWithDesiredTemplate) || pickRandom(simplyAllDueNotes) || null
}

export async function getFirstDueNoteFromVaultThatWeCanFind(): Promise<QueueNote | null> {
    try {
        const allFiles = this.app.vault.getMarkdownFiles();
        const randomStartIndex = Math.floor(Math.random() * allFiles.length);
        let dueNote: QueueNote | null = null
        for (const file of allFiles.slice(randomStartIndex).concat(allFiles)) {
            const note = await getNoteFromFile(file)
            if (note) {

                if (isNoteDue(note)) {
                    dueNote = note
                    break
                }
            } else {
                console.warn('could not create note for file', file)
            }
        }
        if (dueNote) {
            return dueNote
        } else {
            return null
        }
    }
    catch (error) {
        console.error('Error retrieving first due note note:', error);
        return null
    }
}

export function getNoteFromFrontMatter(frontmatter: any, file: TFile): QueueNote {
    let note: QueueNote = {
        template: QueueNoteTemplate.Misc,
        file: file
    }

    // new paradigm
    const q = frontmatter["q"]
    if (q) {

        const templateString = q["template"] || ""
        switch (templateString) {
            case 'learn':
                note.template = QueueNoteTemplate.Learn
                break
            case 'todo':
                note.template = QueueNoteTemplate.Todo
                break
            case 'habit':
                note.template = QueueNoteTemplate.Habit
                break
            case 'check':
                note.template = QueueNoteTemplate.Check
                break
            case 'shortmedia':
                note.template = QueueNoteTemplate.ShortMedia
                break
            case 'longmedia':
                note.template = QueueNoteTemplate.LongMedia
                break
            case 'exclude':
                note.template = QueueNoteTemplate.Exclude
                break
        }

        const stageString = q["stage"] || ""
        switch (stageString) {
            case 'unstarted':
                note.stage = QueueNoteStage.Unstarted
            case 'ongoing':
                note.stage = QueueNoteStage.Ongoing
            case 'finished':
                note.stage = QueueNoteStage.Finished
        }

        if (q["due"]) note.due = new Date(q["due"])
        if (q["seen"]) note.seen = new Date(q["seen"])
        if (q["interval"]) note.interval = q["interval"]
        if (q["stability"]) note.stability = q["stability"]
        if (q["difficulty"]) note.difficulty = q["difficulty"]
        if (q["elapsed"]) note.elapsed = q["elapsed"]
        if (q["scheduled"]) note.scheduled = q["scheduled"]
        if (q["reps"]) note.reps = q["reps"]
        if (q["lapses"]) note.lapses = q["lapses"]
        if (q["state"]) note.state = q["state"]

    } else {

        // old paradigm

        const templateString = frontmatter["q-type"] || ""

        switch (templateString) {
            case 'learn-started':
            case 'learn':
                note.template = QueueNoteTemplate.Learn
                break
            case 'todo':
                note.template = QueueNoteTemplate.Todo
                break
            case 'habit':
                note.template = QueueNoteTemplate.Habit
                break
            case 'check':
                note.template = QueueNoteTemplate.Check
                break
            case 'article':
                note.template = QueueNoteTemplate.ShortMedia
                break
            case 'book-started':
            case 'book':
                note.template = QueueNoteTemplate.LongMedia
                break
            case 'exclude':
            case 'todo-finished':
                note.template = QueueNoteTemplate.Exclude
                break
        }

        const queueData = frontmatter["q-data"]
        if (queueData) {
            // due-at changes for learn ntoes
            if (note.template == QueueNoteTemplate.Learn) {
                const fsrsData = queueData["fsrs-data"]
                if (fsrsData) {
                    const dueString = fsrsData["due"]
                    if (dueString) note.due = new Date(dueString)
                    if (fsrsData["stability"]) note.stability = fsrsData["stability"]
                    if (fsrsData["difficulty"]) note.difficulty = fsrsData["difficulty"]
                    if (fsrsData["elapsed_days"]) note.elapsed = fsrsData["elapsed_days"]
                    if (fsrsData["scheduled_days"]) note.scheduled = fsrsData["scheduled_days"]
                    if (fsrsData["reps"]) note.reps = fsrsData["reps"]
                    if (fsrsData["lapses"]) note.lapses = fsrsData["lapses"]
                    if (fsrsData["state"]) note.state = fsrsData["state"]
                    if (fsrsData["last_review"]) note.seen = new Date(fsrsData["last_review"])
                }

            } else {
                const dueString = queueData["due-at"]
                if (dueString) note.due = new Date(dueString)
            }
        }

        const intervalVal = frontmatter["q-interval"] 
        note.interval = intervalVal
    }

    // TODO: make this fail if stuff is none, or not a date, etc.
    // requires handling of returning null

    return note
}

export function getNoteFromFile(file: TFile): Promise<QueueNote | null> {
    return new Promise((resolve, reject) => {
        try {
            this.app.fileManager.processFrontMatter(file, (frontmatter: any) => {
                const note = getNoteFromFrontMatter(frontmatter, file);
                resolve(note); // Resolve the Promise with the processed note
            });
        } catch (error) {
            console.error(error); // Reject the Promise if an error occurs
            return null
        }
    });
}


export function getButtonsForNote(note: QueueNote): QueueButton[] {
    switch (note.template) {
        case QueueNoteTemplate.Habit:
            return [QueueButton.NotToday, QueueButton.Later, QueueButton.Done]
        case QueueNoteTemplate.Learn:
            return [QueueButton.Wrong, QueueButton.Hard, QueueButton.Correct, QueueButton.Easy]
        case QueueNoteTemplate.Todo:
            return [QueueButton.NotToday, QueueButton.Later, QueueButton.Done, QueueButton.Finished]
        case QueueNoteTemplate.Check:
            return [QueueButton.CheckNo, QueueButton.CheckKindOf, QueueButton.CheckYes]
        case QueueNoteTemplate.ShortMedia:
            return [QueueButton.NotToday, QueueButton.Later, QueueButton.Done, QueueButton.Finished]
        case QueueNoteTemplate.LongMedia:
            return [QueueButton.NotToday, QueueButton.Later, QueueButton.Done, QueueButton.Finished]
        case QueueNoteTemplate.Exclude:
            return [QueueButton.ShowNext]
        default:
            return [QueueButton.ShowLess, QueueButton.ShowNext, QueueButton.ShowMore]
    }
}


export function isNoteDue(note: QueueNote): boolean {
    let isDue = true
    if (note.due) {
        isDue = note.due < new Date()
    }
    return isDue
}


