import { describe, expect, it, vi } from 'vitest'
import { withFallback } from './fallback'

describe('withFallback', () => {
  it('returns remote data when remote succeeds', async () => {
    const result = await withFallback(
      async () => 'remote',
      () => 'local',
    )
    expect(result).toEqual({ data: 'remote', source: 'remote' })
  })

  it('falls back to local when remote rejects', async () => {
    const result = await withFallback(
      async () => {
        throw new Error('boom')
      },
      () => 'local',
    )
    expect(result).toEqual({ data: 'local', source: 'local' })
  })

  it('reports the error to onError before falling back', async () => {
    const onError = vi.fn()
    await withFallback(
      async () => {
        throw new Error('boom')
      },
      () => 'local',
      onError,
    )
    expect(onError).toHaveBeenCalledOnce()
  })
})
