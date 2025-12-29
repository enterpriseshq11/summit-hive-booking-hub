# Global Warnings Inventory

**Last Updated:** 2025-12-29  
**Status:** TRACKED

## React Ref Warnings (Non-Critical)

### 1. FAQSection Component
- **Warning:** `Function components cannot be given refs`
- **Location:** `src/components/home/FAQSection.tsx`
- **Affects:** Dev console only, no production impact
- **Proposed Fix:** Wrap component in `forwardRef` or remove unused ref forwarding

### 2. Footer Component  
- **Warning:** `Function components cannot be given refs`
- **Location:** `src/components/layout/Footer.tsx`
- **Affects:** Dev console only, no production impact
- **Proposed Fix:** Wrap component in `forwardRef` or remove unused ref forwarding

### 3. MainLayout Component
- **Warning:** `Function components cannot be given refs`
- **Location:** `src/components/layout/MainLayout.tsx`
- **Affects:** Dev console only, no production impact
- **Proposed Fix:** Wrap component in `forwardRef` or remove unused ref forwarding

## Summary

| Component | Severity | Production Impact | Priority |
|-----------|----------|-------------------|----------|
| FAQSection | Low | None | P3 |
| Footer | Low | None | P3 |
| MainLayout | Low | None | P3 |

---

**Note:** These warnings are cosmetic and do not affect functionality. They should be addressed in a future cleanup sprint.
