

## Swap Office Name Labels on Coworking Cards

### What's Changing

The four office cards currently display names that are swapped. The photos, prices, and positions stay exactly where they are. Only the displayed names and floor labels need to swap:

| Card Position | Currently Shows | Should Show |
|---|---|---|
| Top-left | S1 / Second Floor | P1 / First Floor |
| Top-right | S2 / Second Floor | P2 / First Floor |
| Bottom-left | P1 / First Floor | S1 / Second Floor |
| Bottom-right | P2 / First Floor | S2 / Second Floor |

### Technical Details

**File:** `src/components/coworking/HiveOfficeCards.tsx`

1. Update the `getDisplayInfo` function to swap labels:
   - Code "S1" displays as "Private Office P1" / "First Floor"
   - Code "S2" displays as "Private Office P2" / "First Floor"
   - Code "P1" displays as "Private Office S1" / "Second Floor"
   - Code "P2" displays as "Private Office S2" / "Second Floor"

2. Update the displayed code on each card (the bold text next to the building icon) to show the swapped name instead of the database code. For example, the card with DB code "S1" will show "P1" as the bold heading.

No database changes, no photo swaps, no price changes. Purely a display-label fix.

