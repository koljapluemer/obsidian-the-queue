import QueuePlugin from "src/main";
import { setContentOfQueueBar, toggleFloatingQueueBar } from "./uiUtils";
import { getNoteFromFile } from "./interfaceNotesWithVault";

export async function loadQueuePlugin(plugin:QueuePlugin) {
    plugin.registerEvent(plugin.app.vault.on('modify', (file) => {
        // TODO: this is needed to make live note template changes nice,
        // but currently it spams too hard; queuebar is reloaded so often,
        // and we even have race conditions
        // setContentOfQueueBar(file as TFile, plugin)
    }))

}