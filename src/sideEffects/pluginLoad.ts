import { TFile } from "obsidian";
import QueuePlugin from "src/main";
import { setContentOfQueueBar, toggleFloatingQueueBar } from "./queueButtonBar";
import { getNoteFromFile } from "src/functions/noteUtils";

export async function loadQueuePlugin(plugin:QueuePlugin) {
    await plugin.loadSettings();

    plugin.addRibbonIcon('banana', 'Toggle Queue', (evt: MouseEvent) => {
        toggleFloatingQueueBar(plugin)
    });

    // EVENT LISTENERS
    // TODO: make these dependent on whether queue is actually open
    plugin.registerEvent(plugin.app.workspace.on('file-open', async (file) => {
        if (file) {
            plugin.setCurrentlyTargetedNote(await getNoteFromFile(file))
            setContentOfQueueBar(file,plugin)
        } else {
            plugin.setCurrentlyTargetedNote(null)
        }
    }));
    plugin.registerEvent(plugin.app.vault.on('modify', (file) => {
        // TODO: this is needed to make live note template changes nice,
        // but currently it spams too hard; queuebar is reloaded so often,
        // and we even have race conditions
        // setContentOfQueueBar(file as TFile, plugin)
    }))

}