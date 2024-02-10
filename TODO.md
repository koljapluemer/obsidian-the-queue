## Large Scale

* check if this works with fresh vault, and with all kinds of incomplete data!
* find a way to do automated tests
    1. take out the obsidian surroundings
    2. unrandomize the random

    1. or: start unit testing what can be tested easily with [this guide](https://www.freecodecamp.org/news/how-to-start-unit-testing-javascript/)

* maybe the *excuses* or/and *what would you be willing to do instead*
    - am I happy with the current implementation?
        - guess I don't like that the card becomes an actual `habit`
* implement priority
    - started in `utils/priority_sandbox.py` (project with Nate)
* handle the fact that notes may be dirty in a million trillion ways (validate cards, essentially), and have elegant fallbacks
* log data somehow (if only for self-analysis)
    * does not have to be in note metadata, I *can* filedump (or even just localstorage, I do have a browser essentially) 
    - think I started doing that, no?
* document how the program works lol
- implement leech check
    - could use my existing log to kickstart with a little bit of scripting
    - could hide away in a variable in q-data.model or something

## Small Scale


* check for wrong q-label `book` - some random internet links that are new have it, may be the bookmark importer
* at least for habit, stop the 16h hack and go for 4am (?)
    - core problem is I don't understand js variables, lmao
* some error when completing todos (todo is deleted, but it causes lag and error msg)
