import { TFile } from "obsidian";
import QueuePlugin from "src/main";
import { setContentOfQueueBar, toggleFloatingQueueBar } from "./queueButtonBar";

export async function loadQueuePlugin(plugin:QueuePlugin) {
    await plugin.loadSettings();

    plugin.addRibbonIcon('banana', 'Toggle Queue', (evt: MouseEvent) => {
        toggleFloatingQueueBar()
    });

    // EVENT LISTENERS
    // TODO: make these dependent on whether queue is actually open
    plugin.registerEvent(plugin.app.workspace.on('file-open', (file) => {
        if (file) {
            setContentOfQueueBar(file)
        } else {
            setContentOfQueueBar(null)
        }
    }));
    plugin.registerEvent(plugin.app.vault.on('modify', (file) => {
        setContentOfQueueBar(file as TFile)
    }))

}