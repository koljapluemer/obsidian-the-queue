// functions are separated because they require obs specific stuff

import { FileManager, TFile } from "obsidian";

export function getFrontmatterOfFile(file: TFile, fileManager: FileManager): Promise<any | null> {
    return new Promise((resolve, reject) => {
        try {
            fileManager.processFrontMatter(file, frontmatter => {
                resolve(frontmatter)

            })
        } catch (error) {
            console.error(error);
            return null
        }
    })
}