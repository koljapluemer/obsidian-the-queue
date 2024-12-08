import { getQueueNoteFromString } from "../utilities/queueNoteUtils"

test('basic note factory works', () => {
    expect(getQueueNoteFromString("")).toEqual({front:""})
})