# Continuous Vibe Planner

A scheduling app with four zoom levels — year, month, week, day — and a drop-down to-do drawer you can drag items from onto any calendar view.

## Running it

You need Node.js 18 or newer. Check with `node -v`; if it's missing, install from nodejs.org.

```bash
cd planner-app
npm install
npm run dev
```

Open the URL it prints (usually http://localhost:5173).

## Using it

- **Zoom** with the `−` / `+` buttons in the header, or tap year / month / week / day directly.
- **Drill in** by tapping things: a month in year view opens that month, a date number opens that week, a day header opens that day.
- **Schedule** by dragging a to-do from the drawer onto a day cell (month view) or an hour slot (week/day view). Scheduled items stay visible in the drawer, tagged with their date/time.
- **Move or resize** a scheduled item by dragging it directly on the calendar to a new day/time, or dragging the handle on the bottom edge of a timed block to change its duration.
- **Unschedule** with the small × next to an item's date/time, either in the drawer or on the calendar.
- **Add a list** with the `+ List` button in the drawer, then tap the ✓ to create it. Tap a list's color dot to recolor it.
- **Toggle "Sky"** in the header to overlay each day's zodiac sign, plus sunrise/sunset times once you grant location access.

Everything saves to your browser's localStorage automatically. No account, no server.

## Building for phones

The Capacitor config is already in place.

```bash
npm run build
npx cap add ios       # needs a Mac with Xcode
npx cap add android   # needs Android Studio
npm run cap:sync
npm run cap:open:ios  # or cap:open:android
```

Re-run `npm run build && npm run cap:sync` after any code change to push it into the native shells.

## Where things live

```
src/
  App.jsx                    drag-and-drop wiring, view switcher
  context/AppContext.jsx     all state + localStorage (start here to change data)
  utils/dateUtils.js         date grid math
  components/
    Header.jsx               zoom + navigation
    TodoDrawer.jsx           lists, adding to-dos
    TodoItem.jsx             draggable row
    DroppableSlot.jsx        shared drop target
    YearView.jsx MonthView.jsx WeekView.jsx DayView.jsx
  index.css                  design tokens at the top, then layout
```

## Not built yet

Recurring items, notifications, and editing a to-do's text after creation.
