import { QueueNoteType } from "../types/QueueNote"
import { getQueueNoteFromString } from "../utilities/queueNoteUtils"
import { basicLearnMd } from "./data"

test('empty note parses correctly', () => {
    expect(getQueueNoteFromString("")).toEqual({front:"", noteType: QueueNoteType.Misc})
})

test(`basic learn note parses correctly`, () => {
    expect(getQueueNoteFromString(basicLearnMd)
        .noteType)
        .toEqual(QueueNoteType.Learn)
})