import QueueNote from "components/classes/QueueNote";
import * as ebisu from "ebisu-js";

export function adaptQueueNoteByScore(qNote: QueueNote, answer: string): QueueNote {

    if (qNote.getType() === "learn") {
        // check if q-data exists and is a dict, otherwise create it

        // assume stuff will be remembered for different kinds of interval, depending on user's confidence
        // hard = 1m, medium = 2h, easy = 48h
        // give the time in hours!
        let model;
        // use initial scoring and (with guessed initial halflifes)
        if (answer === "hard") {
            model = ebisu.defaultModel(1 / 6);
        } else if (answer === "medium") {
            model = ebisu.defaultModel(2);
        } else if (answer === "easy") {
            model = ebisu.defaultModel(24);
        }
        qNote.setModel(model);
        qNote.setLastSeen(new Date());
        qNote.startLearning();
    }

    // learning cards that we have seen before
    // TODO: make stuff like this robust against metadata being broken/missing (and think about what to even do)
    if (qNote.getType() === "learn-started") {
        // score: wrong = 0, correct = 1, easy = 2
        const score = answer === "wrong" ? 0 : answer === "correct" ? 1 : 2;
        // handle leech counting
        if (score === 0) {
            qNote.incrementLeechCount(1);
        } else {
            qNote.resetLeechCount();
        }
        qNote.setNewModel(score);
    }

    // note: "book" means *unstarted* book
    if (qNote.getType() === "book") {
        // if later, set in 10m
        if (answer === "later") {
            qNote.setDueLater("a bit later");
        } else {
            qNote.setDueLater("day later");
        }
        // only convert to started if answer is not "not-today" or "later"
        if (answer !== "not-today" && answer !== "later") {
            qNote.startReadingBook();
        }
    }

    if (qNote.getType() === "book-started") {
        if (answer === "later") {
            qNote.setDueLater("a bit later");
            qNote.incrementLeechCount(0.5);
        } else if (answer === "not-today") {
            qNote.setDueLater("day later");
            qNote.incrementLeechCount(1);
        } else if (answer === "done") {
            qNote.setDueLater("day later");
            qNote.resetLeechCount();
        } else if (answer === "finished") {
            qNote.setDueLater("day later");
            qNote.resetLeechCount();
            qNote.finishReadingBook();
        }
    }

    // article works essentially the same as book-started
    if (qNote.getType() === "article") {
        if (answer === "later") {
            qNote.setDueLater("a bit later");
        } else {
            qNote.setDueLater("day later");
        }
        // check if finished
        if (answer === "finished") {
            qNote.finishReadingArticle();
        }
    }

    if (
        qNote.getType() === "check" ||
        qNote.getType() === "habit" ||
        qNote.getType() === "todo"
    ) {
        if (answer === "later") {
            qNote.setDueLater("a bit later");
            qNote.incrementLeechCount(0.5);
        } else if (answer === "not-today") {
            qNote.setDueLater("day later");
            qNote.incrementLeechCount(1);
        } else {
            qNote.setDueLater("custom");
            qNote.resetLeechCount();
        }
    }

    // just handle the special case of todo being completed (due is handled in the condition before)
    if (qNote.getType() === "todo") {
        if (answer === "completed") {
            qNote.completeTodo();
        }
    }

    if (qNote.getType() === "misc") {
        if (answer === "show-less") {
            qNote.decrementPriority(1);
        } else if (answer === "show-more") {
            qNote.incrementPriority(1);
        }
        qNote.setDueLater("day later");
    }

    return qNote;
}