import { getPluginContext } from "src/helpers/pluginContext"

export class QueueMediator {
    constructor() {
        const context = getPluginContext()
        
        context.plugin.registerEvent(context.app.workspace.on('file-open', async (file) => {
            console.log('file opened!', file)
        }))
    }

}