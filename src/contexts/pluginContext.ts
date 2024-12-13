import { App } from "obsidian";
import QueuePlugin from "src/main";


export interface QueuePluginContext {
    app: App;
    plugin: QueuePlugin;
}

let context: QueuePluginContext;

export function setQueuePluginContext(plugin: QueuePlugin): void {
    context = {
        app: plugin.app,
        plugin: plugin
    }
}

export function getPluginContext(): QueuePluginContext {
    if (!context) {
        throw new Error("Plugin context not set")
    }
    return context
}