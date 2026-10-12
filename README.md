# ArcheAge Classic 3.5 — Gear Planner

Local English planner with 19 equipment slots, skillsets, skills, buffs, item icons, native grade frames, migration, temper, gem sockets, Lunafrost/Lunastone selection and a 48-item inventory.

## Run

Requires Node.js 18 or later; no dependencies need installing. Double-click `iniciar.cmd`, or run `npm start` in this folder. Open http://localhost:3000. To use another port in PowerShell: `$env:PORT='3002'; npm start`.

When updating, stop the old server, restart it and refresh with Ctrl+F5. Do not open index.html directly. Catalogs and exported calculation data are bundled. Item details and uncached icons need internet access and are cached locally.

## Editing and inventory

Click an equipment icon to select an item, grade, physical/magic temper, gems and one compatible Lunafrost/Lunastone. Click Equip to apply the draft. Store a copy in inventory saves the complete draft without changing equipped gear.

In Inventory, choose a slot type and click Add item. Click a stored item to choose its destination and Swap equipment. The equipped piece returns to that inventory position; swapping into an empty slot removes the stored entry. Edit item changes the stored configuration. Inventory items do not affect stats until equipped.

Gem choices are sorted by grade descending. Among compatible gems with identical complete numeric modifier lists, only the highest-grade representative is shown. Selected gems in older builds remain preserved. The same gem can occupy several sockets. Socket count, placement, minimum level and required tags are validated independently of the visual deduplication.

Lunafrost/Lunastone placement checks item slot groups, exact item restrictions and required tags from item_enchanting_gems. Only one enchantment is allowed per item, separately from sockets. Special restriction semantics that are not established are excluded. Lunafrost sets are counted independently of armor sets. Cumulative tiers replace lower tiers when their complete modifier lists include those lower effects, avoiding double counting. Perfect Lunasigils require Enlightened necklace/earring/ring items, including the user-confirmed restriction for Perfect Tidal despite its missing database tag.

Save / share code and browser storage preserve inventory, grades, gems, enchantments, temper, synthesis, migration, skillsets, skills, passives, activated conditions and buffs. Legacy AAC1 codes remain supported. Base64 codes are not encrypted.

## Calculations and audit

All characters use Level 55 / Ancestral 7 and 158 base points per core stat. Migration freely transfers up to 300 points (Migration Scale unlocked), with balanced additions/removals, steps of five and maximum removal of 150 from each stat. Your choices are not fixed to any particular attributes.

Physical temper (0–15%) scales physical defense and Melee/Ranged weapon DPS. Magic temper independently scales magic defense, Magic DPS and Healing Power, following the user's confirmed rule. Core stats are unaffected. Fractions are retained; display rounds values.

Item DPS, armor and weighted core attributes follow the archived public AAClassic item calculator and the supplied Classic database. Static item modifiers, exact-grade buffs, supported gem/Lunastone modifiers and eligible static set buffs feed the equipment contribution totals. Cast Time starts at 100% plus these contributions. Base health, mana, regeneration, attack attributes, critical rates, accuracy, dodge/block/parry use the exported unit_formulas together with AAEmu attribute interpretation. Equipped weapons add their verified DPS to the matching attack attribute. Known base attributes support database percent modifiers; unknown bases remain unresolved.

Attribute names and unit multipliers are archived from the public AAClassic buff API. Level-dependent buffs follow AAEmu's reference implementation: round(value + linear_level_bonus × item level / 100), using ties-to-even. Set buffs use the lowest equipped member level. This source is verifiable but does not certify the current Classic server's exact implementation; compare in-game values before treating these contributions as definitive character totals.

Reference sources:
- https://raw.githubusercontent.com/AAEmu/AAEmu/master/AAEmu.Game/Models/Game/Skills/Templates/BuffTemplate.cs
- https://raw.githubusercontent.com/AAEmu/AAEmu/master/AAEmu.Game/Models/Game/Char/CharacterEquipment.cs
- https://aa-classic.com/data/buffs/_index.json
- https://aa-classic.com/data/items/_index.json
- https://aa-classic.com/data/skills/_index.json

The audit examines all 34,650 catalog entries and exports all 12,600 matching equipment records. It includes 9,329 distinct item/grade links and 136 items with Cast Time. Automated tests check 10,217 modifier cases using independent SQL/Decimal fixtures, including scaled Wave rings rather than only Oracle.

