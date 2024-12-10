import { parse, stringify } from 'yaml'
import { QueueNote, QueueNoteTemplate } from './types/queueNoteRelated';



export function getNoteFromString(str:string): QueueNote {
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
}