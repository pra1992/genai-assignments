# CodeLens AI

CodeLens AI is a React frontend for requesting Java code reviews from an existing n8n workflow. The frontend does not contain or start the backend workflow; it sends a GitHub Java file URL to an n8n webhook and displays the JSON review returned by that workflow.

## Requirements

- Node.js and npm
- An n8n instance with the CodeReviewAgent workflow configured
- A reachable n8n webhook URL

The GitHub repository and Java file must be accessible to the n8n workflow. For local n8n, the default address is `http://localhost:5678`.

## Start the application

Use two terminals, opened in the project directory.

### 1. Start the n8n backend

If n8n is installed locally, run:

```powershell
n8n start
```

For Docker or hosted n8n, start that instance using its normal method instead. Confirm the CodeReviewAgent workflow is active. The frontend expects the active webhook path, usually `/webhook/CodeReviewAgent`.

### 2. Configure the webhook URL

In the project directory, create the local environment file:

```powershell
Copy-Item .env.example .env.local
```

Open `.env.local` and set the URL to your n8n webhook. For a local n8n instance using the default port, the line should be:

```env
VITE_N8N_WEBHOOK_URL=http://localhost:5678/webhook/CodeReviewAgent
```

Use the exact webhook URL shown by your n8n Webhook node. An n8n test URL such as `/webhook-test/...` only works while the workflow is listening for a test event. For normal use, activate the workflow and use its production URL, typically `/webhook/...`.

### 3. Start the frontend

In another terminal, from the project directory, run:

```powershell
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`. If you change `.env.local`, stop and restart `npm run dev` so Vite reloads the setting.

## Request a code review

1. Open the frontend in your browser.
2. Paste a GitHub URL that points directly to a Java source file, for example `https://github.com/owner/repository/blob/main/path/File.java`.
3. Select **Review Code** and wait for the results to appear.

The frontend sends a POST request to the configured webhook with a JSON body containing the `originalUrl` field. The n8n workflow must return a successful JSON response in the format expected by the frontend.

## Troubleshooting

- **Unable to reach the n8n workflow:** Confirm n8n is running and the URL in `.env.local` uses the correct host, port, and protocol. A default local n8n instance uses `http://`, not `https://`. Restart Vite after changing the file.
- **Webhook not found (404):** Confirm the workflow is active and the URL uses its production webhook path, not `/webhook-test/`.
- **Browser reports a CORS error:** Configure n8n to allow requests from the frontend origin, usually `http://localhost:5173`. If Vite selected another port, allow that origin instead.
- **Authentication or access error (401/403):** Check the webhook's authentication and access settings. The frontend currently sends the request without credentials.
- **Invalid review response:** Check that the n8n workflow's Respond to Webhook node returns valid JSON in the expected review format.

## Build check

To type-check and create a production build, run:

```powershell
npm run build
```