import { Page } from '@playwright/test';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Login as an HR user
 */
export async function loginAsHR(page: Page, email = 'admin@example.com', password = 'password') {
  await page.goto('/login');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('/dashboard');
}

/**
 * Login as a regular employee
 */
export async function loginAsEmployee(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('/dashboard');
}

/**
 * Logout the current user
 */
export async function logout(page: Page) {
  // Click on the user menu
  await page.click('[data-testid="user-menu"]');
  // Click logout
  await page.click('text=Logout');
  await page.waitForURL('/login');
}

/**
 * Create a test invite using PHP artisan command
 */
export async function createTestInvite(options: {
  email?: string;
  first_name?: string;
  last_name?: string;
  position?: string;
  department?: string;
} = {}) {
  const args = [];
  if (options.email) args.push(`--email="${options.email}"`);
  if (options.first_name) args.push(`--first_name="${options.first_name}"`);
  if (options.last_name) args.push(`--last_name="${options.last_name}"`);
  if (options.position) args.push(`--position="${options.position}"`);
  if (options.department) args.push(`--department="${options.department}"`);

  const command = `php artisan test:create-invite ${args.join(' ')}`;
  const { stdout } = await execAsync(command);

  return JSON.parse(stdout.trim());
}

/**
 * Get the latest invite token
 */
export async function getLatestInviteToken(): Promise<string> {
  const { stdout } = await execAsync('php artisan test:get-latest-token');
  return stdout.trim();
}

/**
 * Reset the test database
 */
export async function resetTestDatabase() {
  const { stdout } = await execAsync('php artisan test:reset-database');
  return JSON.parse(stdout.trim());
}

/**
 * Wait for a specific amount of time (milliseconds)
 */
export async function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fill a date input field (works around browser date picker issues)
 */
export async function fillDate(page: Page, selector: string, date: string) {
  // Try to fill directly first (works if input type="text" or type="date" accepts text)
  await page.fill(selector, date);
}

/**
 * Accept a browser dialog (confirm/alert)
 */
export async function acceptDialog(page: Page) {
  page.once('dialog', dialog => dialog.accept());
}

/**
 * Dismiss a browser dialog (confirm/alert)
 */
export async function dismissDialog(page: Page) {
  page.once('dialog', dialog => dialog.dismiss());
}

/**
 * Check if an element exists on the page
 */
export async function elementExists(page: Page, selector: string): Promise<boolean> {
  const element = await page.$(selector);
  return element !== null;
}

/**
 * Get text content of an element
 */
export async function getTextContent(page: Page, selector: string): Promise<string> {
  const element = await page.locator(selector);
  return (await element.textContent()) || '';
}
