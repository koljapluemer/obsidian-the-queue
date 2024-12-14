import { QueueNoteData, QueueNoteStage, QueueNoteTemplate } from "src/types";

const streakStartPercentage = 0.4


export class StreakManager {
    currentStreakTemplate: QueueNoteTemplate | null
    streakOngoing = false
    streakCounter = 0

    public onNoteWasPicked(noteData: QueueNoteData) {
        if (this.incomingNoteDataIsValidForStreak(noteData)) {
            if (this.streakOngoing) {
                this.iterateStreak()
            } else {
                if (this.streakShouldBeStarted()) this.startStreak(noteData.template)
            }
        } else {
            if (this.streakOngoing) this.resetStreak()
        }
    }

    public getCurrentStreakTemplate(): QueueNoteTemplate | null {
        return this.currentStreakTemplate
    }

    private streakShouldBeStarted(): boolean {
        return Math.random() < streakStartPercentage
    }

    private startStreak(template: QueueNoteTemplate) {
        this.streakCounter = 0
        this.streakOngoing = true
        this.currentStreakTemplate = template
    }

    private resetStreak() {
        this.streakOngoing = false
        this.currentStreakTemplate = null
    }

    private incomingNoteDataIsValidForStreak(noteData: QueueNoteData): boolean {
        // streaks work with (ongoing) learn items, and checks
        // the _ongoing_ part means the streak breaks when we're hitting new learn cards
        // preventing streak after streak of introducing new learn cards
        return (noteData.template == QueueNoteTemplate.Learn && noteData.stage === QueueNoteStage.Ongoing)
            || noteData.template == QueueNoteTemplate.Check
    }

    private iterateStreak() {
        this.streakCounter += 1
        if (this.streakCounter > 20) {
            this.resetStreak()
        }
    }
}