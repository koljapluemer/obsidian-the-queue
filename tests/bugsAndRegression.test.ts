import { QueueNoteFactory } from "src/models/NoteFactory";
import { expect, test } from "vitest";
import { mockTFile } from "./data/mock";
import { noteTodoBasic } from "./data/notesTodo";
import { QueueButton } from "src/types";
import { dateTomorrow3Am } from "src/helpers/dateUtils";

test('todo — clicking `made progress` works', () => {
    const note = QueueNoteFactory.create(mockTFile, noteTodoBasic)
    note.score(QueueButton.MadeProgress)
    expect(note.qData.due).toEqual(dateTomorrow3Am())
})

