import { QueueNote, QueueNoteStage, QueueNoteTemplate } from "../../types/queueNoteRelated"

export const mdLearnEgBenefitFromOg = `---
q-type: learn-started
created-at: 30.07.2024
q-keywords: frequent-words
auto-generate: true
q-data:
  fsrs-data:
    due: 2024-12-10T09:21:26.817Z
    stability: 1.4436
    difficulty: 6.3449
    elapsed_days: 1
    scheduled_days: 0
    reps: 8
    lapses: 0
    state: 1
    last_review: 2024-12-10T09:16:26.817Z
  last-seen: 2024-12-09T10:53:51.621Z
---
 
---

## استفادوا
`

export const noteLearnEgBenefitFromOg:QueueNote = {
    template: QueueNoteTemplate.Learn,
    stage: QueueNoteStage.Ongoing,
    due: new Date('2024-12-10T09:21:26.817Z'),
    stability: 1.4436,
    difficulty: 6.3449,
    elapsed: 1,
    scheduled: 0,
    reps: 8,
    lapses: 0,
    state: 1,
    seen: new Date('2024-12-10T09:16:26.817Z')
}

export const yamlLearnEgBenefitFromOg = `---
created-at: 30.07.2024
auto-generate: true
q:
  template: learn
  stage: ongoing
  due: 2024-12-10T09:21:26.817Z
  stability: 1.4436
  difficulty: 6.3449
  elapsed: 1
  scheduled: 0
  reps: 8
  lapses: 0
  state: 1
  seen: 2024-12-10T09:16:26.817Z
---
 
---

## استفادوا
`