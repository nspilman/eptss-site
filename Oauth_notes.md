#Yoo 

Migrating from Magic link to O Auth for a google and spotify providers.

Assumptions: 
Using supabase auth. 
Logic for auth is in app/auth/callback/route.ts

## OAuth

### Google O Auth

  [SupaBase Google docs](https://supabase.com/docs/guides/auth/social-login/auth-google)

 
## Ui

components/client/EmailAuthModal/EmailAuthModal.tsx

Upon user click of the SignUp/login button a model opens 
in the modal we will inform the user that we are moving away from magic link and use the new o auth.

- We should slow roll this. Allow users to continue to use magic link but recommend to switch over
- New users have to use o-auth
- For new user if email not found we need to redirect to sign up via o auth.
