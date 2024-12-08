import { QueueNoteType } from "../types/queueNoteRelated";
import { QueueNote } from "./queueNote";

export class QueueNoteMisc extends QueueNote {
    constructor(filestring:string, frontmatter?:Object) {
        super(filestring, frontmatter)
        this.noteType = QueueNoteType.Misc 
    }

    getAnswerOptions(): string[] {
        return ["Cool, Next"]
    }
}