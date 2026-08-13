# CourseTutor — CS 4780 Machine Learning Tutor

A chat-based tutor for a single university course (CS 4780 — Machine Learning), built for the
Scholera take-home assignment. Unlike a general chat assistant, this tutor only knows the
lectures uploaded for this course, and every answer shows exactly which lecture and slide it
came from.

## What I built and why

Beyond the standard chat interface, I built a **Concept Knowledge Map** — a dedicated view that
organizes every concept a student has asked about by how well they understand it, rather than
leaving it buried in a scrolling chat log.

I built this because revision doesn't work well as a chat transcript. A student preparing for an
exam needs to quickly see: what have I actually understood, what still needs work, and how much
of the course have I covered so far. The Knowledge Map answers that at a glance — concepts are
grouped into clearly labeled sections (Confident / Learning / Needs Revision / Not Explored),
each concept card is linked back to the lecture and slide it came from, and a small exam-countdown
badge keeps the deadline visible without taking over the screen.

To update mastery, each tutor answer gets one lightweight self-report: **Got it 🟢 / Sort of 🟡 /
Still fuzzy 🟠**. This is the only assessment mechanism in the app — see "What I deliberately left
out" for why I chose this over a quiz.

On mobile, the Knowledge Map keeps the same grouped-list structure (weakest concepts first) rather
than switching to a different layout — this keeps the experience consistent across devices and
avoids the readability problems a node-graph visualization would have on a small screen.

## Setup

```bash
git clone https://github.com/mundhesrushti7/CourseTutor.git
cd CourseTutor
npm install
npm run dev
```

Then open the local URL Vite prints (usually `http://localhost:5173`).

No environment variables or additional setup required — the mock streaming endpoint and all data
run entirely client-side from the provided `data/` files.

## What I deliberately left out

- **A test/MCQ mode for pre-exam revision.** This felt like a natural extension of the Knowledge
  Map, but a quiz bank would create a second, separate way to set a concept's mastery alongside
  the self-check tap — with no clear rule for what happens if the two disagree. I chose to keep
  one clear mechanism rather than two overlapping ones, and focus the time on making the
  *existing* conversation and concepts clear and well-organized.
- **A node-and-edge relationship graph** (showing how concepts connect to each other visually,
  not just which lecture they came from). I considered this but decided a flat, mastery-grouped
  list of cards was clearer, more accessible, and more finishable within the time I had — and it
  holds up better on mobile than a graph would.
- **A separate revision queue or revision series component.** The Knowledge Map's "Needs
  Revision" group, sorted to the top, already serves this purpose — a second component showing
  the same data would just be redundant.
- **A readiness progress bar in the navbar.** I built this, then removed it. The Knowledge Map
  already surfaces a "% explored" figure and per-state counts one view away, so a second, similar
  percentage in the navbar repeated information rather than adding to it. I replaced it with the
  smaller, genuinely distinct exam-countdown badge instead.
- **A full "Exam Mode" UI takeover.** The exam badge conveys urgency quietly; a full-screen mode
  change felt like a feature that demos well once but adds friction to actually studying.

## Known limitations

- **Response matching is keyword-based, not real NLP.** Since there's no real AI model behind
  this (the assignment provides a mock streaming endpoint with 8 fixed responses), different
  phrasings of the same question may not always trigger the intended response. This took several
  iterations to get reasonably reliable and still isn't perfect — see `AI_USAGE.md` for details.
- **The exam date is a hardcoded config constant**, not connected to a real calendar or course
  system. It's easy to find and change in one place.

## Tech stack

React + TypeScript + Vite + Tailwind CSS. No backend, no auth, no database — `localStorage` only,
for concept state and conversation history.

## AI tools

See `AI_USAGE.md` for a full account of which tools were used, where they helped, and where they
led me wrong.
