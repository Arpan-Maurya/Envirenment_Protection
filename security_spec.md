# CarbonIQ Security Specification

## Data Invariants
1. A user can only read and write their own document in `/users/{uid}`.
2. A user can only read and write to their own subcollections (`missions`, `achievements`, `activities`, `notifications`, `chats`, `reports`).
3. The `leaderboard` is publicly readable but can only be updated by the user for their own entry.
4. Timestamp fields (`createdAt`, `updatedAt`, `timestamp`) must match `request.time`.
5. User `ecoPoints` and `xp` must be positive.

## The Dirty Dozen Payloads

1. **Identity Theft (Write)**: Attempt to create a user profile with a different UID than the authenticated user.
2. **Unauthorized Read**: Attempt to read another user's private carbon data.
3. **Spoofed Points**: Attempt to update `ecoPoints` with 1,000,000.
4. **Invalid Type**: Attempt to set `commuteDistance` to a string instead of a number.
5. **Orphaned Write**: Attempt to create an achievement without a valid user ID.
6. **Bypassing Validation**: Attempt to create a user profile without required fields like `email`.
7. **Cross-User Mission Access**: Attempt to mark another user's mission as completed.
8. **Spoofed Timestamp**: Attempt to set `createdAt` to a historical date.
9. **Leaderboard Poisoning**: Attempt to update someone else's rank on the leaderboard.
10. **Junk ID Poisoning**: Attempt to use a 1MB string as a document ID.
11. **Shadow Update**: Attempt to add a hidden `isAdmin: true` field during profile update.
12. **PII Blanket Leak**: Attempt to list all users' emails in one query.

## Test Runner (firestore.rules.test.ts)

Verification will be done by visual audit and ESLint.
