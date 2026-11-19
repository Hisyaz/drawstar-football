# Merge.MD

This file is the only document you need to start. The zip is a reference pack for a newer main game than the one it was built in. Do not copy this preview app. Copy the data and the painters, then put the screens into the existing Editor Studio.

Do one phase per day. Stop at the end of the phase. Do not open files that the phase does not name.

## How to read the zip

1. Read this file only on day one.
2. On later days, open only the files listed under that phase. Read a file once. Do not re-read catalogs you already used.
3. Ignore `src/components/EditorMenu.tsx`. It is the preview shell. The main game already has Editor Studio.
4. Ignore `MatchBallPicker.tsx`, `BallCatalogSheet.tsx`, `BootCatalogSheet.tsx`, and `preview-host-bridge.tsx` if they are in the zip. They are not part of the merge.
5. The painters (`ballArt.ts`, `bootArt.ts`, `bootPixel.ts`, `shirtArt.ts`) are the pictures. The catalogs are the lists. The registries show the save shape. The React editors show the fields. Rebuild those fields in the existing Editor Studio screens. Do not paste the preview layout in.
6. Brands already exist in the main game. Use those ids if they match. The pack ids are `leone`, `electrik`, `tapitas`, `low_systems`, `generic`.
7. Keep the ball list and the boot list in this pack as the base. Add the competition balls in the last phase. Do not invent a second list.
8. Colors are ids, not free RGB. Kit colors live in `src/equipment/kitPalette.ts`. Ball and boot colors are the hex lists already stored on each design.
9. Do not port `localStorage` keys (`drawstar.balls.v6`, `drawstar.boots.v4`, `drawstar.teams.v2`, `drawstar.players.v1`). Save through the main game's own save.

## What the pack contains

| Path | Use |
|---|---|
| `src/equipment/brands.ts` | Brand ids |
| `src/equipment/ballCatalog.ts` | Ball types, materials, designs, winter, generic copies |
| `src/equipment/ballRegistry.ts` | Saved ball shape, add, edit, remove |
| `src/equipment/ballArt.ts` | 32-bit preview ball. Match sprite stays simpler |
| `src/equipment/ballMatch.ts` | Kick and weather modifiers. Hook only if the match has no ball material yet |
| `src/equipment/bootCatalog.ts` | Boot materials, designs, roles |
| `src/equipment/bootRegistry.ts` | Saved boot shape, add, edit, remove |
| `src/equipment/bootArt.ts` | Side preview and small match boot |
| `src/equipment/bootPixel.ts` | 32-bit side boot. Match path is the simple last |
| `src/equipment/kitPalette.ts` | Locked kit colors. Same list for every brand |
| `src/equipment/uniformCatalog.ts` | Collar, pattern, cuff, sponsor, kit slots |
| `src/equipment/shirtArt.ts` | 32-bit shirt. Brand only changes the cut |
| `src/equipment/teamRegistry.ts` | Club shape. Home, away, and goalkeeper are required |
| `src/equipment/playerRegistry.ts` | Name, stats, chosen boot |
| `src/equipment/playerEffects.ts` | Boot modifiers on the controlled player |
| `src/components/BallEditor.tsx` | Field list for the ball screen |
| `src/components/BootEditor.tsx` | Field list for the boot screen |
| `src/components/TeamEditor.tsx` | Field list for the kit screen |
| `src/components/PlayerCreator.tsx` | Name, stats, boot pick. Gear is specified below and is not in this file yet |

## Rules that must survive the merge

- Brand is chosen before era or design.
- Low Systems has no rustic and no classic balls or boots.
- Generic has a plainer copy of each brand design, with more color slots.
- Ball and boot colors are swatches. No RGB picker.
- Winter exists only on modern and current balls. Classic and rustic never get a winter toggle.
- Winter body defaults: Leone bright yellow, Electrik bright orange, Tapitas bright red, Low Systems bright green. The other bright swatches stay selectable.
- Non-winter balls are white, except rustic leather, Low Systems light grey, and Low Channel black.
- Salmon (`#f08b78` Electrik, `#f3a183` Tapitas) is the default only on those two brands' current boots. It is not a ball color. Modern boots are not salmon.
- Leone boots stay cream, black, gold, navy. Low Systems boots stay black with a green, orange, or red mark.
- A shirt brand does not change the color list. It only thickens or thins the collar and the pattern. See `tune()` in `shirtArt.ts`.
- Visual design does not change ball or boot stats. Materials do.

