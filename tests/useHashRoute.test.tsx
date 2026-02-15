import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { useHashRoute } from '../src/hooks/useHashRoute'

describe('useHashRoute', () => {
  beforeEach(() => {
    window.location.hash = ''
  })

  it('reads the current hash', () => {
    window.location.hash = '#packing-labels'

    const { result } = renderHook(() => useHashRoute())

    expect(result.current[0]).toBe('packing-labels')
  })

  it('updates the hash and notifies subscribers', () => {
    const { result } = renderHook(() => useHashRoute())

    act(() => {
      result.current[1]('add-box')
      window.dispatchEvent(new HashChangeEvent('hashchange'))
    })

    expect(result.current[0]).toBe('add-box')
  })
})
