import dotenv from 'dotenv';
dotenv.config();

// Smoke tests that can run in staging and production
describe('Authentication Smoke Tests', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  it('should complete the full login flow with magic link', () => {
    // Visit the login page and wait for it to load
    cy.visit('/login');
    cy.get('form').should('be.visible');

    const TEST_EMAIL = Cypress.env("GMAIL_USER_EMAIL");
    // Type in the email address
    cy.get('input[type="email"]').should('be.visible').type(TEST_EMAIL!);
    
    // Submit the form and wait for the submission
    console.log({TEST_EMAIL})
    cy.get('form').submit();
    cy.contains('Check your email', { timeout: 10000 }).should('be.visible');

    // Wait for the email to be sent and received
    cy.wait(5000);

    // Get and visit the magic link
    cy.task('getMagicLink').then((magicLink) => {
      expect(magicLink).to.be.a('string');
      cy.visit(magicLink as string);
      
      // Verify we're logged in by checking we're not on the login page
      cy.url().should('not.include', '/login');
    });
  });
});
