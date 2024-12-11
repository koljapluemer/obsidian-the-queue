import { TFile } from "obsidian"
import { getFrontmatterOfFile } from "src/helpers/vaultUtils"
import { QueueButton, QueueNoteStage, QueueNoteTemplate } from "src/types"

export class QueueNote {
    file: TFile
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

    constructor(params: {
        file: TFile;
        template: QueueNoteTemplate;
        stage?: QueueNoteStage;
        priority?: number;
        due?: Date;
        seen?: Date;
        interval?: number;
        history?: string;
        stability?: number;
        difficulty?: number;
        elapsed?: number;
        scheduled?: number;
        reps?: number;
        lapses?: number;
        state?: number;
    }) {
        this.file = params.file;
        this.template = params.template;
        this.stage = params.stage;
        this.priority = params.priority;
        this.due = params.due;
        this.seen = params.seen;
        this.interval = params.interval;
        this.history = params.history;
        this.stability = params.stability;
        this.difficulty = params.difficulty;
        this.elapsed = params.elapsed;
        this.scheduled = params.scheduled;
        this.reps = params.reps;
        this.lapses = params.lapses;
        this.state = params.state;
    }

    public getButtonsForNote(): QueueButton[] {
        switch (this.template) {
            case QueueNoteTemplate.Habit:
                return [QueueButton.NotToday, QueueButton.Later, QueueButton.Done]
            case QueueNoteTemplate.Learn:
                return [QueueButton.Wrong, QueueButton.Hard, QueueButton.Correct, QueueButton.Easy]
            case QueueNoteTemplate.Todo:
                return [QueueButton.NotToday, QueueButton.Later, QueueButton.Done, QueueButton.Finished]
            case QueueNoteTemplate.Check:
                return [QueueButton.CheckNo, QueueButton.CheckKindOf, QueueButton.CheckYes]
            case QueueNoteTemplate.ShortMedia:
                return [QueueButton.NotToday, QueueButton.Later, QueueButton.Done, QueueButton.Finished]
            case QueueNoteTemplate.LongMedia:
                return [QueueButton.NotToday, QueueButton.Later, QueueButton.Done, QueueButton.Finished]
            case QueueNoteTemplate.Exclude:
                return [QueueButton.ShowNext]
            default:
                return [QueueButton.ShowLess, QueueButton.ShowNext, QueueButton.ShowMore]
        }
    }

    public isDue(allowNewLearns = false, allowNewLongMedia = false): boolean {
        if (!allowNewLearns && this.template === QueueNoteTemplate.Learn && this.stage !== QueueNoteStage.Ongoing) {
            return false
        }
        if (!allowNewLongMedia && this.template === QueueNoteTemplate.LongMedia && (!(this.stage === QueueNoteStage.Ongoing || this.stage === QueueNoteStage.Finished))) {
            return false
        }
        let isDue = true
        if (this.due) {
            isDue = this.due < new Date()
        }
        return isDue
    }


}
      