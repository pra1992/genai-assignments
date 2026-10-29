import { test, expect } from '@playwright/test';

test.use({ channel: 'chrome' });

test.describe('Leaftaps Lead Creation', () => {
  test('Create a lead successfully', async ({ page }) => {
    await page.goto('https://leaftaps.com/opentaps');

    await page.locator('#username').fill('democsr2');
    await page.locator('#password').fill('crmsfa');
    await page.getByRole('button', { name: 'Login', exact: true }).click();

    await expect(page).toHaveURL(/opentaps\/control\/main/);
    await page.getByRole('link', { name: 'CRM/SFA', exact: true }).click();

    await page.getByRole('link', { name: 'Create Lead', exact: true }).click();

    await page.locator('#createLeadForm_companyName').fill('TestLeaf');
    await page.locator('#createLeadForm_firstName').fill('Harrish');
    await page.locator('#createLeadForm_lastName').fill('Automation');
    await page.locator('#createLeadForm_primaryEmail').fill('harrish@testleaf.com');
    await page.locator('#createLeadForm_primaryPhoneNumber').fill('9876543210');

    await page.getByRole('button', { name: 'Create Lead', exact: true }).click();

    await expect(page).toHaveURL(/opentaps\/crm\/ViewLead\.html/);
    await expect(page.getByRole('heading', { name: /View Lead/i })).toBeVisible();
    await expect(page.locator('#viewLead_companyName_sp')).toContainText('TestLeaf');
    await expect(page.locator('#viewLead_firstName_sp')).toContainText('Harrish');
    await expect(page.locator('#viewLead_lastName_sp')).toContainText('Automation');
  });
});
