export class ButtonFactory {
    // Create a button with a label and a provided action
    static createButton(label: string, action: () => void): HTMLElement {
      const button = document.createElement('button');
      button.textContent = label;
      button.classList.add('queue-note-button');
  
      // Attach the provided action to the button
      button.addEventListener('click', action);
  
      return button;
    }
  }
  