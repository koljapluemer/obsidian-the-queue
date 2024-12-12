import QueuePlugin from "src/main"
import { QueueMediator } from "./QueueMediator"
import { QueueButton } from "src/types"

export class QueueBar {
    isOpen = false
    containerEl: Element
    el: Element
    buttonHolderEl: Element
    mediator: QueueMediator


    constructor(parentEl: Element, mediator: QueueMediator) {
        this.mediator = mediator
        mediator.queueBar = this
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
        this.mediator.rerenderQueueBar()
    }

    #close() {
        this.el.remove()
    }


    renderButtonsForEmpty() {
        if (this.buttonHolderEl) {
            this.buttonHolderEl.innerHTML = ''
            this.buttonHolderEl.createEl('button', { text: 'Show random due note' })
                .addEventListener('click', () => { this.mediator.requestNewNote() })
        }
    }

    renderButtonsForNote(buttons: QueueButton[]) {
        if (this.buttonHolderEl) {
            this.buttonHolderEl.innerHTML = ''

            buttons.forEach((btn) => {
                this.buttonHolderEl.createEl('button', { text: btn })
                    .addEventListener('click', () => { this.mediator.onBarButtonClicked(btn) })
            })
        }
    }
}