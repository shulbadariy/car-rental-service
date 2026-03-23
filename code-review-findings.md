# Code Review Findings

Validated findings only. Items below were cross-checked against the codebase to avoid false positives.

## Business logic

### Critical

#### Rental lifecycle is not atomic

- **Severity:** Critical
- **Evidence:** `backend/src/rentals/rentals.service.ts:18-61`, `backend/prisma/schema.prisma:62-80`
- **Explanation:** Rental creation and car status updates happen in separate DB operations, and the schema does not enforce one active rental per car/user. Under concurrent requests, the system can create conflicting rentals or leave cars in an inconsistent state.
- **How to fix:** Wrap rental lifecycle changes in a single DB transaction and add DB-level invariants for active rentals.

### High

#### Permission model drifted from product rules

- **Severity:** High
- **Evidence:** `README.md:22-31`, `frontend/src/routes.tsx:57-74`, `backend/src/cars/cars.controller.ts:18-30,113-118`, `backend/src/cars/admin-cars.controller.ts:17-25`, `backend/src/users/users.controller.ts:38-45`, `backend/src/users/admin-users.controller.ts:35-45`
- **Explanation:** Product rules say `SUPERADMIN` cannot manage cars or rentals, but backend car endpoints still allow `SUPERADMIN`. The implementation is already out of sync with the documented business model. Worse, the same operation has different access rules depending on the URL: `UsersController.softDelete` requires `SUPERADMIN`, but `AdminUsersController.deleteUser` allows `ADMIN` as well. An `ADMIN` can bypass the intended restriction by calling `DELETE /admin/users/:id` instead of `PATCH /users/:id/soft-delete`. The same bypass exists for user updates.
- **How to fix:** Define one source of truth for permissions and align backend guards, frontend route access, and documentation to it.

#### Pricing logic is duplicated and inconsistent

- **Severity:** High
- **Evidence:** `backend/src/rentals/rentals.service.ts:89-93`, `backend/src/users/users.service.ts:156-160`, `frontend/src/pages/Profile.tsx:93-98`, `frontend/src/pages/CarDetails.tsx:144-150`
- **Explanation:** Rental pricing is calculated differently in normal stop flow, user-deletion flow, and frontend live display. This creates money-related drift across user journeys.
- **How to fix:** Move pricing rules into one backend domain function and let the frontend render backend-calculated values.

#### Duplicate endpoints create an unguarded attack surface

- **Severity:** High
- **Evidence:** `backend/src/rentals/rentals.controller.ts:19-27`, `backend/src/cars/cars.controller.ts:83-87,89-113`
- **Explanation:** `POST /rentals` and `POST /rentals/start` are identical. `GET /cars/search` and `GET /cars/filter` duplicate the main `GET /cars` but lack `OptionalJwtAuthGuard`, so they never receive user context and skip the "append own active rental car" logic. This means the same feature returns different results depending on which URL the client calls.
- **How to fix:** Remove the duplicate endpoints. Keep one canonical URL per operation and deprecate or delete the aliases.

### Low

#### Soft-deleted user re-registration silently reactivates the old account

- **Severity:** Low
- **Evidence:** `backend/src/auth/auth.service.ts:18-44`
- **Explanation:** When a user registers with the email of a soft-deleted account, the old record is reactivated instead of creating a new one. Old rental history remains linked to the reactivated identity. This may or may not be intended, but it is a product-level decision that should be explicit, not a side effect of the upsert logic.
- **How to fix:** Decide whether re-registration should reuse or orphan old data, document the decision, and enforce it with a test.

## Technical

### Critical

#### Authorization trusts stale JWT claims

- **Severity:** Critical
- **Evidence:** `backend/src/auth/jwt.strategy.ts:19-20`, `backend/src/common/guards/roles.guard.ts:10-18`, `backend/src/users/users.service.ts:91-95,124-185`
- **Explanation:** Role checks rely on the role embedded in the JWT payload instead of reloading the actor from the database. Deleted or downgraded users can keep access until token expiry.
- **How to fix:** Rehydrate the authenticated user from DB during auth/guard flow, or add token revocation/version checks so permission changes take effect immediately.

### High

#### Auth/policy surface is duplicated across controllers

