
export enum QueueNoteTemplate {
    Learn,
    Todo,
    Habit,
    Check,
    ShortMedia,
    LongMedia,
    Misc,
    Exclude
}

export enum QueueNoteStage {
    Unstarted,
    Ongoing,
    Finished,
}


export type QueueNoteData = {
    template: QueueNoteTemplate
    stage?: QueueNoteStage
    priority?: number
    due?: Date
    seen?: Date
    interval?: number
    history?: string
    // fsrs
    stability?: number
    difficulty?: number
    elapsed?: number
    scheduled?: number
    reps?: number
    lapses?: number
    state?: number
}

export enum QueueButton {
    Wrong = "Wrong",
    Hard = "Hard",
    Correct = "Correct",
    Easy = "Easy",
    RegisterRep = "Register repetition",
    RegisterProg = "Mark progress",
    RegisterDone = "Mark as done",
    NotToday = "Not today",
    Later = "Later",
    Done = "Done",
    Finished = "Finished",
    ShowNext = "Show next",
    SeemsHard = "Seems hard",
    SeemsMedium = "I'll try to remember",
    SeemsEasy = "Easy, got it",
    CheckNo = "No",
    CheckKindOf = "Kind of",
    CheckYes = "Yes",
    MadeProgress = "Made progress",
    StartLearning = "Start learning",
    Started = "Started"
}