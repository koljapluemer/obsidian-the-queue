import { QueueNote } from "src/models/QueueNote";
import { QueueNoteStage, QueueNoteTemplate } from "src/types";

export class StatsManager {

    public static logDueStats(notes: QueueNote[]) {

        const dueArticles = notes.filter(n => n.isDue() && n.qData.template === QueueNoteTemplate.ShortMedia).length
        const dueBooks = notes.filter(n => n.isDue() && n.qData.template === QueueNoteTemplate.LongMedia && n.qData.stage === QueueNoteStage.Ongoing).length
        const dueChecks = notes.filter(n => n.isDue() && n.qData.template === QueueNoteTemplate.Check).length
        const dueHabits = notes.filter(n => n.isDue() && n.qData.template === QueueNoteTemplate.Habit).length
        const dueTodos = notes.filter(n => n.isDue() && n.qData.template === QueueNoteTemplate.Todo).length
        const dueMisc = notes.filter(n => n.isDue() && n.qData.template === QueueNoteTemplate.Misc).length
        const dueLearns = notes.filter(n => n.isDue() && n.qData.template === QueueNoteTemplate.Learn && n.qData.stage === QueueNoteStage.Ongoing).length
        const newLearns = notes.filter(n => n.qData.template === QueueNoteTemplate.Learn && n.qData.stage === QueueNoteStage.Unstarted).length
        const startedBooks  = notes.filter(n => n.qData.template === QueueNoteTemplate.LongMedia && n.qData.stage === QueueNoteStage.Ongoing).length

        const stats = {
            createdAt: new Date(),
            logData: {
                "Nr. of due articles": dueArticles,
                "Nr. of due started books": dueBooks,
                "Nr. of due checks": dueChecks,
                "Nr. of due habits": dueHabits,
                "Nr. of due todos": dueTodos,
                "Nr. of new learns": newLearns,
                "Nr. of FSRS due notes": dueLearns,
                "Nr. of due misc": dueMisc,
                "Nr. of started books even if not due": startedBooks
            },
            logType: "due-statistics"
        }

        console.log(stats)
    }

}

