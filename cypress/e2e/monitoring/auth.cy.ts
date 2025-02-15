import dotenv from 'dotenv';
dotenv.config();

// Core authentication monitoring tests
describe('Authentication Monitoring', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  it('should complete the full login flow with magic link', () => {
    cy.log(`Running in environment: ${Cypress.env('environment')}`);
    cy.visit('/login');
    const TEST_EMAIL = Cypress.env("GMAIL_USER_EMAIL");
    cy.get('input[type="email"]').should('be.visible').type(TEST_EMAIL!);
    cy.get('form').submit();
    cy.contains('Check your email', { timeout: 10000 }).should('be.visible');
    cy.wait(5000);
    cy.task('getMagicLink').then((magicLink) => {
      expect(magicLink).to.be.a('string');
      cy.visit(magicLink as string);
      cy.url().should('not.include', '/login');
    });
  });
});
