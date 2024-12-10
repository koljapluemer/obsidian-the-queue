import { Notice } from "obsidian";
import { QueueNote } from "src/types";
import { getNoteFromFile } from "./noteUtils";

export async function getRandomNoteFromVault(): Promise<QueueNote | null> {
    const allFiles = this.app.vault.getMarkdownFiles();
    if (allFiles.length === 0) {
        new Notice("No files in the vault!");
        return null;
    }
    const randomIndex = Math.floor(Math.random() * allFiles.length);
    const randomFile = allFiles[randomIndex];
    try {
        const note = await getNoteFromFile(randomFile);
        return note; // Return the note
    } catch (error) {
        console.error('Error retrieving note:', error);
        return null
    }
}