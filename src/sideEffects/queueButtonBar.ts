import { TFile } from "obsidian";
import { getButtonsForNote, getNoteFromFile, getNoteFromFrontMatter } from "../functions/noteUtils";
import QueuePlugin from "src/main";
import { loadNotes, openRandomFile } from "./openRandomNote";
import { QueueButton } from "src/types";
import { getNoteDataForDueInDays } from "src/functions/scoringUtils";
import { saveCurrentNote } from "./saveNote";

export async function toggleFloatingQueueBar(plugin: QueuePlugin) {
    let elements = document.querySelectorAll(".q-floating-bar")
    if (elements.length > 0) {
        elements.forEach(e => e.remove());
    } else {
        loadNotes(plugin)
        this.app.workspace.containerEl.createEl('div', { cls: 'q-floating-bar' });
        const currentlyOpenFile: TFile | null = this.app.workspace.getActiveFile();
        if (currentlyOpenFile) {
            plugin.currentlyTargetedNote = await getNoteFromFile(currentlyOpenFile)
            setContentOfQueueBar(currentlyOpenFile, plugin)
        } else {
            openRandomFile(plugin)

        }
    }
}

// TODO: persist current buttons, so we don't need to redraw if its the same buttons anyways
// (especially on file change)
export function setContentOfQueueBar(file: TFile | null, plugin: QueuePlugin) {
    const elements = document.querySelectorAll(".q-floating-bar")

    if (elements.length > 0) {
        elements.forEach((el, i) => i > 0 && el.remove());
        const bar = elements[0]
        bar.innerHTML = ''

        if (file) {
            this.app.fileManager.processFrontMatter(file, (frontmatter: any) => {
                const note = getNoteFromFrontMatter(frontmatter, file)
                const buttons = getButtonsForNote(note)

                buttons.forEach((btn) => {
                    bar.createEl('button', { text: btn })
                        .addEventListener('click', () => { reactToQueueButtonClick(btn, plugin), openRandomFile(plugin) })
                })

                bar.createEl('button', { text: 'X' })
                    .addEventListener('click', () => { toggleFloatingQueueBar(plugin) })
            })

        } else {
            bar.createEl('button', { text: 'Show random due note' })
                .addEventListener('click', () => { openRandomFile(plugin) })

            bar.createEl('button', { text: 'X' })
                .addEventListener('click', () => { toggleFloatingQueueBar(plugin) })
        }
    }
}

export function reactToQueueButtonClick(btn: QueueButton, plugin: QueuePlugin) {
    if (plugin.currentlyTargetedNote) {
        // we can ignore the return, b/c this is also using a passed in mutable obj
        // we're changing the currentlyTargetedNote anyways
        getNoteDataForDueInDays(plugin.currentlyTargetedNote, 1)
        saveCurrentNote(plugin)
    }
}

