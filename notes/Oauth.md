# Questions/Notes

I guess this is more of a document of understanding with questions embedded.

## Utils/supabase

#### client.ts

From my understanding this is boiler plate logic to connect Supabase with this Next.Js Application. I guessing you got this information from the supabase docs for setting up Auth.

#### server.ts

This is where things get a bit weird but from my understanding. This is were our auth provider(supabase) is able get, set, and remove cookies on the client.

* I'm guessing that this cookie is used to verify that the ui that is loaded is the correct "logged in user". If the cookie isn't present there will be a redirect to a login/sign up? Is this right?
* Even with O auth this flow is still valid and doesn't need to be changed?
* Database types: This was the type signature from supabase? Basically the DB schema?
  
#### middleware.ts

Boiler plate Logic for getting and refreshing cookies for users. Did you grab all of this from the docs?
[Supabase Docs](https://supabase.com/docs/guides/auth/server-side/nextjs?router=app)

* I'm also a bit confused with the return signature of the the `createServerClient()` function.
  * The return is an object with the property of supabase and response.
  * Supabase property is a client instance.
  * response property is a NextResponse object for cookie handling
  * If-so fact-so, these two bits are used to continually check if a user is logged? It seems like they are only used throughout logging in and signing out.

* I noticed in the Doc's there is async function call in the docs `await supabase.auth.getUser()`. I'm wondering if this is some thing we need to add when using oath? The docs say this function is used to refresh the auth token. (Auth token stored in Local Storage? Refreshed buy Http cookies? )


This is the behind the scenes logic of auth?

Next we move to EmailAuthModal.tsx

## EmailAuthModal.tsx

This is the part that I get all confused with. I'm losing the data path in the abstraction. 

* I'm getting lost with the userSessionProviders.tsx and userSessionService.ts? 
Why is userSessionProvider a .tsx file? It doesn't render ui. That's kinda a weird one for me. 
* I'm guessing in userSessionServices.ts this is where I'm going to add:
*I got this Sniptit from [here](https://supabase.com/docs/guides/auth/server-side/oauth-with-pkce-flow-for-ssr)*

``` ts
 const { data, error } = await supabase.auth.signInWithOAuth({
  provider,
  options: {
    redirectTo: 'http://example.com/auth/callback',
  },
})

if (data.url) {
  redirect(data.url) // use the redirect API for your server framework
}

```

  