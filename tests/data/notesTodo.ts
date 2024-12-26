import { QueueNoteData, QueueNoteStage, QueueNoteTemplate } from "src/types";

export const noteTodoBasic: QueueNoteData = {
    template: QueueNoteTemplate.Todo,
    stage: QueueNoteStage.Ongoing
} as const