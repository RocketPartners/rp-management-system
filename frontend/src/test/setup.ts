import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Ensure the DOM is reset between tests so renders do not leak across cases.
afterEach(() => {
    cleanup();
});
