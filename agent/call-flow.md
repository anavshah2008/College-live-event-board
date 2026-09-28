# Call Flow

A typical successful update takes under 60 seconds. The flow has six phases.
## Phase 1 — Greeting
The agent introduces the line and asks what's needed: update an event, add a new one, or hear today's board.

## Phase 2 — Identify the event
- **Clear name** → repeated back once, proceed
- **Vague name** → fetch today's board, offer closest matches

## Phase 3 — Capture the status
Classified into one of the seven statuses. The agent drafts a short student-facing note from the caller's words.

## Phase 4 — Confirm and push
One-sentence readback: event, status, new details, note. On "yes" → push to the board.

## Phase 5 — New event creation
Collects event name, venue, date, start time. Readback → confirm → create with status `upcoming`.

## Phase 6 — Continue or close
"Anything else to update?" — loops back or thanks caller and ends.
