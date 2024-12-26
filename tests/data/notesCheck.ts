import { QueueNoteData, QueueNoteStage, QueueNoteTemplate } from "src/types";

export const noteCheckBasic:QueueNoteData = {
    template: QueueNoteTemplate.Check,
} as const

export const noteCheckWeekly:QueueNoteData = {
    template: QueueNoteTemplate.Check,
    interval: 7
} as const