## Phase 1 — Equipment Editor shell

Open: this file, then `src/equipment/brands.ts` only.

In Editor Studio, directly under the stadium editor button, add a section labeled **EQUIPMENT EDITOR**. Inside it, two buttons: **BALL EDITOR** and **BOOT EDITOR**. Each opens an empty screen with a list area, an add button, and a close button.

Do not build the forms yet. Do not open the catalogs.

Done when both buttons open and close without changing match data.

## Phase 2 — Ball editor

Open, in this order: `ballRegistry.ts` (the `SavedBall` type), `ballCatalog.ts` (designs, slots, winter), `BallEditor.tsx` (fields), `ballArt.ts` (pictures). Stop. Do not open boots.

Build the ball screen so a user can add, edit, and remove balls from the ball list.

Fields, in order: name, brand, type (era), design filtered by brand and era, pattern sub-option when the design has one, color swatches from that design, winter toggle only when the material is modern or current. Show the 32-bit preview and a smaller match picture. Use `ballImageUrl(paintId, colors, "preview" | "match")`.

Seed the list from `BALL_PRESETS` once. After that, the game save owns the list.

Done when a new ball can be saved, reopened, recolored, and deleted, and a winter ball disappears from the normal list.

## Phase 3 — Boot editor

Open, in this order: `bootRegistry.ts`, `bootCatalog.ts`, `BootEditor.tsx`, `bootArt.ts`. Open `bootPixel.ts` only if the side picture is wrong.

Same flow as balls: name, brand, era, role design, sub-option, swatches. No winter toggle. No RGB. Side picture is the 32-bit boot. The in-game picture is the small one (`kind: "match"`).

Seed from `BOOT_PRESETS` once.

Done when boots can be added, edited, and removed, and Low Systems cannot pick rustic or classic.

## Phase 4 — Team Editor and the new kit

Open: `uniformCatalog.ts`, `kitPalette.ts`, `shirtArt.ts`, `TeamEditor.tsx`. Do not open ball or boot files.

In Editor Studio, rename **TEAM & KITS** to **TEAM EDITOR**. Keep the current team options (name, country, roster, whatever the screen already has).

Replace the whole **KIT STUDIO** block. Do not keep the old kit colors, old patterns, or old preview painter. The brands stay. The new options replace the old ones:

- Collar: Crew Neck, V-Neck, Polo Buttoned
- Pattern: Solid Classic, Vertical Stripes, Horizontal Hoops, Half and Half, Diagonal Sash (left), Diagonal Sash (right), Raglan Sleeves, Smooth Gradient, Checkered Squares, Diagonal Split, Solid Chest Line, Two Colors, Middle Stripe
- Base, Base 2, Pattern, Collar, and Cuff colors: only `KIT_COLORS`
- Cuff: None, Small, Normal, Big
- Chest sponsor text, typography, letter color, border (None, Small, Broad), border color

Slots: **HOME**, **AWAY**, and **GOALKEEPER** exist on every team. Generate those three for every existing team, using the test colors in `testClubs()` only when a team has no kit yet. **THIRD** and **GK 2** are buttons the user can add. Do not generate them for existing teams.

The small card preview stays where it is. Draw it with `shirtImageUrl(design, brand, "match")`.

Done when an old team shows three kits, the new options edit the shirt, and third and GK2 appear only after the user adds them.

## Phase 5 — Captain and in-game kit

Open: `shirtArt.ts` again, and the main game's captain renderer and the in-game player sprite. Do not redesign the face.

Add two previews next to the card:

- Full body, using the existing captain model
- In-game, using the existing match model

