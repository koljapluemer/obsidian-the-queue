import { QueueNoteType } from "../types/queueNoteRelated"

export abstract class QueueNote {
    noteType: QueueNoteType
    front: string
    back?: string
    frontmatter?: string
    due?: Date

    constructor(fileString:string, frontmatter?: Object) {
        console.log("-FRONTMATTER", frontmatter)
        if (frontmatter) {
        if ("q-data" in frontmatter) {
            if ("due-at" in frontmatter["q-data"]) {
                this.due = frontmatter["q-data"]["due-at"]
            }
        }
    }
    }

    abstract getAnswerOptions(): string[] 

    isDue():boolean {
        const now =  new Date()
        if (this.due) {
            return this.due < now
        } else {
            return true
        }
    }
}