- **Severity:** High
- **Evidence:** `backend/src/cars/cars.controller.ts`, `backend/src/cars/admin-cars.controller.ts`, `backend/src/users/users.controller.ts`, `backend/src/users/admin-users.controller.ts`, `backend/src/rentals/rentals.controller.ts`, `backend/src/rentals/admin-rentals.controller.ts`
- **Explanation:** Business permissions are spread across multiple controllers and route trees. When one rule changes, several endpoints must be updated, which already caused policy drift in this project.
- **How to fix:** Consolidate admin capabilities behind one clear controller boundary or a central authorization policy layer.

#### No pagination on any list endpoint

- **Severity:** High
- **Evidence:** `backend/src/cars/cars.service.ts:106-115,118-136,201-213`, `backend/src/users/users.service.ts:63-72,74-84`, `backend/src/rentals/rentals.service.ts:174-183`
- **Explanation:** Every list endpoint (`findAll`, `getAllCarsForAdmin`, `getAllUsers`, `getAdmins`, rental history) returns unbounded result sets. `getFilterOptions` loads every car into memory to compute unique values with `new Set()` instead of using `DISTINCT` queries. This is both a scalability wall and a potential OOM vector as data grows.
- **How to fix:** Add cursor- or offset-based pagination to all list endpoints, and rewrite `getFilterOptions` to use `DISTINCT` at the database level.

### Medium

#### API contract is unstable across layers

- **Severity:** Medium
- **Evidence:** `frontend/src/pages/Profile.tsx:24-40`, `frontend/src/pages/CarDetails.tsx:30-38`, `backend/src/cars/dto/update-car.dto.ts:33-51`, `backend/src/rentals/rentals.service.ts:165-188`
- **Explanation:** The same concepts use multiple field shapes and names (`startTime` vs `startDate`, `lat/lng` vs `latitude/longitude`, duplicate rental-style endpoints). That forces page-level normalization and increases coupling.
- **How to fix:** Standardize DTOs and response models, remove aliases/duplicates, and keep one canonical field name per concept.

#### `CarsController.findAll` silently ignores filters when `q` is present

- **Severity:** Medium
- **Evidence:** `backend/src/cars/cars.controller.ts:34-80`
- **Explanation:** The method treats search and filters as mutually exclusive by implementation: if `q` exists, it returns `search(...)` and never applies filters. That is surprising API behavior and becomes a real issue once the UI needs combined search + filters.
- **How to fix:** Either support combined query building for `q + filters`, or reject mixed usage explicitly with a `400` response.

#### No automated safety net

- **Severity:** Medium
- **Evidence:** `backend/package.json:5-10`, `frontend/package.json:6-10`
- **Explanation:** The repo defines build/lint scripts but has no meaningful automated test coverage for auth, pricing, or rental lifecycle rules. That makes changes risky and regressions likely.
- **How to fix:** Add focused automated tests for rental lifecycle, pricing, and authorization rules, starting with service/integration tests.

#### Geo-search loads all cars into application memory

- **Severity:** Medium
- **Evidence:** `backend/src/cars/cars.service.ts:222-244`
- **Explanation:** `findNear()` fetches every non-deleted car from the database and then runs the Haversine formula in JavaScript. This is O(n) in application memory per request and will degrade linearly with fleet size.
- **How to fix:** Push distance filtering to the database with PostGIS or a raw SQL `WHERE` clause using the Haversine formula, so only nearby rows are returned.

#### No rate limiting on auth endpoints

- **Severity:** Medium
- **Evidence:** `backend/src/auth/auth.controller.ts`, `backend/src/auth/dto/login.dto.ts:9-12`, `backend/src/main.ts`
- **Explanation:** There is no request throttling on `POST /auth/login` or `POST /auth/register`. Combined with a minimum password length of only 6 characters and no complexity requirements, brute-force and credential-stuffing attacks are trivial.
- **How to fix:** Add NestJS `@nestjs/throttler` (or equivalent) to auth routes, and consider stronger password validation rules.

#### `@CurrentUser()` typed as `any` across all controllers

- **Severity:** Medium
- **Evidence:** `backend/src/rentals/rentals.controller.ts:20-44`, `backend/src/users/users.controller.ts:32-45`, `backend/src/cars/cars.controller.ts`
- **Explanation:** Every `@CurrentUser() user: any` parameter discards type safety for the authenticated user object. Mistyping a property name (e.g., `user.id` vs `user.userId`) compiles without error but fails at runtime.
- **How to fix:** Define a shared `AuthenticatedUser` interface and use it as the type for `@CurrentUser()` across all controllers.
