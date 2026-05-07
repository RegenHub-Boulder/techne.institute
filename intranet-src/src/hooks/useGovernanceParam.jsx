// useGovernanceParam — fetch a single governance parameter from techne_governance_params.
// Falls back to hardcoded defaults if the table is unavailable or the key doesn't exist.
//
// Usage:
//   const { value, status, loading } = useGovernanceParam('patronage_formula', DEFAULTS.patronage_formula)
//
// status: 'proposed' | 'ratified' | 'superseded' | null (when using fallback)

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export const GOVERNANCE_DEFAULTS = {
  patronage_formula: { labor: 40, revenue: 30, capital: 20, community: 10 },
}

export function useGovernanceParam(key, fallback) {
  const defaultValue = fallback ?? GOVERNANCE_DEFAULTS[key] ?? null
  const [state, setState] = useState({ value: defaultValue, status: null, label: null, description: null, loading: true, error: null })

  useEffect(() => {
    let cancelled = false
    async function fetch() {
      try {
        const { data, error } = await supabase
          .from('techne_governance_params')
          .select('value, status, label, description, ratified_at')
          .eq('key', key)
          .maybeSingle()

        if (cancelled) return
        if (error) throw error

        setState({
          value: data?.value ?? defaultValue,
          status: data?.status ?? null,
          label: data?.label ?? null,
          description: data?.description ?? null,
          ratifiedAt: data?.ratified_at ?? null,
          loading: false,
          error: null,
        })
      } catch (e) {
        if (!cancelled) {
          setState(prev => ({ ...prev, loading: false, error: e.message }))
        }
      }
    }
    fetch()
    return () => { cancelled = true }
  }, [key]) // eslint-disable-line react-hooks/exhaustive-deps

  return state
}
