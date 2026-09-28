# College Live Event Board 📞→🖥️

A live, student-facing event status board for campus events — updated by **making a phone call**.

Organizers call a phone line, say something like *"Cultural Night is delayed by 30 minutes"*, and the board updates in real time. No app, no login, no typing while running an event.


## The problem

During college fests, students refresh group chats to find out if an event is delayed, moved, or cancelled — while the organizers running the event are too busy on the ground to type updates anywhere. Event information breaks down exactly when it matters most.

## How it works

```
Phone call → AI voice agent → Google Apps Script API → Live board (auto-refreshing web page)
```

1. An organizer **calls the event update line**.
2. An **AI voice agent** (built on Sarvam's Samvaad platform) understands the update in English or Hindi, confirms it back, and only then pushes it.
3. A **Google Apps Script** backend stores events in Google Sheets and serves the board.
4. The **board page** polls and shows every event's live status to students.

## Features

- 🎙️ **Voice-first updates** — speak the event name and new status; the agent confirms before publishing
- 🌐 **English and Hindi** — the agent handles both
- 📊 **Seven statuses** — upcoming, live, delayed, rescheduled, venue changed, cancelled, completed
- ➕ **Add new events** — pop-up events can be added entirely over a call
- 📖 **Ask the board** — callers can hear what's happening today
- ✅ **Confirm-before-publish** — nothing goes live without an explicit spoken confirmation

## The API contract

The voice agent pushes updates as simple JSON POSTs:

```json
{ "action": "update_status", "event_name": "Cultural Night", "status": "delayed",
  "new_time": "19:00", "note": "Delayed by 30 minutes, new start 7 PM" }
```

```json
{ "action": "create_event", "event_name": "Sunset Photography Walk",
  "venue": "Campus Lake Path", "date": "2026-03-15", "start_time": "17:30" }
```

```json
{ "action": "list" }
```

## Quick start

### 1. Deploy the backend

1. Create a new [Google Apps Script](https://script.google.com) project.
2. Paste in the code from [`appsscript/`](appsscript/).
3. Run the setup function once to create the backing Sheet.
4. **Deploy → New deployment → Web app**, execute as *me*, access *Anyone*.
5. Copy the `/exec` URL — that's your board and your API.

### 2. Wire up the voice agent

1. Create an agent on [Sarvam](https://sarvam.ai) (Samvaad voice agents).
2. Add the `/exec` URL as webhook tools: update status, create event, list events.
3. Use the conversation design in (agent/agent-config.md).
4. Publish and note the phone number the platform assigns.

### 3. Share it

- Students: the board link.
- Organizers: the phone number. `docs/demo.md` has a sample call.

## Demo

(docs/demo.gif)

A real call: *"Hello, this is the college live event update line..."* → the organizer says the update → the agent reads it back → confirmation → the board flips to **delayed**.

## Tech stack

- **Voice agent** — Sarvam Samvaad (speech-to-intent, conversation flow, Hindi + English)
- **Backend** — Google Apps Script + Google Sheets
- **Frontend** — single-page board served by the same script, auto-refreshing

## Project structure

```
appsscript/   Google Apps Script backend + board page
agent/        Voice agent conversation design
docs/         Screenshots, demo material
```

## Roadmap

- [ ] Caller verification (only known organizer numbers can update)
- [ ] WhatsApp/SMS notifications for status changes
- [ ] Multi-college support
- [ ] Student-submitted events with moderation

## License

[MIT](LICENSE)
