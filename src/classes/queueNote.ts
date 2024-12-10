import { QueueNoteType } from "../types/queueNoteRelated"

export abstract class QueueNote {
    noteType: QueueNoteType
    front: string
    back?: string
    frontmatter?: string
    due?: Date

    constructor(fileString:string, frontmatter?: Object) {
    }

    abstract getAnswerOptions(): string[] 

    isDue():boolean {
        return true
    }
}