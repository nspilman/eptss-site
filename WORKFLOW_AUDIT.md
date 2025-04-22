# Workflow Audit

Below are the core user workflows to cover with Cypress integration tests:

## 1. User Registration
- Route: `/sign-up`
- Dynamic context: `/sign-up/[slug]`
- Steps:
  - Fill in personal details (name, email, password)
  - Submit form
  - Verify success confirmation or redirect

## 2. Login
- Route: `/login`
- OAuth callback: `/auth/google`
- Steps:
  - Enter email/password or initiate OAuth
  - Submit and verify successful authentication

## 3. Profile Management
- Route: `/profile`
- Steps:
  - View existing user details
  - Edit profile fields (e.g., name, email)
  - Save changes and confirm persistence

## 4. Round Browsing
- Routes: `/rounds` & `/round/[slug]`
- Steps:
  - View list of rounds
  - Navigate to a round’s detail page
  - Confirm round metadata (dates, description)

## 5. Submission Workflow
- Routes: `/submit` & `/submit/[slug]`
- Steps:
  - Fill submission form (title, description, file upload)
  - Submit and verify the submission appears in list

## 6. Voting Workflow
- Routes: `/voting` & `/voting/[slug]`
- Steps:
  - View rounds available for voting
  - Cast votes on items
  - Confirm vote counts update correctly

## 7. Dashboard (User)
- Route: `/dashboard`
- Steps:
  - Display summary metrics (submissions, votes)
  - Interact with filters or date selectors
  - Verify visualizations render with data

## 8. Reporting
- Route: `/reporting`
- Steps:
  - Select report parameters (date range, type)
  - Generate report and verify download or display

## 9. Waitlist
- Route: `/waitlist`
- Steps:
  - Join waitlist (submit email/form)
  - Confirm enrollment and view status

## 10. Admin Workflows
- Routes under `/admin`
- Steps:
  - Authenticate as admin
  - Create/edit/delete rounds
  - Manage users (view, add, disable)
  - Review and moderate submissions & votes

---

Each workflow test should:
- Start from the root or authenticated state
- Navigate through necessary routes
- Interact with UI elements and forms
- Assert API responses and UI updates
