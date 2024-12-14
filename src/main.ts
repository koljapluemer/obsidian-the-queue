import { Plugin, TFile } from 'obsidian';
import { QueueBar } from './controllers/QueueBar';
import { NoteShuffler } from './controllers/NoteShuffler';
import { ActiveNoteManager } from './controllers/ActiveNoteManager';
import { setQueuePluginContext } from './contexts/pluginContext';
import { QueueMediator } from './controllers/QueueMediator';


interface QueueSettings {
    mySetting: string;
}

const DEFAULT_SETTINGS: QueueSettings = {
    mySetting: 'default'
}

// acts as Mediator for main components
export default class QueuePlugin extends Plugin {

    queueBar: QueueBar

    async onload() {
        setQueuePluginContext(this)
        const mediator = new QueueMediator()

        this.queueBar = new QueueBar(this.app.workspace.containerEl, mediator)
        new NoteShuffler(mediator)
        new ActiveNoteManager(mediator)

        this.addRibbonIcon('banana', 'Toggle Queue', (evt: MouseEvent) => {
            // the toggle is held here b/c it's basically the core way of
            // interacting with the plugin itself,
            // however the logic is first handled by the QueueBar visually
            // and than passed to the mediator
            this.queueBar.toggle()
        });
    }

    unload() {
        if (this.queueBar) {
            this.queueBar.el.remove()
        }
    }
}