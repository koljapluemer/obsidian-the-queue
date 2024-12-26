import { QueueNoteData, QueueNoteStage, QueueNoteTemplate } from "src/types";

export const noteShortMediaBasic:QueueNoteData = {
    template: QueueNoteTemplate.ShortMedia,
    stage: QueueNoteStage.Ongoing
} as const

export const noteShortMediaNotDue:QueueNoteData = {
    template: QueueNoteTemplate.ShortMedia,
    due: new Date(2099, 1, 1),
    stage: QueueNoteStage.Ongoing
} as const