import { describe, expect, it } from 'vitest'
import {
  isMainEvent,
  isRequestEnvelope,
  isResponseEnvelope,
  isUiEvent,
} from './messages'

describe('message guards', () => {
  it('accepts a valid main event', () => {
    expect(isMainEvent({ type: 'selection-changed', items: [], pageName: 'Page 1' })).toBe(true)
  })

  it('rejects non-main events', () => {
    expect(isMainEvent({ type: 'focus-node', nodeId: '1:2' })).toBe(false)
    expect(isMainEvent(null)).toBe(false)
    expect(isMainEvent('selection-changed')).toBe(false)
  })

  it('accepts a valid ui event', () => {
    expect(isUiEvent({ type: 'focus-node', nodeId: '1:2' })).toBe(true)
  })

  it('recognises request envelopes only for known kinds', () => {
    expect(
      isRequestEnvelope({ channel: 'request', requestId: 1, kind: 'get-storage', params: { key: 'k' } }),
    ).toBe(true)
    expect(
      isRequestEnvelope({ channel: 'request', requestId: 1, kind: 'unknown', params: {} }),
    ).toBe(false)
    expect(isRequestEnvelope({ channel: 'response', requestId: 1, kind: 'get-storage' })).toBe(false)
  })

  it('recognises response envelopes', () => {
    expect(
      isResponseEnvelope({ channel: 'response', requestId: 1, kind: 'get-storage', ok: true, result: null }),
    ).toBe(true)
    expect(
      isResponseEnvelope({ channel: 'request', requestId: 1, kind: 'get-storage', params: {} }),
    ).toBe(false)
  })
})
