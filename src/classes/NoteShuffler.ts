import { QueueMediator } from "./QueueMediator"

export class NoteShuffler {
    mediator: QueueMediator

    constructor(mediator: QueueMediator) {
        this.mediator = mediator
        mediator.noteShuffler = this
    }
}