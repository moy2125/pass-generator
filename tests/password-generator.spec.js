import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PAGE_URL = `file://${path.join(__dirname, '..', 'index.html')}`;

test.beforeEach(async ({ page }) => {
  await page.goto(PAGE_URL);
});

// ── Render ────────────────────────────────────────────────────────────────────

test('renders all UI elements', async ({ page }) => {
  await expect(page.locator('h1')).toContainText('Password Generator');
  await expect(page.locator('#length')).toBeVisible();
  await expect(page.locator('#number')).toBeVisible();
  await expect(page.locator('#special')).toBeVisible();
  await expect(page.locator('#btn-generate')).toBeVisible();
  await expect(page.locator('#btn-copy')).toBeVisible();
  await expect(page.locator('#result-box')).toBeVisible();
});

// ── Generate ──────────────────────────────────────────────────────────────────

test('generates a password with default settings', async ({ page }) => {
  await page.click('#btn-generate');
  const result = page.locator('#result');
  const text = await result.textContent();
  expect(text).not.toBe('—');
  expect(text.trim().length).toBe(6); // default length
});

test('generated password matches requested length', async ({ page }) => {
  await page.fill('#length', '12');
  await page.click('#btn-generate');
  const text = await page.locator('#result').textContent();
  expect(text.trim().length).toBe(12);
});

test('result box gets has-password class after generating', async ({ page }) => {
  await page.click('#btn-generate');
  await expect(page.locator('#result-box')).toHaveClass(/has-password/);
});

test('generated password contains at least the requested number of digits', async ({ page }) => {
  await page.fill('#length', '10');
  await page.fill('#number', '4');
  await page.click('#btn-generate');
  const text = await page.locator('#result').textContent();
  const digitCount = (text.match(/\d/g) || []).length;
  expect(digitCount).toBeGreaterThanOrEqual(4);
});

