import QueuePlugin from "src/main"
import { QueueMediator } from "./QueueMediator"
import { QueueButton } from "src/types"

export class QueueBar {
    isOpen = false
    containerEl: Element
    el: Element
    buttonHolderEl: Element
    mediator: QueueMediator

    setMediator(mediator: QueueMediator) {
        this.mediator = mediator
    }

    constructor(parentEl: Element) {
        this.containerEl = parentEl
    }

    toggle() {
        if (this.isOpen) {
            this.#close()
            this.isOpen = false
        } else {
            this.#open()
            this.isOpen = true
        }
    }

    #open() {
        this.el = this.containerEl.createEl('div', { cls: 'q-floating-bar' });
        this.buttonHolderEl = this.el.createEl('div', { cls: 'q-floating-bar-btn-holder' })
        this.el.createEl('button', { text: 'X' })
            .addEventListener('click', () => { this.toggle() })
    }

    #close() {
        this.el.remove()
        console.log('closed')
    }


    renderButtonsForEmpty() {
        console.info('rendering empty queue bar')
        this.buttonHolderEl.createEl('button', { text: 'Show random due note' })
            .addEventListener('click', () => { this.mediator.requestNewNote() })
    }

    renderButtonsForNote(buttons: QueueButton[]) {
        console.info('rendering bar with note')

        buttons.forEach((btn) => {
            this.buttonHolderEl.createEl('button', { text: btn })
                .addEventListener('click', () => { this.mediator.onBarButtonClicked(btn) })
        })
    }
}