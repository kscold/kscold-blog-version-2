describe('responsive cursor behavior', () => {
  it('keeps the native cursor on narrow desktop widths', () => {
    cy.viewport(700, 900);
    cy.visit('/');

    cy.document().then((doc) => {
      expect(doc.documentElement.classList.contains('custom-cursor-active')).to.eq(false);
    });
  });
});
