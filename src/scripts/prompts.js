/**
 * Collection of default prompts for different use cases (ICE POT Format)
 */
export const DEFAULT_PROMPTS = {
 
  /**
   * Selenium Java Page Object Prompt (No Test Class)
   */
  SELENIUM_JAVA_PAGE_ONLY: `
    Instructions:
    - Generate ONLY a Selenium Java Page Object Class (no test code).
    - Add JavaDoc for methods & class.
    - Use Selenium 2.30+ compatible imports.
    - Use meaningful method names.
    - Do NOT include explanations or test code.

    Context:
    DOM:
    \`\`\`html
    \${domContent}
    \`\`\`

    Example:
    \`\`\`java
    package com.testleaf.pages;

    /**
     * Page Object for Component Page
     */
    public class ComponentPage {
        // Add methods as per the DOM
    }
    \`\`\`

    Persona:
    - Audience: Automation engineer focusing on maintainable POM structure.

    Output Format:
    - A single Java class inside a \`\`\`java\`\`\` block.

    Tone:
    - Clean, maintainable, enterprise-ready.
  `,

  /**
   * Playwright Java Page Object Prompt (No Test Class)
   */
  PLAYWRIGHT_JAVA_PAGE_ONLY: `
    Instructions:
    - Generate ONLY a Java Playwright Page Object Class (no test code).
    - Add JavaDoc for the class and public methods.
    - Use the com.microsoft.playwright Java API.
    - Accept a Playwright Page through the constructor; do not launch a browser in the page object.
    - Use resilient Playwright locators grounded in the provided DOM and meaningful method names.
    - Do NOT include explanations or test code.

    Context:
    DOM:
    \`\`\`html
    \${domContent}
    \`\`\`

    Example:
    \`\`\`java
    package com.testleaf.pages;

    import com.microsoft.playwright.Page;

    /**
     * Page Object for Component Page
     */
    public class ComponentPage {
        private final Page page;

        public ComponentPage(Page page) {
            this.page = page;
        }
    }
    \`\`\`

    Persona:
    - Audience: Automation engineers building maintainable Playwright Java page objects.

    Output Format:
    - A single Java class inside a \`\`\`java\`\`\` block.

    Tone:
    - Clean, maintainable, enterprise-ready.
  `,

  /**
   * Playwright TypeScript Page Object Prompt (No Test Class)
   */
  PLAYWRIGHT_TYPESCRIPT_PAGE_ONLY: `
    Instructions:
    - Generate ONLY a TypeScript Playwright Page Object Class (no test code).
    - Import Page and Locator as TypeScript types from the Playwright package.
    - Accept a Playwright Page through the constructor; do not launch a browser in the page object.
    - Use strongly typed Locator fields or methods and resilient locators grounded in the provided DOM.
    - Make page interactions asynchronous and use meaningful method names.
    - Do NOT include explanations, browser lifecycle code, or test code.

    Context:
    DOM:
    \`\`\`html
    \${domContent}
    \`\`\`

    Example:
    \`\`\`typescript
    import type { Locator, Page } from 'playwright';

    export class ComponentPage {
      private readonly page: Page;
      readonly saveButton: Locator;

      constructor(page: Page) {
        this.page = page;
        this.saveButton = page.getByRole('button', { name: 'Save' });
      }

      async save(): Promise<void> {
        await this.saveButton.click();
      }
    }
    \`\`\`

    Persona:
    - Audience: Automation engineers building maintainable Playwright TypeScript page objects.

    Output Format:
    - A single TypeScript class inside a \`\`\`typescript\`\`\` block.

    Tone:
    - Clean, maintainable, enterprise-ready.
  `,

  /**
   * Cucumber Feature File Only Prompt
   */
  CUCUMBER_ONLY: `
    Instructions:
    - Generate ONLY a Cucumber (.feature) file.
    - Use Scenario Outline with Examples table.
    - Make sure every step is relevant to the provided DOM.
    - Do not combine multiple actions into one step.
    - Use South India realistic dataset (names, addresses, pin codes, mobile numbers).
    - Use dropdown values only from provided DOM.
    - Generate multiple scenarios if applicable.

    Context:
    DOM:
    \`\`\`html
    \${domContent}
    \`\`\`

    Example:
    \`\`\`gherkin
    Feature: Login to OpenTaps

    Scenario Outline: Successful login with valid credentials
      Given I open the login page
      When I type "<username>" into the Username field
      And I type "<password>" into the Password field
      And I click the Login button
      Then I should be logged in successfully

    Examples:
      | username   | password  |
      | "testuser" | "testpass"|
      | "admin"    | "admin123"|
    \`\`\`

    Persona:
    - Audience: BDD testers who only need feature files.

    Output Format:
    - Only valid Gherkin in a \`\`\`gherkin\`\`\` block.

    Tone:
    - Clear, structured, executable.
  `,

  /**
   * Cucumber with Step Definitions
   */
  CUCUMBER_WITH_SELENIUM_JAVA_STEPS: `
    Instructions:
    - Generate BOTH:
      1. A Cucumber .feature file.
      2. A Java step definition class for selenium.
    - Do NOT include Page Object code.
    - Step defs must include WebDriver setup, explicit waits, and actual Selenium code.
    - Use Scenario Outline with Examples table (South India realistic data).

    Context:
    DOM:
    \`\`\`html
    \${domContent}
    \`\`\`
    URL: \${pageUrl}

    Example:
    \`\`\`gherkin
    Feature: Login to OpenTaps

    Scenario Outline: Successful login with valid credentials
      Given I open the login page
      When I type "<username>" into the Username field
      And I type "<password>" into the Password field
      And I click the Login button
      Then I should be logged in successfully

    Examples:
      | username   | password  |
\      | "admin"    | "admin123"|
    \`\`\`

    \`\`\`java
    package com.leaftaps.stepdefs;

    import io.cucumber.java.en.*;
    import org.openqa.selenium.*;
    import org.openqa.selenium.chrome.ChromeDriver;
    import org.openqa.selenium.support.ui.*;

    public class LoginStepDefinitions {
        private WebDriver driver;
        private WebDriverWait wait;

        @io.cucumber.java.Before
        public void setUp() {
            driver = new ChromeDriver();
            wait = new WebDriverWait(driver, Duration.ofSeconds(10));
            driver.manage().window().maximize();
        }

        @io.cucumber.java.After
        public void tearDown() {
            if (driver != null) driver.quit();
        }

        @Given("I open the login page")
        public void openLoginPage() {
            driver.get("\${pageUrl}");
        }

        @When("I type {string} into the Username field")
        public void enterUsername(String username) {
            WebElement el = wait.until(ExpectedConditions.elementToBeClickable(By.id("username")));
            el.sendKeys(username);
        }

        @When("I type {string} into the Password field")
        public void enterPassword(String password) {
            WebElement el = wait.until(ExpectedConditions.elementToBeClickable(By.id("password")));
            el.sendKeys(password);
        }

        @When("I click the Login button")
        public void clickLogin() {
            driver.findElement(By.xpath("//button[contains(text(),'Login')]")).click();
        }

        @Then("I should be logged in successfully")
        public void verifyLogin() {
            WebElement success = wait.until(ExpectedConditions.visibilityOfElementLocated(By.className("success")));
            assert success.isDisplayed();
        }
    }
    \`\`\`

    Persona:
    - Audience: QA engineers working with Cucumber & Selenium.

    Output Format:
    - Gherkin in \`\`\`gherkin\`\`\` block + Java code in \`\`\`java\`\`\` block.

    Tone:
    - Professional, executable, structured.
  `,

  /**
   * Cucumber Feature File and Playwright Java Step Definitions
   */
  CUCUMBER_WITH_PLAYWRIGHT_JAVA_STEPS: `
    Instructions:
    - Generate BOTH:
      1. A Cucumber .feature file.
      2. A Java step definition class that uses Playwright.
    - Do NOT include Page Object code.
    - Use Playwright's Java API and its auto-waiting locators; do not use Selenium or WebDriver.
    - Initialize Playwright, launch Chromium, create a browser context and page in a Cucumber @Before hook.
    - Close the page, context, browser, and Playwright instance in a Cucumber @After hook.
    - Use Scenario Outline with an Examples table and realistic, clearly fictional South India data.
    - Ground locators and assertions in the provided DOM; do not invent elements or dropdown values.
    - Use separate steps for separate user actions.

    Context:
    DOM:
    \`\`\`html
    \${domContent}
    \`\`\`
    URL: \${pageUrl}

    Example:
    \`\`\`gherkin
    Feature: Login to OpenTaps

    Scenario Outline: Successful login with valid credentials
      Given I open the login page
      When I type "<username>" into the Username field
      And I type "<password>" into the Password field
      And I click the Login button
      Then I should be logged in successfully

    Examples:
      | username | password  |
      | testuser | testpass  |
      | admin    | admin123  |
    \`\`\`

    \`\`\`java
    package com.leaftaps.stepdefs;

    import com.microsoft.playwright.*;
    import io.cucumber.java.After;
    import io.cucumber.java.Before;
    import io.cucumber.java.en.*;

    public class LoginStepDefinitions {
        private Playwright playwright;
        private Browser browser;
        private BrowserContext context;
        private Page page;

        @Before
        public void setUp() {
            playwright = Playwright.create();
            browser = playwright.chromium().launch();
            context = browser.newContext();
            page = context.newPage();
        }

        @After
        public void tearDown() {
            if (page != null) page.close();
            if (context != null) context.close();
            if (browser != null) browser.close();
            if (playwright != null) playwright.close();
        }

        @Given("I open the login page")
        public void openLoginPage() {
            page.navigate("\${pageUrl}");
        }
    }
    \`\`\`

    Persona:
    - Audience: QA engineers writing Cucumber scenarios with Playwright for Java.

    Output Format:
    - Gherkin in a \`\`\`gherkin\`\`\` block followed by Java step definitions in a \`\`\`java\`\`\` block.

    Tone:
    - Professional, executable, structured.
  `,

  /**
   * Cucumber Feature File and Playwright TypeScript Step Definitions
   */
  CUCUMBER_WITH_PLAYWRIGHT_TYPESCRIPT_STEPS: `
    Instructions:
    - Generate BOTH:
      1. A Cucumber .feature file.
      2. A TypeScript step definition file that uses Playwright.
    - Do NOT include Page Object code.
    - Use Playwright's TypeScript API and auto-waiting locators; do not use Selenium or WebDriver.
    - Use @cucumber/cucumber hooks and a typed Cucumber World to create a browser, context, and page before each scenario.
    - Close the page, context, and browser in an After hook, guarding resources that were not created.
    - Define World properties with Playwright types and use async step definitions.
    - Use Scenario Outline with an Examples table and realistic, clearly fictional South India data.
    - Ground locators and assertions in the provided DOM; do not invent elements or dropdown values.
    - Use separate steps for separate user actions.

    Context:
    DOM:
    \`\`\`html
    \${domContent}
    \`\`\`
    URL: \${pageUrl}

    Example:
    \`\`\`gherkin
    Feature: Login

    Scenario Outline: Successful login with valid credentials
      Given I open the login page
      When I type "<username>" into the Username field
      And I type "<password>" into the Password field
      And I click the Login button
      Then I should be logged in successfully

    Examples:
      | username | password |
      | testuser | testpass |
    \`\`\`

    \`\`\`typescript
    import {
      After,
      Before,
      Given,
      setWorldConstructor,
      World
    } from '@cucumber/cucumber';
    import { chromium } from 'playwright';
    import type { Browser, BrowserContext, Page } from 'playwright';

    class PlaywrightWorld extends World {
      browser?: Browser;
      context?: BrowserContext;
      page?: Page;
    }

    setWorldConstructor(PlaywrightWorld);

    Before(async function (this: PlaywrightWorld) {
      this.browser = await chromium.launch();
      this.context = await this.browser.newContext();
      this.page = await this.context.newPage();
    });

    After(async function (this: PlaywrightWorld) {
      await this.page?.close();
      await this.context?.close();
      await this.browser?.close();
    });

    Given('I open the login page', async function (this: PlaywrightWorld) {
      if (!this.page) throw new Error('Playwright page was not initialized');
      await this.page.goto('\${pageUrl}');
    });
    \`\`\`

    Persona:
    - Audience: QA engineers writing Cucumber scenarios with Playwright for TypeScript.

    Output Format:
    - Gherkin in a \`\`\`gherkin\`\`\` block followed by TypeScript step definitions in a \`\`\`typescript\`\`\` block.

    Tone:
    - Professional, executable, structured.
  `
};

