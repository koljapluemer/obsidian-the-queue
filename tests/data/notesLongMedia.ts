import { QueueNoteData, QueueNoteStage, QueueNoteTemplate } from "src/types";


export const noteLongMediaNewExplicit:QueueNoteData = {
    template: QueueNoteTemplate.LongMedia,
    stage: QueueNoteStage.Unstarted
}

export const noteLongMediaStarted:QueueNoteData = {
    template: QueueNoteTemplate.LongMedia,
    stage: QueueNoteStage.Ongoing

}