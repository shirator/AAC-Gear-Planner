# Armor grade scaling investigation

Primary calculator reference: https://darugear.com/main-CSRUMRG6.js, get_buff_hp_mana.

Published Darugear rule: sum over eligible pieces of (0.310118 - 0.000959369 * item_level + 0.000680281 * item_level^2) * linear_level_bonus; round the final sum.

Classic SQLite Divine Leather coefficients: HP 315, Mana 210. User screenshot: seven Divine Leather, HP 5094 and Mana 3396. Both correspond to an effective scale of 16.1714285714. Piece names and item levels are unknown. Seven level-55 pieces under the published rule give 5105 HP and 3403 Mana, so this is not claimed as an exact Classic formula.

Divine Cloth screenshot: HP 5139 and Mana 4195, database coefficients 283 and 231. Their rounding-compatible scale is approximately 18.16. The two screenshots do not establish a universal seven-piece Divine scale, nor the function relating item levels to that scale.

No inferred scaling constant is applied to live totals. HP/Mana remain Partial until validated against known equipment levels. The public AAEmu implementation also labels its own scaling constant hand-calculated, so it is not authoritative for exact Classic values.

## Adopted rule
As of v1.6.9 the user explicitly authorizes the published Darugear formula as the calculator rule. It is now applied to all supported armor grade buffs. The earlier screenshot-specific override is disabled. The screenshot discrepancy is retained above as historical evidence, not used to change the coefficients.
