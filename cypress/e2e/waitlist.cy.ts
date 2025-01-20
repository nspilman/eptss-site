describe("Verify Waitlist Signup in Supabase", () => {
    let slimeAction: string;
    let testEmail: string;
  
    before(() => {
      // Retrieve secret slime action once per test suite
      cy.getSecretSlimeAction().then((action) => {
        slimeAction = action;
      });
    });
  
    it("should confirm the user was added to the waitlist in Supabase", () => {
      cy.getSecretSlimeAction().then((slimeAction) => {
        testEmail = `testuser+${slimeAction}-${Date.now()}@example.com`;
        const testName = "Summer Sanders";
  
        cy.visit("/");
        cy.contains("Get notified about the next round").click();
        cy.get('input[name="name"]').type(testName);
        cy.get('input[name="email"]').first().type(testEmail);
        cy.get('button[type="submit"]').click();
        cy.contains("Success!").should("be.visible");
  
        cy.wait(1000);
  
        // ✅ Use `.then()` instead of `.should()`
        cy.getSupabaseAdminClient().then((supabase) => {
          return supabase
            .from("mailing_list")
            .select("*")
            .eq("email", testEmail)
            .then((response) => {
              cy.log("Supabase Response:", JSON.stringify(response, null, 2));
              expect(response.data).to.have.length(1);
              expect(response.data[0].name).to.eq(testName);
            });
        });
      });
    });
  
    afterEach(() => {
      // ✅ Ensure testEmail exists before running delete query
      if (!testEmail) return;
  
      cy.getSupabaseAdminClient().then((supabase) => {
        supabase
          .from("mailing_list")
          .delete()
          .like("email", `testuser+${slimeAction}%`)
          .then((response) => {
            cy.log("Deleted test emails:", JSON.stringify(response, null, 2));
          });
      });
    });
  });
  