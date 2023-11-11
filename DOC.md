# Documentation

## Structure

Everything worth noting happens in `main.ts`.

### Files

#### main.ts

We're essentially doing nothing but setting up a modal. The plugin's `onload()` loads it and created a button for it.

### Approaches

### Where can I insert a leech/excuse dialog?

- probably smart to do it in `handleScoring()`
- can I stack modals?
- generally, modal contents are reset in `loadNewCard()`, after a random card is found