import { QueueNote } from "../classes/queueNote";
import { QueueNoteLearn } from "../classes/queueNoteLearn";
import { QueueNoteMisc } from "../classes/queueNoteMisc";
import { QueueNoteType } from "../types/queueNoteRelated";
import { parse, stringify } from 'yaml'



export function getQueueNoteFromString(str:string): QueueNote {
    const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
    console.log('looking at note:', str)

    // Extract the frontmatter (if it exists)
    const frontmatterMatch = str.match(frontmatterRegex);
    if (frontmatterMatch) {
        console.log('frontmatter found')
        const frontmatter = parse(frontmatterMatch[1])
        console.log('parsed', frontmatter)
        const noteTypeString:string = frontmatter["q-type"] ?? ""
        console.log(noteTypeString)
    
        let noteType:QueueNoteType = QueueNoteType.Misc
        
        switch (noteTypeString) {
            case 'learn':
                return new QueueNoteLearn(str, frontmatter)
            default:
                return new QueueNoteMisc(str, frontmatter)
        }
        

    } else {
        console.log('no frontmatter found')
        return new QueueNoteMisc(str)
    }
}