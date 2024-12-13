import { QueueNote } from "src/classes/QueueNote";
import { QueueNoteData, QueueNoteTemplate } from "src/types";
import { test, expect} from 'vitest'
import { mockTFile } from "./data/mock";
import { noteMiscDue } from "./data/notesMisc";
import { noteLongMediaNew, noteLongMediaNewExplicit, noteLongMediaStarted } from "./data/notesLongMedia";
import { noteLearnStartedDueIncomplete } from "./data/notesLearn";
import { noteTodoBasic } from "./data/notesTodo";
import { noteHabitBasic } from "./data/notesHabit";
import { noteCheckBasic } from "./data/notesCheck";
import { noteShortMediaBasic } from "./data/notesShortMedia";

// ESSENTIAL

test('note creating works', () => {
    const note:QueueNote = new QueueNote(mockTFile, noteMiscDue)
    expect(note.qData.template).toEqual(QueueNoteTemplate.Misc)
})


// isDue()


test('QueueNote | isDue(): new long media denied by default (implicit)', () => {
    const note:QueueNote = new QueueNote(mockTFile, noteLongMediaNew)
    expect(note.isDue()).toBeFalsy()
})

test('QueueNote | isDue(): new long media denied by default (explicit)', () => {
    const note:QueueNote = new QueueNote(mockTFile, noteLongMediaNewExplicit)
    expect(note.isDue()).toBeFalsy()
})


// BUTTONS

// Basic Due Case 

test('QueueNote | buttons: due learn — basics', () => {
    const note = new QueueNote(mockTFile, noteLearnStartedDueIncomplete) 
    expect(note.getButtons()).toEqual(["Wrong", "Hard", "Correct", "Easy"])
})

test('QueueNote | buttons: due todo — basics', () => {
    const note = new QueueNote(mockTFile, noteTodoBasic) 
    expect(note.getButtons()).toEqual(["Not today", "Later", "Done", "Finished"])
})

test('QueueNote | buttons: due habit — basics', () => {
    const note = new QueueNote(mockTFile, noteHabitBasic) 
    expect(note.getButtons()).toEqual(["Not today", "Later", "Done"])
})

test('QueueNote | buttons: due check — basics', () => {
    const note = new QueueNote(mockTFile, noteCheckBasic) 
    expect(note.getButtons()).toEqual(["No", "Kind of", "Yes"])
})

test('QueueNote | buttons: due shortmedia — basics', () => {
    const note = new QueueNote(mockTFile, noteShortMediaBasic) 
    expect(note.getButtons()).toEqual(["Not today", "Later", "Done", "Finished"])
})

test('QueueNote | buttons: due longmedia — basics', () => {
    const note = new QueueNote(mockTFile, noteLongMediaStarted) 
    expect(note.getButtons()).toEqual(["Not today", "Later", "Done", "Finished"])
})

test('QueueNote | buttons: due misc — basics', () => {
    const note = new QueueNote(mockTFile, noteMiscDue) 
    expect(note.getButtons()).toEqual(["Show less often", "Ok, cool", "Show more often"])
})
