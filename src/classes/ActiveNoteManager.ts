import { TFile } from "obsidian";
import { QueueNote } from "./QueueNote";

export class ActiveNoteManager {
    activeNote:QueueNote
    activeFile:TFile | null

    constructor() {
    }

    // onNewFileOpened(file:TFile | null) {
    //     this.activeFile = file
    // }
}