Unknown units (attribute 191), conflicting grade-buff records, unsupported percentage modifiers, timed/charged effects, unactivated triggered effects appear in Build modifiers as unresolved. One item/grade pair has conflicting database buffs and is not silently overwritten or double-counted. Selected buffs now contribute supported static modifiers. All 70 class passive records are selectable for the chosen skillsets. Conditional modifiers require explicit activation; related timed buffs are offered as manual candidates by matching the localized buff name or description, which is not automatic certification of the trigger relationship. Effects with unknown units, dynamic formulas, or missing numeric records are reported rather than invented. Rank/point requirements, event simulation, buff stack counts, specialized skill damage and armor-grade bonuses are not fully simulated. Raw details remain available.

Costumes/undergarments accept core tooltip bonuses and up to five editable synthesis effects. Enter actual tooltip values; random roll pools, grade ranges and expiration are not simulated. Reductions use negative percentage points.

## Validation and data refresh

Run `node tests.cjs`. The bundled 35 tests include full grade-effect fixtures, placement restrictions, gem deduplication, migration, temper, codes and inventory swaps.

To regenerate from the supplied local read-only database, run `python export-database.py`, then `python export-effects.py`. Python is only needed for data regeneration. The saved attribute-map.json holds verified API metadata; the report is data/equipment-audit.json. Original game/database files and synced sources are never modified.

The layout is inspired by the supplied ArcherAge screenshot; calculations target Classic 3.5 rather than the ArcherAge version. Empty slot and grade graphics use the supplied native client DDS atlases converted to PNG.

## Character rules and UI additions

Combat costumes use database slot 31, alongside the existing costume slot 12. Hover or keyboard-focus equipment, inventory and catalog items to see grade, individual values, static modifiers, temper, synthesis, gems, enchantments and set tiers. Lunafrost choices include icons, highest-grade sorting and deduplication by complete verified modifiers plus set identity. Unknown or distinct set effects are preserved.

Four/complete seven-piece armor buffs and Dual Wield/Shield/Two-Handed buffs activate automatically. Removing the qualifying equipment removes the automatic buff. Duplicate selections of the same buff ID do not double count. Dual-Wield Proficiency activates only with two one-handed weapons. Folding Time contributes -4 percentage points to Cast Time.

The base movement value 5.4 m/s, attack-speed conversion and defense percentage denominator are corroborated by the public DaruGear Classic client; they were not found as explicit constants in this compact database. These references are distinguished from database formulas. Nothing from the downloaded source code is bundled or executed.
- https://darugear.com/?s=JZRHHB
- https://raw.githubusercontent.com/AAEmu/AAEmu/master/AAEmu.Game/Models/Game/Char/Character.cs
- https://raw.githubusercontent.com/AAEmu/AAEmu/master/AAEmu.Game/Models/Game/Formulas/UnitFormulaKind.cs

Ayanad Desert follows the current database: 4 pieces grant +9.7% Parry Rate, not the outdated +298 Magic Defense from the screenshot. Erenor Earth Lunafrost: 3 pieces give 452 Toughness, 4 add 560 Resilience, 6 add -4.1% Received Damage, with each cumulative stat counted once. Equipment Points includes verified base, socket and enchant contributions; synthesis points are explicitly marked Partial.


## General checkup — version 1.5.0

Run `npm test` for 35 tests and `npm run audit` to regenerate `data/checkup.json`. See `CHECKUP.md` for findings, scope and remaining work. The tests now use the same aggregation function as the UI and exercise 100 seeded complete builds.

Attribute 175 (Healing Power increment) currently has conflicting display-scale evidence: the API publishes raw integers with multiplier 1, whereas the character reference represents attack/heal increments in thousandths. These automatic modifiers are explicitly withheld and listed as unresolved until the Classic display conversion is confirmed. Weapon Healing Power, Spirit-derived Healing Power and manual Healing percentage remain separate supported contributions. Source metadata is retained with an `unverified_scale` flag rather than silently changed.


## Synthesis availability — version 1.5.1

The editor now reads per-item database random-attribute categories, including cloak slot 9 and underwear slot 13. It is hidden when the current item/grade has no nonzero rolls. Select an appropriate grade (for example Epic) to unlock underwear effects. Cloaks use the database pool pick count; costumes and underwear use the documented grade progression. Values are entered within exact database min/max ranges, with duplicate effects and incompatible groups rejected. Grade changes preserve rolls and require correcting any newly invalid values rather than silently changing them.

Run `python export-synthesis.py` after the other data exporters to regenerate synthesis pools. The suite now contains 38 tests. Mythic is the highest selectable grade. Legacy manual synthesis is retained for old codes and clearly marked in the editor; replace it with database rolls when editing.

