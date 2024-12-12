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