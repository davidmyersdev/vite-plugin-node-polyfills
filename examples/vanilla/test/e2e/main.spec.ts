import { expect, test } from '@playwright/test'
import { isBuild, isDev } from '/test/utils'

test('sets the page title', async ({ page }) => {
  await page.goto('/')

  await expect(page).toHaveTitle('Example (Vanilla)')
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

  if (isBuild) {
    expect(logs).toEqual([
      '{Volume: , vol: Volume, createFsFromVolume: , fs: Object, memfs: }',
      'function fetch() { [native code] }',
      '/',
      'Module',
      '{}',
      'function Array() { [native code] }',
      '4294967295',
      'Uint8Array(6)',
      'function Array() { [native code] }',
      'Hello from fs!',
      '{some: true, else: 1, inner: Object}',
    ])
  }

  if (isDev) {
    expect(logs).toEqual([
      '[vite] connecting...',
      '[vite] connected.',
      '{Volume: , vol: _Volume, createFsFromVolume: , fs: Object, memfs: }',
      'function fetch() { [native code] }',
      '/',
      '{nextTick: , title: browser, browser: true, env: Object, argv: Array(0)}',
      '{}',
      'function Array() { [native code] }',
      '4294967295',
      'Uint8Array(6)',
      'function Array() { [native code] }',
      'Hello from fs!',
      '{some: true, else: 1, inner: Object}',
    ])
  }
})
