import { QueueButton, QueueNoteData, QueueNoteStage, QueueNoteTemplate } from "src/types";
import { test, expect, vi } from 'vitest'
import { QueueNoteFactory } from "src/models/NoteFactory";
import { QueueNote } from "src/models/QueueNote";
import { dateInNrOfDaysAt3Am, dateTenMinutesFromNow, dateTomorrow3Am } from "../src/helpers/dateUtils";
import { TFile } from "obsidian";


export const mockTFile = {
    path: "mock-folder/mock-file.md",
    name: "mock-file.md",
    basename: "mock-file",
    extension: "md",
    stat: {
        ctime: 1672531200000, // Mock creation time (e.g., 2023-01-01T00:00:00.000Z)
        mtime: 1672534800000, // Mock modification time
        size: 1234, // Mock file size in bytes
    },
    vault: {
        adapter: {
            write: vi.fn(() => Promise.resolve()),
            read: vi.fn(() => Promise.resolve("mock file content")),
            delete: vi.fn(() => Promise.resolve()),
            rename: vi.fn(() => Promise.resolve()),
        },
        getName: vi.fn(() => "MockVault"),
    },
    unsafeCachedData: null,
} as unknown as TFile;


// SCORING - State Transitions

test(`Queue Note | new learn card that's skipped keeps state`, () => {
    const n: QueueNoteData = {
        template: QueueNoteTemplate.Learn,
        stage: QueueNoteStage.Unstarted
    }
    const note = QueueNoteFactory.create(mockTFile, n)
    note.score(QueueButton.NotToday)
    expect(note.qData.stage).toEqual(QueueNoteStage.Unstarted)
})


test('QueueNote | scoring: new learn card transitions to ongoing', () => {
    const n: QueueNoteData =  {
        template: QueueNoteTemplate.Learn,
        stage: QueueNoteStage.Unstarted
    } 
    const note = QueueNoteFactory.create(mockTFile, n)
    note.score(QueueButton.StartLearning)
    expect(note.qData.stage).toEqual(QueueNoteStage.Ongoing)
})





// ESSENTIAL

test('note creating works', () => {
    const n: QueueNoteData = {
        template: QueueNoteTemplate.Misc,
        due: new Date(1999, 1, 1)
    }
    const note = QueueNoteFactory.create(mockTFile, n)
    expect(note.qData.template).toEqual(QueueNoteTemplate.Misc)
})


// isDue()



test('QueueNote | isDue(): new long media accepted by default (explicit)', () => {
    const n: QueueNoteData = {
        template: QueueNoteTemplate.LongMedia,
        stage: QueueNoteStage.Unstarted
    }
    const note = QueueNoteFactory.create(mockTFile, n)
    expect(note.isDue()).toBeTruthy()
})

test('QueueNote | isDue(): new learn accepted by default (explicit)', () => {
    const n: QueueNoteData =  {
        template: QueueNoteTemplate.Learn,
        stage: QueueNoteStage.Unstarted
    } 
    const note = QueueNoteFactory.create(mockTFile, n)
    expect(note.isDue()).toBeTruthy()
})



// BUTTONS

// Basic Due Case 

test('QueueNote | buttons: due learn — basics', () => {
    const n: QueueNoteData =  {
        template: QueueNoteTemplate.Learn,
        stage: QueueNoteStage.Ongoing
    } 
    const note = QueueNoteFactory.create(mockTFile, n) 
    expect(note.getButtons()).toEqual(["Wrong", "Hard", "Correct", "Easy"])
})

test('QueueNote | buttons: due todo — basics', () => {
    const n: QueueNoteData = {
        template: QueueNoteTemplate.Todo,
        stage: QueueNoteStage.Ongoing
    }
    const note = QueueNoteFactory.create(mockTFile, n) 
    expect(note.getButtons()).toEqual(["Not today", "Later", "Made progress", "Finished"])
})

test('QueueNote | buttons: due habit — basics', () => {
    const n: QueueNoteData = {
        template: QueueNoteTemplate.Habit,
    }
    const note = QueueNoteFactory.create(mockTFile, n) 
    expect(note.getButtons()).toEqual(["Not today", "Later", "Done"])
})

test('QueueNote | buttons: due check — basics', () => {
    const n: QueueNoteData = {
        template: QueueNoteTemplate.Check,
    } 
    const note = QueueNoteFactory.create(mockTFile, n) 
    expect(note.getButtons()).toEqual(["No", "Kind of", "Yes"])
})

test('QueueNote | buttons: due shortmedia — basics', () => {
    const n: QueueNoteData = {
        template: QueueNoteTemplate.ShortMedia,
        stage: QueueNoteStage.Ongoing
    } 
    const note = QueueNoteFactory.create(mockTFile, n) 
    expect(note.getButtons()).toEqual(["Not today", "Later", "Done", "Finished"])
})

test('QueueNote | buttons: due longmedia — basics', () => {
    const n: QueueNoteData = {
        template: QueueNoteTemplate.LongMedia,
        stage: QueueNoteStage.Ongoing
    
    } 
    const note = QueueNoteFactory.create(mockTFile, n) 
    expect(note.getButtons()).toEqual(["Not today", "Later", "Done", "Finished"])
})

