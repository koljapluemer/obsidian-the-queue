import { QueueNoteData, QueueNoteStage, QueueNoteTemplate } from "src/types";

export const noteHabitBasic:QueueNoteData = {
    template: QueueNoteTemplate.Habit,
} as const

export const noteHabitWeekly:QueueNoteData = {
    template: QueueNoteTemplate.Habit,
    interval: 7
} as const