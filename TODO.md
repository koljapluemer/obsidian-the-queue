
### Ideas

- use a documentation framework?
- find a way to do automated tests
    1. take out the obsidian surroundings
    2. unrandomize the random
    3. or: start unit testing what can be tested easily with [this guide](https://www.freecodecamp.org/news/how-to-start-unit-testing-javascript/)
- calendar functionality
    - start with birthdays
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
- allow disabling log
- allow good UX for export
- explain the learn note limit setting
- add concepts from 20 rules to learn leech prompt options?
- add demo video to `README.md`
- allow weighing collections instead of the awkward duplication hack 
    - basically implemented, check if it actually works
- allow setting how many due learn cards are allowed
- give option to autodelete old todos
- bring back gh style feedback with little squares

#### Redesign in View Leaf

- maybe want to go for `EditableFileView` extension? 
    - [inspiration](https://github.com/lachholden/obsidian-recipe-view/blob/a1b92eb0c078994e4493a53f22c8bef70ef812fc/src/recipe-view.ts#L8)

### Bugs and minor improvements

- add command?
- notes where leech count was reset (and is in fact set as `0` in the frontmatter) sometimes show up with leech prompt again
- see that editing with the pen icon also triggers leech decrement
- fix type issues
- 'Not Now' for improvable prompt for learn cards fails
- new books added even if above designated number?
- fix up the escomplete (it's outdated among others for Obs doc)
- adapt documentation to reflect new todo handling


- see issue on gh: q freezing after 1 card, or not loading at all.
- see that note overview stat is not saved when filter is active (massive distorition)

### Next

- see that long notes have a scrollbar so that buttons aren't covered (see Light and Colors in the Outdoors for an example)

