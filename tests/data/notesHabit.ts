import { QueueNoteData, QueueNoteStage, QueueNoteTemplate } from "src/types";

export const noteHabitBasic:QueueNoteData = {
    template: QueueNoteTemplate.Habit,
} 

export const noteHabitWeekly:QueueNoteData = {
    template: QueueNoteTemplate.Habit,
    interval: 7
} 