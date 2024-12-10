import { QueueNoteType } from "../types/queueNoteRelated"
import { getQueueNoteFromString } from "../utilities/queueNoteUtils"
import { basicLearnMd } from "./data"



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

test('note with no due is counted as due', () => {
    const basicLearn = getQueueNoteFromString(basicLearnMd)
    expect(
        basicLearn.isDue()
    ).toBeTruthy()
})