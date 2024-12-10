import { Notice, TFile } from "obsidian";
import QueuePlugin from "./main";

// Helper to get a random file from the vault
export function getRandomFileFromVault(): TFile | undefined {
    const allFiles = this.app.vault.getMarkdownFiles();
    console.info(`found ${allFiles.length} files`)
    if (allFiles.length === 0) {
        new Notice("No files in the vault!");
        return undefined;
    }
    const randomIndex = Math.floor(Math.random() * allFiles.length);
    return allFiles[randomIndex];
}

// Load a random TFile in the current view
export function loadRandomFile(): TFile | undefined {
    const randomFile = getRandomFileFromVault();
    if (randomFile) {
        console.info('found random file to open', randomFile)
        console.info('trying', this.app)
        this.app.workspace.getLeaf(false).openFile(randomFile)
        return randomFile
    }
    return undefined
}