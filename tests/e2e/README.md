# Playwright E2E Tests for Onboarding System

This directory contains end-to-end tests for the onboarding workflow using Playwright.

## Setup

### Prerequisites

1. **Node.js and npm** - Already installed
2. **Playwright browsers** - Already installed during setup
3. **Test database** - MySQL database named `rp_management_system_test`

### First-Time Setup

1. **Create the test database:**

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS rp_management_system_test;"
```

2. **Run migrations and seed the test database:**

```bash
php artisan migrate:fresh --env=testing --seed
```

Alternatively, use the test command:

```bash
php artisan test:reset-database
```

## Running Tests

### Run all tests

```bash
npx playwright test
```

### Run specific test file

```bash
# Onboarding workflow
npx playwright test tests/e2e/onboarding-workflow.spec.ts

# Audit trail
npx playwright test tests/e2e/audit-trail.spec.ts
```

### Run in headed mode (see browser)

```bash
npx playwright test --headed
```

### Run in debug mode (Playwright Inspector)

```bash
npx playwright test --debug
```

### Run in UI mode (visual test runner)

```bash
npx playwright test --ui
```

### Run specific test by name

```bash
npx playwright test --grep "complete onboarding workflow"
```

## Test Structure

### Main Test Files

- **`onboarding-workflow.spec.ts`** - Complete onboarding workflow test that automates the full process:
  1. HR creates invite
  2. Guest fills 4-step form (personal info, gov IDs, emergency contact, documents)
  3. HR reviews and approves documents
  4. HR converts submission to user account

- **`audit-trail.spec.ts`** - Immutable audit logging system test:
  1. Verifies upload action creates audit log with metadata
  2. Verifies view action creates audit log
  3. Verifies download action creates audit log
  4. Validates immutability (no `updated_at` timestamp)
  5. Validates user ID, IP address, and context data capture

### Helper Utilities

- **`utils/helpers.ts`** - Reusable helper functions:
  - **Authentication**:
    - `loginAsHR(page)` - Login as HR user
    - `loginAsEmployee(page, email, password)` - Login as employee
    - `logout(page)` - Logout current user
  - **Onboarding**:
    - `createTestInvite(options)` - Create test invite via PHP command
    - `getLatestInviteToken()` - Get latest invite token
    - `getInviteTokenByEmail(email)` - Get token for specific email
    - `resetTestDatabase()` - Reset test database
  - **Audit Trail**:
    - `getAuditLogCount(action?)` - Count total logs or by action type
    - `getLatestAuditLog()` - Get most recent audit log with details
    - `getAuditLogsForUser(userId)` - Get logs for specific user
    - `clearAuditLogs()` - Clear all audit logs (test cleanup)
  - Other utility functions for common operations

### Test Fixtures

- **`fixtures/`** - Test PDF files for document uploads:
  - `resume.pdf`
  - `gov-id.pdf`
  - `nbi-clearance.pdf`
  - `pnp-clearance.pdf`
  - `medical-cert.pdf`

## PHP Test Data Bridge

The tests use artisan commands to set up test data:

### Create a test invite

```bash
php artisan test:create-invite --email=test@example.com --first_name=John --last_name=Doe --position=employee --department=Engineering --env=testing
```

### Get latest invite token

```bash
php artisan test:get-latest-token --env=testing
```

### Reset test database

```bash
php artisan test:reset-database
```

## Test Reports

After running tests, view the HTML report:

```bash
npx playwright show-report
```

## Debugging Failed Tests

### View test traces

Traces are captured automatically on test failures. To view a trace:

```bash
npx playwright show-trace test-results/.../trace.zip
```

### Screenshots and videos

Failed tests automatically capture:
- Screenshots (`screenshot.png`)
- Videos (`video.webm`)
- Full trace files (`trace.zip`)

These are saved in `test-results/` directory.

### Debug specific test

```bash
npx playwright test tests/e2e/onboarding-workflow.spec.ts --debug
```

This opens Playwright Inspector where you can:
- Step through the test
- Inspect page elements
- View console logs
- See network requests

## Test Configuration

Configuration is defined in `playwright.config.ts`:

- **Base URL**: `http://localhost:8000`
- **Browser**: Chromium only (can add Firefox/Safari)
- **Timeout**: 60 seconds per test
- **Retries**: 2 on CI, 0 locally
- **Web Server**: Automatically starts Laravel (`php artisan serve`)

## Common Issues

### 1. Test database not set up

**Error**: "No invites found" or database errors

**Solution**:
```bash
php artisan test:reset-database
```

### 2. Laravel server not running

**Error**: "Cannot reach http://localhost:8000"

**Solution**: Playwright automatically starts the server, but if issues persist:
```bash
php artisan serve
```

### 3. Selector not found

**Error**: "Element not found"

**Solution**:
- Use Playwright codegen to get correct selectors:
  ```bash
  npx playwright codegen http://localhost:8000
  ```
- Or use debug mode to inspect elements:
  ```bash
  npx playwright test --debug
  ```

### 4. File upload failures

**Error**: "File not found"

**Solution**: Verify test fixtures exist:
```bash
ls -la tests/fixtures/
```

## Writing New Tests

### Basic test structure

```typescript
import { test, expect } from '@playwright/test';
import { loginAsHR } from './utils/helpers';

test('my test name', async ({ page }) => {
  await loginAsHR(page);

  await page.goto('/some-page');

  await expect(page.locator('h1')).toHaveText('Expected Title');

  await page.fill('input[name="field"]', 'value');
  await page.click('button:has-text("Submit")');

  await expect(page.locator('text=Success')).toBeVisible();
});
```

### Best practices

1. **Use helper functions** - Reuse login, data creation, and common operations
2. **Wait for elements** - Use `await page.waitForSelector()` or `expect().toBeVisible()`
3. **Use descriptive selectors** - Prefer `data-testid`, text content, or specific attributes
4. **Add timeouts when needed** - For slow operations like file uploads
5. **Handle dialogs** - Use `page.once('dialog', ...)` for confirms/alerts
6. **Reset state between tests** - Use `test.beforeEach()` to reset database if needed

## CI/CD Integration

To run tests in GitHub Actions, add Playwright to your workflow:

```yaml
- name: Run Playwright Tests
  run: npx playwright test

- name: Upload test results
  if: failure()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## Next Steps

1. **Add more tests** - Create validation and error scenario tests
2. **Add visual regression testing** - Use Playwright's screenshot comparison
3. **Add API tests** - Test backend endpoints directly
4. **Add cross-browser testing** - Enable Firefox and Safari in config
5. **Optimize test speed** - Use parallel execution and fixtures

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)
