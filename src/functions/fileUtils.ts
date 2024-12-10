import { Notice, TFile } from "obsidian";

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