The Raffin guide's Costume Builder K17 value (47.5 at Eternal 100%) matches the database raw maximum 47500 for Healing Power, confirming its thousandths display scale. The earlier Healing Power suspension is superseded: those modifiers now use multiplier 0.001. The guide remains reference evidence; Eternal is not selectable in the planner, and per-item database unlocks take precedence where they differ from the guide.


## Stats layout — version 1.5.2

Attack Speed now displays rating and Attack Animation Speed together as `288 (11.1 %)`. Core attributes use two columns separated from attack/defense values and movement/casting. Attack and Defense have separate Melee, Ranged and Magic groups; Healing, Penetration, Regeneration and Misc are divided for readability. Explanatory calculation notes remain in the data section instead of the stats list. No formulas or totals changed in this layout update. All four tabs were verified in the browser without JavaScript errors.


## Defense display — version 1.5.3

The defense panel omits the four Received Damage contribution rows. Melee/Ranged/Magic Damage Reduction display the user's requested complement of the calculated armor mitigation: 64.42% is displayed as 35.58%. Internal mitigation calculations, fixed reductions and PvE reductions are unchanged. The raw modifier report still retains received-damage contributions.


## Version 1.6.0

- Equipment Points uses read-only database formulas 30 (base), 31 (each lunagem), 32 (one lunafrost/lunastone). Formula 30 uses grade stat_multiplier / 100 and weapon or wearable-slot gear_score_multiplier / 100, verified against the bundled public AAClassic calculator. Precision is retained for the native one-decimal score presentation. Scores for unverified synthesis or missing equipment records are explicitly marked Partial; hover the total for the breakdown. Inventory is excluded from equipped points. No score effect is inferred from temper.
- Physical/Magic Defense show their defense-only received-damage percentage in parentheses: 7900 / (defense + 7900). In the Defense tab, Melee/Ranged/Magic Damage Reduction now show the general incoming_damage_mul reduction plus the corresponding type-specific reduction, added in percentage points according to the user's confirmed Classic rule. These are independent of the defense percentage and fixed reduction.
- Active buff icons show verified modifier tooltips on hover or keyboard focus. Item tooltips hide zero core bonuses and round physical/magic defense to whole numbers without changing calculation precision.
- Buff families with explicitly named ranks have a rank selector; changing an active rank replaces its previous rank. Selected skills with same-name ranked buff links verified in skill_effects → effects → buff_effects also expose a Buff active checkbox and rank selector. Merely learning a skill does not activate it. Health Lift uses +974 / 1288 / 1602 / 2086 / 2570 / 3054 HP, as stored in the database. The skill's default at level 55 is rank 4; ranks 5/6 have database level bands 65+/75+ and are displayed with their requirements rather than certified as available in Classic.
- Data, effects and limitations is entirely hidden on load and has a Show/Hide button.

Re-export the additional score and skill-buff inputs with `python export-score.py` after the other exporters.


## Version 1.6.1

Corrected grade inputs: wearable_formulas now use item_grades.var_wearable_armor / var_wearable_magic_resistance; weapon DPS uses the corresponding var_holdable_* multiplier. Attributes and Equipment Points keep stat_multiplier. Armor defense applies temper before final truncation, and armor attributes round once. Verified native fixture: Divine Ayanad Life Hood (31572), physical +10%, magical +8% → Physical Defense 399, Magic Defense 1959, Spirit 127. The archived public item calculator incorrectly shares stat_multiplier across defenses/DPS; it is retained as a reference for Equipment Points, rather than the defense baseline. Primary implementation reference: https://github.com/AAEmu/AAEmu/blob/master/AAEmu.Game/Models/Game/Items/Armor.cs and Weapon.cs.

All set tooltips use one common tier formatter that omits modifiers already introduced by earlier tiers. Active tiers remain marked when a higher cumulative tier is active. Set 458 displays 3 pieces: Toughness 452; 4: Resilience 560; 6: Critical Heal Rate 4.1%. This is presentation only; calculation still suppresses cumulative duplicate buffs.

Permanent passive bonuses no longer require the condition checkbox merely because the catalog contains other temporary effects with the same name. Invigorated Healing grants +25% Critical Heal Bonus immediately on selection. Explicit conditions such as Dual-Wield Proficiency remain conditional.

Active buffs and Passive buffs now have separate tabs. Explicit buff activations from the Skills/Buffs controls appear in Active; selected passive bonuses and automatic equipment buffs appear in Passive. Both show contribution tooltips. This separation does not change calculations.


