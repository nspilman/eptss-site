/// <reference types="cypress" />

import { createClient, SupabaseClient } from "@supabase/supabase-js";

declare global {
    namespace Cypress {
      interface Chainable {
        getSupabaseClient(): Chainable<SupabaseClient>;
        getSupabaseAdminClient(): Chainable<SupabaseClient>;
        getSecretSlimeAction(): Chainable<string>
      }
    }
  }

// Add a custom Cypress command that wraps the Supabase client in `cy.wrap()`
Cypress.Commands.add("getSupabaseClient", () => {
    return cy.wrap(
      createClient(
        Cypress.env("SUPABASE_URL"),
        Cypress.env("SUPABASE_ANON_KEY")
      )
    );
  });

  Cypress.Commands.add("getSupabaseAdminClient", () => {
    return cy.wrap(
      createClient(
        Cypress.env("SUPABASE_URL"),
        Cypress.env("SUPABASE_SERVICE_ROLE_KEY")
      )
    );
  });

Cypress.Commands.add("getSecretSlimeAction", () => {
    const slime = Cypress.env("THE_SECRET_SLIME_ACTION")
    return slime;
})

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }