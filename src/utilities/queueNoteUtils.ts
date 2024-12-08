import { QueueNote, QueueNoteType } from "../types/QueueNote";
import { parse, stringify } from 'yaml'



export function getQueueNoteFromString(str:string): QueueNote {
    const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
    console.log('looking at note:', str)

    // Extract the frontmatter
    const frontmatterMatch = str.match(frontmatterRegex);
    if (frontmatterMatch) {
        console.log('frontmatter found')
        const parsedYaml = parse(frontmatterMatch[1])
        console.log('parsed', parsedYaml)
        const noteTypeString:string = parsedYaml["q-type"] ?? ""
        console.log(noteTypeString)
    
        let noteType:QueueNoteType = QueueNoteType.Misc
        
        switch (noteTypeString) {
            case 'learn':
                noteType = QueueNoteType.Learn
        }
        const note:QueueNote = {
            front: str,
            noteType: noteType
        } 
        return note

    } else {
        console.log('no frontmatter found')
        const note:QueueNote = {
            front: str,
            noteType: QueueNoteType.Misc
        } 
        return note
    }
}