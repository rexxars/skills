# Technical collaboration

Use this mode for technical Slack, PR descriptions, PR reviews, issue replies, and incident updates. Adjust context to the relationship:

- Shared context: start closer to the problem; fragments and visible live thinking are fine.
- PR or durable record: explain intent and known weak spots; tell reviewers where scrutiny is needed.
- External or public: establish the relevant baseline, avoid blame, and separate fixed, investigating, uncertain, and workaround states.

Rhythm: short paragraphs with substantial causal sentences. A short answer, correction, or landing may follow a dense explanation. Do not force it.

## Example 1: technical context with a visible correction

> Partial indexing allows customers who have reached/are close to the 10k "attribute limit" in Content Lake to still use us, by telling the content lake to only index certain attributes.
>
> Currently I think the only implemented partial indexing strategy is max field depth. So if a customer reached their 10k limit, they can set a max field depth to (say) 2 levels. Queries that filter on properties below this would still theoretically work, but be de-optimized (it would do more in-memory).
>
> The studio cares about this because it had to list all the attributes that your query could match on in order for us to get a match. For customers who have enabled a max field depth, you want to exclude properties beyond that depth from the attributes in the query.
>
> This isn't necessary anymore, as the full text search API takes care of this behind the scenes.
>
> Well, it is not necessary to exclude them from the "wildcard search" - I am assuming (without having checked) that we also exclude properties beyond this depth from the attributes we list in the global search filters, so we still want to respect the setting there.

What carries the voice: customer problem, mechanism, why the Studio cares, then a visible narrowing of an over-broad claim. Confidence changes with the evidence.

What is absent: no humor, no general recommendation, and no attempt to conceal what has not been checked.

## Example 2: PR reasoning and reviewer direction

> This one needs a proper read-through, I am not super confident with these changes - especially the last commit. There might be a lot easier ways to solve the problem outlined in the title here, but let me explain:
>
> When researching why there were constant requests being fired to the `/access` API, I saw that it was due to a hook being run inside of the `<PermissionCheckBanner />`. Upon further inspection, I saw that this component remounts (unmounts and mounts) constantly while edits are going on, due to the continuous evaluation of permissions as the document changes. When this happens, the `isPermissionsLoading` state gets set to `true`, which triggers the banner to unmount. Once it's calculated if it should be allowed/disallowed, it re-mounts. My hunch is that this is not only causing the additional requests that we want to get rid of, but potentially also affects performance negatively.
>
> While reading the code of the `useDocumentValuePermissions` and the underlying `createHookFromObservableFactory` and friends, it seems like the intention is to keep the old state while recalculating - but because the `document` being passed as an argument is recreated on any edit, the observable factory gets called again and the state resets. In my mind it would be better (for the permission check in particular) to assume that the grants don't change that quickly, and keep the old cached value around. I refactored the code to do this, but the code is a lot simpler/more naive than `createHookFromObservableFactory` + `useObservable`, so I'd be happy to have some more eyes on this and see if there are edge cases it wouldn't account for.
>
> While writing this, I realized that we should probably throw away that cached value on document ID change.

What carries the voice: uncertainty is named before the investigation. Observation, hunch, implementation choice, and a newly noticed edge case remain distinct.

What is absent: no apology spiral, no claim that the approach is finished, and no generic request to “take a look.”

## Example 3: concise review with room for context

> I'm a little confused by the need to move the ignore files to individual directories, given the eslint configs have not changed and seem to still inherit from the parent?
>
> Would it work if we moved from an `.eslintignore` to `ignorePatterns` defined in the root config?
>
> Would be nice not to duplicate the ignore file throughout, but if it can't be helped, fair enough.

What carries the voice: a concrete concern, a suggested alternative, and a narrow opening for context the reviewer may be missing.

What is absent: no command language, blocker theater, or praise padding.

## Delivery modifiers

- Internal Slack may use a compact label such as `Long term vision:` or begin with a fragment when context is shared.
- PR descriptions can use a functional heading such as `What to review`, but avoid sectioning a short description.
- PR reviews should focus on the concern and alternative, not restate the entire change.
- Public support should end with the current state or workaround. Own regressions plainly when they belong to Espen's side.

