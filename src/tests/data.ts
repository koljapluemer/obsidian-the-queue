export const basicLearnMd = `---
q-type: learn
---

Egypt

---

Cairo
`

export const learningMdDueInFuture = `---
q-type: learn
q-data:
  fsrs-data:
    due: 2099-12-10T09:21:26.817Z
    stability: 1.4436
    difficulty: 6.3449
    elapsed_days: 0
    scheduled_days: 0
    reps: 8
    lapses: 0
    state: 1
---

future

---

مـُستـَقبـَل 
`

export const basicTodoMd = `---
q-type: todo
---

Answer Anna
`


export const basicHabitMd = `---
q-type: habit

Make some Kindle quotes standalone notes
---
`


export const basicCheckMd = `---
q-type: check
---

Got enough sleep last night?
`

export const basicPromptMd = `---
q-type: prompt
---

Note down the last thing you bought
`

export const basicShortMediaMd = `---
q-type: media-short
---

📰 The Pattern Language of Project Xanadu
`

export const basicLongMediaMd = `---
q-type: media-long
---

📖 Guns, Germs and Steel
`

export const basicLongMediaMdDueInFuture = `---
q-type: media-long
q-data:
  due-at: 2099-12-10T03:00:00.000Z
---

📖 Stoner
`

export const basicLongMediaMdDueInPast = `---
q-type: media-long
q-data:
  due-at: 1999-12-10T03:00:00.000Z
---

📖 Emma
`

export const  basicMiscMd = `
Deep Breaths!
`

export const basicExcludeMd = `---
q-type: exclude
---

Secret Report #344
`


export const basicNoteList = [
    basicCheckMd,
    basicExcludeMd,
    basicHabitMd,
    basicLearnMd,
    basicLongMediaMd,
    basicMiscMd,
    basicPromptMd,
    basicShortMediaMd,
    basicTodoMd
]