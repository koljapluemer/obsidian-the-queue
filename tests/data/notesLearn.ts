import { QueueNoteData, QueueNoteStage, QueueNoteTemplate } from "src/types";

export const noteLearnStartedDueIncomplete:QueueNoteData = {
    template: QueueNoteTemplate.Learn,
    stage: QueueNoteStage.Ongoing
} as const


export const noteLearnFSRSData:QueueNoteData = {
    template: QueueNoteTemplate.Learn,
    stage: QueueNoteStage.Ongoing,
    due: new Date('2023-12-27T18:32:17.409Z'),
    seen: new Date('2023-12-11T18:32:17.409Z'),
    stability: 15.62332369,
    difficulty: 9.54482981,
    elapsed: 13,
    scheduled: 16,
    reps: 49,
    lapses: 5,
    state: 2
} as const

export const noteLearnFSRSDataNotDue:QueueNoteData = {
    template: QueueNoteTemplate.Learn,
    stage: QueueNoteStage.Ongoing,
    due: new Date('2099-12-27T18:32:17.409Z'),
    seen: new Date('2023-12-11T18:32:17.409Z'),
    stability: 15.62332369,
    difficulty: 9.54482981,
    elapsed: 13,
    scheduled: 16,
    reps: 49,
    lapses: 5,
    state: 2
} as const


export const noteLearnUnstarted:QueueNoteData = {
    template: QueueNoteTemplate.Learn,
    stage: QueueNoteStage.Unstarted
}  as const
