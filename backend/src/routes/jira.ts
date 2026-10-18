import express from 'express'
import { JiraClient } from '../jiraClient'

export const jiraRouter = express.Router()

jiraRouter.post('/connect', async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const jiraClient = new JiraClient()
    const stories = await jiraClient.connectAndFetchStories()

    res.json({
      connected: true,
      stories
    })
  } catch (error) {
    console.error('JIRA connection error:', error)
    const message = error instanceof Error ? error.message : 'Failed to connect to JIRA'
    res.status(502).json({
      error: message
    })
  }
})
