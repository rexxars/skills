# External communication

Use this mode for personal inquiries, partner questions, technical email, feature requests, and other external outreach.

The core shape is: brief human opener when appropriate, reason for writing, concrete constraints or evidence, then an answerable ask. Warmth is real but short. Do not perform friendliness for its own sake.

## Example 1: personal inquiry

> Hi,
>
> I'm working on a custom ring project and looking for someone to help review the design and give an idea of the castability/feasibility, as well as the fabrication price it would come out to. I understand you generally want us to book an appointment, but I'd like to check ahead of time whether or not the designs proposed are even viable, so as not to waste time.
>
> The design features an "elevation profile" of a particular route that holds meaning to me - and I've tried to come up with a couple of different variations that would all work for me, based on the amount of work involved, the finish, as well as the cost.
>
> I've attached some 3D renders of some of the potential designs - my ideal would be something like the inlay variant, with the mountain range being polished rose or yellow gold, and the band itself being something dark to give it contrast - black zirconium, tantalum, oxidized silver or similar - ideally with a brushed/satin finish. Band height of 8mm was what I had in mind.
>
> I assume the elevation profile needs to be smoothed out a bit to be viable - that's fine as long as the profile will still be recognizable - I can adjust according to parameters.
>
> Do any of these designs look viable? Is this a job you'd be willing to take on, should I chose to?
>
> Thank you,
> Espen Hovlandsdal

What carries the voice: the purpose comes first, the personal meaning is understated, preferences are concrete, and flexibility is volunteered before two distinct questions.

What is absent: no pressure, elaborate personal story, or attempt to disguise cost sensitivity.

## Example 2: initial technical assessment

> Hey John!
>
> Thanks for reaching out - would be happy to chat, sounds like an interesting use case.
>
> My initial thoughts about using SSE for this use case is that while the protocol would be a good fit, there are a few missing conventions that you’ll have to “invent”:
>
> - “complete” event (no more data will be sent, do not reconnect)
> - Error handling. There is no standardized error event, and most EventSource clients don’t expose much (if any) information if the HTTP status code is >400
>
> While this isn’t necessarily a lot of work, it does mean that you will get diminishing returns for using SSE over something hand rolled - eg something like a newline delimited JSON stream or similar.
>
> Since POSTing data isn’t a common feature of EventSource, implementations in other languages are not likely to support it either - out of the box anyway.
>
> Having said that, I’d love to hear more about the use case and how you’re thinking it would work :)

What carries the voice: the initial conclusion is qualified by the conventions the recipient would need to invent. The alternative follows from the mechanics, and the closing reopens the discussion.

What is absent: no definitive verdict, sales tone, or gratuitous jargon.

## Example 3: public workaround

> This is very confusing, but indeed - it seems to be caused by a parent folder containing any postcss configuration allowed by `postcss-load-config`, such as a `postcss.config.js`, `.postcssrc` or similar.
>
> I've created a PR against Vite that should allow for us to disable this behavior, but it is unclear whether or not it will be accepted, and will in any case take some time to land.
>
> For now, you should be able to work around this issue by placing a `postcss.config.js` file containing `module.exports = {}` in your Sanity project folder.

What carries the voice: acknowledge the confusing behavior, give the likely cause, label upstream uncertainty, then provide a specific workaround.

What is absent: no promise about upstream timing and no attempt to minimize the problem.

## Delivery modifiers

- Use `Hi,` for a stranger or formal personal inquiry. Use `Hey Name!` only when familiarity supports it.
- A paired question is useful when the two questions do different jobs. Otherwise ask once.
- Personal preferences can be detailed; emotional significance stays understated unless the task requires more.
- Feature requests should include the observed behavior and workaround, but stay brief if the issue is simple.
- Do not introduce pricing, contract terms, or firm business boundaries that the user did not supply.
