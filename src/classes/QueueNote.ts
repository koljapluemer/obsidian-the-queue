import { TFile } from "obsidian"
import { QueueNoteStage, QueueNoteTemplate } from "src/types"

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
}
      
}