import { Notice, TFile } from "obsidian";
import { QueueButton, QueueNote, QueueNoteStage, QueueNoteTemplate } from "../types";
import { pickRandom } from "./arrayUtils";
import QueuePlugin from "src/main";
import { Card, createEmptyCard, FSRS, FSRSParameters, generatorParameters, Rating, RecordLog, RecordLogItem, State } from "ts-fsrs";



export function getButtonsForNote(note: QueueNote): QueueButton[] {
    switch (note.template) {
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


export function isNoteDue(note: QueueNote, allowNewLearns = false, allowNewLongMedia = false): boolean {
    if (!allowNewLearns && note.template === QueueNoteTemplate.Learn && note.stage !== QueueNoteStage.Ongoing) {
        return false
    }
    if (!allowNewLongMedia && note.template === QueueNoteTemplate.LongMedia && (!(note.stage === QueueNoteStage.Ongoing || note.stage === QueueNoteStage.Finished))) {
        return false
    }
    let isDue = true
    if (note.due) {
        isDue = note.due < new Date()
    }
    // if (note.template === QueueNoteTemplate.Learn) console.info('returning due', isDue, 'for', note)
    return isDue
}




// TODO: would love to use immutable data, but structuredClone has random issues :) 
export function getNoteDataForDueInDays(note: QueueNote, days: number): QueueNote {
    const now = new Date();
    if (days > 1) {
        const nextDay = new Date(now);
        // Set to the next day
        nextDay.setDate(now.getDate() + days);
        // Set time to 3:00 AM
        nextDay.setHours(3, 0, 0, 0);
        note.due = nextDay
    } else {
        const soon = new Date(now);
        soon.setTime(now.getTime() + (days * 24 * 60 * 60 * 1000))
        note.due = soon
    }
    return note
}

export function changeNoteDataAccordingToInteraction(note: QueueNote, btn: QueueButton): QueueNote {
    // managing due
    switch (btn) {
        case QueueButton.Correct:
        case QueueButton.Easy:
        case QueueButton.Hard:
        case QueueButton.Wrong:
            scoreLearningNote(note, btn)
            break
        case QueueButton.CheckKindOf:
        case QueueButton.CheckYes:
        case QueueButton.CheckNo:
        case QueueButton.Done:
            note = getNoteDataForDueInDays(note, note.interval || 1)
            break
        case QueueButton.Later:
            note = getNoteDataForDueInDays(note, 0.01)
            break
        case QueueButton.Finished:
        case QueueButton.ShowLess:
        case QueueButton.ShowMore:
        case QueueButton.ShowNext:
        case QueueButton.NotToday:
        default:
            note = getNoteDataForDueInDays(note, 1)
            break
    }

    return note
}


// TODO: handle new learning notes that _should_ be treated as new gracefully
function scoreLearningNote(note: QueueNote, btn: QueueButton): QueueNote {
    if (note.due !== undefined && note.stability !== undefined && note.difficulty !== undefined && note.elapsed !== undefined && note.scheduled !== undefined && note.reps !== undefined && note.lapses !== undefined && note.state !== undefined) {
        let cardState: State = State.New
        // I'm not sure this is needed, or correct
        // can I just pass an int?
        switch (note.state) {
            case 0:
                cardState = State.New
                break
            case 1:
                cardState = State.Learning
                break
            case 2:
                cardState = State.Review
                break
            case 3:
                cardState = State.Relearning
                break
        }


        let fsrsCard: Card = {
            due: note.due,
            stability: note.stability,
            difficulty: note.difficulty,
            elapsed_days: note.elapsed,
            scheduled_days: note.scheduled,
            reps: note.reps,
            lapses: note.lapses,
            state: cardState,
            last_review: note.seen
        }

        const params: FSRSParameters = generatorParameters({ maximum_interval: 1000 });
        const f = new FSRS(params);
        const schedule_options: RecordLog = f.repeat(fsrsCard, new Date())

        let relevantLog: RecordLogItem
        switch (btn) {
            case QueueButton.Wrong:
                relevantLog = schedule_options[Rating.Again]
                break
            case QueueButton.Hard:
                relevantLog = schedule_options[Rating.Hard]
                break
            case QueueButton.Correct:
                relevantLog = schedule_options[Rating.Good]
                break
            case QueueButton.Easy:
            default:
                relevantLog = schedule_options[Rating.Easy]
                break
        }

        note.due = relevantLog.card.due
        note.stability = relevantLog.card.stability
        note.difficulty = relevantLog.card.difficulty
        note.elapsed = relevantLog.card.elapsed_days
        note.scheduled = relevantLog.card.scheduled_days
        note.reps = relevantLog.card.reps
        note.lapses = relevantLog.card.lapses
        note.state = relevantLog.card.state
        note.seen = relevantLog.card.last_review

    } else {
        console.error("couldn't parse note's fsrs data, treating as new learning data", note)
        note = scoreLearningNoteForTheFirstTime(note, btn)
        // console.log(note.due !== undefined, note.stability !== undefined, note.difficulty !== undefined, note.elapsed !== undefined, note.scheduled !== undefined, note.reps !== undefined, note.lapses !== undefined, note.state !== undefined)
    }

    note.stage = QueueNoteStage.Ongoing
    return note
}

function scoreLearningNoteForTheFirstTime(note: QueueNote, btn: QueueButton): QueueNote {
    const card: Card = createEmptyCard()

    note.due = card.due
    note.stability = card.stability
    note.difficulty = card.difficulty
    note.elapsed = card.elapsed_days
    note.scheduled = card.scheduled_days
    note.reps = card.reps
    note.lapses = card.lapses
    note.state = card.state
    note.seen = new Date()

    note.stage = QueueNoteStage.Ongoing

    return note
}


export function fillInNoteFromFile(frontmatter: any, file: TFile):QueueNote {
    let note: QueueNote = {
        template: QueueNoteTemplate.Misc,
        file: file
    }
    // new paradigm
    const q = frontmatter["q"]
    if (q) {
        note = getNoteDataFromFrontmatter(note, q)
    } else {
        note = getNoteDataFromFrontmatterWithLegacyParadigm(note, frontmatter)
    }
    // TODO: make this fail if stuff is none, or not a date, etc.
    // requires handling of returning null

    return note
}

function getNoteDataFromFrontmatter(note: QueueNote, qData: any): QueueNote {
    const templateString = qData["template"] || ""
    switch (templateString) {
        case 'learn':
            note.template = QueueNoteTemplate.Learn
            break
        case 'todo':
            note.template = QueueNoteTemplate.Todo
            break
        case 'habit':
            note.template = QueueNoteTemplate.Habit
            break
        case 'check':
            note.template = QueueNoteTemplate.Check
            break
        case 'shortmedia':
            note.template = QueueNoteTemplate.ShortMedia
            break
        case 'longmedia':
            note.template = QueueNoteTemplate.LongMedia
            break
        case 'exclude':
            note.template = QueueNoteTemplate.Exclude
            break
    }

    const stageString = qData["stage"] || ""
    switch (stageString) {
        case 'unstarted':
            note.stage = QueueNoteStage.Unstarted
            break
        case 'ongoing':
            note.stage = QueueNoteStage.Ongoing
            break
        case 'finished':
            note.stage = QueueNoteStage.Finished
            break
    }

    if (qData["due"] !== undefined) note.due = new Date(qData["due"])
    if (qData["seen"] !== undefined) note.seen = new Date(qData["seen"])
    if (qData["interval"] !== undefined) note.interval = qData["interval"]
    if (qData["stability"] !== undefined) note.stability = qData["stability"]
    if (qData["difficulty"] !== undefined) note.difficulty = qData["difficulty"]
    if (qData["elapsed"] !== undefined) note.elapsed = qData["elapsed"]
    if (qData["scheduled"] !== undefined) note.scheduled = qData["scheduled"]
    if (qData["reps"] !== undefined) note.reps = qData["reps"]
    if (qData["lapses"] !== undefined) note.lapses = qData["lapses"]
    if (qData["state"] !== undefined) note.state = qData["state"]


    return note
}

export function getNoteDataFromFrontmatterWithLegacyParadigm(note: QueueNote, frontmatter: any): QueueNote {
    // old paradigm

    const templateString = frontmatter["q-type"] || ""
    switch (templateString) {
        case 'learn-started':
        case 'learn':
            note.template = QueueNoteTemplate.Learn
            break
        case 'todo':
            note.template = QueueNoteTemplate.Todo
            break
        case 'habit':
            note.template = QueueNoteTemplate.Habit
            break
        case 'check':
            note.template = QueueNoteTemplate.Check
            break
        case 'article':
            note.template = QueueNoteTemplate.ShortMedia
            break
        case 'book-started':
        case 'book':
            note.template = QueueNoteTemplate.LongMedia
            break
        case 'exclude':
        case 'todo-finished':
            note.template = QueueNoteTemplate.Exclude
            break
    }

    // check stages
    switch (templateString) {
        case 'learn-started':
        case 'book-started':
            note.stage = QueueNoteStage.Ongoing
            break
        case 'book-finished':
            note.stage = QueueNoteStage.Finished
            break
    }

    const queueData = frontmatter["q-data"]
    if (queueData) {
        // due-at changes for learn ntoes
        if (note.template == QueueNoteTemplate.Learn) {
            const fsrsData = queueData["fsrs-data"]
            if (fsrsData) {
                const dueString = fsrsData["due"]
                if (dueString !== undefined) note.due = new Date(dueString)
                if (fsrsData["stability"] !== undefined) note.stability = fsrsData["stability"]
                if (fsrsData["difficulty"] !== undefined) note.difficulty = fsrsData["difficulty"]
                if (fsrsData["elapsed_days"] !== undefined) note.elapsed = fsrsData["elapsed_days"]
                if (fsrsData["scheduled_days"] !== undefined) note.scheduled = fsrsData["scheduled_days"]
                if (fsrsData["reps"] !== undefined) note.reps = fsrsData["reps"]
                if (fsrsData["lapses"] !== undefined) note.lapses = fsrsData["lapses"]
                if (fsrsData["state"] !== undefined) note.state = fsrsData["state"]
                if (fsrsData["last_review"] !== undefined) note.seen = new Date(fsrsData["last_review"])
            }

        } else {
            const dueString = queueData["due-at"]
            if (dueString) note.due = new Date(dueString)
        }
    }

    const intervalVal = frontmatter["q-interval"]
    note.interval = intervalVal

    return note
}
