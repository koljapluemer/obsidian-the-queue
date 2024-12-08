import { QueueNoteType } from "../types/queueNoteRelated"

export abstract class QueueNote {
    noteType: QueueNoteType
    front: string
    back?: string
    frontmatter?: string

    constructor(fileString:string, frontmatter?: Object) {
    }

    abstract getAnswerOptions(): string[] 
}