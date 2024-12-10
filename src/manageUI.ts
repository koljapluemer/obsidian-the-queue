import { TFile, WorkspaceContainer } from "obsidian";
import { loadRandomFile } from "./manageFiles";
import { QueueButton } from "./types";
import { getButtonsForNote, getNoteFromFrontMatter } from "./manageNotes";

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

export function setContentOfQueueBar(file: TFile) {
    this.app.fileManager.processFrontMatter(file, (frontmatter: any) => {
        const note = getNoteFromFrontMatter(frontmatter)
        const buttons = getButtonsForNote(note)
        const elements = document.querySelectorAll(".q-floating-bar")
        if (elements.length > 0) {
            const bar = elements[0]

            buttons.forEach((btn) => {
                bar.createEl('button', { text: btn })
                    .addEventListener('click', () => { loadRandomFile() })
            })


            const btnCloseBar = bar.createEl('button', { text: 'X' })
                .addEventListener('click', () => { toggleFloatingQueueBar() })
        } else {
            console.warn("the queue: tried to set buttons, but bar doesn't exist")
        }

    })
}


