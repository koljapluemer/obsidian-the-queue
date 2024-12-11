import QueuePlugin from "src/main"
import { QueueNote, QueueNoteStage, QueueNoteTemplate } from "src/types"
import { pickRandom } from "./arrayUtils"
import { isNoteDue } from "./noteUtils"

export function getRandomDueNoteFromNotes(notes: QueueNote[], plugin: QueuePlugin): QueueNote | null {
    const noteTemplates = [QueueNoteTemplate.Learn, QueueNoteTemplate.Learn, QueueNoteTemplate.Todo, QueueNoteTemplate.Habit, QueueNoteTemplate.Check, QueueNoteTemplate.ShortMedia, QueueNoteTemplate.LongMedia, QueueNoteTemplate.Misc]
    let templateToPick: QueueNoteTemplate | null
    if (plugin.isStreakActive) {
        plugin.streakCounter += 1
        if (plugin.streakCounter > 12) {
            plugin.streakCounter = 0
            plugin.isStreakActive = false
            templateToPick = pickRandom(noteTemplates) 
        } else {
            templateToPick = plugin.currentTemplate
        }
    } else {
        templateToPick = pickRandom(noteTemplates) 
        if (templateToPick === QueueNoteTemplate.Learn ||templateToPick === QueueNoteTemplate.Check ) {
            plugin.isStreakActive = true
            plugin.currentTemplate = templateToPick
        }
    }

    const nrDueLearns = notes.filter(note => note.template === QueueNoteTemplate.Learn && note.stage === QueueNoteStage.Ongoing && isNoteDue(note)).length
    const nrActiveLongMedia = notes.filter(note => note.template === QueueNoteTemplate.LongMedia && note.stage === QueueNoteStage.Ongoing).length
    // TODO: hook up magic numbers to settings instead
    const allowNewLearns = nrDueLearns < 20
    const allowNewLongMedia = nrActiveLongMedia < 5
    console.info('ongoing learn notes currently due:', nrDueLearns)
    const simplyAllDueNotes = notes.filter(note => isNoteDue(note, allowNewLearns, allowNewLongMedia))
    const notesWithDesiredTemplate = simplyAllDueNotes.filter(note => note.template === templateToPick)
    return pickRandom(notesWithDesiredTemplate) || pickRandom(simplyAllDueNotes) || null
}