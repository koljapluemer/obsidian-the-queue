// functions are separated because they require obs specific stuff
// ...and thus, side effects

import { TFile } from "obsidian";
import { getPluginContext } from "./pluginContext";
import { QueueNote } from "src/classes/QueueNote";
import { QueueNoteStage, QueueNoteTemplate } from "src/types";

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
    return files
}

export function openFile(file: TFile) {
    getPluginContext().app.workspace.getLeaf(false).openFile(file)
}

// SAVING

export function saveNoteToVault(note: QueueNote) {
    if (note) {
        getPluginContext().app.fileManager.processFrontMatter(note.file, (frontmatter: any) => {
            frontmatter["q"] = frontmatter["q"] || {}

            if (note.qData.template !== QueueNoteTemplate.Misc) {
                const template = Object.keys(QueueNoteTemplate).find(
                    // @ts-ignore
                    key => QueueNoteTemplate[key] === note.qData.template
                )
                frontmatter["q"]["template"] = template?.toLowerCase()
            }

            if (note.qData.stage !== undefined && note.qData.stage !== QueueNoteStage.Base) {
                const stage = Object.keys(QueueNoteStage).find(
                    // @ts-ignore
                    key => QueueNoteStage[key] === note.qData.stage
                )
                frontmatter["q"]["stage"] = stage?.toLowerCase()
            }

            if (note.qData.due !== undefined) frontmatter["q"]["due"] = note.qData.due
            if (note.qData.seen !== undefined) frontmatter["q"]["seen"] = note.qData.seen
            if (note.qData.interval !== undefined && note.qData.interval !== 1 && note.qData.interval !== 0) frontmatter["q"]["interval"] = note.qData.interval
            if (note.qData.stability !== undefined) frontmatter["q"]["stability"] = note.qData.stability
            if (note.qData.difficulty !== undefined) frontmatter["q"]["difficulty"] = note.qData.difficulty
            if (note.qData.elapsed !== undefined) frontmatter["q"]["elapsed"] = note.qData.elapsed
            if (note.qData.scheduled !== undefined) frontmatter["q"]["scheduled"] = note.qData.scheduled
            if (note.qData.reps !== undefined) frontmatter["q"]["reps"] = note.qData.reps
            if (note.qData.lapses !== undefined) frontmatter["q"]["lapses"] = note.qData.lapses
            if (note.qData.state !== undefined) frontmatter["q"]["state"] = note.qData.state

            deletePropertiesWithOldPrefix(frontmatter)
        })

    }
}

// TODO: put this behind a settings toggle
function deletePropertiesWithOldPrefix(obj: Record<string, any>): void {
    for (const key of Object.keys(obj)) {
        if (key.startsWith("q-")) {
            delete obj[key];
        }
    }
}