test('generated password contains at least the requested special chars', async ({ page }) => {
  await page.fill('#length', '10');
  await page.fill('#special', '3');
  await page.click('#btn-generate');
  const text = await page.locator('#result').textContent();
  const specialCount = (text.match(/[!@#$%^&*()]/g) || []).length;
  expect(specialCount).toBeGreaterThanOrEqual(3);
});

test('generates different passwords on successive clicks', async ({ page }) => {
  await page.fill('#length', '16');
  await page.click('#btn-generate');
  const first = await page.locator('#result').textContent();
  await page.click('#btn-generate');
  const second = await page.locator('#result').textContent();
  // Extremely unlikely to be equal with length 16
  expect(first).not.toBe(second);
});

// ── Validation ────────────────────────────────────────────────────────────────

test('shows inline error and disables Generate when numbers + specials exceed length', async ({ page }) => {
  await page.fill('#length', '6');
  await page.fill('#number', '4');
  await page.fill('#special', '4');
  await expect(page.locator('#validation-msg')).toContainText("can't exceed length");
  await expect(page.locator('#btn-generate')).toBeDisabled();
});

test('clears error and re-enables Generate when values become valid', async ({ page }) => {
  await page.fill('#length', '6');
  await page.fill('#number', '4');
  await page.fill('#special', '4');
  await expect(page.locator('#btn-generate')).toBeDisabled();
  await page.fill('#special', '2');
  await expect(page.locator('#validation-msg')).toHaveText('');
  await expect(page.locator('#btn-generate')).toBeEnabled();
});

// ── Copy ──────────────────────────────────────────────────────────────────────

test('copy button shows feedback before generating', async ({ page }) => {
  await page.click('#btn-copy');
  await expect(page.locator('#btn-copy')).toHaveText('Generate one first!');
  // resets after timeout
  await expect(page.locator('#btn-copy')).toHaveText('Copy', { timeout: 3000 });
});

test('copy button shows Copied! after generating', async ({ page }) => {
  // Grant clipboard permissions
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.click('#btn-generate');
  await page.click('#btn-copy');
  await expect(page.locator('#btn-copy')).toHaveText('Copied!');
  await expect(page.locator('#btn-copy')).toHaveText('Copy', { timeout: 3000 });
});

test('clipboard contains the generated password after copy', async ({ page }) => {
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.fill('#length', '10');
  await page.click('#btn-generate');
  const password = await page.locator('#result').textContent();
  await page.click('#btn-copy');
  const clipboard = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboard).toBe(password.trim());
});

// ── Rate Limiting ────────────────────────────────────────────────────────────

test('button shows Wait... text during cooldown', async ({ page }) => {
  await page.click('#btn-generate');
  await expect(page.locator('#btn-generate')).toHaveText('Wait...');
});

test('button is disabled during cooldown', async ({ page }) => {
  await page.click('#btn-generate');
  await expect(page.locator('#btn-generate')).toBeDisabled();
});

test('button re-enables after cooldown period', async ({ page }) => {
  await page.click('#btn-generate');
  await expect(page.locator('#btn-generate')).toBeEnabled({ timeout: 1000 });
});

// ── Slider ──────────────────────────────────────────────────────────────────

test('slider exists and has correct min/max attributes', async ({ page }) => {
  const slider = page.locator('#length-slider');
  await expect(slider).toBeVisible();
  await expect(slider).toHaveAttribute('min', '3');
  await expect(slider).toHaveAttribute('max', '30');
});

test('moving slider updates the number input', async ({ page }) => {
  const slider = page.locator('#length-slider');
  const input = page.locator('#length');
  await slider.fill('15');
  await expect(input).toHaveValue('15');
});

test('editing number input updates the slider', async ({ page }) => {
  const slider = page.locator('#length-slider');
  const input = page.locator('#length');
  await input.fill('20');
  await expect(slider).toHaveValue('20');
});

test('generating password with slider uses correct length', async ({ page }) => {
  const slider = page.locator('#length-slider');
  await slider.fill('18');
  await page.click('#btn-generate');
  const text = await page.locator('#result').textContent();
  expect(text.trim().length).toBe(18);
});

test('slider clamps value to min when below range', async ({ page }) => {
  const input = page.locator('#length');
  await input.fill('1');
  await expect(page.locator('#length-slider')).toHaveValue('3');
});

test('slider clamps value to max when above range', async ({ page }) => {
  const input = page.locator('#length');
  await input.fill('50');
  await expect(page.locator('#length-slider')).toHaveValue('30');
});

// ── Security (event listeners) ────────────────────────────────────────────────

test('validation triggers on slider change', async ({ page }) => {
  const slider = page.locator('#length-slider');
  const input = page.locator('#length');
  await input.fill('6');
  await page.fill('#number', '4');
  await page.fill('#special', '4');
  await slider.fill('10');
  await expect(page.locator('#validation-msg')).toHaveText('');
  await expect(page.locator('#btn-generate')).toBeEnabled();
});

// ── Strength Indicator ────────────────────────────────────────────────────────

test('strength indicator is hidden before generating password', async ({ page }) => {
  const container = page.locator('#strength-container');
  await expect(container).not.toHaveClass(/visible/);
});

test('strength indicator appears after generating password', async ({ page }) => {
  await page.click('#btn-generate');
  const container = page.locator('#strength-container');
  await expect(container).toHaveClass(/visible/);
});

test('strength indicator shows Strong for password with high length and variety', async ({ page }) => {
  const slider = page.locator('#length-slider');
  await slider.fill('20');
  await page.fill('#number', '5');
  await page.fill('#special', '5');
  await page.click('#btn-generate');
  const strengthText = page.locator('#strength-text');
  await expect(strengthText).toHaveText('Strong');
});

test('strength indicator shows Weak for short password without variety', async ({ page }) => {
  const slider = page.locator('#length-slider');
  await slider.fill('3');
  await page.fill('#number', '0');
  await page.fill('#special', '0');
  await page.click('#btn-generate');
  const strengthText = page.locator('#strength-text');
  await expect(strengthText).toHaveText('Weak');
});

test('strength indicator shows Fair or higher for 8-char password with variety', async ({ page }) => {
  const slider = page.locator('#length-slider');
  await slider.fill('8');
  await page.fill('#number', '2');
  await page.fill('#special', '0');
  await page.click('#btn-generate');
  const strengthText = page.locator('#strength-text');
  const text = await strengthText.textContent();
  expect(["Fair", "Good", "Strong"]).toContain(text);
});

test('strength indicator shows Good for password with numbers', async ({ page }) => {
  const slider = page.locator('#length-slider');
  await slider.fill('12');
  await page.fill('#number', '4');
  await page.fill('#special', '0');
  await page.click('#btn-generate');
  const strengthText = page.locator('#strength-text');
  await expect(strengthText).toHaveText('Good');
});

// ── Keyboard Shortcuts ─────────────────────────────────────────────────────────

test('pressing Enter generates password when body is focused', async ({ page }) => {
  await page.click('body');
  await page.keyboard.press('Enter');
  const text = await page.locator('#result').textContent();
  expect(text).not.toBe('—');
  expect(text.trim().length).toBe(6);
});

test('pressing Space generates password when body is focused', async ({ page }) => {
  await page.click('body');
  await page.keyboard.press('Space');
  const text = await page.locator('#result').textContent();
  expect(text).not.toBe('—');
  expect(text.trim().length).toBe(6);
});

test('keyboard shortcuts respect rate limiting', async ({ page }) => {
  await page.click('body');
  await page.keyboard.press('Enter');
  await expect(page.locator('#btn-generate')).toBeDisabled();
  await expect(page.locator('#btn-generate')).toHaveText('Wait...');
});

// ── Module Pattern ─────────────────────────────────────────────────────────────

test('PasswordGenerator module exposes expected API', async ({ page }) => {
  await page.goto(PAGE_URL);
  const hasInit = await page.evaluate(() => typeof PasswordGenerator.init === 'function');
  const hasGenerate = await page.evaluate(() => typeof PasswordGenerator.generatePassword === 'function');
  const hasCopy = await page.evaluate(() => typeof PasswordGenerator.copyPassword === 'function');
  const hasGeneratePassword = await page.evaluate(() => typeof PasswordGenerator.generateEquilibratedPassword === 'function');
  expect(hasInit).toBe(true);
  expect(hasGenerate).toBe(true);
  expect(hasCopy).toBe(true);
  expect(hasGeneratePassword).toBe(true);
});

test('PasswordGenerator exposes CONFIG object', async ({ page }) => {
  await page.goto(PAGE_URL);
  const hasConfig = await page.evaluate(() => typeof PasswordGenerator.CONFIG === 'object');
  expect(hasConfig).toBe(true);
});

test('CONFIG has expected structure', async ({ page }) => {
  await page.goto(PAGE_URL);
  const config = await page.evaluate(() => PasswordGenerator.CONFIG);
  expect(config).toHaveProperty('chars');
  expect(config).toHaveProperty('defaults');
  expect(config).toHaveProperty('animation');
  expect(config).toHaveProperty('rateLimit');
});

test('CONFIG.chars contains all character types', async ({ page }) => {
  await page.goto(PAGE_URL);
  const chars = await page.evaluate(() => PasswordGenerator.CONFIG.chars);
  expect(chars).toHaveProperty('lowercase');
  expect(chars).toHaveProperty('uppercase');
  expect(chars).toHaveProperty('numbers');
  expect(chars).toHaveProperty('specials');
});

test('generateEquilibratedPassword function works via API', async ({ page }) => {
  await page.goto(PAGE_URL);
  await page.fill('#length', '10');
  await page.fill('#number', '0');
  await page.fill('#special', '0');
  const password = await page.evaluate(() => PasswordGenerator.generateEquilibratedPassword(10));
  expect(password.length).toBe(10);
});

// ── Case Selector ───────────────────────────────────────────────────────────────

test('case selector exists with correct options', async ({ page }) => {
  const select = page.locator('#case');
  await expect(select).toBeVisible();
  await expect(select.locator('option')).toHaveCount(3);
  await expect(select).toHaveValue('both');
});

test('generates uppercase only password when Upper is selected', async ({ page }) => {
  await page.selectOption('#case', 'upper');
  await page.click('#btn-generate');
  const text = await page.locator('#result').textContent();
  expect(text).toMatch(/^[A-Z]+$/);
});

test('generates lowercase only password when Lower is selected', async ({ page }) => {
  await page.selectOption('#case', 'lower');
  await page.click('#btn-generate');
  const text = await page.locator('#result').textContent();
  expect(text).toMatch(/^[a-z]+$/);
});

test('generates mixed case password when Both is selected', async ({ page }) => {
  await page.selectOption('#case', 'both');
  await page.click('#btn-generate');
  const text = await page.locator('#result').textContent();
  const hasUpper = /[A-Z]/.test(text);
  const hasLower = /[a-z]/.test(text);
  expect(hasUpper || hasLower).toBe(true);
});

// ── History ────────────────────────────────────────────────────────────────────

test('history section is hidden by default', async ({ page }) => {
  const section = page.locator('#history-section');
  await expect(section).toHaveClass(/hidden/);
});

test('history section appears when enabled and password generated', async ({ page }) => {
  await page.check('#save-history');
  await page.click('#btn-generate');
  await page.waitForTimeout(600);
  const section = page.locator('#history-section');
  await expect(section).not.toHaveClass(/hidden/);
});

test('history contains generated password', async ({ page }) => {
  await page.check('#save-history');
  await page.click('#btn-generate');
  await page.waitForTimeout(600);
  const list = page.locator('#history-list');
  await expect(list.locator('li')).toHaveCount(1);
});

test('history shows count', async ({ page }) => {
  await page.check('#save-history');
  await page.click('#btn-generate');
  await page.waitForTimeout(600);
  await page.click('#btn-generate');
  await page.waitForTimeout(600);
  const count = page.locator('#history-count');
  await expect(count).toHaveText('(2)');
});

test('history can be cleared', async ({ page }) => {
  await page.check('#save-history');
  await page.click('#btn-generate');
  await page.waitForTimeout(600);
  await page.click('#btn-clear-history');
  const section = page.locator('#history-section');
  await expect(section).toHaveClass(/hidden/);
});

test('history toggle expands and collapses list', async ({ page }) => {
  await page.check('#save-history');
  await page.click('#btn-generate');
  await page.waitForTimeout(600);
  await page.click('#history-toggle');
  const list = page.locator('#history-list');
  await expect(list).toHaveClass(/collapsed/);
  await page.click('#history-toggle');
  await expect(list).not.toHaveClass(/collapsed/);
});

// ── Toggle Visibility ────────────────────────────────────────────────────────────

test('toggle visibility button is hidden before generating', async ({ page }) => {
  const btn = page.locator('#btn-toggle-visibility');
  await expect(btn).toHaveClass(/hidden/);
});

test('toggle visibility button appears after generating', async ({ page }) => {
  await page.click('#btn-generate');
  await page.waitForTimeout(600);
  const btn = page.locator('#btn-toggle-visibility');
  await expect(btn).not.toHaveClass(/hidden/);
});

test('clicking toggle visibility blurs the password', async ({ page }) => {
  await page.click('#btn-generate');
  await page.waitForTimeout(600);
  await page.click('#btn-toggle-visibility');
  const btn = page.locator('#btn-toggle-visibility');
  await expect(btn).toHaveClass(/masked/);
});

test('clicking toggle visibility again reveals the password', async ({ page }) => {
  await page.click('#btn-generate');
  await page.waitForTimeout(600);
  await page.click('#btn-toggle-visibility');
  await page.click('#btn-toggle-visibility');
  const btn = page.locator('#btn-toggle-visibility');
  await expect(btn).not.toHaveClass(/masked/);
});
