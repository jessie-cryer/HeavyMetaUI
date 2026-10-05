import { useEffect, useRef, useState } from 'react'

type CheckState = { phase: 'idle' | 'loading' | 'success' | 'error'; message: string }

export default function ConnectionPanel() {
  const [state, setState] = useState<CheckState>({ phase: 'idle', message: 'Ready to check the connection.' })
  const activeRequest = useRef<AbortController | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => () => {
    const request = activeRequest.current
    activeRequest.current = null
    clearTimeout(timer.current)
    request?.abort()
  }, [])

  async function checkConnection() {
    if (activeRequest.current) return
    const controller = new AbortController()
    activeRequest.current = controller
    let timedOut = false
    setState({ phase: 'loading', message: 'Checking connection…' })
    timer.current = setTimeout(() => {
      timedOut = true
      controller.abort()
    }, 5000)

    try {
      const response = await fetch('/api/status', { signal: controller.signal, cache: 'no-store' })
      if (!response.ok) throw new Error('response')
      const data: unknown = await response.json()
      if (typeof data !== 'object' || data === null ||
          !('service' in data) || data.service !== 'HeavyMeta' ||
          !('status' in data) || data.status !== 'available') {
        throw new Error('response')
      }
      if (activeRequest.current === controller && !controller.signal.aborted) {
        setState({ phase: 'success', message: 'Connected to HeavyMeta' })
      }
    } catch {
      // Cleanup clears the request reference before aborting on unmount.
      if (activeRequest.current === controller) {
        setState({ phase: 'error', message: timedOut
          ? 'Connection timed out after five seconds. Try again.'
          : 'Could not verify the connection. Check that the BFF is running and retry.' })
      }
    } finally {
      if (activeRequest.current === controller) {
        clearTimeout(timer.current)
        activeRequest.current = null
      }
    }
  }

  return (
    <section aria-labelledby="connection-heading" className="mb-10 rounded border border-stone-600 p-6">
      <h2 id="connection-heading" className="text-lg font-semibold">Development connection check</h2>
      <p className="mt-2 text-sm text-stone-300">Checks only the Web/BFF connection, not sign-in, databases, or deck services.</p>
      <p role="status" aria-live="polite" aria-atomic="true" className="my-4 text-sm">{state.message}</p>
      <button type="button" onClick={checkConnection} disabled={state.phase === 'loading'}
        className="rounded bg-amber-200 px-4 py-2 font-medium text-stone-950 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-200 disabled:cursor-wait disabled:opacity-60">
        {state.phase === 'loading' ? 'Checking…' : state.phase === 'error' ? 'Retry connection' : 'Check connection'}
      </button>
    </section>
  )
}
