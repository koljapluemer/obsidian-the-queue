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