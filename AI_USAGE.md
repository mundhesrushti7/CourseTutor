# AI Usage

## Tools used

- **Antigravity** (agentic coding IDE, Gemini model) — initial project scaffolding and Phase 1
  (chat core, streaming, markdown/math/table rendering, citations, source preview).
- **Trae** (agentic coding IDE) — continued development after Antigravity's credits ran out
  mid-project. Built the understanding-check, Knowledge Map, exam badge, dark/light theming, and
  fixed most of the bugs listed below.
- **Claude** (Anthropic) — used throughout as a planning and prompt-engineering layer: breaking
  the assignment into a phased build plan, writing the specific prompts I fed into Antigravity and
  Trae, deciding what to cut and why, debugging strategy when something broke, and drafting this
  documentation.

I did not use any AI tool to write code I didn't read. Every prompt was written by me based on
what I wanted built, and every change was reviewed and tested in the browser before I moved on to
the next piece.

## Where AI tools helped

- **Scaffolding and boilerplate.** Setting up Vite + React + TypeScript + Tailwind, wiring up
  `react-markdown` / `rehype-katex` / `remark-gfm` for rich content rendering, and the general
  component structure were all much faster to get right with an agentic tool than writing by
  hand — this is exactly the kind of repetitive setup work AI tools are good at.
- **Rapid iteration on styling.** Getting the dark/light theme, pill shapes, and gradient badge
  looking right took many small visual back-and-forths (see below) that would have been slow to
  do manually, even though the process wasn't smooth.
- **Root-causing bugs when I pushed for it.** Vague "please fix it" prompts consistently got
  vague, incomplete fixes. Asking the tool to show me the actual code path and explain the exact
  point of failure, instead of just claiming it was fixed, produced real fixes and also meant I
  actually understood what changed.

## Where AI tools were wrong, or led me astray

- **Response-selection bug.** For a long stretch, the chat always returned the same mock response
  regardless of what I typed. Two separate "fix" attempts from the tool claimed success without
  actually fixing the underlying selection logic — it turned out the keyword-matching function
  was either defaulting to a fixed index or failing silently and falling through to one response.
  It only got resolved once I stopped accepting "it's fixed" and asked the tool to show me the
  exact selection code and explain, line by line, where it broke.
- **Theming regressions that flip-flopped.** Fixing invisible text in dark mode led to a
  follow-up fix that made text invisible in light mode instead — a hardcoded color had been
  patched into one theme instead of the component being wired to the shared theme variables
  correctly in both. This happened more than once, which told me the tool was patching symptoms
  component-by-component rather than fixing the actual architecture, and I had to explicitly ask
  it to audit *every* hardcoded color across the codebase rather than just the one I'd pointed
  out.
- **Unrequested UI additions.** At one point the agent added an "Active Course Context" bar and a
  "Response Mock Scenario" dropdown that were never part of the plan and weren't functional — I
  caught these because they didn't match my spec, not because the tool flagged them, and had to
  explicitly remove them and tell the tool to stop adding unrequested features.
- **Color changes that "technically" applied but didn't actually fix the problem.** Early
  attempts to make the "Needs Revision" and "Learning" states visually distinct only nudged the
  existing colors, which stayed too close together (both read as dark orange/brown). Progress
  only happened once I gave exact hex values and explicitly told it to shift Learning to blue
  rather than trying to find yet another distinguishable shade of orange.
- **A broken CDN dependency.** The math renderer (KaTeX) was loading its CSS from a CDN with a
  hardcoded integrity hash that no longer matched, silently blocking the stylesheet and risking
  broken math styling for anyone whose browser hadn't cached an older version. This wasn't
  something I asked for or noticed until checking the browser console directly — a reminder that
  "looks fine on my machine" isn't the same as "works for a stranger cloning the repo."

## Overall takeaway

Agentic tools were genuinely useful for velocity, especially on scaffolding and repetitive
styling work, but they were unreliable at self-reporting whether something was actually fixed —
several bugs required me to demand the tool show its actual reasoning and code before I could
trust the result. The most useful habit through this project was treating every "fixed" claim as
unverified until I tested it myself in the browser.
