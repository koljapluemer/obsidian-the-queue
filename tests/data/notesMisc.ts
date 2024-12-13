import { QueueNoteData, QueueNoteTemplate } from "src/types";

export const noteMiscBasic:QueueNoteData = {
    template: QueueNoteTemplate.Misc,
}


export const noteMiscDue:QueueNoteData = {
    template: QueueNoteTemplate.Misc,
    due: new Date(1999, 1, 1)
}
