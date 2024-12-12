import { QueueMediator } from "./QueueMediator"
import { QueueNote } from "./QueueNote"
import { QueueNoteStage, QueueNoteTemplate } from "src/types"
import { getAllMdFiles } from "src/helpers/vaultUtils"
import { getRandomInt, pickRandom } from "src/helpers/arrayUtils"

// knows the notes
// when asked, produces a random note (probably to open it)
export class NoteShuffler {
    mediator: QueueMediator
    notes: QueueNote[] = []

    constructor(mediator: QueueMediator) {
        this.mediator = mediator
        mediator.noteShuffler = this
    }

    public async getDueNote(): Promise<QueueNote | null> {
        if (this.notes.length > 0) {
            console.info('notes fully loaded, picking from full set')
            return this.getDueNoteFromAllNotes()
        } else {
            console.info('notes not yet fully loaded, picking any')
            return await this.getDueNoteQuickly()
        }
    }

    public async loadNotes() {
        const allFiles = getAllMdFiles();
        try {
            const notes: QueueNote[] = []
            for (const file of allFiles) {
                const note = await QueueNote.createNoteFromFile(file)
                if (note && note.qData.template !== QueueNoteTemplate.Exclude) {
                    notes.push(note)
                }
            }
            console.info('finished loading notes:', notes.length)
            this.notes = notes
        } catch (error) {
            console.error('Error loading notes:', error);
        }
    }

    private getDueNoteFromAllNotes(): QueueNote | null {
        const notes = this.notes
        const noteTemplates = [QueueNoteTemplate.Learn, QueueNoteTemplate.Learn, QueueNoteTemplate.Todo, QueueNoteTemplate.Habit, QueueNoteTemplate.Check, QueueNoteTemplate.ShortMedia, QueueNoteTemplate.LongMedia, QueueNoteTemplate.Misc]
        let templateToPick: QueueNoteTemplate | null

        templateToPick = pickRandom(noteTemplates)

        const nrDueLearns = notes.filter(note => note.qData.template === QueueNoteTemplate.Learn && note.qData.stage === QueueNoteStage.Ongoing && note.isDue()).length
        const nrActiveLongMedia = notes.filter(note => note.qData.template === QueueNoteTemplate.LongMedia && note.qData.stage === QueueNoteStage.Ongoing).length
        // TODO: hook up magic numbers to settings instead
        const allowNewLearns = nrDueLearns < 20
        const allowNewLongMedia = nrActiveLongMedia < 5
        console.info('ongoing learn notes currently due:', nrDueLearns)
        const simplyAllDueNotes = notes.filter(note => note.isDue(allowNewLearns, allowNewLongMedia))
        const notesWithDesiredTemplate = simplyAllDueNotes.filter(note => note.qData.template === templateToPick)
        return pickRandom(notesWithDesiredTemplate) || pickRandom(simplyAllDueNotes) || null
    }

    private async getDueNoteQuickly(): Promise<QueueNote | null> {
        let dueNote: QueueNote | null = null

        // the following is a bit cheese, but it ensures that we randomly get due files
        // from the whole vault, not always from the same part of the file list
        const allFiles = getAllMdFiles();
        const randomStartingIndex = getRandomInt(0, allFiles.length - 1)
        const allFilesFromStartingIndexAndAddedToTheEndAgain = allFiles.slice(randomStartingIndex).concat(allFiles)

        for (const file of allFilesFromStartingIndexAndAddedToTheEndAgain) {
            const note = await QueueNote.createNoteFromFile(file)
            if (note) {
                dueNote = note
                break
            }
        }
        return dueNote
    }

    public removeNoteFromNotes(note: QueueNote) {
        // delete note that was saved from notes, so that it won't be opened again
        this.notes = this.notes.filter(el => el.file !== note.file)

    }
}

