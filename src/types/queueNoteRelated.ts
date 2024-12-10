export enum QueueNoteTemplate {
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

export enum QueueNoteStage {
    Unstarted,
    Ongoing,
    Finished,
    Base
}

export type QueueNote = {
    template: QueueNoteTemplate
    stage?: QueueNoteStage,
    priority?: number,
    due?: Date,
    seen?: Date,
    interval?: number,
    // fsrs
    stability?: number,
    difficulty?: number,
    elapsed?: number,
    scheduled?: number,
    reps?: number,
    lapses?: number,
    state?: number,
    history?: string
}