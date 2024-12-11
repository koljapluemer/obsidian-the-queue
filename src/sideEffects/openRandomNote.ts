import { getFirstDueNoteFromVaultThatWeCanFind, getNotesFromFiles, getRandomDueNoteFromNotes } from "src/functions/noteUtils";
import QueuePlugin from "src/main";
import { QueueNote } from "src/types";

export async function openRandomFile(plugin: QueuePlugin) {
    try {
        let randomNote: QueueNote | null
        if (plugin.notes.length > 0) {
            console.info('full note set loaded, getting note from there')
            randomNote = getRandomDueNoteFromNotes(plugin.notes)
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

export async function loadNotes(plugin: QueuePlugin) {
    const allFiles = this.app.vault.getMarkdownFiles();
    plugin.notes = await getNotesFromFiles(allFiles)
}