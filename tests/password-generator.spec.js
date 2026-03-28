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
