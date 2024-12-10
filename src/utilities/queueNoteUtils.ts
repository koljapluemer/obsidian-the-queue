import { QueueNote } from "../classes/queueNote";
import { QueueNoteLearn } from "../classes/queueNoteLearn";
import { QueueNoteMisc } from "../classes/queueNoteMisc";
import { QueueNoteType } from "../types/queueNoteRelated";
import { parse, stringify } from 'yaml'



export function getQueueNoteFromString(str:string): QueueNote {
    const frontmatterRegex = /^---\n([\s\S]*?)\n---/;

    // Extract the frontmatter (if it exists)
    const frontmatterMatch = str.match(frontmatterRegex);
    if (frontmatterMatch) {
        const frontmatter = parse(frontmatterMatch[1])
        const noteTypeString:string = frontmatter["q-type"] ?? ""
    
        let noteType:QueueNoteType = QueueNoteType.Misc
        
        switch (noteTypeString) {
            case 'learn':
                return new QueueNoteLearn(str, frontmatter)
            default:
                return new QueueNoteMisc(str, frontmatter)
        }
        

    } else {
        return new QueueNoteMisc(str)
    }
}