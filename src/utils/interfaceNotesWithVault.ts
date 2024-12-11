import { QueueNote, QueueNoteStage, QueueNoteTemplate } from "src/types";
import {  isNoteDue } from "./noteUtils";
import { TFile } from "obsidian";
import QueuePlugin from "src/main";
import { getRandomDueNoteFromNotes } from "./noteListUtils";

export async function getNotesFromFiles(files: TFile[]): Promise<QueueNote[]> {
    try {
        const notes: QueueNote[] = []
        for (const file of files) {
            const note = await getNoteFromFile(file)
            if (note && note.template !== QueueNoteTemplate.Exclude) {
                notes.push(note)
            }
        }
        return notes
    } catch (error) {
        console.error('Error loading notes:', error);
        return []
    }
}


export function getNoteFromFile(file: TFile): Promise<QueueNote | null> {
    return new Promise((resolve, reject) => {
        try {
            this.app.fileManager.processFrontMatter(file, (frontmatter: any) => {
                const note = getNoteFromFrontMatter(frontmatter, file);
                resolve(note); // Resolve the Promise with the processed note
            });
        } catch (error) {
            console.error(error); // Reject the Promise if an error occurs
            return null
        }
    });
}


export async function getFirstDueNoteFromVaultThatWeCanFind(): Promise<QueueNote | null> {
    try {
        const allFiles = this.app.vault.getMarkdownFiles();
        const randomStartIndex = Math.floor(Math.random() * allFiles.length);
        let dueNote: QueueNote | null = null
        for (const file of allFiles.slice(randomStartIndex).concat(allFiles)) {
            const note = await getNoteFromFile(file)
            if (note) {

                if (isNoteDue(note)) {
                    dueNote = note
                    break
                }
            } else {
                console.warn('could not create note for file', file)
            }
        }
        if (dueNote) {
            return dueNote
        } else {
            return null
        }
    }
    catch (error) {
        console.error('Error retrieving first due note note:', error);
        return null
    }
}

export function getNoteFromFrontMatter(frontmatter: any, file: TFile): QueueNote {
    let note: QueueNote = {
        template: QueueNoteTemplate.Misc,
        file: file
    }

    // new paradigm
    const q = frontmatter["q"]
    if (q) {

        const templateString = q["template"] || ""
        switch (templateString) {
            case 'learn':
                note.template = QueueNoteTemplate.Learn
                break
            case 'todo':
                note.template = QueueNoteTemplate.Todo
                break
            case 'habit':
                note.template = QueueNoteTemplate.Habit
                break
            case 'check':
                note.template = QueueNoteTemplate.Check
                break
            case 'shortmedia':
                note.template = QueueNoteTemplate.ShortMedia
                break
            case 'longmedia':
                note.template = QueueNoteTemplate.LongMedia
                break
            case 'exclude':
                note.template = QueueNoteTemplate.Exclude
                break
        }

        const stageString = q["stage"] || ""
        switch (stageString) {
            case 'unstarted':
                note.stage = QueueNoteStage.Unstarted
                break
            case 'ongoing':
                note.stage = QueueNoteStage.Ongoing
                break
            case 'finished':
                note.stage = QueueNoteStage.Finished
                break
        }

        if (q["due"] !== undefined) note.due = new Date(q["due"])
        if (q["seen"] !== undefined) note.seen = new Date(q["seen"])
        if (q["interval"] !== undefined) note.interval = q["interval"]
        if (q["stability"] !== undefined) note.stability = q["stability"]
        if (q["difficulty"] !== undefined) note.difficulty = q["difficulty"]
        if (q["elapsed"] !== undefined) note.elapsed = q["elapsed"]
        if (q["scheduled"] !== undefined) note.scheduled = q["scheduled"]
        if (q["reps"] !== undefined) note.reps = q["reps"]
        if (q["lapses"] !== undefined) note.lapses = q["lapses"]
        if (q["state"] !== undefined) note.state = q["state"]

    } else {

        // old paradigm

        const templateString = frontmatter["q-type"] || ""
        switch (templateString) {
            case 'learn-started':
            case 'learn':
                note.template = QueueNoteTemplate.Learn
                break
            case 'todo':
                note.template = QueueNoteTemplate.Todo
                break
            case 'habit':
                note.template = QueueNoteTemplate.Habit
                break
            case 'check':
                note.template = QueueNoteTemplate.Check
                break
            case 'article':
                note.template = QueueNoteTemplate.ShortMedia
                break
            case 'book-started':
            case 'book':
                note.template = QueueNoteTemplate.LongMedia
                break
            case 'exclude':
            case 'todo-finished':
                note.template = QueueNoteTemplate.Exclude
                break
        }

        // check stages
        switch (templateString) {
            case 'learn-started':
            case 'book-started':
                note.stage = QueueNoteStage.Ongoing
                break
            case 'book-finished':
                note.stage = QueueNoteStage.Finished
                break
        }

        const queueData = frontmatter["q-data"]
        if (queueData) {
            // due-at changes for learn ntoes
            if (note.template == QueueNoteTemplate.Learn) {
                const fsrsData = queueData["fsrs-data"]
                if (fsrsData) {
                    const dueString = fsrsData["due"]
                    if (dueString !== undefined) note.due = new Date(dueString)
                    if (fsrsData["stability"] !== undefined) note.stability = fsrsData["stability"]
                    if (fsrsData["difficulty"] !== undefined) note.difficulty = fsrsData["difficulty"]
                    if (fsrsData["elapsed_days"] !== undefined) note.elapsed = fsrsData["elapsed_days"]
                    if (fsrsData["scheduled_days"] !== undefined) note.scheduled = fsrsData["scheduled_days"]
                    if (fsrsData["reps"] !== undefined) note.reps = fsrsData["reps"]
                    if (fsrsData["lapses"] !== undefined) note.lapses = fsrsData["lapses"]
                    if (fsrsData["state"] !== undefined) note.state = fsrsData["state"]
                    if (fsrsData["last_review"] !== undefined) note.seen = new Date(fsrsData["last_review"])
                }

            } else {
                const dueString = queueData["due-at"]
                if (dueString) note.due = new Date(dueString)
            }
        }

        const intervalVal = frontmatter["q-interval"]
        note.interval = intervalVal
    }

    // TODO: make this fail if stuff is none, or not a date, etc.
    // requires handling of returning null

    return note
}



