# Questions/Notes

I guess this is more of a document of understanding with questions embedded.

## Utils/supabase

#### client.ts

From my understanding this is boiler plate logic to connect Supabase with this Next.Js Application. I guessing you got this information from the supabase docs for setting up Auth.

##### Nate response - 4/15/2024

`npx create-next-app -e with-supabase` via this [quickstart guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs). `server.ts, client.ts and middleware.ts are generated code.`

Now that I'm looking at it, we only ever use `server.ts` to call supabase. `client` and `middleware` are unused.

The idea is that `client` could be used to call `Supabase` from a `use client` denoted component. That said, I'd like to avoid that - though if we ever need to poll data from a UI component, that's how we'd do it.

---

#### server.ts

This is where things get a bit weird but from my understanding. This is were our auth provider(supabase) is able get, set, and remove cookies on the client.

- I'm guessing that this cookie is used to verify that the ui that is loaded is the correct "logged in user". If the cookie isn't present there will be a redirect to a login/sign up? Is this right?
- Even with O auth this flow is still valid and doesn't need to be changed?
- Database types: This was the type signature from supabase? Basically the DB schema?

##### Nate response - 4/15/2024

yes, this is the one we use to talk to Supabase via our `service` layer (and some other places I haven't gotten to yet). I'd expect OAuth to use this `client` as well, yeah.

The database types are generated via the `supabase cli`. this is the thing you helped me out with a while back.

---

#### middleware.ts

Boiler plate Logic for getting and refreshing cookies for users. Did you grab all of this from the docs?
[Supabase Docs](https://supabase.com/docs/guides/auth/server-side/nextjs?router=app)

##### Nate response - 4/15/2024

this is boilerplate, but good looks with the docs reading, as this might be the version we want to be using for auth? I've been using the `server` client.

---

- I'm also a bit confused with the return signature of the the `createServerClient()` function.
  %% Nate response - this was boilerplate from the nextjs project generation %%

  - The return is an object with the property of supabase and response.
  - Supabase property is a client instance.
  - response property is a NextResponse object for cookie handling
  - If-so fact-so, these two bits are used to continually check if a user is logged? It seems like they are only used throughout logging in and signing out.

- I noticed in the Doc's there is async function call in the docs `await supabase.auth.getUser()`. I'm wondering if this is some thing we need to add when using oath? The docs say this function is used to refresh the auth token. (Auth token stored in Local Storage? Refreshed buy Http cookies? )

This is the behind the scenes logic of auth?

Next we move to EmailAuthModal.tsx

## EmailAuthModal.tsx

This is the part that I get all confused with. I'm losing the data path in the abstraction.

- I'm getting lost with the userSessionProviders.tsx and userSessionService.ts?
  Why is userSessionProvider a .tsx file? It doesn't render ui. That's kinda a weird one for me.
- I'm guessing in userSessionServices.ts this is where I'm going to add:
  _I got this Sniptit from [here](https://supabase.com/docs/guides/auth/server-side/oauth-with-pkce-flow-for-ssr)_

```ts
const { data, error } = await supabase.auth.signInWithOAuth({
  provider,
  options: {
    redirectTo: "http://example.com/auth/callback",
  },
});

if (data.url) {
  redirect(data.url); // use the redirect API for your server framework
}
```

##### Nate Response 4/15/2024

The architecture I'm trying to build - and it's almost done - is to have the `UI layer` call into the `Provider layer` call into the `data-access Layer`., which calls into `supabase`.
So the `EmailAuthModel` calls `userSessionProvider`, which returns `signInWithOTP`.

This then calls into `getUserSession` in the data access layer.

The abstraction isn't necessary here, but I appreciate having the business logic layer in between the database the UI. `roundProvider` has a lot more logic.
