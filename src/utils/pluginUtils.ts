import QueuePlugin from "src/main";
import { setContentOfQueueBar, toggleFloatingQueueBar } from "./uiUtils";
import { getNoteFromFile } from "./interfaceNotesWithVault";

export async function loadQueuePlugin(plugin:QueuePlugin) {
    await plugin.loadSettings();

    plugin.addRibbonIcon('banana', 'Toggle Queue', (evt: MouseEvent) => {
        toggleFloatingQueueBar(plugin)
    });

    // EVENT LISTENERS
    // TODO: make these dependent on whether queue is actually open
    plugin.registerEvent(plugin.app.workspace.on('file-open', async (file) => {
            plugin.setCurrentlyTargetedFile(file)
    }));
    plugin.registerEvent(plugin.app.vault.on('modify', (file) => {
        // TODO: this is needed to make live note template changes nice,
        // but currently it spams too hard; queuebar is reloaded so often,
        // and we even have race conditions
        // setContentOfQueueBar(file as TFile, plugin)
    }))

}