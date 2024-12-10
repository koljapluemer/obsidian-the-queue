import { WorkspaceContainer } from "obsidian";
import { loadRandomFile } from "./manageFiles";

export function toggleFloatingQueueBar():void {
    let elements = document.querySelectorAll(".q-floating-bar")
    if (elements.length > 0) {
        elements.forEach(e => e.remove());
    } else {
        this.bar = this.app.workspace.containerEl.createEl('div', { cls: 'q-floating-bar' });
        const btnShowNext = this.bar.createEl('button', { text: 'Show next' })
            .addEventListener('click', () => {loadRandomFile()})
        const btnCloseBar = this.bar.createEl('button', { text: 'X' })
            .addEventListener('click', () => {toggleFloatingQueueBar()})
    }
}