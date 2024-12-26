import { QueueButton, QueueNoteData, QueueNoteStage, QueueNoteTemplate } from "src/types";
import { test, expect} from 'vitest'
import { mockTFile } from "./data/mock";
import { noteMiscDue } from "./data/notesMisc";
import { noteLongMediaNewExplicit, noteLongMediaStarted } from "./data/notesLongMedia";
import { noteLearnFSRSData, noteLearnStartedDueIncomplete, noteLearnUnstarted } from "./data/notesLearn";
import { noteTodoBasic } from "./data/notesTodo";
import { noteHabitBasic, noteHabitWeekly } from "./data/notesHabit";
import { noteCheckBasic, noteCheckWeekly } from "./data/notesCheck";
import { noteShortMediaBasic, noteShortMediaNotDue } from "./data/notesShortMedia";
import { QueueNoteFactory } from "src/models/NoteFactory";
import { QueueNote } from "src/models/QueueNote";
import { dateInNrOfDaysAt3Am, dateTenMinutesFromNow, dateTomorrow3Am } from "../src/helpers/dateUtils";

// ESSENTIAL

test('note creating works', () => {
    let note = QueueNoteFactory.create(mockTFile, noteMiscDue)
    expect(note.qData.template).toEqual(QueueNoteTemplate.Misc)
})


// isDue()



test('QueueNote | isDue(): new long media accepted by default (explicit)', () => {
    let note = QueueNoteFactory.create(mockTFile, noteLongMediaNewExplicit)
    expect(note.isDue()).toBeTruthy()
})

test('QueueNote | isDue(): new learn accepted by default (explicit)', () => {
    let note = QueueNoteFactory.create(mockTFile, noteLearnUnstarted)
    expect(note.isDue()).toBeTruthy()
})


// SCORING - State Transitions

test(`Queue Note | new learn card that's skipped keeps state`, () => {
    let note = QueueNoteFactory.create(mockTFile, noteLearnUnstarted)
    note.score(QueueButton.NotToday)
    expect(note.qData.stage).toEqual(QueueNoteStage.Unstarted)
})


test('QueueNote | scoring: new learn card transitions to ongoing', () => {
    let note = QueueNoteFactory.create(mockTFile, noteLearnUnstarted)
    note.score(QueueButton.StartLearning)
    expect(note.qData.stage).toEqual(QueueNoteStage.Ongoing)
})



// BUTTONS

// Basic Due Case 

test('QueueNote | buttons: due learn — basics', () => {
    let note = QueueNoteFactory.create(mockTFile, noteLearnStartedDueIncomplete) 
    expect(note.getButtons()).toEqual(["Wrong", "Hard", "Correct", "Easy"])
})

test('QueueNote | buttons: due todo — basics', () => {
    let note = QueueNoteFactory.create(mockTFile, noteTodoBasic) 
    expect(note.getButtons()).toEqual(["Not today", "Later", "Made progress", "Finished"])
})

test('QueueNote | buttons: due habit — basics', () => {
    let note = QueueNoteFactory.create(mockTFile, noteHabitBasic) 
    expect(note.getButtons()).toEqual(["Not today", "Later", "Done"])
})

test('QueueNote | buttons: due check — basics', () => {
    let note = QueueNoteFactory.create(mockTFile, noteCheckBasic) 
    expect(note.getButtons()).toEqual(["No", "Kind of", "Yes"])
})

test('QueueNote | buttons: due shortmedia — basics', () => {
    let note = QueueNoteFactory.create(mockTFile, noteShortMediaBasic) 
    expect(note.getButtons()).toEqual(["Not today", "Later", "Done", "Finished"])
})

test('QueueNote | buttons: due longmedia — basics', () => {
    let note = QueueNoteFactory.create(mockTFile, noteLongMediaStarted) 
    expect(note.getButtons()).toEqual(["Not today", "Later", "Done", "Finished"])
})

test('QueueNote | buttons: due misc — basics', () => {
    let note = QueueNoteFactory.create(mockTFile, noteMiscDue) 
    expect(note.getButtons()).toEqual(["Show next"])
})


// SCORING

test('QueueNote | scoring: learn (fsrs sanity check)', () => {
    let note:QueueNote = QueueNoteFactory.create(mockTFile, noteLearnFSRSData) 
    note.score(QueueButton.Easy)
    expect(note.qData.reps).toEqual(50)
    expect(note.qData.lapses).toEqual(5)
    expect(note.qData.interval).toBeUndefined()
    expect(note.qData.template).toEqual(QueueNoteTemplate.Learn)
    expect(note.qData.stage).toEqual(QueueNoteStage.Ongoing)
})

test('QueueNote | scoring: todo `not-today` due tomorrow', () => {
    let note = QueueNoteFactory.create(mockTFile, noteTodoBasic)
    note.score(QueueButton.NotToday)
    expect(note.qData.due).toEqual(dateTomorrow3Am())
})

test('QueueNote | scoring: todo `later` due in 10m', () => {
    let note = QueueNoteFactory.create(mockTFile, noteTodoBasic)
    note.score(QueueButton.Later)
    expect(note.qData.due).toEqual(dateTenMinutesFromNow())
})

test('QueueNote | scoring: todo `finished` exclude and not due', () => {
    let note = QueueNoteFactory.create(mockTFile, noteTodoBasic)
    note.score(QueueButton.Finished)
    expect(note.isDue()).toBeFalsy()
    expect(note.qData.stage).toEqual(QueueNoteStage.Finished)
})

test('QueueNote | scoring: habit `done` due after interval', () => {
    let note = QueueNoteFactory.create(mockTFile, noteHabitWeekly)
    note.score(QueueButton.Done)
    expect(note.qData.due).toEqual(dateInNrOfDaysAt3Am(7))
})

test('QueueNote | scoring: check `done` due after interval', () => {
    let note = QueueNoteFactory.create(mockTFile, noteCheckWeekly)
    note.score(QueueButton.Done)
    expect(note.qData.due).toEqual(dateInNrOfDaysAt3Am(7))
})

test('QueueNote | scoring: short media `done` due tmrw', () => {
    let note = QueueNoteFactory.create(mockTFile, noteShortMediaBasic)
    note.score(QueueButton.Done)
    expect(note.qData.due).toEqual(dateTomorrow3Am())
})

test('QueueNote | scoring: short media not due `shownext` no change to due', () => {
    let note = QueueNoteFactory.create(mockTFile, noteShortMediaNotDue)
    const dueDate = note.qData.due
    note.score(QueueButton.ShowNext)
    expect(note.qData.due).toEqual(dueDate)
})

test('QueueNote | scoring: short media `finished`: finished, due tmrw', () => {
    let note = QueueNoteFactory.create(mockTFile, noteShortMediaBasic)
    note.score(QueueButton.Finished)
    expect(note.qData.due).toEqual(dateTomorrow3Am())
    expect(note.qData.stage).toEqual(QueueNoteStage.Finished)
})

test('QueueNote | scoring: long media `finished`: finished, due tmrw', () => {
    let note = QueueNoteFactory.create(mockTFile, noteLongMediaNewExplicit)
    note.score(QueueButton.Finished)
    expect(note.qData.due).toEqual(dateTomorrow3Am())
    expect(note.qData.stage).toEqual(QueueNoteStage.Finished)
})
