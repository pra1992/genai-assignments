# Selenium and Playwright workflow

This document describes the browser-automation code-generation workflow shared by Selenium and Playwright in the extension. The extension generates code from inspected page markup; it does not execute the generated tests or launch either automation framework.

## Shared architecture

1. **Side-panel UI (`panel.html`)** provides the chat, Inspect/Generate actions, generation modes, language binding, browser-engine selection, and provider/model settings. Selenium and Playwright use the same controls and interaction flow.
2. **DOM inspection (`src/content/content.js`)** highlights page elements and collects selected elements' `outerHTML`. The chat receives the selected markup through the extension messaging APIs. This behavior is framework-independent.
3. **Generation orchestration (`src/scripts/chat.js`)** validates that markup and an LLM provider are available, trims excessive `<option>` entries, reads the selected language, engine, and generation modes, then sends one or more prompts. The existing loading state, chat transcript, token metadata, code-block rendering, and copy controls are shared.
4. **Prompt policy and templates (`src/scripts/prompts.js`)** map the selected options to prompt keys and hold the framework-specific instructions. Keep selection policy here and add a matching template when introducing another supported language/engine combination.
5. **LLM adapters (`src/scripts/api/`)** send the selected prompt to the configured Groq or OpenAI provider. Browser-engine selection changes the generated code, not the API transport or browser-inspection mechanism.

## Generation modes

| Selected mode | Java + Selenium | Java + Playwright | TypeScript + Playwright | Other combinations |
| --- | --- | --- | --- | --- |
| Feature File | Cucumber feature file | Cucumber feature file | Cucumber feature file | Cucumber feature file |
| Page Class | Selenium Java page object | Playwright Java page object | Playwright TypeScript page object | Not supported; a warning is shown |
| Feature File + Page Class | Cucumber feature and Selenium Java step definitions | Cucumber feature and Playwright Java step definitions | Cucumber feature and Playwright TypeScript step definitions | Cucumber feature is still generated, with a warning that combined step definitions are not supported |
| No mode selected | Defaults to Selenium Java page object | Defaults to Playwright Java page object | Defaults to Playwright TypeScript page object | No prompt is selected, matching the existing fallback behavior |

Playwright page objects accept a typed `Page` through their constructor so browser creation and lifecycle remain with the caller. Combined Playwright output uses Cucumber hooks for Playwright setup and teardown, typed Cucumber World state for TypeScript, and Playwright locator auto-waiting. The feature-only template is engine-agnostic, so it remains available for every language and engine selection.

The language selector currently exposes Java, C#, Python, and TypeScript, and the engine selector also lists Cypress and Puppeteer. Page classes and combined step definitions are implemented for Java/Selenium, Java/Playwright, and TypeScript/Playwright; other combinations remain unsupported and are not implicitly treated as Playwright support.

## Validation

Run the dependency-free prompt and selection-policy tests with Node.js:

```sh
node --test tests/playwright-support.test.mjs
```

There is no extension build or browser end-to-end test setup in the repository. A manual smoke check can load the extension, select TypeScript and Playwright, inspect an element, and generate Feature File, Page Class, and combined output. The existing provider credentials and network access are required for actual LLM generation.
