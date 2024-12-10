import { getFirstDueNoteFromVaultThatWeCanFind, getRandomDueNoteFromVault, getRandomNoteFromVault } from "src/functions/noteUtils";
import QueuePlugin from "src/main";

export async function openRandomFile(plugin: QueuePlugin) {
    try {
        // const randomNote = await getRandomNoteFromVault()
        const randomNote = await getFirstDueNoteFromVaultThatWeCanFind()
        // const randomNote = await getRandomDueNoteFromVault()
        if (randomNote !== null) {
            this.app.workspace.getLeaf(false).openFile(randomNote.file)
            plugin.setCurrentlyTargetedNote(randomNote)
        }
    } catch (error) {
        console.error('the queue:', error)
    }
}