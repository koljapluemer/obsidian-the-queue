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
    | "learnLeeches"
    | "checkLeeches"
    | "otherLeeches"
    | "readingLeeches"
    ;


/** A lightweight class essentially just wrapping QueueNote
 * It exists because a given QNote may take different roles in the queue that the user sees
 * For example, the same note may be a due learn note or treated as a note in need of improvement 
 * Because this does not really change the underlying note and I did not want to have multiple QueueNote instances for the same note, I created this class
 */
export default class QueuePrompt {
    qNote: QueueNote;
    promptType: PromptType;

    constructor(qNote: QueueNote, promptType: PromptType) {
        this.qNote = qNote;
        this.promptType = promptType;
    }
}