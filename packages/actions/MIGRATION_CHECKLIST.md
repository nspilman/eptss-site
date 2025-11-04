# Actions Package Migration Checklist

Moving all server actions from `@eptss/data-access/actions/` to `@eptss/actions`

## Action Files to Move

### 1. ✅ adminActions.ts (COMPLETED)
- [x] adminSignupUser
- [x] adminSubmitCover
- [x] createRoundAction
- [x] updateFeedbackPublicStatus
- [x] deleteFeedback

### 2. ⬜ signupActions.ts
- [ ] signupForRound
- [ ] signupForRoundWithResult (deprecated wrapper)

### 3. ⬜ feedbackActions.ts
- [ ] submitFeedback

### 4. ⬜ userParticipationActions.ts
- [ ] submitVotes (includes rate limiting, revalidation)
- [ ] submitCover (includes rate limiting, revalidation)
- [ ] signup (wrapper with revalidation)
- [ ] signupWithOTP (includes rate limiting, validation)
- [ ] completeSignupAfterVerification (includes rate limiting)
- [ ] verifySignupByEmail (wrapper with revalidation)

## Email Integration Opportunities

Based on comments in the code, these actions previously had email but it was removed:

### User Participation Actions (userParticipationActions.ts)
- **submitVotes** - Line 70 comment: "Note: Email confirmation removed - should be handled by consuming app"
  - Could send voting confirmation email

- **submitCover** - Line 143 comment: "Note: Email confirmation removed - should be handled by consuming app"
  - Could send submission confirmation email

- **signup** - Line 177 comment: "Note: Email confirmation removed - should be handled by consuming app"
  - Could send signup confirmation email

- **verifySignupByEmail** - Line 323 comment: "Note: Email confirmation removed - should be handled by consuming app"
  - Could send signup verification email

## Migration Steps

1. [x] Create `@eptss/actions` package structure
2. [ ] Move signupActions.ts to actions package
3. [ ] Move feedbackActions.ts to actions package
4. [ ] Move userParticipationActions.ts to actions package
5. [ ] Consider adding email integrations to appropriate actions
6. [ ] Update all imports in apps/web
7. [ ] Update data-access exports to remove action exports
8. [ ] Update actions package index.ts to export all actions
9. [ ] Delete old action files from data-access/src/actions/
10. [ ] Test all affected forms and workflows

## Import Changes Needed

All imports will change from:
```typescript
import { actionName } from "@eptss/data-access";
```

To:
```typescript
import { actionName } from "@eptss/actions";
```

## Files That May Need Updates

Need to search apps/web for imports of:
- signupForRound
- submitFeedback
- submitVotes
- submitCover
- signup
- signupWithOTP
- completeSignupAfterVerification
- verifySignupByEmail