export async function loadNotes(plugin: QueuePlugin) {
    const allFiles = this.app.vault.getMarkdownFiles();
    plugin.notes = await getNotesFromFiles(allFiles)
}


export async function saveCurrentNote(plugin: QueuePlugin) {
    const note = plugin.currentlyTargetedNote
    if (note) {
        this.app.fileManager.processFrontMatter(note.file, (frontmatter: any) => {
            frontmatter["q"] = frontmatter["q"] || {}

            if (note.template !== QueueNoteTemplate.Misc) {
                const template = Object.keys(QueueNoteTemplate).find(
                    // @ts-ignore
                    key => QueueNoteTemplate[key] === note.template
                )
                frontmatter["q"]["template"] = template?.toLowerCase()
            }

            if (note.stage !== undefined && note.stage !== QueueNoteStage.Base) {
                const stage = Object.keys(QueueNoteStage).find(
                    // @ts-ignore
                    key => QueueNoteStage[key] === note.stage
                )
                frontmatter["q"]["stage"] = stage?.toLowerCase()
            }

            if (note.due !== undefined) frontmatter["q"]["due"] = note.due
            if (note.seen !== undefined) frontmatter["q"]["seen"] = note.seen
            if (note.interval !== undefined && note.interval != 1) frontmatter["q"]["interval"] = note.interval
            if (note.stability !== undefined) frontmatter["q"]["stability"] = note.stability
            if (note.difficulty !== undefined) frontmatter["q"]["difficulty"] = note.difficulty
            if (note.elapsed !== undefined) frontmatter["q"]["elapsed"] = note.elapsed
            if (note.scheduled !== undefined) frontmatter["q"]["scheduled"] = note.scheduled
            if (note.reps !== undefined) frontmatter["q"]["reps"] = note.reps
            if (note.lapses !== undefined) frontmatter["q"]["lapses"] = note.lapses
            if (note.state !== undefined) frontmatter["q"]["state"] = note.state

            deletePropertiesWithOldPrefix(frontmatter)
        })

        // delete note that was saved from notes, so that it won't be opened again
        plugin.notes = plugin.notes.filter(el => el.file !== note.file)
    }
}

// TODO: put this behind a settings toggle
function deletePropertiesWithOldPrefix(obj: Record<string, any>): void {
    for (const key of Object.keys(obj)) {
        if (key.startsWith("q-")) {
            delete obj[key];
        }
    }
}

export async function openRandomFile(plugin: QueuePlugin) {
    try {
        let randomNote: QueueNote | null
        if (plugin.notes.length > 0) {
            console.info('full note set loaded, getting note from there')
            randomNote = getRandomDueNoteFromNotes(plugin.notes, plugin)
        } else {
            console.info('full note set not yet loaded, getting any due note')
            randomNote = await getFirstDueNoteFromVaultThatWeCanFind()
        }
        if (randomNote !== null) {
            this.app.workspace.getLeaf(false).openFile(randomNote.file)
            plugin.setCurrentlyTargetedNote(randomNote)
        }
    } catch (error) {
        console.error('the queue:', error)
    }
}