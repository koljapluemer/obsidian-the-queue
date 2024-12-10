import { TFile, WorkspaceContainer } from "obsidian";
import { QueueButton } from "../types";
import { getButtonsForNote, getNoteFromFrontMatter, reactToQueueButtonClick } from "../functions/noteUtils";
import { loadRandomFile } from "./openRandomNote";

export async function toggleFloatingQueueBar() {
    let elements = document.querySelectorAll(".q-floating-bar")
    if (elements.length > 0) {
        elements.forEach(e => e.remove());
    } else {
        this.app.workspace.containerEl.createEl('div', { cls: 'q-floating-bar' });
        const currentlyOpenFile: TFile | null = this.app.workspace.getActiveFile();
        if (currentlyOpenFile) {
            setContentOfQueueBar(currentlyOpenFile)
            console.info('file open rn')
        } else {
            console.info('nothing open rn')
            const randomFile = loadRandomFile()
            if (randomFile) {
                console.info('found file')
                setContentOfQueueBar(randomFile)
            } else {
                console.warn('no file found', randomFile)
            }

        }
    }
}

// TODO: persist current buttons, so we don't need to redraw if its the same buttons anyways
// (especially on file change)
export function setContentOfQueueBar(file: TFile | null) {
    const elements = document.querySelectorAll(".q-floating-bar")
    if (elements.length > 0) {
        const bar = elements[0]
        bar.innerHTML = ''

        if (file) {
            this.app.fileManager.processFrontMatter(file, (frontmatter: any) => {
                const note = getNoteFromFrontMatter(frontmatter)
                const buttons = getButtonsForNote(note)

                buttons.forEach((btn) => {
                    bar.createEl('button', { text: btn })
                        .addEventListener('click', () => { reactToQueueButtonClick(file, note, btn), loadRandomFile() })
                })

                bar.createEl('button', { text: 'X' })
                    .addEventListener('click', () => { toggleFloatingQueueBar() })
            })

        } else {
            bar.createEl('button', { text: 'Show random due note' })
                .addEventListener('click', () => { loadRandomFile() })

            bar.createEl('button', { text: 'X' })
                .addEventListener('click', () => { toggleFloatingQueueBar() })
        }
    }
}


