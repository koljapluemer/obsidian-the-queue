import { getNoteFromString } from "../queueNoteUtils"
import { mdHabitFists, noteHabitFists, yamlHabitFists } from "./data/habitShakeOutFists"
import { mdLearnEgBenefitFromOg, noteLearnEgBenefitFromOg, yamlLearnEgBenefitFromOg } from "./data/learnEgBenefitFrom"

test(`legacy learn note parses correctly`, () => {
    expect(
        getNoteFromString(mdLearnEgBenefitFromOg)
    ).toMatchObject(noteLearnEgBenefitFromOg)
})

test(`learn note parses correctly`, () => {
    expect(
        getNoteFromString(yamlLearnEgBenefitFromOg)
    ).toMatchObject(noteLearnEgBenefitFromOg)
})



test(`legacy habit note parses correctly`, () => {
    expect(
        getNoteFromString(mdHabitFists)
    ).toMatchObject(noteHabitFists)
})

test(`habit note parses correctly`, () => {
    expect(
        getNoteFromString(yamlHabitFists)
    ).toMatchObject(noteHabitFists)
})