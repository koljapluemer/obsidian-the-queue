## Large Scale

* check if this works with fresh vault, and with all kinds of incomplete data!
* find a way to do automated tests
    1. take out the obsidian surroundings
    2. unrandomize the random

    1. or: start unit testing what can be tested easily with [this guide](https://www.freecodecamp.org/news/how-to-start-unit-testing-javascript/)

* implement priority
    - started in `utils/priority_sandbox.py` (project with Nate)
* handle the fact that notes may be dirty in a million trillion ways (validate cards, essentially), and have elegant fallbacks
* document how the program works lol
- implement leech check
    - could use my existing log to kickstart with a little bit of scripting
    - could hide away in a variable in q-data.model or something
- calendar functionality
    - start with birthdays
- elegant way to handle first-time learn cards
- implement house cleaning into the-q
    - *adopt this orphan* would be an obvious start...
    - or a regex or whatever or a `[[]]` or a `#` with *this needs improvement*
* check for wrong q-label `book` - some random internet links that are new have it, may be the bookmark importer
* at least for habit, stop the 16h hack and go for 4am (?)
    - core problem is I don't understand js variables, lmao
* some error when completing todos (todo is deleted, but it causes lag and error msg)
- make *Show Less Often* influence prio, not interval
- when note is renamed when editing from q, there is an error msg when reopening
    - does nothing bad but not elegant either
- *Marta*: Skip trivially easy cards
    - first, improve tracking and do an hour of cramming with some small dataset
- account for the case that learn cards are really easy, but we don't have new learn cards 
    - in that case we may want to learn some easy cards, or maybe not
- deal with the weird global variables
    - especially the one that saves a setting that should be accessible anyways
- add notices
- optional: pass current keyword filter into QueueFilterModal so that it can be preselected
- special treatment of new learn cards