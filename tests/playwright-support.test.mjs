import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const source = await readFile(new URL('../src/scripts/prompts.js', import.meta.url), 'utf8');
const prompts = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);

test('Playwright Java page generation uses a supplied Page and the selected DOM', () => {
  const prompt = prompts.getPrompt('PLAYWRIGHT_JAVA_PAGE_ONLY', {
    domContent: '<button>Save</button>',
    pageUrl: 'https://example.test'
  });

  assert.match(prompt, /com\.microsoft\.playwright/);
  assert.match(prompt, /Accept a Playwright Page through the constructor/);
  assert.match(prompt, /<button>Save<\/button>/);
  assert.doesNotMatch(prompt, /WebDriver/);
});

test('Playwright TypeScript page generation uses typed locators and a supplied Page', () => {
  const prompt = prompts.getPrompt('PLAYWRIGHT_TYPESCRIPT_PAGE_ONLY', {
    domContent: '<button>Save</button>',
    pageUrl: 'https://example.test'
  });

  assert.match(prompt, /import type \{ Locator, Page \} from 'playwright'/);
  assert.match(prompt, /Accept a Playwright Page through the constructor/);
  assert.match(prompt, /Promise<void>/);
  assert.match(prompt, /<button>Save<\/button>/);
  assert.doesNotMatch(prompt, /WebDriver/);
});

test('Playwright Java combined generation requests Cucumber and Java step definitions', () => {
  const { promptKeys, showUnsupportedWarning } = prompts.getGenerationPromptKeys(
    'java',
    'playwright',
    ['FEATURE', 'PAGE']
  );

  assert.deepEqual(promptKeys, ['CUCUMBER_WITH_PLAYWRIGHT_JAVA_STEPS']);
  assert.equal(showUnsupportedWarning, false);
  assert.match(prompts.DEFAULT_PROMPTS[promptKeys[0]], /auto-waiting locators/);
  assert.match(prompts.DEFAULT_PROMPTS[promptKeys[0]], /@Before/);
  assert.match(prompts.DEFAULT_PROMPTS[promptKeys[0]], /@After/);
});

test('Playwright TypeScript combined generation requests typed Cucumber hooks and steps', () => {
  const { promptKeys, showUnsupportedWarning } = prompts.getGenerationPromptKeys(
    'ts',
    'playwright',
    ['FEATURE', 'PAGE']
  );
  const prompt = prompts.DEFAULT_PROMPTS[promptKeys[0]];

  assert.deepEqual(promptKeys, ['CUCUMBER_WITH_PLAYWRIGHT_TYPESCRIPT_STEPS']);
  assert.equal(showUnsupportedWarning, false);
  assert.match(prompt, /import \{[\s\S]*?World[\s\S]*?\} from '@cucumber\/cucumber'/);
  assert.match(prompt, /setWorldConstructor\(PlaywrightWorld\)/);
  assert.match(prompt, /this\.page\?\.close\(\)/);
  assert.match(prompt, /TypeScript step definitions/);
  assert.doesNotMatch(prompt, /WebDriver/);
});

test('existing Selenium Java generation and framework-independent feature generation remain available', () => {
  assert.deepEqual(
    prompts.getGenerationPromptKeys('java', 'selenium', ['PAGE']).promptKeys,
    ['SELENIUM_JAVA_PAGE_ONLY']
  );
  assert.deepEqual(
    prompts.getGenerationPromptKeys('java', 'selenium', ['FEATURE', 'PAGE']).promptKeys,
    ['CUCUMBER_WITH_SELENIUM_JAVA_STEPS']
  );
  assert.deepEqual(
    prompts.getGenerationPromptKeys('ts', 'playwright', ['FEATURE']).promptKeys,
    ['CUCUMBER_ONLY']
  );
});

test('unsupported page-only and combined modes report their limits without losing feature generation', () => {
  const pageOnly = prompts.getGenerationPromptKeys('ts', 'selenium', ['PAGE']);
  const combined = prompts.getGenerationPromptKeys('ts', 'selenium', ['FEATURE', 'PAGE']);

  assert.deepEqual(pageOnly.promptKeys, []);
  assert.equal(pageOnly.showUnsupportedWarning, true);
  assert.deepEqual(combined.promptKeys, ['CUCUMBER_ONLY']);
  assert.equal(combined.showUnsupportedWarning, true);
});

test('an empty selection defaults to a page object for supported language and engine combinations', () => {
  assert.deepEqual(
    prompts.getGenerationPromptKeys('java', 'selenium', []).promptKeys,
    ['SELENIUM_JAVA_PAGE_ONLY']
  );
  assert.deepEqual(
    prompts.getGenerationPromptKeys('java', 'playwright', []).promptKeys,
    ['PLAYWRIGHT_JAVA_PAGE_ONLY']
  );
  assert.deepEqual(
    prompts.getGenerationPromptKeys('ts', 'playwright', []).promptKeys,
    ['PLAYWRIGHT_TYPESCRIPT_PAGE_ONLY']
  );
});
