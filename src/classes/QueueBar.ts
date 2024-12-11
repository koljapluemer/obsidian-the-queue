export class QueueBar {
    isOpen = false
    containerEl: Element
    el: Element
    buttonHolderEl: Element

    constructor(containerEl: Element) {
        this.containerEl = containerEl
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
        console.log('close')
    }
}