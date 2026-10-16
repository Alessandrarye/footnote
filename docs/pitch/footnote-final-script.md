# Footnote: Final Presentation Script

Eleven slides plus four backup slides. About 2123 words, which runs roughly 14 to 16 minutes at a natural pace, inside the 15 minute limit. The same text is in the speaker notes of the deck.

Slides 1 and 2 open in your own wording, and the rest follows that voice: short sentences, direct address, room to pause.

---

## Slide 1: Title

_About 111 words, 0.8 min._

We've all had the experience of seeing something alarming online about our local community. It shows up as a meme or a post, with no good next step. You can't tell if it's true, and even if it is, you don't know what to do about it. Footnote fixes that.

When I presented this a few weeks ago, Footnote was a plan and a walking skeleton. Today it's a working product, live at that address, running on real public records from my own county. In the next few minutes, I'll show you what it does, how it's built, what I did with your feedback, and where it honestly still falls short.

## Slide 2: The gap between seeing and doing

_About 247 words, 1.8 min._

A quick recap of the problem, because everything I built answers it. Picture this for a moment. A resident of your town is scrolling her community Facebook group, and she sees a post: the new levy money is going to administrator raises. There are a hundred angry reactions and sixty comments.

She has hit three dead ends without realizing it. First, she can't easily check whether it's true. The answer exists, but it's in a long financial report on a website she has never been to. So she reads the comments instead, which is never a good idea. There is certainty everywhere, but evidence nowhere.

The second dead end is the fact-check. It may or may not reach her, and if it does, it's a label with no reasoning behind it and no sources. By this point, her feed has repeated the claim until it feels true.

The third dead end is the one nobody talks about. Say she does get the truth. Now what? Nothing tells her what to do with it. There's a school board meeting where the budget is on the agenda, and nothing in her feed will ever tell her that. So she shares the post, or she shrugs.

I tested this before I built anything. An attorney, a librarian, and a student each described this exact gap, without me naming it first.

Nobody connects "I saw this claim" to "here is what I can do about it." That connection is the product.

## Slide 3: The solution: one path, four steps

_About 152 words, 1.1 min._

So here's the path. It's the same four steps I showed you last time. The difference is that every one of them now runs.

Step one. You bring a claim, and you pick a place. By a claim, I mean anything presented to you as true that showed up without its receipts. There's no login and no feed. Footnote tells you what you're holding: a checkable statement of fact, an opinion, or an opinion with a fact buried inside it.

Step two. It shows you what the official records say. Not a true-or-false stamp. The documents themselves.

Step three, if you're curious. You open the transparency record and see how the answer was put together, including where AI was involved.

And step four is the part nothing else does. It hands you the real next step in your actual town. Then the session ends and evaporates. No profiles, no tracking, no ads.

## Slide 4: It's live, on real records

_About 229 words, 1.6 min._

So let me show you. This is the live site, not a mockup. I typed in the claim "the levy money is going to classrooms" and picked Delaware County.

At the top, Footnote tells me what I'm holding: a checkable statement of fact about levy fund allocation. That label came from a real model call.

Below that is what the records say, and it's built from three primary records. The district's audited financial report for fiscal year 2025. The March 2024 ballot language from the Board of Elections. And the August 2026 board meeting minutes. Each one links to the document itself and shows the date I verified it.

Now here's a number most people in my district have never seen. The district spent 265 million dollars on instruction, out of 379 million in general fund spending. That's about seventy percent. Footnote doesn't tell you whether that's good or bad. It puts the number, and where it came from, in front of you.

The last time you saw this card, it was all placeholders. Today, every fact on it is real, sourced, and dated.

But a screenshot is still a screenshot. Let me show you the real thing.

[Switch to the browser. The site is already open to the empty form. Type the claim, pick Delaware County, click Look at the records. While it loads: "That pause is a real model call." Scroll once through the card and the invitation, open the transparency record, point at the policy stage, then say:]

And that's it. It's still live, still real, and still yours to try on your phone later. Back to the slides, because I want to show you how it got there.

[Switch back to the PDF on slide 5.]

## Slide 5: How a claim moves through Footnote

_About 191 words, 1.4 min._

You asked me for a diagram of how a claim moves through the system. Here it is. There's a version on the front page of the repo too.

A claim and a place go in at the top. Then four stages run in order. Classify labels the claim. Source picks the set of primary records that matches the claim, or none if nothing matches. Policy decides which sources are good enough to show, and writes the summary. Invite attaches the local next step.

Two of those stages use AI, and I marked them. Both go through a single adapter, and both have a fallback. So if the model is down, or there's no key, the site still works.

