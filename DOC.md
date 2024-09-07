## Folder Structure

- partly designed by ChatGPT


```
/src
│
├── /models
│   ├── QueueNote.ts            # Represents a note, parsing frontmatter and handling note-specific data
│   └── QueueNoteFactory.ts     # Factory for creating QueueNote instances with different q-types
│
├── /types
│   ├── NoteTypeStrategy.ts     # Interface or abstract class for q-type strategies
│   ├── HabitStrategy.ts        # Concrete strategy for "habit" type behavior
│   ├── MiscStrategy.ts         # Concrete strategy for "misc" type behavior
│
├── /managers
│   └── QueueManager.ts         # Handles note selection, random loading, and delegates to correct q-type strategy
│
├── /views
│   └── QueueView.ts            # Extends MarkdownView, responsible for rendering UI and buttons
│
├── main.ts                     # Main plugin entry point, handles setup, ribbon button, and initialization
└── utils.ts                    # Utility functions for handling frontmatter parsing, etc.

```