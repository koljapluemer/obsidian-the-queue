import { QueueMediator } from "./QueueMediator"

export class NoteShuffler {
    mediator: QueueMediator

    setMediator(mediator: QueueMediator) {
        this.mediator = mediator
    }
}