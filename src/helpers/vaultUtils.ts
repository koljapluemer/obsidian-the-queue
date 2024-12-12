// functions are separated because they require obs specific stuff
// ...and thus, side effects

import { TFile } from "obsidian";
import { getPluginContext } from "./pluginContext";

export function getFrontmatterOfFile(file: TFile): Promise<any | null> {
    return new Promise((resolve, reject) => {
        try {
            const fileManager = getPluginContext().app.fileManager
            fileManager.processFrontMatter(file, frontmatter => {
                resolve(frontmatter)
            })
        } catch (error) {
            console.error(error);
            return null
        }
    })
}

export function getAllMdFiles(): TFile[] {
    const files = getPluginContext().app.vault.getMarkdownFiles()
    console.info('found md files:', files.length)
    return files
}

export function openFile(file:TFile) {
    this.app.workspace.getLeaf(false).openFile(file)
}