import { QueueNote, QueueNoteStage, QueueNoteTemplate } from "src/types";
import { fillInNoteFromFile, isNoteDue } from "./noteUtils";
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
                const note = fillInNoteFromFile(frontmatter, file);
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


export async function loadNotes(plugin: QueuePlugin) {
    const allFiles = this.app.vault.getMarkdownFiles();
    plugin.notes = await getNotesFromFiles(allFiles)
}


export async function saveCurrentNote(plugin: QueuePlugin) {
    const note = plugin.currentlyTargetedNote
    if (note) {
        writeNoteDataToItsfFile(note)
        // delete note that was saved from notes, so that it won't be opened again
        plugin.notes = plugin.notes.filter(el => el.file !== note.file)
    }
}

async function writeNoteDataToItsfFile(note: QueueNote) {
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