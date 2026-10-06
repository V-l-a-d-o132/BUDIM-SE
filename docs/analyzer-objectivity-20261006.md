# Analyzer: transparent answers and local prototypes

The previous self-assessment mixed different scales, reverse-scored items and weighted totals. It also interrupted selection with reflective pauses. The replacement preserves the author's 35 original question strings and IDs, accepts selections immediately, and presents a descriptive answer map. An answer on the first page cannot cancel an answer on the fifth page.

## Self-assessment

- `src/lib/self-assessment.ts` is the single source for the 35 questions and deterministic `habits-map-v3` calculation. `tests/fixtures/original-assessment-questions.json` records the original strings extracted from commit `e762b6db5f217ae4708bf05d4cadc76dccd2ba6e`. The exact text and order are regression-checked.
- Frequency and intensity use a seven-day recall frame; general self-judgment uses the person's current experience. The deletion-of-a-post question uses a separate yes/no scale. Each question also offers an explicit unavailable/unapplicable answer.
- Numeric option values identify choices; they are not points awarded to the person. Results count labels within each theme and scale. No inverted scores, weights, hidden consistency rules, cross-question deductions, diagnosis, five-step classification or general total are used.
- Zero, an unavailable answer and a missing answer are distinct. Completing the map requires an explicit choice for all questions; unavailable answers are counted separately and cannot create a favorable score.
- All answers and results stay in React memory. Navigation between the three tools preserves them. Reloading, resetting or leaving the page clears them. No assessment request, CAPTCHA execution, AI call, database write or browser-storage write occurs when answering.
- Some original wording is subjective or assumes an experience. Keeping the questions does not establish construct validity or remove those limitations. Question hints, unavailable answers and the disclosure of no psychometric validation make those limits explicit.

## Focus

The controls identify operating systems as **iOS** and **Android**. Twelve selectable local prototypes cover Instagram, TikTok, Facebook, YouTube, X, Snapchat, WhatsApp, Gmail, Chrome, Photos, Camera and Settings. Their examples use inline vector illustrations and fictional data. Tabs, local filters, reactions, example dialogs and the home control work within the prototype; no message is sent, account contacted, real media accessed or device setting changed.

Grayscale applies only a CSS color filter and preserves the selected app and its current local reaction state. Quiet notifications suppress example badges and change the manually shown example alert. Pausing apps blocks only the six social prototypes; tools such as WhatsApp and Gmail remain available. All eight combinations of these controls are checked against all twelve applications. There is no automatic sound, notification timer, game feed, simulated public score or leaderboard in this mode.

Layouts are educational approximations, not exact replicas for every device, version, region or account. Interface references reviewed on 2026-10-06 include:

- [Apple display color filters](https://support.apple.com/en-us/111773), [Focus](https://support.apple.com/guide/iphone/set-up-a-focus-iphd6288a67f/ios), and [Screen Time in iOS 27](https://support.apple.com/guide/iphone/set-schedules-and-time-allowances-iphb0c7313c9/27/ios/27).
- [Google Pixel display settings](https://support.google.com/pixelphone/answer/7169926?hl=en) and [Android Digital Wellbeing](https://support.google.com/android/answer/9346420).
- [WhatsApp's updated navigation and filters](https://about.fb.com/br/news/2024/05/mantendo-o-whatsapp-moderno-simples-e-acessivel/), [Instagram navigation changes](https://about.fb.com/news/2025/09/in-india-instagram-debuts-a-reels-first-experience-for-its-mobile-app/), and [Facebook navigation and photo grids](https://about.fb.com/news/2025/12/making-it-easier-to-create-discover-and-share-content-on-facebook/).
- [YouTube Shorts controls, June 2026](https://blog.youtube/news-and-events/youtube-shorts-experience-updates-features/) and [Google Photos Create hub](https://blog.google/products-and-platforms/products/photos/photo-to-video-remix-create-tab/).

The device instructions distinguish color filters, notification modes and application limits. Real menu names and exceptions can differ. Neither the demo nor the instructions promise a particular attention or health outcome.

## AI language analysis

`language-signals-v3` requires five distinct categories, bounded integer values, bounded explanations and exact continuous quotes from the supplied excerpt for every positive category. A zero cannot carry contradictory positive evidence. Missing categories, invalid quotes, stale versions and incomplete successful responses are rejected by the frontend and/or server; they are not filled with invented zero values.

The frontend shows quoted text, safely highlighted source text, all five category explanations and model limitations. It does not show the previous overall numeric risk index. The model is instructed to consider real deadlines, ordinary warnings, quotations, educational examples, irony and missing context. Quote validation demonstrates that words occur in the input; it does not demonstrate that the model's interpretation is correct. No fact-checking, intent detection, clinical diagnosis or calibrated probability is claimed.

Submission is guarded before CAPTCHA starts. The CAPTCHA wait, fetch and provider call are bounded; repeated clicks cannot create duplicate submissions. Editing clears a stale result. Temporary errors preserve the excerpt for retry. The existing origin policy, body limit, CAPTCHA requirement, request rate limit, generic provider-error logging and lack of excerpt persistence remain in place.

## Compatibility and release

- Deploy only `tavora-content-analyzer`, with its relative shared files and `deno.json`. Its existing `verify_jwt: false` setting remains because the endpoint already performs custom public-request, CAPTCHA and rate-limit checks.
- Keep legacy numeric response fields for the previously published frontend. Keep the old self-assessment endpoint until a separate retirement decision; the new frontend does not call it. No database migration or historical-record deletion is needed.
- Import the merged frontend through **Readdy → Pull from GitHub**, then **Publish**. Server deployment alone does not change the hosted page.

## Verification and limits

Automated coverage includes exact preservation of all questions; validation of all legitimate options; independence of changes to one answer; separation of mixed scales and unavailable answers; editing and navigation; all app tabs on both operating systems; independent focus controls; Escape from local dialogs; duplicate analysis submission; exact evidence highlighting; malformed-result rejection; and the existing payment, request, privacy and database regression checks.

The component tests run against a DOM emulator with isolated CAPTCHA and provider fixtures. They execute the production React components without a real browser, database, CAPTCHA or model. They verify behavior and accessible DOM structure, not pixel layout or real-model accuracy. The production build, TypeScript checks and all Edge Function checks must pass separately.

The browser environment blocked the local preview. No attempt was made to bypass that browser policy. Visual verification of the new hosted frontend remains necessary after Pull and Publish: narrow mobile widths, both platform layouts, inner scrolling, controls, dialogs and keyboard focus. Actual model interpretation and real CAPTCHA submission are not proven by mocked tests.

Local checks on 2026-10-06 passed: clean `npm ci`; **138 tests, zero failures/cancellations/skips**; `npm run typecheck`; all **19** entry points in `npm run check:edge`; and `npm run build`. Production dependency audit reported **zero vulnerabilities**. The complete dependency audit still lists five pre-existing high development-tool findings in the Tailwind 3/braces chain and zero critical findings; these are unchanged by the analyzer implementation.