## Version 1.6.2 — phone layout and separate buff tabs

The character panel fills its column. Desktop stats reserve a stable scrollbar gutter; on phones stats use page scrolling. Controls have larger touch targets, item dialogs fit the screen, and inventory uses six columns. Buff tooltips also open on tap. Active buffs shows explicit Skills/Buffs activations; Passive buffs shows selected passive bonuses and automatic armor/weapon buffs.

For phone access on the same Wi-Fi, start `iniciar-celular.cmd` on the PC and open the private-network address printed in its window on your phone. This optional launcher listens on the local network. `iniciar.cmd` keeps the default computer-only loopback binding. If Windows asks, allow Node on your private network. The PC must stay on with the server running. No router port forwarding is needed. Save/load codes work between devices; browser-local saved builds belong to each browser.


## Version 1.6.3
Removed the manual tooltip base-bonus inputs from costume and undergarment editors. Select the compatible enchantment in Lunafrost / Lunastone instead. Secret Life Lunatear (38517, +15 Spirit) is for undergarments only; costume does not offer it. Existing build-code fields remain readable for compatibility.

## Version 1.6.4
Costumes no longer offer enchantments. Legacy costume enchantments contribute neither effects nor equipment points. Lesser Lunasigils are excluded from undergarments based on current-game placement reported by the user, overriding the database slot assignment. Secret Life Lunatear remains available for undergarments (+15 Spirit).

## Version 1.6.5
The percentages beside Physical Defense and Magic Defense now show defense-based damage reduction, rather than the remaining damage received. Other damage reduction statistics are unchanged.

## Version 1.6.6
Armor grade buffs now activate automatically for four or more Arcane-or-better pieces of one material, using the lowest eligible grade; Rare or lower pieces and other materials do not count. Database mappings cover Cloth, Leather and Plate through Mythic. These buffs appear under Passive buffs, with eligible piece count and lowest grade in the tooltip. Verified fixed critical, penetration, speed and damage modifiers apply once. Manually selected armor grade buffs cannot bypass equipment requirements.

Health and Mana from armor grade buffs remain excluded and marked Partial until their piece/item-level scaling is verified. The public AAEmu implementation explicitly describes its scaling constant as hand-calculated; it is not treated as a verified Classic formula. Current-game reference supplied by the user: seven Divine Cloth pieces show +5,139 Health and +4,195 Mana; item levels were not supplied, so this is not generalized to other builds.
Reference: https://github.com/AAEmu/AAEmu/blob/develop/AAEmu.Game/Models/Game/Units/Unit.cs (ApplyArmorGradeBuff), plus the read-only Classic database armor_grade_buffs and unit_modifiers tables.

## Version 1.6.7
Replaced the equipment-panel mannequin with the left feline character from the user reference, isolated on a transparent background. Responsive sizing and subdued opacity preserve equipment visibility.

## Version 1.6.8
Seven Divine Flexible Talisman armor pieces (9000972–9000978, level 55) now receive exactly +5,094 Health and +3,396 Mana from the Divine Leather buff, verified by the user’s current-game screenshot. The observation applies only to that exact configuration. Different pieces, grades or counts still mark the unverified HP/Mana scale Partial. Published Darugear scaling would yield 5,105/3,403 for this configuration and is therefore not used as an exact Classic rule. Observations are preserved by export-effects.py via data/armor-grade-observations.json.

## Version 1.6.9
At the user’s explicit request, all armor-grade HP/Mana contributions now use the published Darugear get_buff_hp_mana formula: round(sum(0.310118 - 0.000959369 * item_level + 0.000680281 * item_level^2) * buff linear_level_bonus). Only matching material pieces of Arcane or higher count, at least four; the lowest eligible grade selects the buff. Screenshot-specific overrides are no longer applied. Seven level-55 Divine Flexible Talisman pieces consequently add 5,105 HP and 3,403 Mana using this rule. Source: https://darugear.com/main-CSRUMRG6.js

## Version 1.6.10
The equipment silhouette is embedded in the page, removing its dependency on a separate PNG request or an updated server asset route. The original transparent PNG remains included.

The left equipment column now places Hands above Wrists, matching the native game layout. Slot identities, icons and equipment restrictions retain their correct association.

## Version 1.6.11
Equipping a two-handed weapon moves any offhand item to inventory. Equipping an offhand item moves an existing two-handed weapon to inventory. The same rule applies to inventory swaps and preserves item configuration. A full inventory blocks the operation without changing the build; invalid two-hand/offhand build codes are rejected. Includes the embedded silhouette and corrected Hands/Wrists order from 1.6.10.