The dark band is the part I care about most. Every stage writes down what it did: which model, how long it took, what it kept, what it threw out. That log is the transparency record. I didn't bolt it on at the end. It's how the pipeline is built.

Three things come out after you submit a claim: the source card, the civic invitation, and the transparency panel. Then the session evaporates.

## Slide 6: The data: one county, by hand

_About 224 words, 1.6 min._

Your second piece of feedback was to build out the data for one locality. And from the very start, the concern about this project was the data. So let me show you exactly what's in there.

This is Delaware County, Ohio, and I captured it by hand from official sites. Eighteen officials. Four public meetings. Four organizations. And six resources, things like how to file a public records request and where to watch the meeting videos.

Every entry carries three things: a link to its source, the date I verified it, and its tier, meaning whether it's the record itself, an official communication, or established reporting. And staleness is shown, never hidden. If I checked something twenty days ago, the screen says twenty days ago.

The list is also ordered for the claim. A levy claim leads with the school board, not the city council.

All of it lives in one text file in the repo, which means the whole edit history is public. The git history is the audit log.

I'll be honest about the cost. This is labor. One county took real hours. That labor is also the moat, and I'll come back to who does it.

So the promise is not "the data is true." The promise is "you can always see where it came from and when it was checked."

## Slide 7: The model writes, code decides

_About 256 words, 1.8 min._

This is the part of the build I'm proudest of. And it started with a mistake.

I wanted the summary on the source card to be written by the model instead of by me. So I gave the model, Claude Haiku, the claim and the three records, and asked for a summary, with every sentence tagged to the source it came from.

On the very first run, it wrote that voters approved the levy. And it cited the ballot. But think about what a ballot is. A ballot lists the question. It doesn't list the result. So the sentence sounded right, and the source didn't say it. For a product whose whole promise is "check our work," that is exactly the failure that matters.

So I built a checker. And the checker is plain code, not AI. Every sentence has to pass four rules. One, it has to point to a source we kept. Two, every figure in it has to appear in that source. Three, no verdict language. And four, it can't use an outcome word, like approved or rejected, unless the source it cites uses that word.

That's why the same word, approved, gets blocked for the ballot and allowed for the board minutes. It depends on what each record says.

On the right is the proof. Six test sentences. Two kept, four dropped, and every drop has a stated reason. On the live site, every dropped sentence is logged in the transparency record.

The model writes the summary. Code decides what you see.

## Slide 8: Tech stack: what is running

_About 123 words, 0.9 min._

The tech stack, quickly, because the choices are boring on purpose. React on the front end. Node and Express on the back end, with each of the four pipeline stages in a file of its own. Claude Haiku handles the two AI stages, behind one adapter, so the provider can be swapped.

There's one change from the slide I showed you last time. I planned for a PostgreSQL database and an automated test pipeline, and I didn't build either one. Here's why. The product doesn't need a database yet. Sessions aren't stored, and the civic data lives in a version-controlled file. I'd rather show you no database than one that exists to fill a box on a slide. Both are on the roadmap.

## Slide 9: Your feedback, and honest limits

_About 280 words, 2.0 min._

Last time, you gave me four pieces of feedback. So here's the scorecard. A diagram of the claim flow: done, you just saw it. Build out the data for one locality: done. Keep using GitHub the way I had been: done, and the whole history is public. More interviews: partly. Round one was the attorney, the librarian, and the student. Round two is a teacher, a journalist, and a civic organization, and that outreach is underway now.

Then this month, my instructor asked for three more things: a current README, a current server, and a polished interface. All three are done and live.

Now for what Footnote can't do yet. I'd rather you hear it from me.

The pipeline handles any claim you bring. What it's missing is the context behind most of them. Right now it has records for one question, the school levy. Take a claim like "the school board has five members." Footnote classifies it correctly as a checkable statement of fact. The answer is even sitting in its own civic data; the five board members are listed on the invitation. But the source card says "not yet covered," because nobody has connected that record to that question yet. That's the build-out: records and context for the claims people actually bring, one at a time, each with a source and a verified date. It's a long list, and it's the right kind of long.

The checker has a limit too. It verifies attribution, figures, and wording. It does not yet verify that a paraphrase keeps the source's meaning. And it's one county, maintained by hand.

A tool about trust has to be honest about its own edges.

## Slide 10: Beyond the capstone: what comes next

_About 225 words, 1.6 min._

So where does this go? In the code, two things. First, a stronger checker. Today it catches a wrong number. It doesn't yet catch a right number attached to the wrong idea, like the instruction figure described as administrator raises. Second, automated tests, so every rule in that checker runs on every change. And then the records: connecting sources to the claims people actually bring, starting with the ones already sitting in the civic data.

