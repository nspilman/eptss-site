/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to get magic link from email
     * @example cy.getMagicLink()
     */
    getMagicLink(): Chainable<string>
  }
}
