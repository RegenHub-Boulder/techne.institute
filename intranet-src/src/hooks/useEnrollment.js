/**
 * useEnrollment — persistent enrollment state for the board ratification flow.
 *
 * State is stored in localStorage keyed by participant ID so it survives:
 *   - Navigation away from /intranet/enroll
 *   - Browser refresh / tab close
 *   - Session expiry and re-login (same device)
 *
 * Server sync (Supabase) is attempted for votes and comments.
 * If the governance tables aren't deployed yet, we degrade gracefully
 * and keep the local record.
 *
 * Enrollment steps (0-indexed):
 *   0  identity      — profile: name, bio, role, location
 *   1  bylaws-read   — read Bylaws v.2, mark read
 *   2  bylaws-vote   — Full Consent vote on Bylaws v.2
 *   3  ma-read       — read Membership Agreement v.2, mark read
 *   4  ma-vote       — Full Consent vote on MA v.2
 *   5  orientation   — capital account orientation (informational)
 *   6  complete      — done
 */

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

// Document descriptors used by the flow
export const DOCUMENTS = {
  bylaws: {
    id: 'bylaws-v2',
    title: 'Bylaws, Version 2',
    version: 'v.2',
    drafted: 'May 11, 2026',
    url: '/legal/bylaws-v2/',
    analysisUrl: '/legal/bylaws-analysis/',
    blockingIssues: 2,
    totalIssues: 8,
    description: 'The foundational governance document. 18 articles covering member rights, board composition, voting procedures, and patronage distribution.',
  },
  ma: {
    id: 'membership-agreement-v2',
    title: 'Membership Agreement, Version 2',
    version: 'v.2',
    drafted: 'May 11, 2026',
    url: '/legal/membership-agreement-v2/',
    analysisUrl: '/legal/membership-agreement-modifications/',
    blockingIssues: 3,
    totalIssues: 6,
    description: 'The agreement each Class A Patron Member signs. Governs obligations, IP, patronage rights, capital accounts, and withdrawal.',
  },
}

// Full Consent vote options (sociocratic model)
export const VOTE_OPTIONS = [
  {
    value: 'consent',
    label: 'Consent',
    description: 'I can work with this document. It is good enough for now, safe enough to try.',
    color: '#6a8a5e',
  },
  {
    value: 'stand-aside',
    label: 'Stand Aside',
    description: 'I have reservations but will not block ratification. My concerns are on the record.',
    color: '#c4956a',
  },
  {
    value: 'object',
    label: 'Object',
    description: 'I have a principled objection. This blocks ratification until resolved.',
    color: '#9a5a5a',
  },
]

// Steps in order
export const STEPS = [
  { id: 'identity',     label: 'Identity',            phase: 'Profile'    },
  { id: 'bylaws-read',  label: 'Bylaws',               phase: 'Read'       },
  { id: 'bylaws-vote',  label: 'Bylaws',               phase: 'Vote'       },
  { id: 'ma-read',      label: 'Member Agreement',     phase: 'Read'       },
  { id: 'ma-vote',      label: 'Member Agreement',     phase: 'Vote'       },
  { id: 'orientation',  label: 'Capital Account',      phase: 'Orientation'},
  { id: 'complete',     label: 'Complete',             phase: ''           },
]

function storageKey(participantId) {
  return `techne-enrollment-${participantId}`
}

function defaultState() {
  return {
    step: 0,
    // Profile completion
    profileSaved: false,
    // Bylaws
    bylawsRead: false,
    bylawsComment: '',
    bylawsCommentSaved: false,
    bylawsVote: null,        // 'consent' | 'stand-aside' | 'object'
    bylawsVoteReason: '',
    bylawsVoteSaved: false,
    // Membership Agreement
    maRead: false,
    maComment: '',
    maCommentSaved: false,
    maVote: null,
    maVoteReason: '',
    maVoteSaved: false,
    // Orientation
    orientationRead: false,
    // Completion
    enrollmentComplete: false,
    completedAt: null,
  }
}

export function useEnrollment(participantId) {
  const [state, setStateRaw] = useState(() => {
    if (!participantId) return defaultState()
    try {
      const raw = localStorage.getItem(storageKey(participantId))
      if (raw) return { ...defaultState(), ...JSON.parse(raw) }
    } catch (_) {}
    return defaultState()
  })

  // Sync to localStorage whenever state changes
  useEffect(() => {
    if (!participantId) return
    try {
      localStorage.setItem(storageKey(participantId), JSON.stringify(state))
    } catch (_) {}
  }, [state, participantId])

  const setState = useCallback((updater) => {
    setStateRaw(prev => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater }
      return next
    })
  }, [])

  // Navigate to a specific step index
  const goToStep = useCallback((index) => {
    setState(s => ({ ...s, step: Math.max(0, Math.min(index, STEPS.length - 1)) }))
  }, [setState])

  const goNext = useCallback(() => {
    setState(s => ({ ...s, step: Math.min(s.step + 1, STEPS.length - 1) }))
  }, [setState])

  const goBack = useCallback(() => {
    setState(s => ({ ...s, step: Math.max(s.step - 1, 0) }))
  }, [setState])

  // Save a comment to Supabase (graceful fallback)
  const saveComment = useCallback(async (docId, comment) => {
    if (!participantId || !comment.trim()) return { ok: true }
    try {
      const { error } = await supabase.from('document_comments').upsert({
        participant_id: participantId,
        document_id: docId,
        comment: comment.trim(),
        created_at: new Date().toISOString(),
      }, { onConflict: 'participant_id,document_id' })
      return { ok: !error, error }
    } catch (e) {
      // Table may not exist yet — local state is the fallback
      return { ok: false, error: e }
    }
  }, [participantId])

  // Save a vote to Supabase (graceful fallback)
  const saveVote = useCallback(async (docId, vote, reason) => {
    if (!participantId || !vote) return { ok: true }
    try {
      const { error } = await supabase.from('document_votes').upsert({
        participant_id: participantId,
        document_id: docId,
        vote,
        reason: reason?.trim() || null,
        voted_at: new Date().toISOString(),
      }, { onConflict: 'participant_id,document_id' })
      return { ok: !error, error }
    } catch (e) {
      return { ok: false, error: e }
    }
  }, [participantId])

  // Mark enrollment complete in participants table
  const markEnrollmentComplete = useCallback(async () => {
    if (!participantId) return
    setState(s => ({ ...s, enrollmentComplete: true, completedAt: new Date().toISOString() }))
    try {
      await supabase.from('participants').update({
        enrollment_completed: true,
        enrollment_completed_at: new Date().toISOString(),
      }).eq('id', participantId)
    } catch (_) {}
  }, [participantId, setState])

  // How many steps are meaningfully done (for progress display)
  const stepsCompleted = state.step

  return {
    state,
    setState,
    goToStep,
    goNext,
    goBack,
    saveComment,
    saveVote,
    markEnrollmentComplete,
    stepsCompleted,
    totalSteps: STEPS.length,
    currentStep: STEPS[state.step] || STEPS[0],
    isComplete: state.enrollmentComplete,
  }
}
