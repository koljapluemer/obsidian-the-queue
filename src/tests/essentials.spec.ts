import { QueueNoteType } from "../types/QueueNote"
import { getQueueNoteFromString } from "../utilities/queueNoteUtils"

test('empty note parses correctly', () => {
    expect(getQueueNoteFromString("")).toEqual({front:"", noteType: QueueNoteType.Misc})
})