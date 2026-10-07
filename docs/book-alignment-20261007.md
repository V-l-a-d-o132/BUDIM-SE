# Website alignment with the revised book — 7 October 2026

The author supplied the revised, professionally formatted 162-page Bulgarian manuscript of **„Петте степени“**. Earlier website descriptions used different chapter names, a fixed progression and claims about restored cognitive abilities. This edit aligns the public explanations with the current manuscript.

## Editorial changes

- The five tasks now have the book's names everywhere: **Да забележиш навика**, **Да разбереш средата**, **Да опиташ промяна**, **Да върнеш място за живота**, **Да поддържаш свободата си**.
- The chapter pages use ordinary situations, conditional examples and practical exercises. The framework describes repeatable tasks, without ranking people, diagnosing them or promising a fixed outcome.
- The homepage explains **„Будим се“**: observation, checking, choice, trial and review. It includes a clearly labelled conditional example.
- School, family and workplace cases describe possible pilot approaches. Invented session outcomes, measurements and unconfirmed 2026 event dates are removed. The four built-in fallback articles use the same distinction between examples and evidence; existing database articles are not rewritten.
- The homepage analyzer preview is a labelled educational example with quoted language and a contextual question. Its invented percentages and overall numerical score are removed. The analyzer and the original 35-question assessment keep their existing implementation.
- The sources page contains the same **17 numbered notes** as the book. Filtering keeps the original note numbers. Each note explains what its sources support and their limits. Static FAQ metadata, navigation and the public search summary agree with the visible copy.
- The Meta example uses official state documents checked on 7 October: a package **up to USD 17.1 billion**, including guaranteed and conditional payments and privacy claims; court approval and a first state payment are distinct from full payment. Installments continue through 2035. Allegations, settlement obligations and an admission of liability are kept separate.

## Cookie banner

The banner uses **„Одобрявам“** and **„Не одобрявам“**, with equally visible controls and at least 44px touch height. It states that advertising measurement cookies need consent and that refusal preserves access to the site. Settings can be reopened in the footer.

The existing consent implementation is unchanged: no optional tracker before consent or after refusal, versioned expiry, withdrawal, cross-tab changes and protected routes. The privacy policy retains accurate details about Meta and data processing. Shorter banner wording does not remove those disclosures.

## Verification

- All **138 existing tests** passed, including the nine consent tests.
- TypeScript checking and the production build passed.
- Additional local DOM verification rendered all eleven revised main pages, checked unique anchors, matching chapter names and all seventeen note numbers, exercised source filtering and both consent choices, and verified reopening settings. No external service was called.
- No images were added. The five-card homepage layout now uses two columns at intermediate widths and five on wider screens.

## Publication

Import and publish the updated frontend in the existing Readdy project. Repeat the network checks in `privacy-and-editorial-release.md` against the actual hosted build. A GitHub merge does not establish that the hosted frontend has changed.

This change does not upload or activate the revised PDF in the private book catalogue and does not establish that existing physical stock contains that revision. Verify the delivered editions before presenting the new manuscript as the sold edition. The stale 116-page search metadata is removed; prices and purchase logic remain as configured. See `book-payments.md` for the catalogue release procedure.
