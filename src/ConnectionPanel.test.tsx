// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import ConnectionPanel from './ConnectionPanel'

const goodResponse = () => new Response(JSON.stringify({ service: 'HeavyMeta', status: 'available' }))
const click = () => fireEvent.click(screen.getByRole('button'))

afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.useRealTimers() })

it('shows loading, prevents duplicate requests, then validates success', async () => {
  let resolve!: (value: Response) => void
  const fetchMock = vi.fn(() => new Promise<Response>(r => { resolve = r }))
  vi.stubGlobal('fetch', fetchMock)
  render(<ConnectionPanel />)
  expect(screen.getByRole('status').textContent).toContain('Ready')
  click(); click()
  expect((screen.getByRole('button') as HTMLButtonElement).disabled).toBe(true)
  expect(screen.getByRole('status').textContent).toContain('Checking')
  expect(fetchMock).toHaveBeenCalledTimes(1)
  expect(fetchMock.mock.calls[0]).toEqual(['/api/status', expect.objectContaining({ cache: 'no-store', signal: expect.any(AbortSignal) })])
  resolve(goodResponse())
  await waitFor(() => expect(screen.getByRole('status').textContent).toBe('Connected to HeavyMeta'))
  expect((screen.getByRole('button') as HTMLButtonElement).disabled).toBe(false)
  expect(screen.getByRole('status').getAttribute('aria-live')).toBe('polite')
})

it('recovers from a network failure when retried', async () => {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValueOnce(new TypeError('offline')).mockResolvedValueOnce(goodResponse()))
  render(<ConnectionPanel />); click()
  await screen.findByRole('button', { name: 'Retry connection' })
  click()
  await waitFor(() => expect(screen.getByRole('status').textContent).toBe('Connected to HeavyMeta'))
})

it.each([
  ['HTTP error', () => new Response('unavailable', { status: 503 })],
  ['malformed JSON', () => new Response('{')],
  ['wrong fields', () => new Response('{"service":"Other","status":"available"}')],
  ['null body', () => new Response('null')],
])('rejects %s', async (_name, response) => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response()))
  render(<ConnectionPanel />); click()
  await screen.findByRole('button', { name: 'Retry connection' })
  expect(screen.getByRole('status').textContent).toContain('Could not verify')
})

it('aborts after five seconds and permits retry', async () => {
  vi.useFakeTimers()
  let signal!: AbortSignal
  vi.stubGlobal('fetch', vi.fn((_url, options) => new Promise((_resolve, reject) => {
    signal = options.signal
    signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))
  })))
  render(<ConnectionPanel />); click()
  await act(async () => { await vi.advanceTimersByTimeAsync(5000) })
  expect(signal.aborted).toBe(true)
  expect(screen.getByRole('status').textContent).toContain('timed out')
  expect((screen.getByRole('button') as HTMLButtonElement).disabled).toBe(false)
})

it('aborts on unmount and clears the timer without showing a failure', async () => {
  vi.useFakeTimers()
  let signal!: AbortSignal
  vi.stubGlobal('fetch', vi.fn((_url, options) => new Promise((_resolve, reject) => {
    signal = options.signal
    signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))
  })))
  const { unmount } = render(<ConnectionPanel />); click()
  await act(async () => { unmount() })
  expect(signal.aborted).toBe(true)
  expect(vi.getTimerCount()).toBe(0)
  expect(screen.queryByRole('status')).toBeNull()
})
