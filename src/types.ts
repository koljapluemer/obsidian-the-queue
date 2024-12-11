import { TFile } from "obsidian"

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
    Base
}

export type QueueNote = {
    file: TFile,
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

export enum QueueButton { 
    Wrong = "Wrong",
    Hard = "Hard",
    Correct = "Correct",
    Easy = "Easy",
    NotToday = "Not today",
    Later = "Later",
    Done = "Done",
    Finished = "Finished",
    ShowLess = "Show less often",
    ShowNext = "Ok, cool",
    ShowMore = "Show more often",
    SeemsHard = "Seems hard",
    SeemsMedium = "I'll try to remember", 
    SeemsEasy = "Easy, got it",
    CheckNo = "No",
    CheckKindOf = "Kind of",
    CheckYes = "Yes"
}