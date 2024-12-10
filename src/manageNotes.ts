import { TFile } from "obsidian";
import { QueueButton, QueueNote, QueueNoteTemplate } from "./types";



export function getNoteFromFrontMatter(frontmatter: any): QueueNote {
    let note: QueueNote = {
        template: QueueNoteTemplate.Misc
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
    console.log('NOTE', note)
    return note
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