The bigger question is how this reaches a second town. And the answer is people. You saw how much work one county took. I can't do that for every county, and software can't either. Every place needs people who live there keeping its information current, working with their library and their schools.

I don't have that part solved. I don't know yet whether it's a paid role, a volunteer one, or part of a librarian's job. But this isn't a new problem. Wikipedia and OpenStreetMap both started as projects that looked too big to maintain, with no clear way to pay for them, and both are kept current today by people who care about their own corner of it. Footnote doesn't grow without that. The software is the tool. The community is what keeps it true.

It stays free for citizens. The revenue is institutional licensing. And no ads, ever.

## Slide 11: Close

_About 85 words, 0.6 min._

So that's Footnote. You pick a place. It shows you the records, shows its work, and hands you the next step. Then it forgets you.

Last time, that was a promise. Today it's a live site, running on real records from a real county, with an AI component that is checked by rules and logged in the open.

It's live at that address right now, and the repo is public. I'd welcome your questions, especially the hard ones. The transparency record applies to me too.
## Slide 12: Backup: competitors

_Backup, not part of the timed run._

Backup slide, only if asked about competitors. Three camps, all healthy businesses, which proves both halves of the market are real. Media trust tools stop at the verdict. Civic software is sold to governments, so the citizen isn't the customer. Community platforms own the attention and carry no trust layer. Nobody owns the connection between knowing and doing.

On Google: anyone can paste a claim into a chatbot, but a chatbot doesn't maintain a county's meeting calendar and ballot language with a receipt on every entry. Google ran an API for local officials data and shut it down in 2025.

## Slide 13: Backup: checker test output

_Backup, not part of the timed run._

Backup slide, only if someone wants to see the raw test. This is the terminal output from the checker run on October 4. The top half is the six test sentences. The bottom six lines are the results: kept or dropped, and the reason for each drop.

## Slide 14: Backup: the transparency record

_Backup, not part of the timed run._

Backup slide, for anyone who wants to see the record itself. This is the live site on the canonical claim. Four stages. Classify and policy used the model, and each shows which model and how long the call took. Source shows which record set matched and on which word. Policy shows three sentences drafted, three kept, none dropped. Invite shows what was loaded and that the school district entries were listed first.

## Slide 15: Backup: a claim it has no records for

_Backup, not part of the timed run._

Backup slide, if someone asks what happens with a different claim. I typed a claim about water rates. Footnote classified it, said plainly that it has no records for it yet, and named what it does carry. It did not show the levy records, and it did not ask the model to fill the gap. The local next step still appears, because the meetings and officials are real either way.

---

## Questions to have ready

**Does the checker catch a sentence that twists a source's meaning?** Not yet. It checks attribution, figures, verdict language, and outcome words. Meaning is the next hardening step, and it is on the limits slide.

**What happens if I type a different claim?** It gets classified, and then Footnote says plainly that it has no records for it yet and names what it does carry. It never shows records that do not answer the claim. The local next step still appears. There is a backup slide showing this.

**Why is there no database?** Nothing about a session is kept, and the civic data lives in a version-controlled file whose git history is the audit log. A database earns its place when there is something to store.

**Why Haiku?** The two AI jobs are small and structured, it answers in about a second and a half, and it sits behind an adapter, so it can be swapped.

**How do you know the data is accurate?** The promise is not that the data is true. It is that you can always see where it came from and when it was checked.

**How does this reach more places?** Through people in each community. Every locality needs residents keeping its information current, working with their library and schools. Whether that is a paid role, a volunteer one, or part of a librarian's job is an open question, and I would rather say so than pretend it is solved. Wikipedia and OpenStreetMap faced the same question and answered it with people who maintain their own corner, so there is precedent.

**You say no tracking, but the claim text goes to Anthropic.** Yes. The claim is sent to the model provider for classification and for drafting the summary. Footnote itself stores nothing, and the transparency record says AI was involved. The adapter means a self-hosted model could replace it later.

**The live site shows 3 drafted, 3 kept, 0 dropped. Does the checker ever do anything?** The first run dropped "approved." I tightened the prompt after that, so drops are rare now, and the checker is the backstop for when the prompt is not enough. The six-sentence test is the proof it works.

**What is a citation policy?** Strict shows primary records and official communications only. Light also allows established reporting. The reader picks it, and the transparency record shows which was applied.

**Why keyword matching for sources instead of AI?** So the transparency record can say exactly why a record set was chosen, and so a model cannot quietly pick the wrong records.

**What does it cost to run?** One small server, about ten dollars a month, plus model calls that cost well under a cent each.

**What did the interviews change about the build?** [Have one concrete example ready.]

**How does it make money?** Free for citizens. Institutional licensing to libraries and schools later. Ads are excluded on values and on unit economics.
