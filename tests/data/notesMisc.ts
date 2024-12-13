import { QueueNoteData, QueueNoteStage, QueueNoteTemplate } from "src/types";

export const noteMiscBasic:QueueNoteData = {
    template: QueueNoteTemplate.Misc,
    stage: QueueNoteStage.Ongoing
}


export const noteMiscDue:QueueNoteData = {
    template: QueueNoteTemplate.Misc,
    due: new Date(1999, 1, 1)
}
