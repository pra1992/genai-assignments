import { storeJiraApiToken } from '../src/jiraCredentialStore'

function readHiddenToken(): Promise<string> {
  return new Promise((resolve, reject) => {
    const input = process.stdin
    if (!input.isTTY || typeof input.setRawMode !== 'function') {
      reject(new Error('Run this command in an interactive terminal to enter the token securely.'))
      return
    }

    process.stdout.write('Jira API token (input hidden): ')
    let token = ''

    const restoreTerminal = () => {
      input.setRawMode(false)
      input.pause()
      input.removeListener('data', onData)
      process.stdout.write('\n')
    }

    const onData = (chunk: Buffer) => {
      const character = chunk.toString()
      if (character === '\u0003') {
        restoreTerminal()
        reject(new Error('Token entry cancelled.'))
      } else if (character === '\r' || character === '\n') {
        restoreTerminal()
        resolve(token)
      } else if (character === '\u007f' || character === '\b') {
        token = token.slice(0, -1)
      } else if (!character.startsWith('\u001b') && character >= ' ') {
        token += character
      }
    }

    input.setRawMode(true)
    input.resume()
    input.on('data', onData)
  })
}

async function main(): Promise<void> {
  const token = await readHiddenToken()
  if (!token) {
    throw new Error('The Jira API token cannot be empty.')
  }

  await storeJiraApiToken(token)
  console.log('Jira API token stored in the operating system credential store.')
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'Unable to store Jira API token.')
  process.exitCode = 1
})