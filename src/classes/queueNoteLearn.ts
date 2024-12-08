import { QueueNoteType } from "../types/queueNoteRelated";
import { QueueNote } from "./queueNote";

export class QueueNoteLearn extends QueueNote {

    constructor(filestring:string, frontmatter?:Object) {
        super(filestring, frontmatter)
        this.noteType = QueueNoteType.Learn 
    }

    getAnswerOptions(): string[] {
        return ["Wrong", "Right"]
    }


}