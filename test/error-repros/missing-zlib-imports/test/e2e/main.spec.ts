import { expect, test } from '@playwright/test'

test('sets the page title', async ({ page }) => {
  await page.goto('/')

  await expect(page).toHaveTitle('missing-zlib-imports')
})

test('logs the correct values', async ({ page }) => {
  const errors = []
  const logs = []

  page.on('console', (message) => {
    logs.push(message.text())
  })

  page.on('pageerror', (error) => {
    errors.push(error.message)
  })

  await page.goto('/')

  expect(errors).toEqual([])
  expect(logs).toContainEqual(
    '[Inflate, Deflate, InflateRaw, DeflateRaw, Gzip, Gunzip, Unzip, BrotliCompress, BrotliDecompress, constants, default]',
  )
})
