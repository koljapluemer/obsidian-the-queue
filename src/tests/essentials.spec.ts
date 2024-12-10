import { QueueNoteType } from "../types/queueNoteRelated"
import { getQueueNoteFromString } from "../utilities/queueNoteUtils"
import { basicLearnMd, basicLongMediaMdDueInFuture, basicLongMediaMdDueInPast } from "./data"



test(`basic learn note: type parses correctly`, () => {
    expect(getQueueNoteFromString(basicLearnMd)
        .noteType)
        .toEqual(QueueNoteType.Learn)
})

test(`empty misc note: type parses correctly`, () => {
    expect(getQueueNoteFromString("")
        .noteType)
        .toEqual(QueueNoteType.Misc)
})

// BASIC DUE

test('note with no due is counted as due', () => {
    const basicLearn = getQueueNoteFromString(basicLearnMd)
    expect(
        basicLearn.isDue()
    ).toBeTruthy()
})

test('book note due in future not counted as due', () => {
    const bookNote = getQueueNoteFromString(basicLongMediaMdDueInFuture) 
    expect(
        bookNote.isDue()
    ).toBeFalsy()
})

test('book note due in past counted as due', () => {
    const bookNote = getQueueNoteFromString(basicLongMediaMdDueInPast) 
    expect(
        bookNote.isDue()
    ).toBeTruthy()
})