import { getRandomNoteFromVault } from "src/functions/fileUtils";
import QueuePlugin from "src/main";

export async function openRandomFile(plugin: QueuePlugin) {
    try {
        const randomNote = await getRandomNoteFromVault()
        if (randomNote !== null) {
            this.app.workspace.getLeaf(false).openFile(randomNote.file)
            plugin.setCurrentlyTargetedNote(randomNote)
        }
    } catch (error) {
        console.error('the queue:', error)
    }
}