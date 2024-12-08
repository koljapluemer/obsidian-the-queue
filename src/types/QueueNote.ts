export enum QueueNoteType {
    Learn,
    Todo,
    Habit,
    Check,
    Prompt,
    ShortMedia,
    LongMedia,
    Misc,
    Exclude
}

export enum QueueNoteState {
    Unstarted,
    Ongoing,
    Finished,
    Base
}

export type QueueNote = {
    noteType: QueueNoteType,
    front?: string,
    back?:string
}