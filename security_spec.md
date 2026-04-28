# Firestore Security Specification for FILANT°225

## 1. Data Invariants
- Users are identified by their sanitized phone numbers.
- A user can only read and write their own profile (except for verification by admin).
- Workers are public for reading, but creating/updating is restricted.
- sensitive fields like `pin`, `role`, `isVerified` must be protected.

## 2. The "Dirty Dozen" Payloads (Deny List)
1. Someone trying to write to another user's profile: `setDoc(doc(db, 'users', '0705052632'), { ... })` where the authenticated UID doesn't match the stored `userId`.
2. Someone trying to verify themselves: `updateDoc(doc(db, 'users', 'myphone'), { isVerified: true })`.
3. Someone trying to change their role to Admin: `updateDoc(doc(db, 'users', 'myphone'), { role: 'Admin 225' })`.
4. Someone trying to delete the entire users collection.
5. Someone trying to inject a very large string as a phone number.
6. Someone trying to write a worker without authentication.
7. Someone trying to update a worker's `isVerified` status without being an admin.
8. Someone trying to read all users' profiles (blanket read).
9. Someone trying to set an invalid status: `status: 'super-admin'`.
10. Someone trying to spoof `updatedAt` with a client timestamp.
11. Someone trying to bypass `isValidId` with a 2KB string as ID.
12. Someone trying to update a terminal state if applicable.

## 3. The Test Runner Plan
I will generate `firestore.rules` that address these concerns.
