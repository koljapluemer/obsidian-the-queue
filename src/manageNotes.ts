import { TFile } from "obsidian";
import { QueueButton, QueueNote, QueueNoteTemplate } from "./types";



export function getNoteFromFrontMatter(frontmatter: Object): QueueNote {
    let note:QueueNote = {
        template: QueueNoteTemplate.Misc
    }
    return note 
}


export function getButtonsForNote(note:QueueNote): QueueButton[] {
    switch(note.template) {
        default:
            return [QueueButton.ShowLess, QueueButton.ShowNext, QueueButton.ShowMore]
    }
}

