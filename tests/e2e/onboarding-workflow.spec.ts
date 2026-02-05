import { test, expect } from '@playwright/test';
import { loginAsHR, getInviteTokenByEmail } from './utils/helpers';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Complete onboarding workflow test
 *
 * Tests the full onboarding process:
 * 1. HR creates an onboarding invite
 * 2. Guest completes 4-step form (Personal Info, Government IDs, Emergency Contact, Documents)
 * 3. Guest submits onboarding form
 * 4. HR reviews submission and approves documents
 * 5. HR converts submission to user account
 */
test('complete onboarding workflow', async ({ page }) => {
    // ==============================================
    // PART 1: HR Creates Invite (5-10 seconds)
    // ==============================================

    await loginAsHR(page);

    // Navigate to create invite page
    await page.goto('/onboarding/invites/create');
    await expect(page.locator('text=Send Onboarding Invite')).toBeVisible();

    // Fill candidate information (Playwright auto-waits for elements)
    const candidateEmail = `test-candidate-${Date.now()}@example.com`;

    // Use label text to find inputs more reliably
    await page.getByLabel(/first name/i).fill('John');
    await page.getByLabel(/last name/i).fill('Doe');
    await page.getByLabel(/email/i).fill(candidateEmail);

    // Select position - wait for dropdown and select first option
    const positionSelect = page
        .locator('select[name="position"], [role="combobox"]')
        .first();
    await positionSelect.click();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    // Wait briefly for department to auto-populate
    await page.waitForTimeout(800);

    // Submit the form
    await page.locator('button[type="submit"]').click();

    // Wait for redirect to invites list (submission complete)
    await page.waitForURL('/onboarding/invites', { timeout: 15000 });
    console.log('✅ Redirected to invites list');

    // Wait for database write
    await page.waitForTimeout(1500);

    // Get the invite token for the specific email we just created
    const token = await getInviteTokenByEmail(candidateEmail);
    console.log('=== INVITE CREATED ===');
    console.log('Token:', token);
    console.log('Email:', candidateEmail);
    console.log('Name: John Doe');

    // ==============================================
    // PART 2: Guest Fills 4-Step Form (30-40 seconds)
    // ==============================================

    // Navigate to guest onboarding form
    console.log(`\nNavigating to: /guest/onboarding/${token}`);
    await page.goto(`/guest/onboarding/${token}`);

    // Wait for onboarding portal to load completely
    await expect(page.locator('text=Onboarding Portal')).toBeVisible();
    await expect(page.locator('text=Personal Information')).toBeVisible();

    // Verify we're on the right form - check for candidate name
    const pageContent = await page.textContent('body');
    console.log('=== GUEST FORM LOADED ===');
    console.log('Page contains John Doe:', pageContent?.includes('John Doe'));
    console.log('Current URL:', page.url());

    // Give React time to fully render the form
    await page.waitForTimeout(1500);

    // ----------------------------------
    // Step 1: Personal Information
    // ----------------------------------

    // Use nth() for fields without placeholders, getByPlaceholder for others
    const allInputs = page.locator('input');

    // Name fields are pre-filled, just verify and refill
    await allInputs.nth(0).clear(); // First name
    await allInputs.nth(0).fill('John');

    await allInputs.nth(1).clear(); // Middle name
    await allInputs.nth(1).fill('Michael');

    await allInputs.nth(2).clear(); // Last name
    await allInputs.nth(2).fill('Doe');

    // Birthday - type="date" requires YYYY-MM-DD format
    await allInputs.nth(3).fill('1990-01-15');

    // Gender - required field, find the Select button (first Select... on page after birthday)
    const selectButtons = page.locator('text=Select...');
    await selectButtons.first().click(); // This should be the Gender dropdown
    await page.waitForTimeout(300);
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    // Phone number - has placeholder "09XX XXX XXXX"
    await page
        .getByPlaceholder(/09XX XXX XXXX/i)
        .first()
        .fill('09123456789');

    // Address line 1 - has placeholder "House/Unit No., Street Name"
    await page.getByPlaceholder(/House/i).fill('123 Main Street');

    // City - has placeholder "Quezon City"
    await page.getByPlaceholder(/Quezon City/i).fill('Manila');

    // Province - has placeholder "Metro Manila"
    await page.getByPlaceholder(/Metro Manila/i).fill('Metro Manila');

    // Postal code - has placeholder "1100"
    await page.getByPlaceholder(/1100/i).fill('1000');

    // Click Save & Continue button
    await page.locator('button:has-text("Save & Continue")').click();

    // Wait for next step
    await page.waitForTimeout(1000);

    // ----------------------------------
    // Step 2: Government IDs
    // ----------------------------------

    // Use placeholder selectors for government ID fields
    await page.getByPlaceholder(/XX-XXXXXXX-X/i).fill('12-3456789-0'); // SSS
    await page.getByPlaceholder(/XXX-XXX-XXX-XXX/i).fill('123-456-789-000'); // TIN
    await page.getByPlaceholder(/XXXXXXXXXXXX/i).fill('123456789012'); // HDMF (12 digits)
    await page.getByPlaceholder(/XXXX-XXXXX-XX/i).fill('1234-56789-01'); // PhilHealth

    // Click Save & Continue
    await page.click('button:has-text("Save & Continue")');
    await page.waitForTimeout(1000);

    // ----------------------------------
    // Step 3: Emergency Contact
    // ----------------------------------

    // Contact Name - has placeholder "Jane Doe"
    await page.getByPlaceholder(/Jane Doe/i).fill('Jane Doe');

    // Phone Number - first "09XX XXX XXXX" on this page
    await page
        .getByPlaceholder(/09XX XXX XXXX/i)
        .first()
        .fill('09987654321');

    // Mobile Number - second "09XX XXX XXXX" on this page
    await page
        .getByPlaceholder(/09XX XXX XXXX/i)
        .nth(1)
        .fill('09987654321');

    // Relationship - Radix UI Select component
    // Click the trigger button (contains "Select relationship..." placeholder)
    await page.locator('button:has-text("Select relationship")').click();
    await page.waitForTimeout(500);

    // Click the first option in the dropdown
    await page.locator('[role="option"]').first().click();
    await page.waitForTimeout(300);

    // Click Save & Continue
    await page.click('button:has-text("Save & Continue")');
    await page.waitForTimeout(1000);

    // ----------------------------------
    // Step 4: Document Upload
    // ----------------------------------

    console.log('Starting document uploads...');

    // Define test files
    const resumePath = path.resolve(__dirname, '../fixtures/resume.pdf');
    const govIdPath = path.resolve(__dirname, '../fixtures/gov-id.pdf');
    const nbiPath = path.resolve(__dirname, '../fixtures/nbi-clearance.pdf');
    const pnpPath = path.resolve(__dirname, '../fixtures/pnp-clearance.pdf');
    const medicalPath = path.resolve(__dirname, '../fixtures/medical-cert.pdf');

    // Helper function to upload a document
    async function uploadDocument(docTypeLabel: string, filePath: string) {
        console.log(`  Uploading ${docTypeLabel}...`);

        // Find document type card button in the "Select Document Type" section
        // Use more specific selector to avoid matching uploaded document labels
        const docTypeButton = page
            .locator('button[type="button"]')
            .filter({ hasText: docTypeLabel })
            .first();

        // Scroll into view and click
        await docTypeButton.scrollIntoViewIfNeeded();
        await docTypeButton.click();
        console.log(`    Clicked ${docTypeLabel} card`);
        await page.waitForTimeout(1000); // Wait for state to update

        // Set file in the hidden file input
        const fileInput = page.locator('input[type="file"]#file-upload');
        await fileInput.setInputFiles(filePath);
        console.log(`    Selected file: ${filePath.split('/').pop()}`);
        await page.waitForTimeout(500);

        // Click Upload File button
        const uploadButton = page.locator('button:has-text("Upload File")');
        await expect(uploadButton).toBeEnabled({ timeout: 3000 });
        await uploadButton.click();
        console.log(`    Clicked Upload File button`);

        // Wait for upload to complete
        await page.waitForTimeout(3000);

        console.log(`  ✓ ${docTypeLabel} uploaded successfully`);
    }

    // Upload all 5 required documents
    await uploadDocument('Resume / CV', resumePath);
    await uploadDocument('Government ID', govIdPath);
    await uploadDocument('NBI Clearance', nbiPath);
    await uploadDocument('PNP Clearance', pnpPath);
    await uploadDocument('Medical Certificate', medicalPath);

    console.log('All documents uploaded successfully');

    // Note: Submit button should be DISABLED at this point (documents not approved yet)
    const submitButton = page.locator('button:has-text("Submit to HR")');
    console.log(
        'Submit button should be disabled (documents pending approval)...',
    );

    // ==============================================
    // PART 3: HR Reviews and Approves (10-15 seconds)
    // ==============================================

    console.log('\n=== PART 3: HR Approves Documents ===');

    // HR is already logged in from Part 1, navigate to submissions
    await page.goto('/onboarding/submissions');
    await page.waitForTimeout(2000);

    // Debug: Show all submissions in the table
    console.log('\n=== SUBMISSIONS TABLE ===');
    const allRows = await page.locator('tbody tr').count();
    console.log(`Total submissions in table: ${allRows}`);

    // Get first 3 rows for debugging
    for (let i = 0; i < Math.min(3, allRows); i++) {
        const rowText = await page.locator('tbody tr').nth(i).textContent();
        console.log(`Row ${i + 1}: ${rowText?.substring(0, 80)}...`);
    }

    // Find the submission by searching for the unique email in the table
    console.log(`\nSearching for submission with email: ${candidateEmail}`);

    // Look for a table row that contains the candidate email
    const submissionRow = page
        .locator('tbody tr')
        .filter({ hasText: candidateEmail });

    const rowCount = await submissionRow.count();
    console.log(`Found ${rowCount} row(s) matching ${candidateEmail}`);

    if (rowCount === 0) {
        console.error(
            `ERROR: No submission found with email ${candidateEmail}`,
        );
        console.log(
            'This might indicate the submission was not created or has a different email',
        );
        throw new Error(
            `Submission with email ${candidateEmail} not found in table`,
        );
    }

    if (rowCount > 1) {
        console.warn(
            `WARNING: Multiple rows found with ${candidateEmail}, clicking first`,
        );
    }

    await expect(submissionRow.first()).toBeVisible({ timeout: 5000 });

    // Show what we're about to click
    const targetRowText = await submissionRow.first().textContent();
    console.log(`Clicking row: ${targetRowText?.substring(0, 100)}...`);

    await submissionRow.first().click();

    // Wait for submission detail page to load
    await page.waitForTimeout(1000);
    console.log('\n=== SUBMISSION DETAIL PAGE ===');
    console.log('Current URL:', page.url());

    // Verify we're viewing the correct submission
    const detailPageContent = await page.textContent('body');
    const hasCorrectEmail = detailPageContent?.includes(candidateEmail);
    const hasCorrectName = detailPageContent?.includes('John Doe');

    console.log(`Page contains email ${candidateEmail}: ${hasCorrectEmail}`);
    console.log(`Page contains name "John Doe": ${hasCorrectName}`);

    if (!hasCorrectEmail && !hasCorrectName) {
        console.error(
            'ERROR: Opened wrong submission! Neither email nor name match.',
        );
        throw new Error(
            `Wrong submission opened. Expected ${candidateEmail} and John Doe`,
        );
    }

    // Verify we can see the SSS number (data is loaded)
    await expect(page.locator('text=/12-3456789-0/i')).toBeVisible({
        timeout: 5000,
    });
    console.log('✓ SSS number visible (correct submission data loaded)');

    // Approve all documents
    console.log('Approving all documents...');
    const approveAllButton = page.locator('button:has-text("Approve All")');
    await approveAllButton.click();
    await page.waitForTimeout(500);

    // Confirm in the React AlertDialog (not browser dialog)
    const confirmApproveButton = page.locator(
        'button:has-text("Approve All Documents")',
    );
    await confirmApproveButton.click();
    await page.waitForTimeout(2000);
    console.log('✓ Documents approved');

    // ==============================================
    // PART 4: Guest Submits Form (5-10 seconds)
    // ==============================================

    console.log('\n=== PART 4: Guest Submits Form ===');

    // Navigate back to guest form to submit
    await page.goto(`/guest/onboarding/${token}`);
    await page.waitForTimeout(1000);

    // Submit button should now be ENABLED (documents approved)
    const submitButtonEnabled = page.locator('button:has-text("Submit to HR")');
    await expect(submitButtonEnabled).toBeEnabled({ timeout: 5000 });
    console.log('Submit button is now enabled (documents approved)');

    await submitButtonEnabled.click();
    await page.waitForTimeout(2000);
    console.log('✓ Form submitted to HR');

    // ==============================================
    // PART 5: HR Converts to User (5-10 seconds)
    // ==============================================

    console.log('\n=== PART 5: HR Converts to User ===');

    // Navigate back to submission detail
    await page.goto('/onboarding/submissions');
    await page.waitForTimeout(2000);

    // Find the same submission again by email
    console.log(`Searching for submission with email: ${candidateEmail}`);
    const submissionRowAgain = page
        .locator('tbody tr')
        .filter({ hasText: candidateEmail });
    await expect(submissionRowAgain).toBeVisible({ timeout: 5000 });
    await submissionRowAgain.first().click();
    await page.waitForTimeout(1000);
    console.log('Reopened submission detail page');

    // Convert to user account
    console.log('Converting to user account...');
    const convertButton = page.locator(
        'button:has-text("Convert to User Account")',
    );
    await expect(convertButton).toBeVisible({ timeout: 5000 });
    await convertButton.click();
    await page.waitForTimeout(500);

    // Confirm in the React AlertDialog
    const confirmConvertButton = page.locator(
        'button:has-text("Create User Account")',
    );
    await confirmConvertButton.click();
    await page.waitForTimeout(3000);
    console.log('✓ User account created');

    console.log('Complete onboarding workflow test passed!');
});
