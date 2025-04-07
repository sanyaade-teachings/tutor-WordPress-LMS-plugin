import { faker } from '@faker-js/faker';
import { frontendUrls } from '../../../config/page-urls';

describe('Tutor Dashboard Announcements', () => {
  const announcements = {
    title: faker.lorem.sentence(),
    summary: faker.lorem.sentences(3),
  };
  beforeEach(() => {
    cy.visit(`${Cypress.env('base_url')}${frontendUrls.dashboard.ANNOUNCEMENTS}`);
    cy.loginAsInstructor();
    cy.url().should('include', frontendUrls.dashboard.DASHBOARD);
  });

  it('should filter announcements', () => {
    cy.get('.tutor-col-12 > .tutor-js-form-select').click();
    cy.get(
      '.tutor-col-12 > .tutor-js-form-select > .tutor-form-select-dropdown > .tutor-form-select-options span[tutor-dropdown-item]',
    ).then(($options) => {
      const randomIndex = Cypress._.random(1, $options.length - 1);
      const $randomOption = $options.eq(randomIndex);
      cy.wrap($randomOption).click({ force: true });
      const selectedOptionText = $randomOption.text().trim();
      cy.get('body').then(($body) => {
        if ($body.text().includes('No Data Found from your Search/Filter')) {
          cy.log('No data available');
        } else {
          cy.get('.tutor-fs-7.tutor-fw-medium.tutor-color-muted').each(($announcement) => {
            cy.wrap($announcement).should('contain.text', selectedOptionText);
          });
        }
      });
    });
  });

  it('should create a new announcement', () => {
    cy.intercept('POST', `${Cypress.env('base_url')}/wp-admin/admin-ajax.php`).as('ajaxRequest');
    cy.get('button[data-tutor-modal-target=tutor_announcement_new]').click();
    cy.get('.tutor-modal.tutor-is-active .tutor-form-select-label').then(($modal) => {
      if ($modal.text().includes('No course found')) {
        cy.log('No data found');
        return;
      }
      cy.get('#tutor_announcement_new input[name=tutor_announcement_title]').type(announcements.title);
      cy.get('#tutor_announcement_new textarea[name=tutor_announcement_summary]').type(announcements.summary);
      cy.get('#tutor_announcement_new button').contains('Publish').click();

      cy.get('.tutor-table').should('contain.text', announcements.title);
    });
  });

  it('should view and delete an announcement', () => {
    cy.intercept('POST', `${Cypress.env('base_url')}/wp-admin/admin-ajax.php`).as('ajaxRequest');
    cy.get('body').then(($body) => {
      if ($body.text().includes('No Data Available in this Section')) {
        cy.log('No data found');
      } else {
        cy.get('button.tutor-announcement-details').eq(0).click();
        cy.get('.tutor-modal.tutor-is-active button.tutor-modal-btn-delete').click();
        cy.get('.tutor-modal.tutor-is-active button').contains('Yes, Delete This').click();
        cy.wait('@ajaxRequest').then((interception) => {
          expect(interception.response?.body.success).to.equal(true);
        });
      }
    });
  });
});
