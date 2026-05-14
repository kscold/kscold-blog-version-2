describe('responsive cursor behavior', () => {
  it('keeps the native cursor on narrow desktop widths', () => {
    cy.viewport(700, 900);
    cy.visit('/');

    cy.document().then((doc) => {
      expect(doc.documentElement.classList.contains('custom-cursor-active')).to.eq(false);
    });
  });

  it('activates the custom cursor on wide desktop widths', () => {
    cy.viewport(1440, 900);
    cy.visit('/');

    cy.document().then((doc) => {
      expect(doc.documentElement.classList.contains('custom-cursor-active')).to.eq(true);
    });
  });

  it('does not activate the custom cursor on mobile widths', () => {
    cy.viewport(390, 844);
    cy.visit('/');

    cy.document().then((doc) => {
      expect(doc.documentElement.classList.contains('custom-cursor-active')).to.eq(false);
    });
  });
});
