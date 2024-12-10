import { QueueNote, QueueNoteTemplate } from 'src/types/queueNoteRelated';
import { parse, stringify } from 'yaml'



export function getQueueNoteFromString(str:string): QueueNote {
    const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
    const queueNote:QueueNote = {
        template: QueueNoteTemplate.Misc
    }

    // Extract the frontmatter (if it exists)
    const frontmatterMatch = str.match(frontmatterRegex);
    if (frontmatterMatch) {
        const frontmatter = parse(frontmatterMatch[1])
        const noteTypeString:string = frontmatter["q-type"] ?? ""
    }

    return queueNote;

    
    
    //     let noteType:QueueNoteType = QueueNoteType.Misc
        
    //     switch (noteTypeString) {
    //         case 'learn':
    //             return new QueueNoteLearn(str, frontmatter)
    //         default:
    //             return new QueueNoteMisc(str, frontmatter)
    //     }
        

    // } else {
    //     return new QueueNoteMisc(str)
    // }
}