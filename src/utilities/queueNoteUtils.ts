import { QueueNote } from "../types/QueueNote";

export function getQueueNoteFromString(str:string): QueueNote {
    const note:QueueNote = {
        front: str
    } 
    return note
}