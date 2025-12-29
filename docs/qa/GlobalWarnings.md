# Global Warnings Inventory

**Last Updated:** 2025-12-29  
**Status:** TRACKED

## React Ref Warnings (Non-Critical)

### 1. FAQSection Component
- **File Path:** `src/components/home/FAQSection.tsx`
- **Warning Text:** `Function components cannot be given refs. Attempts to access this ref will fail. Did you mean to use React.forwardRef()?`
- **Root Cause:** Component receives ref prop from parent but is not wrapped in `forwardRef()`
- **Present in Production:** Unknown (dev console only, React warnings typically stripped in prod builds)
- **Fix Candidate:** Wrap component export in `React.forwardRef()` or remove ref prop from parent

### 2. Footer Component  
- **File Path:** `src/components/layout/Footer.tsx`
- **Warning Text:** `Function components cannot be given refs. Attempts to access this ref will fail. Did you mean to use React.forwardRef()?`
- **Root Cause:** Component receives ref prop from parent but is not wrapped in `forwardRef()`
- **Present in Production:** Unknown (dev console only, React warnings typically stripped in prod builds)
- **Fix Candidate:** Wrap component export in `React.forwardRef()` or remove ref prop from parent

### 3. MainLayout Component
- **File Path:** `src/components/layout/MainLayout.tsx`
- **Warning Text:** `Function components cannot be given refs. Attempts to access this ref will fail. Did you mean to use React.forwardRef()?`
- **Root Cause:** Component receives ref prop from parent but is not wrapped in `forwardRef()`
- **Present in Production:** Unknown (dev console only, React warnings typically stripped in prod builds)
- **Fix Candidate:** Wrap component export in `React.forwardRef()` or remove ref prop from parent

## Summary

| Component | File Path | Severity | Production Impact | Priority | Fix Candidate |
|-----------|-----------|----------|-------------------|----------|---------------|
| FAQSection | src/components/home/FAQSection.tsx | Low | None | P3 | forwardRef wrap |
| Footer | src/components/layout/Footer.tsx | Low | None | P3 | forwardRef wrap |
| MainLayout | src/components/layout/MainLayout.tsx | Low | None | P3 | forwardRef wrap |

---

**Note:** These warnings are cosmetic and do not affect functionality. They should be addressed in a future cleanup sprint.
