import { QueueNote } from "src/classes/QueueNote";
import { QueueNoteData, QueueNoteTemplate } from "src/types";
import { test, expect} from 'vitest'
import { mockTFile } from "./data/mock";
import { noteMiscDue } from "./data/notesMisc";

test('note creating works', () => {
    const note:QueueNote = new QueueNote(mockTFile, noteMiscDue)
    expect(note.qData.template).toEqual(QueueNoteTemplate.Misc)
})