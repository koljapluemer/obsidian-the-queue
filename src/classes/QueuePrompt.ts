import QueueNote from "./QueueNote";

export type PromptType =
	| "dueArticles"
    | "newBooks"
    | "dueStartedBooks"
    | "dueChecks"
    | "dueHabits"
    | "dueTodos"
    | "newLearns"
    | "startedLearnNoteMostCloseToForgetting"
    | "dueMisc"
    | "orphans"
    | "improvables"
    | "learnLeeches";
    ;


export default class QueuePrompt {
    qNote: QueueNote;
    promptType: PromptType;

    constructor(qNote: QueueNote, promptType: PromptType) {
        this.qNote = qNote;
        this.promptType = promptType;
    }
}