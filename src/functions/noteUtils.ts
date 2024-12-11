import { Notice, TFile } from "obsidian";
import { QueueButton, QueueNote, QueueNoteTemplate } from "../types";
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
        const dueString = queueData["due-at"]
        if (dueString) note.due = new Date(dueString)
    }

    const intervalVal = frontmatter["q-interval"] || 1
    note.interval = intervalVal


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


