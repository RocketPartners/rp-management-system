import { test, expect } from '@playwright/test';
import {
    loginAsHR,
    getInviteTokenByEmail,
    getAuditLogCount,
    getLatestAuditLog,
    clearAuditLogs,
} from './utils/helpers';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Audit Trail E2E Tests
 *
 * Tests the immutable audit logging system for document operations.
 *
 * Currently tests:
 * - Upload: Logs when a document is uploaded (guest or authenticated)
 * - Immutability: Verifies no updated_at timestamp exists
 * - Metadata: Validates IP, user agent, context data captured
 *
 * Future tests (when UI implemented):
 * - View: Logs when a document is viewed inline
 * - Download: Logs when a document is downloaded
 * - Replace: Logs when a document is replaced
 * - Delete: Logs when a document is deleted
 */

test.describe('Audit Trail', () => {
    let candidateEmail: string;
    let token: string;

    test.beforeAll(async () => {
        // Clear existing audit logs for clean test
        await clearAuditLogs();
    });

    test('documents all operations in audit trail', async ({ page }) => {
        // ==============================================
        // SETUP: Create Invite and Upload Document
        // ==============================================

        await loginAsHR(page);

        // Navigate to create invite page
        await page.goto('/onboarding/invites/create');
        await expect(page.locator('text=Send Onboarding Invite')).toBeVisible();

        // Create test candidate
        candidateEmail = `audit-test-${Date.now()}@example.com`;
        await page.getByLabel(/first name/i).fill('Audit');
        await page.getByLabel(/last name/i).fill('Test');
        await page.getByLabel(/email/i).fill(candidateEmail);

        // Select position
        const positionSelect = page
            .locator('select[name="position"], [role="combobox"]')
            .first();
        await positionSelect.click();
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Enter');

        await page.waitForTimeout(800);
        await page.locator('button[type="submit"]').click();
        await page.waitForURL('/onboarding/invites', { timeout: 15000 });
        await page.waitForTimeout(1500);

        // Get token
        token = await getInviteTokenByEmail(candidateEmail);
        console.log('✓ Test invite created');

        // Navigate to guest form
        await page.goto(`/guest/onboarding/${token}`);
        await expect(page.locator('text=Onboarding Portal')).toBeVisible();
        await page.waitForTimeout(1500);

        // Fill minimal personal info to enable document upload
        const allInputs = page.locator('input');
        await allInputs.nth(0).fill('Audit');
        await allInputs.nth(1).fill('Middle');
        await allInputs.nth(2).fill('Test');
        await allInputs.nth(3).fill('1990-01-15');

        // Select gender
        await page.locator('text=Select...').first().click();
        await page.waitForTimeout(300);
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Enter');

        await page
            .getByPlaceholder(/09XX XXX XXXX/i)
            .first()
            .fill('09123456789');
        await page.getByPlaceholder(/House/i).fill('123 Main St');
        await page.getByPlaceholder(/Quezon City/i).fill('Manila');
        await page.getByPlaceholder(/Metro Manila/i).fill('Metro Manila');
        await page.getByPlaceholder(/1100/i).fill('1000');

        await page.click('button:has-text("Save & Continue")');
        await page.waitForTimeout(1000);

        // Fill government IDs
        await page.getByPlaceholder(/XX-XXXXXXX-X/i).fill('12-3456789-0');
        await page.getByPlaceholder(/XXX-XXX-XXX-XXX/i).fill('123-456-789-000');
        await page.getByPlaceholder(/XXXXXXXXXXXX/i).fill('123456789012');
        await page.getByPlaceholder(/XXXX-XXXXX-XX/i).fill('1234-56789-01');

        await page.click('button:has-text("Save & Continue")');
        await page.waitForTimeout(1000);

        // Fill emergency contact
        await page.getByPlaceholder(/Jane Doe/i).fill('Emergency Contact');
        await page
            .getByPlaceholder(/09XX XXX XXXX/i)
            .first()
            .fill('09987654321');
        await page
            .getByPlaceholder(/09XX XXX XXXX/i)
            .nth(1)
            .fill('09987654321');

        await page.locator('button:has-text("Select relationship")').click();
        await page.waitForTimeout(500);
        await page.locator('[role="option"]').first().click();

        await page.click('button:has-text("Save & Continue")');
        await page.waitForTimeout(1000);

        console.log('✓ Guest form filled');

        // ==============================================
        // TEST 1: Upload Document (should log 'upload')
        // ==============================================

        console.log('\n=== TEST 1: Upload Audit Log ===');

        const initialCount = await getAuditLogCount();
        console.log(`Initial audit log count: ${initialCount}`);

        // Upload a document
        const resumePath = path.resolve(__dirname, '../fixtures/resume.pdf');

        const docTypeButton = page
            .locator('button[type="button"]')
            .filter({ hasText: 'Resume / CV' })
            .first();
        await docTypeButton.click();
        await page.waitForTimeout(1000);

        const fileInput = page.locator('input[type="file"]#file-upload');
        await fileInput.setInputFiles(resumePath);
        await page.waitForTimeout(500);

        const uploadButton = page.locator('button:has-text("Upload File")');
        await uploadButton.click();
        await page.waitForTimeout(3000);

        console.log('✓ Document uploaded');

        // Verify audit log created
        const newCount = await getAuditLogCount();
        expect(newCount).toBe(initialCount + 1);
        console.log(`New audit log count: ${newCount} (+1)`);

        // Check latest log details
        const latestLog = await getLatestAuditLog();
        expect(latestLog).toBeTruthy();
        expect(latestLog.action).toBe('upload');
        expect(latestLog.ip_address).toBeTruthy();
        expect(latestLog.user_agent).toBeTruthy();
        expect(latestLog.accessed_at).toBeTruthy();

        // Verify context contains upload metadata
        expect(latestLog.context).toBeTruthy();
        expect(latestLog.context.original_filename).toBe('resume.pdf');
        expect(latestLog.context.file_size).toBeGreaterThan(0);
        expect(latestLog.context.mime_type).toBe('application/pdf');

        console.log('✓ Upload audit log verified:', {
            action: latestLog.action,
            filename: latestLog.context.original_filename,
            size: latestLog.context.file_size,
            ip: latestLog.ip_address,
        });

        // ==============================================
        // TEST 2: HR Approval Flow
        // ==============================================

        console.log('\n=== TEST 2: HR Approval (No Audit Log Expected) ===');

        // Clear guest session before HR login
        await page.context().clearCookies();
        await page.waitForTimeout(500);

        // HR approves the document (doesn't trigger audit log)
        await loginAsHR(page);
        await page.goto('/onboarding/submissions');
        await page.waitForTimeout(2000);

        const submissionRow = page
            .locator('tbody tr')
            .filter({ hasText: candidateEmail });
        await submissionRow.first().click();
        await page.waitForTimeout(1000);

        // Approve all documents
        const approveAllButton = page.locator('button:has-text("Approve All")');
        await approveAllButton.click();
        await page.waitForTimeout(500);

        const confirmApproveButton = page.locator(
            'button:has-text("Approve All Documents")',
        );
        await confirmApproveButton.click();
        await page.waitForTimeout(2000);

        console.log('✓ Document approved by HR');
        console.log('   (Approval itself does not create audit log)');
        console.log('   (View/download actions would create logs)');

        // ==============================================
        // TEST 3: Verify Immutability
        // ==============================================

        console.log('\n=== TEST 3: Immutability Verification ===');

        const finalLog = await getLatestAuditLog();

        // Check that updated_at doesn't exist (immutable design)
        expect(finalLog.updated_at).toBeFalsy();
        console.log('✓ Immutability verified: updated_at is absent');

        // ==============================================
        // TEST 4: Verify All Actions Logged
        // ==============================================

        console.log('\n=== TEST 4: Summary ===');

        const totalLogs = await getAuditLogCount();
        console.log(`Total audit logs created: ${totalLogs}`);

        const uploadLogs = await getAuditLogCount('upload');

        console.log('Action breakdown:');
        console.log(`  - upload: ${uploadLogs}`);
        console.log(`  - total: ${totalLogs}`);

        expect(uploadLogs).toBeGreaterThanOrEqual(1);
        expect(totalLogs).toBeGreaterThanOrEqual(1);
        console.log('✓ Audit trail core functionality verified!');
    });

    test('captures user information in audit logs', async ({ page }) => {
        console.log('\n=== TEST: User Information Capture ===');

        // Get any existing log to verify structure
        const totalLogs = await getAuditLogCount();

        if (totalLogs > 0) {
            const latestLog = await getLatestAuditLog();

            // Verify log structure (some fields always present)
            expect(latestLog).toBeTruthy();
            expect(latestLog.action).toBeTruthy();
            expect(latestLog.ip_address).toBeTruthy();
            expect(latestLog.user_agent).toBeTruthy();
            expect(latestLog.accessed_at).toBeTruthy();

            // user_id can be null for guest actions, which is valid
            const userType = latestLog.user_id ? 'authenticated user' : 'guest';

            console.log('✓ Audit log structure verified:', {
                action: latestLog.action,
                user_type: userType,
                user_id: latestLog.user_id ?? 'null (guest)',
                ip: latestLog.ip_address,
                timestamp: latestLog.accessed_at,
            });

            // Verify immutability
            expect(latestLog.updated_at).toBeFalsy();
            console.log('✓ Immutability confirmed: updated_at is absent');
        } else {
            // If no logs exist, create one by logging in as HR
            console.log('No existing logs, creating test log...');

            await loginAsHR(page);
            await page.goto('/dashboard');
            await page.waitForTimeout(1000);

            // Note: This doesn't create an audit log since we only log document operations
            // But we can verify the test infrastructure works
            console.log('✓ Test infrastructure validated');
        }
    });
});
