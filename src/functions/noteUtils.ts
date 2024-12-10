import { TFile } from "obsidian";
import { QueueButton, QueueNote, QueueNoteTemplate } from "../types";



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
    return note
}

export function getNoteFromFile(file: TFile): Promise<QueueNote> {
    return new Promise((resolve, reject) => {
        try {
            this.app.fileManager.processFrontMatter(file, (frontmatter: any) => {
                const note = getNoteFromFrontMatter(frontmatter, file);
                resolve(note); // Resolve the Promise with the processed note
            });
        } catch (error) {
            reject(error); // Reject the Promise if an error occurs
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


export function isDue(note:QueueNote): boolean {
    return true
}
