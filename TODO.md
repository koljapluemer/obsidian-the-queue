
### Ideas

- use a documentation framework?
- find a way to do automated tests
    1. take out the obsidian surroundings
    2. unrandomize the random
    3. or: start unit testing what can be tested easily with [this guide](https://www.freecodecamp.org/news/how-to-start-unit-testing-javascript/)
- calendar functionality
    - start with birthdays
- add notices (Toasts)
- dependent learn notes?
    - poetry is just *so* hard
- add empty and non-existing frontmatter to test suite
- do something about long load time...
    - idea: I mean, kind of doesn't matter if it's partly async, as long as we load *some* notes...
- analyze long loading time
    - ideally optimize
    - otherwise add subtle loading animation or smth
- add a kind of `Test` button so that people can see how their note would look like in queue
- make `needs-improvement` adaptable
- add orphan screenshot
- add *Tips and Tricks* to Readme
    - Wozniak 20 rules of formulating
    - AutoMOC recommendation
    - could even be blog posts about 'how I use my tool to do x'
- allow disabling log
- allow good UX for export
- explain the learn note limit setting
- add concepts from 20 rules to learn leech prompt options?
- handle access of settings more elegantly than sessionCookie, Singleton?
- add demo video to `README.md`

### Bugs and minor improvements

- add command?
- notes where leech count was reset (and is in fact set as `0` in the frontmatter) sometimes show up with leech prompt again
- see that editing with the pen icon also triggers leech decrement
- fix type issues
- 'Not Now' for improvable prompt for learn cards fails