import { useState } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'

const TYPE_LABELS = {
  steward:  'Steward',
  member:   'Member',
  investor: 'Investor',
  ally:     'Ally',
  guest:    'Guest',
}

const MEMBERSHIP_LABELS = {
  1: 'Class 1',
  2: 'Class 2',
  3: 'Class 3',
  4: 'Class 4',
}

// Convert array value (from DB) to a comma-separated display string
function arrToStr(val) {
  if (!val) return ''
  if (Array.isArray(val)) return val.join(', ')
  return String(val)
}

// Convert comma-separated string back to array for DB update
function strToArr(str) {
  if (!str || !str.trim()) return []
  return str.split(',').map(s => s.trim()).filter(Boolean)
}

export default function Profile({ onRerunOnboarding }) {
  const { participant, displayName, signOut, updateProfile } = useAuth()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [showRerunConfirm, setShowRerunConfirm] = useState(false)

  const [fields, setFields] = useState({
    first_name:      participant?.first_name      || '',
    last_name:       participant?.last_name       || '',
    display_name:    participant?.display_name    || '',
    bio:             participant?.bio             || '',
    location:        participant?.location        || '',
    affiliation:     participant?.affiliation     || '',
    craft_primary:   participant?.craft_primary   || '',
    craft_secondary: participant?.craft_secondary || '',
    skills:          arrToStr(participant?.skills),
    interests:       arrToStr(participant?.interests),
  })

  if (!participant) return null

  const typeLabel       = TYPE_LABELS[participant.participant_type]       || participant.participant_type       || 'Participant'
  const membershipLabel = MEMBERSHIP_LABELS[participant.membership_class] || (participant.membership_class ? `Class ${participant.membership_class}` : '—')
  const initials = displayName
    ? displayName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  function handleField(key, val) {
    setFields(f => {
      const next = { ...f, [key]: val }
      if (key === 'first_name' || key === 'last_name') {
        next.display_name = [next.first_name, next.last_name].filter(Boolean).join(' ')
      }
      return next
    })
  }

  async function handleSave() {
    setSaving(true)
    setSaveError(null)
    const updates = {
      ...fields,
      skills:    strToArr(fields.skills),
      interests: strToArr(fields.interests),
    }
    const { error } = await updateProfile(updates)
    setSaving(false)
    if (error) { setSaveError('Save failed. Try again.'); return }
    setEditing(false)
  }

  function handleCancel() {
    setFields({
      first_name:      participant.first_name      || '',
      last_name:       participant.last_name       || '',
      display_name:    participant.display_name    || '',
      bio:             participant.bio             || '',
      location:        participant.location        || '',
      affiliation:     participant.affiliation     || '',
      craft_primary:   participant.craft_primary   || '',
      craft_secondary: participant.craft_secondary || '',
      skills:          arrToStr(participant.skills),
      interests:       arrToStr(participant.interests),
    })
    setSaveError(null)
    setEditing(false)
  }

  return (
    <div style={s.page}>
      <div style={s.card}>

        {/* Avatar + name header */}
        <div style={s.avatarRow}>
          <div style={s.avatar}>{initials}</div>
          <div style={s.avatarMeta}>
            <div style={s.name}>{displayName || '—'}</div>
            <div style={s.typeBadge}>{typeLabel}</div>
          </div>
          {!editing && (
            <button style={s.editBtn} onClick={() => setEditing(true)}>Edit</button>
          )}
        </div>

        {/* Fields — view or edit */}
        {editing ? (
          <div style={s.editForm}>
            {/* Locked identity block */}
            <div style={s.lockedBlock}>
              <div style={s.lockedLabel}>Account — read only</div>
              <div style={s.lockedGrid}>
                <LockedRow label="Type"       value={typeLabel} />
                <LockedRow label="Account"    value={participant.account_type || '—'} />
                <LockedRow label="Membership" value={membershipLabel} />
                <LockedRow label="Email"      value={participant.email || '—'} />
              </div>
            </div>

            {/* Editable name */}
            <FieldRow label="First Name">
              <input style={s.input} value={fields.first_name} onChange={e => handleField('first_name', e.target.value)} placeholder="First name" />
            </FieldRow>
            <FieldRow label="Last Name">
              <input style={s.input} value={fields.last_name} onChange={e => handleField('last_name', e.target.value)} placeholder="Last name" />
            </FieldRow>
            <FieldRow label="Display Name">
              <input style={s.input} value={fields.display_name} onChange={e => handleField('display_name', e.target.value)} placeholder="How your name appears" />
              <span style={s.fieldNote}>Auto-derived from First + Last</span>
            </FieldRow>

            {/* Craft */}
            <FieldRow label="Craft (primary)">
              <input style={s.input} value={fields.craft_primary} onChange={e => handleField('craft_primary', e.target.value)} placeholder="e.g. Engineering, Design, Writing" />
            </FieldRow>
            <FieldRow label="Craft (secondary)">
              <input style={s.input} value={fields.craft_secondary} onChange={e => handleField('craft_secondary', e.target.value)} placeholder="Secondary craft or discipline" />
            </FieldRow>

            {/* Context */}
            <FieldRow label="Location">
              <input style={s.input} value={fields.location} onChange={e => handleField('location', e.target.value)} placeholder="City, region" />
            </FieldRow>
            <FieldRow label="Affiliation">
              <input style={s.input} value={fields.affiliation} onChange={e => handleField('affiliation', e.target.value)} placeholder="Organization or studio" />
            </FieldRow>
            <FieldRow label="Bio">
              <textarea style={s.textarea} value={fields.bio} onChange={e => handleField('bio', e.target.value)} placeholder="Brief bio" rows={3} />
            </FieldRow>

            {/* Arrays */}
            <FieldRow label="Skills">
              <input style={s.input} value={fields.skills} onChange={e => handleField('skills', e.target.value)} placeholder="Comma-separated list" />
              <span style={s.fieldNote}>e.g. React, SQL, facilitation</span>
            </FieldRow>
            <FieldRow label="Interests">
              <input style={s.input} value={fields.interests} onChange={e => handleField('interests', e.target.value)} placeholder="Comma-separated list" />
              <span style={s.fieldNote}>e.g. governance, regenerative finance, ceramics</span>
            </FieldRow>

            {saveError && <div style={s.error}>{saveError}</div>}
            <div style={s.formActions}>
              <button style={s.cancelBtn} onClick={handleCancel} disabled={saving}>Cancel</button>
              <button style={{ ...s.saveBtn, ...(saving ? s.saveBtnDisabled : {}) }} onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </div>
        ) : (
          <div style={s.detailGrid}>
            {/* Identity — non-editable */}
            <ProfileSection label="Account">
              <ProfileRow label="Type"         value={typeLabel} />
              <ProfileRow label="Account"      value={participant.account_type || '—'} />
              <ProfileRow label="Membership"   value={membershipLabel} />
              <ProfileRow label="Email"        value={participant.email || '—'} />
            </ProfileSection>

            {/* Name */}
            <ProfileSection label="Name">
              <ProfileRow label="First"        value={participant.first_name   || '—'} />
              <ProfileRow label="Last"         value={participant.last_name    || '—'} />
              <ProfileRow label="Display"      value={participant.display_name || '—'} />
            </ProfileSection>

            {/* Craft + context */}
            <ProfileSection label="Craft">
              <ProfileRow label="Primary"      value={participant.craft_primary   || '—'} />
              <ProfileRow label="Secondary"    value={participant.craft_secondary || '—'} />
            </ProfileSection>

            <ProfileSection label="Context">
              <ProfileRow label="Location"     value={participant.location    || '—'} />
              <ProfileRow label="Affiliation"  value={participant.affiliation || '—'} />
              {participant.bio && (
                <div style={s.wideRow}>
                  <span style={s.label}>Bio</span>
                  <span style={s.bioValue}>{participant.bio}</span>
                </div>
              )}
            </ProfileSection>

            {/* Arrays */}
            {(participant.skills?.length > 0 || participant.interests?.length > 0) && (
              <ProfileSection label="Background">
                {participant.skills?.length > 0 && (
                  <ProfileRow label="Skills"     value={arrToStr(participant.skills)} />
                )}
                {participant.interests?.length > 0 && (
                  <ProfileRow label="Interests"  value={arrToStr(participant.interests)} />
                )}
              </ProfileSection>
            )}
          </div>
        )}

        <div style={s.divider} />

        {/* Orientation */}
        <div style={s.section}>
          <div style={s.sectionTitle}>Orientation</div>
          <p style={s.sectionDesc}>Re-run the intranet orientation to revisit the cooperative structure and navigation guide.</p>
          {showRerunConfirm ? (
            <div style={s.confirmRow}>
              <span style={s.confirmText}>Re-run orientation?</span>
              <button style={s.confirmBtn} onClick={() => { setShowRerunConfirm(false); onRerunOnboarding() }}>Yes, re-run</button>
              <button style={s.cancelBtn2} onClick={() => setShowRerunConfirm(false)}>Cancel</button>
            </div>
          ) : (
            <button style={s.rerunBtn} onClick={() => setShowRerunConfirm(true)}>Re-run orientation</button>
          )}
        </div>

        <div style={s.divider} />
        <div style={s.section}>
          <button style={s.signOutBtn} onClick={signOut}>Sign out</button>
        </div>
      </div>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProfileSection({ label, children }) {
  return (
    <div style={s.sectionBlock}>
      <div style={s.sectionHeader}>{label}</div>
      {children}
    </div>
  )
}

function ProfileRow({ label, value }) {
  return (
    <div style={s.row}>
      <span style={s.label}>{label}</span>
      <span style={s.value}>{value}</span>
    </div>
  )
}

function FieldRow({ label, children }) {
  return (
    <div style={s.fieldRow}>
      <span style={{ ...s.label, paddingTop: '0.45rem' }}>{label}</span>
      <div style={s.fieldRight}>{children}</div>
    </div>
  )
}

function LockedRow({ label, value }) {
  return (
    <div style={s.lockedRow}>
      <span style={s.lockedRowLabel}>{label}</span>
      <span style={s.lockedRowValue}>{value}</span>
    </div>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = {
  page: { padding: '2rem', maxWidth: '560px' },
  card: {
    background: 'var(--color-surface, #13131a)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '10px',
    padding: '1.75rem',
  },
  avatarRow: {
    display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.75rem',
  },
  avatar: {
    width: '56px', height: '56px', borderRadius: '50%',
    background: 'rgba(196,149,106,0.15)', border: '2px solid rgba(196,149,106,0.3)',
    color: 'var(--gold, #c4956a)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: '1.25rem', fontWeight: 700, flexShrink: 0,
  },
  avatarMeta: { display: 'flex', flexDirection: 'column', gap: '0.3rem', flex: 1 },
  name: { fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary, #e8e0d4)' },
  typeBadge: {
    fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase',
    color: 'var(--gold, #c4956a)', background: 'rgba(196,149,106,0.12)',
    border: '1px solid rgba(196,149,106,0.2)', borderRadius: '4px',
    padding: '0.15rem 0.5rem', display: 'inline-block',
  },
  editBtn: {
    background: 'none', border: '1px solid rgba(255,255,255,0.12)',
    color: 'var(--text-secondary, #aaa)', fontSize: '0.8rem',
    padding: '0.35rem 0.85rem', borderRadius: '5px', cursor: 'pointer', flexShrink: 0,
  },

  // View mode
  detailGrid: { display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  sectionBlock: { display: 'flex', flexDirection: 'column', gap: '0' },
  sectionHeader: {
    fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase',
    color: 'var(--text-dim, #555)', marginBottom: '0.35rem',
  },
  row: {
    display: 'grid', gridTemplateColumns: '100px 1fr', gap: '1rem', alignItems: 'baseline',
    padding: '0.3rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
  },
  wideRow: {
    display: 'grid', gridTemplateColumns: '100px 1fr', gap: '1rem',
    padding: '0.3rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
  },
  label: {
    fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-dim, #666)',
    letterSpacing: '0.04em', textTransform: 'uppercase',
  },
  value: { fontSize: '0.875rem', color: 'var(--text-secondary, #aaa)' },
  bioValue: { fontSize: '0.875rem', color: 'var(--text-secondary, #aaa)', lineHeight: 1.55 },

  // Edit mode
  editForm: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  lockedBlock: {
    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '6px', padding: '0.75rem', marginBottom: '0.5rem',
  },
  lockedLabel: {
    fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
    color: 'var(--text-dim, #555)', marginBottom: '0.5rem',
  },
  lockedGrid: { display: 'flex', flexDirection: 'column', gap: '0.15rem' },
  lockedRow: {
    display: 'grid', gridTemplateColumns: '90px 1fr', gap: '0.75rem',
  },
  lockedRowLabel: {
    fontSize: '0.7rem', color: 'var(--text-dim, #555)', fontWeight: 600,
    textTransform: 'uppercase', letterSpacing: '0.04em',
  },
  lockedRowValue: { fontSize: '0.8rem', color: 'rgba(200,192,182,0.5)' },
  fieldRow: {
    display: 'grid', gridTemplateColumns: '110px 1fr', gap: '1rem', alignItems: 'start',
    padding: '0.3rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
  },
  fieldRight: { display: 'flex', flexDirection: 'column', gap: '0.2rem' },
  input: {
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '5px', color: 'var(--text-primary, #e8e0d4)',
    fontSize: '0.875rem', padding: '0.4rem 0.6rem', width: '100%',
    outline: 'none', boxSizing: 'border-box',
  },
  textarea: {
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '5px', color: 'var(--text-primary, #e8e0d4)',
    fontSize: '0.875rem', padding: '0.4rem 0.6rem', width: '100%',
    outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box',
  },
  fieldNote: { fontSize: '0.7rem', color: 'var(--text-dim, #555)' },
  error: { color: '#f87171', fontSize: '0.8rem', marginTop: '0.25rem' },
  formActions: { display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.75rem' },
  cancelBtn: {
    background: 'none', border: '1px solid rgba(255,255,255,0.12)',
    color: 'var(--text-secondary, #aaa)', fontSize: '0.825rem',
    padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer',
  },
  saveBtn: {
    background: 'var(--gold, #c4956a)', border: 'none', color: '#0a0a0f',
    fontSize: '0.825rem', fontWeight: 700, padding: '0.5rem 1.2rem',
    borderRadius: '6px', cursor: 'pointer',
  },
  saveBtnDisabled: { opacity: 0.6, cursor: 'default' },

  // Bottom sections
  divider: { height: '1px', background: 'rgba(255,255,255,0.06)', margin: '1.25rem 0' },
  section: { display: 'flex', flexDirection: 'column', gap: '0.6rem' },
  sectionTitle: {
    fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em',
    textTransform: 'uppercase', color: 'var(--text-dim, #666)',
  },
  sectionDesc: { margin: 0, fontSize: '0.825rem', color: 'var(--text-secondary, #aaa)', lineHeight: 1.55 },
  rerunBtn: {
    background: 'rgba(196,149,106,0.1)', border: '1px solid rgba(196,149,106,0.25)',
    color: 'var(--gold, #c4956a)', fontSize: '0.825rem', fontWeight: 600,
    padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', alignSelf: 'flex-start',
  },
  confirmRow: { display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' },
  confirmText: { fontSize: '0.825rem', color: 'var(--text-secondary, #aaa)' },
  confirmBtn: {
    background: 'var(--gold, #c4956a)', border: 'none', color: '#0a0a0f',
    fontSize: '0.8rem', fontWeight: 700, padding: '0.4rem 0.9rem',
    borderRadius: '5px', cursor: 'pointer',
  },
  cancelBtn2: {
    background: 'none', border: '1px solid rgba(255,255,255,0.12)',
    color: 'var(--text-secondary, #aaa)', fontSize: '0.8rem',
    padding: '0.4rem 0.9rem', borderRadius: '5px', cursor: 'pointer',
  },
  signOutBtn: {
    background: 'none', border: '1px solid rgba(255,100,100,0.2)',
    color: 'rgba(255,120,120,0.7)', fontSize: '0.825rem',
    padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', alignSelf: 'flex-start',
  },
}
