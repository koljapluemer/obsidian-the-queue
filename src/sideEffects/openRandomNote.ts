import { TFile } from "obsidian";
import { getRandomFileFromVault } from "src/functions/fileUtils";

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