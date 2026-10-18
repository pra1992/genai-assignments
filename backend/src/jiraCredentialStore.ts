import keytar from 'keytar'

const SERVICE = 'user-story-to-tests'
const ACCOUNT = 'jira-api-token'

export function getJiraApiToken(): Promise<string | null> {
  return keytar.getPassword(SERVICE, ACCOUNT)
}

export function storeJiraApiToken(token: string): Promise<void> {
  return keytar.setPassword(SERVICE, ACCOUNT, token)
}