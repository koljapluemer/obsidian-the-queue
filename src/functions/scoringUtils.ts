import { QueueNote } from "src/types";

// TODO: would love to use immutable data, but structuredClone has random issues :) 
export function getNoteDataForDueInDays(note:QueueNote, days:number): QueueNote {
    const now = new Date();
    const nextDay = new Date(now);
    // Set to the next day
    nextDay.setDate(now.getDate() + days);
    // Set time to 3:00 AM
    nextDay.setHours(3, 0, 0, 0);
    note.due = nextDay
    return note
}