import { expect, test } from '@playwright/test'

test('sets the page title', async ({ page }) => {
  await page.goto('/')

  await expect(page).toHaveTitle('Example (Vanilla)')
})

test('logs the correct values', async ({ page }) => {
  const errors = []
  const logs = []

  page.on('console', (message) => {
    if (/^\[vite\]/.test(message.text())) {
      return
    }

    logs.push(message.text())
  })

  page.on('pageerror', (error) => {
    errors.push(error.message)
  })

  await page.goto('/')

  expect(errors).toEqual([
    'process is not defined',
  ])

  expect(logs).toEqual([])
})
