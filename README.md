# User Story to Tests

A React and Express application that generates structured test cases from user-story details using Groq. It can also connect to Jira and display recent issues from a configured project.

For the component map, request flows, API contracts, and security boundaries, see [workflow.md](workflow.md).

## Requirements

- Node.js `^20.19.0` or `>=22.12.0` and npm.
- A Groq API key to generate test cases.
- For Jira integration: Jira Cloud site URL, Atlassian account email, project key or project name, and a Jira API token.

## Setup

Run commands from the repository root unless a step says otherwise.

1. Install dependencies:

   ```powershell
   npm install
   ```

2. Create the backend environment file by copying `.env.example` to `.env`:

   ```powershell
   Copy-Item .env.example .env
   ```

   Edit the root `.env` and replace placeholders. Set the Groq API key and model, plus Jira site URL, account email, and project key/name. Do not add `JIRA_API_TOKEN` to this file. The root `.env` is ignored by Git.

3. Set the frontend API URL in `frontend/.env`:

   ```dotenv
   VITE_API_BASE_URL=http://localhost:8090/api
   ```

   This URL is not a secret. Do not put Jira or Groq credentials in `frontend/.env`; Vite exposes frontend environment values to browser code.

4. Create a Jira API token in your Atlassian account’s API token settings. From an interactive terminal at the repository root, run:

   ```powershell
   npm run setup:jira-token --workspace backend
   ```

   When prompted with `Jira API token (input hidden):`, type or paste the new token and press Enter. The input will not be displayed. A success message confirms storage in the operating system credential store (Windows Credential Manager on Windows). The credential entry uses service `user-story-to-tests` and account `jira-api-token`.

   Never put the token in a command argument, `.env`, frontend settings, chat, screenshots, or source control. Running the setup command again replaces the same credential entry. If a token was exposed, revoke it in Atlassian and store a replacement.

## Run the Application

Start the backend and frontend together from the repository root:

```powershell
npm run dev
```

Open the Vite URL printed in the terminal, normally `http://localhost:5173`. The backend normally listens on `http://localhost:8090`; verify it at `http://localhost:8090/api/health`.

If either dev process has exited, start both again. After changing backend `.env` values or backend code, restart the backend. After changing `frontend/.env`, restart the frontend so Vite reloads its configuration.

## Use the App

### Connect Jira

1. Configure `JIRA_BASE_URL`, `JIRA_EMAIL`, and `JIRA_PROJECT_KEY` in the root `.env` and store the API token using the setup command above.
2. Start or restart the backend.
3. Select **Connect JIRA** in the app.
4. Recent issues from the configured project appear with their key, summary, status, and issue type. The app displays Jira stories; it does not automatically copy a selected issue into the test-generation form.

### Generate Test Cases

1. Enter **Story Title**, **Summary**, and **Acceptance Criteria**. All three are required.
2. Optionally add **Description** and **Additional Info**.
3. Select **Generate Test Cases**. Results appear in the output area; select a test-case ID to expand its details.
4. Select **Reset** to clear the form, results, messages, Jira display, and expanded test cases. Reset does not remove the saved Jira token or environment configuration.

## API and Validation

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Check backend availability. |
| `POST` | `/api/generate-tests` | Validate story input and request generated test cases. |
| `POST` | `/api/jira/connect` | Connect to Jira and fetch up to 50 issues. |

Run TypeScript checks for both workspaces with:

```powershell
npm run typecheck
```

## Troubleshooting

- **Jira says the token is not stored:** Run `npm run setup:jira-token --workspace backend` in an interactive terminal and confirm the success message.
- **Jira returns 401 or 403:** Verify the Jira email and site URL, ensure the new token belongs to that Atlassian account, and confirm the account can access the project.
- **Jira returns 400 or no issues:** Check `JIRA_PROJECT_KEY` in the root `.env`. Use a valid Jira project key or exact project name and confirm that the project contains issues visible to the account.
- **Jira returns 410 Gone:** The backend should use Jira’s current `/rest/api/3/search/jql` endpoint. Restart the backend after updating the code.
- **Frontend cannot reach the backend:** Confirm the backend is running on port `8090` and `frontend/.env` points to `http://localhost:8090/api`.
- **Groq generation fails:** Verify `groq_API_KEY`, `groq_API_BASE`, and `groq_MODEL` in the root `.env`; inspect the backend’s provider error response without sharing secrets.

## Security Notes

- Keep the root `.env` local. The repository `.gitignore` excludes environment files.
- Jira tokens are stored in the OS credential store and retrieved only by the backend when connecting.
- Frontend variables are public to browser users. Only non-secret configuration such as the API base URL belongs in `frontend/.env`.
- Revoke and replace credentials that have been exposed. Do not paste API tokens into support requests or commit them to the repository.