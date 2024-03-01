*This document briefly described the structure of the repository. Detailed documentation can be found inline, partly in docstrings.*

1. All business logic is to be found in `src/`
2. The entry point for the software is `src/main.ts`
3. `main.ts` does the elementary boilerplate plugin things, such as loading the `Settings`, setting and unsetting eventListeners, etc.
4. Most importantly `main.ts` binds the `QueueModal`-modal to a ribbon icon. This modal is the core of the plugin.
5. `QueueModal` is a class, defined in `elements/QueueModal.ts`.
6. `elements/` also holds two other files, defining auxiliary UI components: The `QueueSettingsTab`, where the Setting UI is defined and `QueueFilterModal`, a modal that can be opened from within the main modal for the specific and fairly rare use case of filtering (see `README.md` to see what filtering is about)
7. `QueueModal` is mainly responsible for two things:
    1. triggering data-loading and converting functions on load
    2. loading a random `QueuePrompt` whenever required and rendering it
        - `QueuePrompt` is what this plugin is all about — a random `QueueNote` and a specific *prompt*, which determines which buttons the user sees and how the `QueueNote` is treated.
8. `QueueNote` is the most important non-UI class of the plugin. It is defined in `classes/QueueNote.ts`. It is responsible for the majority of features described in `README.md`. Every note in your vault gets its own `QueueNote`, and whether to display a given note, how to handle it, how to score it, how to render it etc. is defined within this class.
9. `QueuePrompt` on contrast is a fairly small wrapper around `QueueNote` existing because of a specific almost-edge-case, please see it's class description.
10. `QueueLog` is just an attempt to elegantly save and retrieve localStorage logs — unless you're interested in Logging (see `README`), you can ignore it.
11. Back to main features: To eventually pick a `QueueNote` (or rather, `QueuePrompt`) to actually render, `QueueModal` first uses `getSortedSelectionsOfPickableNotes()` (saved in `utils/`) to get an array of arrays or `QueueNote`s which would be a valid pick.
12. Then, `pickRandomNoteWithPriorityWeighting()` (saved in`utils/randomSelection.ts`) is used on one these selections to actually get a random `QueueNote`.
13. For the actual rendering, another `utils/` function `renderModalNote()` is called — its existence in a separate file is merely for readability.
14. Within this function, callbacks are registered to first change the displayed `QueueNote` according to what the user does and to then pick a new note, calling `QueueModal`s `loadNewNote()`.
15. Thus, the circle is closed. Another `QueueNote` corresponding to another one of the user's vault notes will always be shown, until the plugin main modal is closed or until there are no more due `QueueNote`s. 