const PAGE_OBJECT_PROMPTS = {
  'java:selenium': 'SELENIUM_JAVA_PAGE_ONLY',
  'java:playwright': 'PLAYWRIGHT_JAVA_PAGE_ONLY',
  'ts:playwright': 'PLAYWRIGHT_TYPESCRIPT_PAGE_ONLY'
};

const COMBINED_STEP_PROMPTS = {
  'java:selenium': 'CUCUMBER_WITH_SELENIUM_JAVA_STEPS',
  'java:playwright': 'CUCUMBER_WITH_PLAYWRIGHT_JAVA_STEPS',
  'ts:playwright': 'CUCUMBER_WITH_PLAYWRIGHT_TYPESCRIPT_STEPS'
};

export function getGenerationPromptKeys(language, engine, selectedModes) {
  const lang = language?.toLowerCase() || '';
  const eng = engine?.toLowerCase() || '';
  const combination = `${lang}:${eng}`;
  const modes = new Set(selectedModes);
  const isFeatureChecked = modes.has('FEATURE');
  const isPageChecked = modes.has('PAGE');
  const promptKeys = [];
  let showUnsupportedWarning = false;

  if (!isFeatureChecked && !isPageChecked) {
    const pagePrompt = PAGE_OBJECT_PROMPTS[combination];
    if (pagePrompt) promptKeys.push(pagePrompt);
  } else if (isFeatureChecked && isPageChecked) {
    const combinedPrompt = COMBINED_STEP_PROMPTS[combination];
    if (combinedPrompt) {
      promptKeys.push(combinedPrompt);
    } else {
      promptKeys.push('CUCUMBER_ONLY');
      showUnsupportedWarning = true;
    }
  } else if (isFeatureChecked) {
    promptKeys.push('CUCUMBER_ONLY');
  } else {
    const pagePrompt = PAGE_OBJECT_PROMPTS[combination];
    if (pagePrompt) {
      promptKeys.push(pagePrompt);
    } else {
      showUnsupportedWarning = true;
    }
  }

  return { promptKeys, showUnsupportedWarning };
}

/**
 * Helper function to escape code blocks in prompts
 */
function escapeCodeBlocks(text) {
  return text.replace(/```/g, '\\`\\`\\`');
}

/**
 * Function to fill template variables in a prompt
 */
export function getPrompt(promptKey, variables = {}) {
  let prompt = DEFAULT_PROMPTS[promptKey];
  if (!prompt) {
    throw new Error(`Prompt not found: ${promptKey}`);
  }

  Object.entries(variables).forEach(([k, v]) => {
    const regex = new RegExp(`\\$\\{${k}\\}`, 'g');
    prompt = prompt.replace(regex, v);
  });

  return prompt.trim();
}

export const CODE_GENERATOR_TYPES = {
  SELENIUM_JAVA_PAGE_ONLY: 'Selenium-Java-Page-Only',
  CUCUMBER_ONLY: 'Cucumber-Only',
  CUCUMBER_WITH_SELENIUM_JAVA_STEPS: 'Cucumber-With-Selenium-Java-Steps',
};