test('QueueNote | buttons: due misc — basics', () => {
    const n:QueueNoteData = {
        template: QueueNoteTemplate.Misc,
        due: new Date(1999, 1, 1)
    }
    const note = QueueNoteFactory.create(mockTFile, n) 
    expect(note.getButtons()).toEqual(["Show next"])
})


// SCORING

test('QueueNote | scoring: learn (fsrs sanity check)', () => {
    const n: QueueNoteData =  {
        template: QueueNoteTemplate.Learn,
        stage: QueueNoteStage.Ongoing,
        due: new Date('2023-12-27T18:32:17.409Z'),
        seen: new Date('2023-12-11T18:32:17.409Z'),
        stability: 15.62332369,
        difficulty: 9.54482981,
        elapsed: 13,
        scheduled: 16,
        reps: 49,
        lapses: 5,
        state: 2
    }
    const note:QueueNote = QueueNoteFactory.create(mockTFile, n) 
    note.score(QueueButton.Easy)
    expect(note.qData.reps).toEqual(50)
    expect(note.qData.lapses).toEqual(5)
    expect(note.qData.interval).toBeUndefined()
    expect(note.qData.template).toEqual(QueueNoteTemplate.Learn)
    expect(note.qData.stage).toEqual(QueueNoteStage.Ongoing)
})

test('QueueNote | scoring: todo `not-today` due tomorrow', () => {
    const n: QueueNoteData = {
        template: QueueNoteTemplate.Todo,
        stage: QueueNoteStage.Ongoing
    }
    const note = QueueNoteFactory.create(mockTFile, n)
    note.score(QueueButton.NotToday)
    expect(note.qData.due).toEqual(dateTomorrow3Am())
})

test('QueueNote | scoring: todo `later` due in 10m', () => {
    const n: QueueNoteData = {
        template: QueueNoteTemplate.Todo,
        stage: QueueNoteStage.Ongoing
    } 
    const note = QueueNoteFactory.create(mockTFile, n)
    note.score(QueueButton.Later)
    expect(note.qData.due).toEqual(dateTenMinutesFromNow())
})

test('QueueNote | scoring: todo `finished` exclude and not due', () => {
    const n: QueueNoteData = {
        template: QueueNoteTemplate.Todo,
        stage: QueueNoteStage.Ongoing
    } 
    const note = QueueNoteFactory.create(mockTFile, n)
    note.score(QueueButton.Finished)
    expect(note.isDue()).toBeFalsy()
    expect(note.qData.stage).toEqual(QueueNoteStage.Finished)
})

test('QueueNote | scoring: habit `done` due after interval', () => {
    const n: QueueNoteData = {
        template: QueueNoteTemplate.Habit,
        interval: 7
    }
    const note = QueueNoteFactory.create(mockTFile, n)
    note.score(QueueButton.Done)
    expect(note.qData.due).toEqual(dateInNrOfDaysAt3Am(7))
})

test('QueueNote | scoring: check `done` due after interval', () => {
    const n: QueueNoteData = {
        template: QueueNoteTemplate.Check,
        interval: 7
    }
    const note = QueueNoteFactory.create(mockTFile, n)
    note.score(QueueButton.Done)
    expect(note.qData.due).toEqual(dateInNrOfDaysAt3Am(7))
})

test('QueueNote | scoring: short media `done` due tmrw', () => {
    const n: QueueNoteData = {
        template: QueueNoteTemplate.ShortMedia,
        stage: QueueNoteStage.Ongoing
    }
    const note = QueueNoteFactory.create(mockTFile, n)
    note.score(QueueButton.Done)
    expect(note.qData.due).toEqual(dateTomorrow3Am())
})

test('QueueNote | scoring: short media not due `shownext` no change to due', () => {
    const n: QueueNoteData = {
        template: QueueNoteTemplate.ShortMedia,
        due: new Date(2099, 1, 1),
        stage: QueueNoteStage.Ongoing
    } 
    const note = QueueNoteFactory.create(mockTFile, n)
    const dueDate = note.qData.due
    note.score(QueueButton.ShowNext)
    expect(note.qData.due).toEqual(dueDate)
})

test('QueueNote | scoring: short media `finished`: finished, due tmrw', () => {
    const n: QueueNoteData = {
        template: QueueNoteTemplate.ShortMedia,
        stage: QueueNoteStage.Ongoing
    } 
    const note = QueueNoteFactory.create(mockTFile, n)
    note.score(QueueButton.Finished)
    expect(note.qData.due).toEqual(dateTomorrow3Am())
    expect(note.qData.stage).toEqual(QueueNoteStage.Finished)
})

test('QueueNote | scoring: long media `finished`: finished, due tmrw', () => {
    const n: QueueNoteData =  {
        template: QueueNoteTemplate.LongMedia,
        stage: QueueNoteStage.Unstarted
    } 
    const note = QueueNoteFactory.create(mockTFile, n)
    note.score(QueueButton.Finished)
    expect(note.qData.due).toEqual(dateTomorrow3Am())
    expect(note.qData.stage).toEqual(QueueNoteStage.Finished)
})
