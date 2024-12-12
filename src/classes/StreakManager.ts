import { QueueNoteTemplate } from "src/types";

export class StreakManager {
    currentStreakTemplate: QueueNoteTemplate | null
    streakCounter = 0

    public onNoteWithTemplateWasPicked(template: QueueNoteTemplate) {
        // for now, learn and check *always* trigger a streak
        if (template == QueueNoteTemplate.Learn || template == QueueNoteTemplate.Check) {
            this.currentStreakTemplate = template
        } else {
            this.currentStreakTemplate = null
            this.streakCounter

        }

        if (this.currentStreakTemplate !== null) {
            this.streakCounter += 1
            if (this.streakCounter > 20) {
                this.streakCounter = 0
                this.currentStreakTemplate = null
            }
        }
    }

    public getCurrentStreakTemplate(): QueueNoteTemplate | null {
        return this.currentStreakTemplate
    }
}