Every kit option from Phase 4 has to be visible on both: collar, pattern, both base colors, collar color, cuff size and color, and the sponsor. Brand cut follows `tune()` in `shirtArt.ts`. Away, goalkeeper, third, and GK2 use the same painter. A team without third or GK2 simply has no shirt to show there.

Done when changing a swatch updates the card, the captain, and the match model.

## Phase 6 — Player Gear

Open: `playerRegistry.ts` and the main game's player editor. Do not open appearance art until the fields exist.

In Editor Studio, Player Editor, replace the kit-design menu with one section named **GEAR**.

First control: **Normal** or **Winter**. Normal is the rest of the year. Winter is used when the match season is winter. Store both outfits.

Inside each outfit:

- Shirt style: Tight, Normal, Loose (retro)
- Inside wear: Disabled, Short sleeves, Long sleeves. Sleeves can be with or without a neck
- Shirt tuck: Tucked, Untucked
- Sock length: Short, Normal, Long
- Sleeves: Short, Long
- Boots: one saved boot from the boot list

Move these out of Appearance and into Gear: headwear and glasses, necklace, earrings. Appearance no longer shows them.

Done when a player can wear a different normal kit and winter kit, and the chosen boots are the ones from the boot editor.

## Phase 7 — Tape and bands

No pack file. This is new match art on the captain and the in-game model.

Wrist, each side independent (left and right):

- None
- Athletic wrist tape. Short note: stiff tape for a goalkeeper's wrists. Color is the white tape color below
- Sweatband. Cotton. Colors: black, white, grey, brown, yellow, red, blue, purple, green, orange, sky blue
- Elastic. Thinner, synthetic, same hues but brighter and higher contrast

Ankle tape: always the white tape color. It sits on the ankle, over the sock and over the boot.

Cohesive bandage, same white tape color and texture as the athletic wrist tape and the ankle tape. Keep the labels short:

- None
- Separate ring. One thin strip around the base of one finger
- Buddy tape. Two neighboring fingers taped with two thin strips, knuckles free, a small pad between them
- Hand wrap. From the wrist, across the back of the hand, around the pinky or ring finger, and back to the wrist

Done when each option is visible on the captain and on the match model, and left and right wrists can differ.

## Phase 8 — Competition balls

Open: `ballCatalog.ts` only to copy the `SavedBall` / design shape. Then work in the competition editor.

In Editor Studio, Competitions, after Edit, add a section named **Ball** after the existing numbered sections.

1. Gear sponsor: one brand, or Generic. This is the competition's equipment sponsor.
2. Regular ball: a non-winter ball from that brand's list.
3. Winter ball: a winter ball from that brand's list.

Generate these extra balls with the ball editor data, then assign them. White body unless the row says winter. Winter body is the bright league color.

| Competition | Brand | Regular | Winter body |
|---|---|---|---|
| England 1st division | Electrik | White, blue panels | Bright blue |
| Spain 1st division | Tapitas | White, orange and yellow | Bright orange |
| Germany 1st division | Leone | White, red panels | Bright red |
| France 1st division | Electrik | White, blue and red | Bright blue |
| Italy 1st division | Leone | White, green and red | Bright green |
| EWL | Electrik | Navy | Bright blue |
| EEL | Tapitas | Orange | Bright orange |
| ECC | Low Systems | Green | Bright green |
| Copa Proceres | Leone | Gold on white | Bright yellow |
| Sudaca | Tapitas | Blue | Bright blue |
| World championship, also U17 and U20 world | Generic | White with several panels, more color than a league ball | Bright mixed |

Assignment rules for the competitions that do not get a new ball:

- U17, U20, and reserves use the ball of their main league.
- The 2nd division uses a different ball from the 1st, same brand.
- The national cup uses the 1st-division ball.
- Every other league picks an existing ball from the seeded list. Still set a gear sponsor.

Do not leave a competition without a regular ball and a winter ball.

Done when every competition has a sponsor, a regular ball, and a winter ball, and the match uses the winter ball only when the season is winter.

## Out of scope

Do not restyle the stadium. Do not replace the captain's face or body. Do not add RGB pickers. Do not generate third or GK2 kits for teams that have not added them.