## Version 1.6.12
Restored the original equipment slot order: Wrists (sleeves) above Hands (gloves). Corrected only the empty slot atlas icons: Wrists uses tile 7 and Hands uses tile 5. Equipped items, compatibility and build codes remain associated with their original slot IDs.

## Version 1.6.13
Enabled Clear/Vivid/Lucid Ancient and Eternal skill lunagem families, including Witchcraft, using database slot groups 31 (Wrists/sleeves) and 32 (Waist/belt). These special-tag families bypass the previously overrestrictive tag filter, while retaining minimum item level and socket capacity checks. Their skill-specific effects are not invented as generic character stats.

## Version 1.6.14
Perfect Earth Lunafrost is correctly offered on cloaks (+10 Stamina); only Perfect Lunasigils require Enlightened accessories. Installed gem sockets and gem search rows now show the standard item tooltip on hover/focus, with verified effect values also visible in search results. Includes skill lunagem placement support from 1.6.13.

### 1.6.15
Lunafrost / Lunastone search also matches verified effect names, such as Toughness, while retaining slot compatibility filters.

### 1.6.16
Weapon hand choices follow database restrictions. Removed instrument temper controls and tooltip text.

### 1.6.17
Include offhand weapon Healing Power (including both Blind Fate variants), with grade and magic temper scaling.

### 1.6.18
Compressed AAC2 share codes, with lossless build data and legacy AAC1 import support. No server storage needed.

### 1.6.19
Export and calculate shield physical defense using holdable armor formula, grade multiplier and physical temper.

### 1.6.20
Resilience critical reductions, Toughness PvP reduction, effective powers and PvP effective health. Compare tab imports AAC1/AAC2 without replacing current build. Based on Darugear formulas; magic effective health correctly uses magic incoming reduction. Effective power excludes target defenses and effective health excludes fixed mitigation.

### 1.6.21
Effective powers are displayed inside their Melee, Ranged, Magic and Healing groups. Effective stats use a distinct lavender accent.

### 1.6.22
Expanded Compare with evasion, parry, shield block, accuracy, critical bonuses, healing, received healing, skill and backstab damage, focus, penetration and regeneration. Uses the same stat value resolver as character tabs. Fixed, Siege and PvE reductions are excluded per user preference.

### 1.7.0
Persistent six-character share links (?s=Ab3xY7), PostgreSQL via DATABASE_URL on Render, local SQLite for offline development. Automatically loads shared links and supports link/ID input in Compare and Load. Keeps AAC2 backup codes. See DATABASE-SETUP.md. Pink Goblet of Honor includes user-confirmed Classic +15% Healing Power.

## 1.7.1
Active buffs can be removed directly with the remove button. It appears on hover or keyboard focus and stays visible on touch devices. Passive buffs retain their effect tooltips.

## 1.7.2
Identifies Healing Power attribute 173 and applies healing and magic power percentage bonuses from both Bulwark of Wisdom variants and Gray Goblet of Honor. Supported percentage bonuses show as applied in buff tooltips.

## 1.7.3
Frequently used buffs appear first, including Combat Manuals, Combat Scrolls and Vaughn consumable buffs identified through database skill effects. Rank selectors and search remain available.

## 1.7.4
Synthesis does not contribute Equipment Points and no longer marks the score as partial.

## 1.7.5
Stat Migration uses adjustment buttons, current attribute totals, colored deltas and available points. Its button appears below the five attributes.

## 1.7.6
Socket tooltips show gem effects without long item names. Database skill/buff modifiers for 60 special gem items are displayed, including Witchcraft Mitigation duration +0.6s.

## 1.7.7
Fixes disappearing character stats after switching from Compare back to Core by retaining the Stat Migration button reference.

## 1.8.0
Import game gear (.txt) reads the existing Darugear addon export locally, previews warnings, and replaces equipment while retaining character settings. Imports grades, temper, compatible sockets and synthesis; unsupported items are reported. No addon changes required.

## 1.8.1
Removes gem minimum item-level filtering for level 55+ build planning. Slot, item compatibility and socket capacity restrictions remain enforced.

## 1.9.0
Equip armor set selects complete database sets with search, armor-type filtering, a seven-piece preview, grade and independent physical/magic temper. Only armor slots are replaced.

## 1.9.1
Tempest speed gem tooltips show one Attack Speed rating, e.g. +10 for Radiant, instead of four internal percentage modifiers.
