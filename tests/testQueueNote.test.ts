import { QueueNote } from "src/classes/QueueNote";
import { QueueNoteData, QueueNoteTemplate } from "src/types";
import { test, expect} from 'vitest'
import { mockTFile } from "./data/mock";
import { noteMiscDue } from "./data/notesMisc";
import { noteLongMediaNew, noteLongMediaNewExplicit, noteLongMediaStarted } from "./data/notesLongMedia";

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

test('QueueNote | buttons: due longmedia — basics', () => {
    const note = new QueueNote(mockTFile, noteLongMediaStarted) 
    expect(note.getButtons()[0]).toEqual("Not today")
})

test('QueueNote | buttons: new longmedia', () => {
    const note = new QueueNote(mockTFile, noteLongMediaNew) 
    expect(note.getButtons()[1]).toEqual("Start")
})