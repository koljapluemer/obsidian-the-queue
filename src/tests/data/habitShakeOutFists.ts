import { QueueNote, QueueNoteTemplate } from "../../types/queueNoteRelated"

export const mdHabitFists = `---
aliases: []
bibtex-key: ""
q-data:
  dueat: 2024-02-21T14:28:13.399Z
  efactor: 2.5
  lastseen: 0
  repetition: 0
  due-at: 2024-12-10T03:00:00.000Z
  leech-count: 0
q-interval: 2
q-priority: 3
q-keywords: habit
q-type: habit
---
- [[office health]]
	- [[⚓️ I optimize experience]]
`

export const noteHabitFists:QueueNote = {
    template: QueueNoteTemplate.Habit,
    due: new Date('2024-12-10T03:00:00.000Z'),
    interval: 2,
    priority: 3
}



export const yamlHabitFists = `---
aliases: []
bibtex-key: ""
q:
  template: habit
  due: 2024-12-10T03:00:00.000Z
  interval: 2
  priority: 3
---
- [[office health]]
	- [[⚓️ I optimize experience]]
`

