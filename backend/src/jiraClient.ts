import fetch from 'node-fetch'
import { getJiraApiToken } from './jiraCredentialStore'

export interface JiraStory {
  id: string
  key: string
  summary: string
  status: string
  issueType: string
  url?: string
}

export class JiraClient {
  private email: string
  private baseUrl: string
  private projectKey: string

  constructor() {
    this.email = process.env.JIRA_EMAIL || ''
    this.baseUrl = process.env.JIRA_BASE_URL || ''
    this.projectKey = process.env.JIRA_PROJECT_KEY || ''

    if (!this.email || !this.baseUrl || !this.projectKey) {
      console.warn('JIRA configuration is incomplete. Set JIRA_BASE_URL, JIRA_EMAIL, and JIRA_PROJECT_KEY.')
    } else {
      console.log(`JIRA configured for project: ${this.projectKey}`)
    }
  }

  private getAuthHeader(apiToken: string): string {
    const token = `${this.email}:${apiToken}`
    return `Basic ${Buffer.from(token).toString('base64')}`
  }

  async connectAndFetchStories(): Promise<JiraStory[]> {
    if (!this.email || !this.baseUrl || !this.projectKey) {
      throw new Error('JIRA configuration is incomplete. Please set JIRA_BASE_URL, JIRA_EMAIL, and JIRA_PROJECT_KEY in the backend environment.')
    }

    const apiToken = await getJiraApiToken()
    if (!apiToken) {
      throw new Error('JIRA API token is not stored. Run npm run setup:jira-token --workspace backend.')
    }

    const baseUrl = this.baseUrl.replace(/\/$/, '')
    const project = this.projectKey.replace(/"/g, '\\"')
    const jql = encodeURIComponent(`project="${project}" ORDER BY created DESC`)
    const endpoint = `${baseUrl}/rest/api/3/search/jql?jql=${jql}&fields=summary,status,issuetype,key,self&maxResults=50`

    console.log(`Fetching JIRA stories from: ${endpoint}`)

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        Authorization: this.getAuthHeader(apiToken),
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`JIRA API error: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const data = await response.json() as any
    const issues = Array.isArray(data.issues) ? data.issues : []

    return issues.map((issue: any) => ({
      id: issue.id,
      key: issue.key,
      summary: issue.fields?.summary || 'No summary available',
      status: issue.fields?.status?.name || 'Unknown',
      issueType: issue.fields?.issuetype?.name || 'Task',
      url: issue.self
    }))
  }
}
