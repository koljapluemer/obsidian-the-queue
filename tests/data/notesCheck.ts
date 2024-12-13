import { QueueNoteData, QueueNoteStage, QueueNoteTemplate } from "src/types";

export const noteCheckBasic:QueueNoteData = {
    template: QueueNoteTemplate.Check,
} 

export const noteCheckWeekly:QueueNoteData = {
    template: QueueNoteTemplate.Check,
    interval: 7
} 