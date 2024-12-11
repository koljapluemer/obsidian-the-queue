import { TFile } from "obsidian";
import QueuePlugin from "src/main";
import { QueueButton, QueueNote } from "src/types";
import { getNoteFromFile, loadNotes, openRandomFile, saveCurrentNote } from "./interfaceNotesWithVault";
import { changeNoteDataAccordingToInteraction, fillInNoteFromFile, getButtonsForNote } from "./noteUtils";

export async function toggleFloatingQueueBar(plugin: QueuePlugin) {
    let elements = document.querySelectorAll(".q-floating-bar")
    if (elements.length > 0) {
        closeFloatingQueueBar(elements)
    } else {
        loadNotes(plugin)
        openFloatingQueueBar(plugin)
    }
}

function closeFloatingQueueBar(queueBars: NodeListOf<Element>) {
    // weird foreach because we may have several due to some error, in this case kill them all
    queueBars.forEach(e => e.remove());
}

async function openFloatingQueueBar(plugin: QueuePlugin) {
    plugin.app.workspace.containerEl.createEl('div', { cls: 'q-floating-bar' });
    if (plugin.currentlyTargetedNote) {
        setContentOfQueueBar(plugin.currentlyTargetedNote, plugin)
    } else {
        openRandomFile(plugin)
    }

}

// TODO: persist current buttons, so we don't need to redraw if its the same buttons anyways
// (especially on file change)
export function setContentOfQueueBar(note: QueueNote | null, plugin: QueuePlugin) {
    console.info('setting queue bar...with note', note)
    const elements = document.querySelectorAll(".q-floating-bar")

    if (elements.length > 0) {
        elements.forEach((el, i) => i > 0 && el.remove());
        const bar = elements[0]
        bar.innerHTML = ''
        if (note) {
            renderNoteQueueBar(bar, note, plugin)
        } else {
            renderEmptyQueueBar(bar, plugin)

        }
    }
}


function renderEmptyQueueBar(bar: Element, plugin: QueuePlugin) {
    console.info('rendering empty queue bar')
    bar.createEl('button', { text: 'Show random due note' })
        .addEventListener('click', () => { openRandomFile(plugin) })
    addCloseButton(bar, plugin)
}

function renderNoteQueueBar(bar: Element, note: QueueNote, plugin: QueuePlugin) {
    console.info('rendering bar with note', note)

    const buttons = getButtonsForNote(note)

    buttons.forEach((btn) => {
        bar.createEl('button', { text: btn })
            .addEventListener('click', () => { reactToQueueButtonClick(btn, plugin) })
    })

    addCloseButton(bar, plugin)
}

function addCloseButton(parent: Element, plugin: QueuePlugin) {
    parent.createEl('button', { text: 'X' })
        .addEventListener('click', () => { toggleFloatingQueueBar(plugin) })
}

export async function reactToQueueButtonClick(btn: QueueButton, plugin: QueuePlugin) {
    if (plugin.currentlyTargetedNote) {
        // we can ignore the return, b/c this is also using a passed in mutable obj
        // we're changing the currentlyTargetedNote anyways
        changeNoteDataAccordingToInteraction(plugin.currentlyTargetedNote, btn)
        saveCurrentNote(plugin)
        openRandomFile(plugin)
    }
}

