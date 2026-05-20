/**
 * Enroll.jsx — Board member enrollment flow
 *
 * Route: /intranet/enroll
 *
 * This is the governance act: board members read, comment on, and vote to
 * ratify the Bylaws and Membership Agreement. Enrollment is resumable —
 * users can navigate away at any step and return to pick up where they left off.
 *
 * Steps:
 *   0  Identity         — profile completion
 *   1  Bylaws read      — read + optional comment
 *   2  Bylaws vote      — Full Consent vote
 *   3  MA read          — read + optional comment
 *   4  MA vote          — Full Consent vote
 *   5  Orientation      — capital account overview
 *   6  Complete         — confirmation
 */

import { useState } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import { useEnrollment, STEPS, DOCUMENTS, VOTE_OPTIONS } from '../hooks/useEnrollment.js'

// ─── Utility: navigate without reload ────────────────────────────────────────
function navigate(path) {
  window.history.pushState(null, '', `/intranet/${path ? path + '/' : ''}`)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

// ─── Small SVG icon ───────────────────────────────────────────────────────────
function Icon({ d, size = 16, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  )
}

const ICONS = {
  person:  'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  doc:     'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM14 2v6h6M16 13H8M16 17H8M10 9H8',
  check:   'M20 6L9 17l-5-5',
  vote:    'M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z',
  capital: 'M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
  done:    'M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4 12 14.01l-3-3',
  exit:    'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
  warn:    'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01',
  ext:     'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3',
}

const STEP_ICONS = ['person', 'doc', 'vote', 'doc', 'vote', 'capital', 'done']

// ─── Progress rail ────────────────────────────────────────────────────────────
function ProgressRail({ currentStep, totalSteps, onStepClick, state }) {
  return (
    <div style={s.rail}>
      {STEPS.map((step, i) => {
        const done = i < currentStep
        const active = i === currentStep
        const accessible = i <= currentStep // can click back to previous steps

        return (
          <div
            key={step.id}
            style={{ ...s.railItem, cursor: accessible ? 'pointer' : 'default' }}
            onClick={() => accessible && onStepClick(i)}
            title={`${step.label}${step.phase ? ' — ' + step.phase : ''}`}
          >
            <div style={{
              ...s.railDot,
              ...(active ? s.railDotActive : done ? s.railDotDone : s.railDotFuture),
            }}>
              {done ? (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              ) : (
                <span style={{ fontSize: '0.6rem', fontWeight: 700, lineHeight: 1 }}>{i + 1}</span>
              )}
            </div>
            <div style={s.railLabel}>
              <span style={{ ...s.railPhase, ...(active ? { color: 'var(--gold)' } : done ? { color: 'var(--moss)' } : {}) }}>
                {step.phase}
              </span>
              <span style={{ ...s.railName, ...(active ? { color: 'var(--text-primary)' } : {}) }}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ ...s.railLine, ...(done ? s.railLineDone : {}) }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Save & Exit bar ──────────────────────────────────────────────────────────
function ExitBar({ onExit }) {
  return (
    <div style={s.exitBar}>
      <span style={s.exitText}>Progress is saved automatically. You can return to this page at any time.</span>
      <button style={s.exitBtn} onClick={onExit}>
        <Icon d={ICONS.exit} size={14} />
        Save &amp; exit
      </button>
    </div>
  )
}

// ─── Step shell ───────────────────────────────────────────────────────────────
function StepShell({ icon, phase, title, desc, children, onBack, onNext, nextLabel, nextDisabled, saving, stepIndex }) {
  return (
    <div style={s.stepShell}>
      <div style={s.stepHeader}>
        <div style={s.stepIconWrap}>
          <Icon d={ICONS[icon]} size={22} color="var(--gold)" />
        </div>
        <div>
          {phase && <p style={s.stepPhase}>{phase}</p>}
          <h2 style={s.stepTitle}>{title}</h2>
          {desc && <p style={s.stepDesc}>{desc}</p>}
        </div>
      </div>
      <div style={s.stepBody}>{children}</div>
      <div style={s.stepFooter}>
        {onBack && (
          <button style={s.btnSecondary} onClick={onBack}>← Back</button>
        )}
        <div style={{ flex: 1 }} />
        {onNext && (
          <button
            style={{ ...s.btnPrimary, ...(nextDisabled || saving ? s.btnDisabled : {}) }}
            onClick={onNext}
            disabled={nextDisabled || saving}
          >
            {saving ? 'Saving…' : (nextLabel || 'Continue →')}
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Step 0: Identity ─────────────────────────────────────────────────────────
function StepIdentity({ state, setState, goNext, participant, updateProfile }) {
  const [form, setForm] = useState({
    first_name:  participant?.first_name  || '',
    last_name:   participant?.last_name   || '',
    bio:         participant?.bio         || '',
    role:        participant?.role        || '',
    location:    participant?.location    || '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const isValid = form.first_name.trim() && form.last_name.trim()

  async function handleNext() {
    if (!isValid) return
    setSaving(true)
    setError(null)
    const { error } = await updateProfile(form)
    setSaving(false)
    if (error) {
      setError('Could not save profile. Try again.')
      return
    }
    setState(s => ({ ...s, profileSaved: true }))
    goNext()
  }

  return (
    <StepShell
      icon="person"
      phase="Step 1 of 7"
      title="Your Identity"
      desc="This is how you'll appear in the cooperative record. Complete your name — other fields help the membership but aren't required to continue."
      onNext={handleNext}
      nextDisabled={!isValid}
      saving={saving}
    >
      <div style={s.formGrid}>
        <div style={s.fieldGroup}>
          <label style={s.label}>First name <span style={s.required}>*</span></label>
          <input
            style={s.input}
            value={form.first_name}
            onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))}
            placeholder="Given name"
            autoFocus
          />
        </div>
        <div style={s.fieldGroup}>
          <label style={s.label}>Last name <span style={s.required}>*</span></label>
          <input
            style={s.input}
            value={form.last_name}
            onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))}
            placeholder="Family name"
          />
        </div>
        <div style={{ ...s.fieldGroup, gridColumn: '1 / -1' }}>
          <label style={s.label}>Role / title</label>
          <input
            style={s.input}
            value={form.role}
            onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
            placeholder="e.g. Ventures & Operations Steward"
          />
        </div>
        <div style={{ ...s.fieldGroup, gridColumn: '1 / -1' }}>
          <label style={s.label}>Location</label>
          <input
            style={s.input}
            value={form.location}
            onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
            placeholder="e.g. Boulder, CO"
          />
        </div>
        <div style={{ ...s.fieldGroup, gridColumn: '1 / -1' }}>
          <label style={s.label}>Bio</label>
          <textarea
            style={{ ...s.input, ...s.textarea }}
            value={form.bio}
            onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
            placeholder="A sentence or two about your work and practice…"
            rows={3}
          />
        </div>
      </div>
      {error && <div style={s.errorNotice}>{error}</div>}
    </StepShell>
  )
}

// ─── Step 1 / 3: Document Read ────────────────────────────────────────────────
function StepDocumentRead({ doc, readFlag, commentField, stepNum, totalSteps, onMarkRead, onCommentChange, onNext, onBack, saving }) {
  const [confirmedRead, setConfirmedRead] = useState(readFlag)

  function handleNext() {
    if (!confirmedRead) return
    onMarkRead()
    onNext()
  }

  return (
    <StepShell
      icon="doc"
      phase={`Step ${stepNum} of ${totalSteps}`}
      title={doc.title}
      desc={doc.description}
      onBack={onBack}
      onNext={handleNext}
      nextDisabled={!confirmedRead}
      saving={saving}
    >
      {/* Blocking issues notice */}
      {doc.blockingIssues > 0 && (
        <div style={s.warnBox}>
          <Icon d={ICONS.warn} size={14} color="var(--rust)" />
          <div>
            <span style={s.warnTitle}>{doc.blockingIssues} blocking issue{doc.blockingIssues !== 1 ? 's' : ''} identified</span>
            <span style={s.warnBody}> — {doc.totalIssues} issues total. Ratification requires these to be resolved first. Review the analysis before voting.</span>
          </div>
        </div>
      )}

      {/* Document links */}
      <div style={s.docLinks}>
        <a href={doc.url} target="_blank" rel="noopener" style={s.docLinkPrimary}>
          <Icon d={ICONS.ext} size={13} />
          Open {doc.title} ↗
        </a>
        <a href={doc.analysisUrl} target="_blank" rel="noopener" style={s.docLinkSecondary}>
          View legal analysis ({doc.totalIssues} issues) ↗
        </a>
      </div>

      {/* Meta */}
      <div style={s.docMeta}>
        <span style={s.docMetaItem}>Version: <strong>{doc.version}</strong></span>
        <span style={s.docMetaItem}>Drafted: <strong>{doc.drafted}</strong></span>
        <span style={s.docMetaItem}>Status: <strong style={{ color: 'var(--gold)' }}>Draft — not yet ratified</strong></span>
      </div>

      {/* Comment */}
      <div style={s.fieldGroup}>
        <label style={s.label}>Advisory comment <span style={s.optional}>(optional)</span></label>
        <p style={s.fieldHint}>Your comment is advisory — it does not block ratification. Share questions, concerns, or suggested amendments for the record.</p>
        <textarea
          style={{ ...s.input, ...s.textarea }}
          value={commentField}
          onChange={e => onCommentChange(e.target.value)}
          placeholder="Your observations, questions, or concerns about this document…"
          rows={4}
        />
      </div>

      {/* Read confirmation */}
      <label style={s.checkRow}>
        <input
          type="checkbox"
          checked={confirmedRead}
          onChange={e => setConfirmedRead(e.target.checked)}
          style={s.checkbox}
        />
        <span style={s.checkLabel}>I have read this document and am ready to vote</span>
      </label>
    </StepShell>
  )
}

// ─── Step 2 / 4: Document Vote ────────────────────────────────────────────────
function StepDocumentVote({ doc, voteField, reasonField, stepNum, totalSteps, onVoteChange, onReasonChange, onNext, onBack, saving }) {
  const selected = VOTE_OPTIONS.find(o => o.value === voteField)

  const needsReason = voteField === 'stand-aside' || voteField === 'object'
  const isValid = !!voteField && (!needsReason || reasonField.trim().length > 0)

  return (
    <StepShell
      icon="vote"
      phase={`Step ${stepNum} of ${totalSteps}`}
      title={`Vote — ${doc.title}`}
      desc="Full Consent model: your vote is Consent, Stand-aside, or Object. An unresolved Object blocks ratification. Stand-aside records your reservation without blocking. Quorum: 5 of 8 organizers."
      onBack={onBack}
      onNext={onNext}
      nextDisabled={!isValid}
      saving={saving}
    >
      {/* Vote options */}
      <div style={s.voteGrid}>
        {VOTE_OPTIONS.map(opt => {
          const isSelected = voteField === opt.value
          return (
            <button
              key={opt.value}
              style={{
                ...s.voteOption,
                ...(isSelected ? { ...s.voteOptionSelected, borderColor: opt.color, background: `${opt.color}10` } : {}),
              }}
              onClick={() => onVoteChange(opt.value)}
            >
              <div style={{ ...s.voteLabel, ...(isSelected ? { color: opt.color } : {}) }}>
                {isSelected && <span style={{ color: opt.color, marginRight: '0.35rem' }}>◉</span>}
                {!isSelected && <span style={{ color: 'var(--text-dim)', marginRight: '0.35rem' }}>○</span>}
                {opt.label}
              </div>
              <p style={s.voteDesc}>{opt.description}</p>
            </button>
          )
        })}
      </div>

      {/* Reason field — required for stand-aside / object */}
      {needsReason && (
        <div style={{ ...s.fieldGroup, marginTop: '1.25rem' }}>
          <label style={s.label}>
            {voteField === 'object' ? 'Objection' : 'Reservation'} <span style={s.required}>*</span>
          </label>
          <p style={s.fieldHint}>
            {voteField === 'object'
              ? 'State your principled objection clearly. What specific harm or principle does this document violate? What would need to change?'
              : 'Note your reservation for the record. This does not block ratification.'}
          </p>
          <textarea
            style={{ ...s.input, ...s.textarea }}
            value={reasonField}
            onChange={e => onReasonChange(e.target.value)}
            placeholder={voteField === 'object' ? 'My objection is…' : 'My reservation is…'}
            rows={4}
            autoFocus
          />
        </div>
      )}

      {/* Summary of selected vote */}
      {voteField && (
        <div style={{ ...s.warnBox, borderColor: `${selected?.color}40`, background: `${selected?.color}08`, marginTop: '1rem' }}>
          <div style={{ color: selected?.color, fontSize: '0.8rem', fontWeight: 600 }}>
            Your vote: {selected?.label}
          </div>
        </div>
      )}
    </StepShell>
  )
}

// ─── Step 5: Capital Account Orientation ──────────────────────────────────────
function StepOrientation({ onBack, onNext, state, setState }) {
  function handleNext() {
    setState(s => ({ ...s, orientationRead: true }))
    onNext()
  }

  return (
    <StepShell
      icon="capital"
      phase="Step 6 of 7"
      title="Capital Account"
      desc="A brief orientation to how your economic stake in the cooperative is tracked."
      onBack={onBack}
      onNext={handleNext}
      nextLabel="Complete enrollment →"
    >
      <div style={s.orientationBlocks}>

        <div style={s.orientBlock}>
          <h3 style={s.orientTitle}>What is a capital account?</h3>
          <p style={s.orientBody}>
            Every cooperative member holds a capital account — a running record of your economic stake.
            It accumulates as you contribute labor, generate revenue, or invest cash, and decrements
            as the cooperative distributes patronage back to you.
          </p>
        </div>

        <div style={s.orientBlock}>
          <h3 style={s.orientTitle}>IRC § 704(b) — Partnership Tax Treatment</h3>
          <p style={s.orientBody}>
            RegenHub elected Subchapter K partnership tax treatment. Under IRC § 704(b),
            your capital account is the governing record of your economic rights. This gives the
            cooperative flexibility to recognize multiple forms of contribution and allocate
            surplus with precision.
          </p>
        </div>

        <div style={s.orientBlock}>
          <h3 style={s.orientTitle}>Patronage formula (proposed)</h3>
          <div style={s.formulaGrid}>
            <div style={s.formulaItem}>
              <span style={{ ...s.formulaShare, color: 'var(--gold)' }}>40%</span>
              <span style={s.formulaLabel}>Labor</span>
            </div>
            <div style={s.formulaItem}>
              <span style={{ ...s.formulaShare, color: 'var(--moss)' }}>30%</span>
              <span style={s.formulaLabel}>Revenue</span>
            </div>
            <div style={s.formulaItem}>
              <span style={{ ...s.formulaShare, color: 'var(--sky)' }}>20%</span>
              <span style={s.formulaLabel}>Capital</span>
            </div>
            <div style={s.formulaItem}>
              <span style={{ ...s.formulaShare, color: 'var(--text-muted)' }}>10%</span>
              <span style={s.formulaLabel}>Community</span>
            </div>
          </div>
          <p style={{ ...s.orientBody, marginTop: '0.75rem' }}>
            This formula is a proposed parameter — it requires ratification. The weights
            and mechanics are subject to organizer review. No patronage has been allocated yet.
          </p>
        </div>

        <div style={s.orientBlock}>
          <h3 style={s.orientTitle}>Cloud Credits</h3>
          <p style={s.orientBody}>
            1 CLOUD ≈ $0.10. Cloud credits are the cooperative's unit of exchange for compute.
            They appear in your capital account as a resource balance.
          </p>
        </div>

        <div style={s.orientBlock}>
          <h3 style={s.orientTitle}>Where to find it</h3>
          <p style={s.orientBody}>
            Your capital account is under <strong style={{ color: 'var(--gold)' }}>Account</strong> in
            the sidebar. Labor contributions, patronage allocations, and your account balance
            are all tracked there.
          </p>
        </div>

      </div>
    </StepShell>
  )
}

// ─── Step 6: Complete ─────────────────────────────────────────────────────────
function StepComplete({ participant, state }) {
  const bylawsVote = VOTE_OPTIONS.find(o => o.value === state.bylawsVote)
  const maVote = VOTE_OPTIONS.find(o => o.value === state.maVote)

  return (
    <div style={s.completeWrap}>
      <div style={s.completeMark}>
        <Icon d={ICONS.done} size={32} color="var(--moss)" />
      </div>
      <h2 style={s.completeTitle}>Enrollment complete</h2>
      <p style={s.completeDesc}>
        Your profile is set, your votes are on record, and your capital account orientation is done.
        Welcome to the cooperative, {participant?.first_name || participant?.name?.split(' ')[0] || 'organizer'}.
      </p>

      {/* Vote summary */}
      <div style={s.voteSummary}>
        <p style={s.voteSummaryTitle}>Your votes</p>
        <div style={s.voteSummaryRow}>
          <span style={s.voteSummaryDoc}>Bylaws v.2</span>
          <span style={{ color: bylawsVote?.color || 'var(--text-dim)', fontWeight: 600, fontSize: '0.85rem' }}>
            {bylawsVote?.label || 'Not voted'}
          </span>
        </div>
        <div style={s.voteSummaryRow}>
          <span style={s.voteSummaryDoc}>Membership Agreement v.2</span>
          <span style={{ color: maVote?.color || 'var(--text-dim)', fontWeight: 600, fontSize: '0.85rem' }}>
            {maVote?.label || 'Not voted'}
          </span>
        </div>
      </div>

      <p style={s.completeNote}>
        Ratification requires 5 of 8 organizers to consent with zero unresolved objects.
        You can view the current vote tally under <strong style={{ color: 'var(--gold)' }}>Governance</strong> once tallying is active.
      </p>

      <div style={s.completeActions}>
        <button style={s.btnPrimary} onClick={() => navigate('')}>
          Go to dashboard →
        </button>
        <button style={s.btnSecondary} onClick={() => navigate('account')}>
          View my account
        </button>
      </div>
    </div>
  )
}

// ─── Main Enroll page ─────────────────────────────────────────────────────────
export default function Enroll() {
  const { participant, updateProfile } = useAuth()
  const enrollment = useEnrollment(participant?.id)
  const { state, setState, goNext, goBack, goToStep, saveComment, saveVote, markEnrollmentComplete } = enrollment

  const [saving, setSaving] = useState(false)

  // ── Step handlers ────────────────────────────────────────────────────────────

  // Bylaws read step
  async function handleBylawsReadNext() {
    setSaving(true)
    if (state.bylawsComment && !state.bylawsCommentSaved) {
      await saveComment(DOCUMENTS.bylaws.id, state.bylawsComment)
      setState(s => ({ ...s, bylawsCommentSaved: true }))
    }
    setState(s => ({ ...s, bylawsRead: true }))
    setSaving(false)
    goNext()
  }

  // Bylaws vote step
  async function handleBylawsVoteNext() {
    if (!state.bylawsVote) return
    setSaving(true)
    await saveVote(DOCUMENTS.bylaws.id, state.bylawsVote, state.bylawsVoteReason)
    setState(s => ({ ...s, bylawsVoteSaved: true }))
    setSaving(false)
    goNext()
  }

  // MA read step
  async function handleMaReadNext() {
    setSaving(true)
    if (state.maComment && !state.maCommentSaved) {
      await saveComment(DOCUMENTS.ma.id, state.maComment)
      setState(s => ({ ...s, maCommentSaved: true }))
    }
    setState(s => ({ ...s, maRead: true }))
    setSaving(false)
    goNext()
  }

  // MA vote step
  async function handleMaVoteNext() {
    if (!state.maVote) return
    setSaving(true)
    await saveVote(DOCUMENTS.ma.id, state.maVote, state.maVoteReason)
    setState(s => ({ ...s, maVoteSaved: true }))
    setSaving(false)
    goNext()
  }

  // Final complete
  async function handleOrientationNext() {
    setSaving(true)
    await markEnrollmentComplete()
    setSaving(false)
    goNext()
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  const step = state.step

  return (
    <div style={s.page}>

      {/* Page header */}
      <div style={s.pageHeader}>
        <div>
          <p style={s.pageEyebrow}>Board enrollment</p>
          <h1 style={s.pageTitle}>Ratification &amp; enrollment</h1>
          <p style={s.pageSubtitle}>
            Read the governing documents, record your advisory comments, and cast your
            ratification vote. This is the governance act.
          </p>
        </div>
        {/* Quorum indicator */}
        <div style={s.quorumBox}>
          <span style={s.quorumLabel}>Quorum</span>
          <span style={s.quorumValue}>5 / 8</span>
          <span style={s.quorumSub}>organizers required</span>
        </div>
      </div>

      {/* Save & Exit bar */}
      {step < 6 && <ExitBar onExit={() => navigate('')} />}

      {/* Progress rail */}
      {step < 6 && (
        <ProgressRail
          currentStep={step}
          totalSteps={STEPS.length}
          onStepClick={goToStep}
          state={state}
        />
      )}

      {/* Step content */}
      <div style={s.stepArea}>

        {step === 0 && (
          <StepIdentity
            state={state}
            setState={setState}
            goNext={goNext}
            participant={participant}
            updateProfile={updateProfile}
          />
        )}

        {step === 1 && (
          <StepDocumentRead
            doc={DOCUMENTS.bylaws}
            readFlag={state.bylawsRead}
            commentField={state.bylawsComment}
            stepNum={2}
            totalSteps={7}
            onMarkRead={() => setState(s => ({ ...s, bylawsRead: true }))}
            onCommentChange={v => setState(s => ({ ...s, bylawsComment: v }))}
            onNext={handleBylawsReadNext}
            onBack={goBack}
            saving={saving}
          />
        )}

        {step === 2 && (
          <StepDocumentVote
            doc={DOCUMENTS.bylaws}
            voteField={state.bylawsVote}
            reasonField={state.bylawsVoteReason}
            stepNum={3}
            totalSteps={7}
            onVoteChange={v => setState(s => ({ ...s, bylawsVote: v }))}
            onReasonChange={v => setState(s => ({ ...s, bylawsVoteReason: v }))}
            onNext={handleBylawsVoteNext}
            onBack={goBack}
            saving={saving}
          />
        )}

        {step === 3 && (
          <StepDocumentRead
            doc={DOCUMENTS.ma}
            readFlag={state.maRead}
            commentField={state.maComment}
            stepNum={4}
            totalSteps={7}
            onMarkRead={() => setState(s => ({ ...s, maRead: true }))}
            onCommentChange={v => setState(s => ({ ...s, maComment: v }))}
            onNext={handleMaReadNext}
            onBack={goBack}
            saving={saving}
          />
        )}

        {step === 4 && (
          <StepDocumentVote
            doc={DOCUMENTS.ma}
            voteField={state.maVote}
            reasonField={state.maVoteReason}
            stepNum={5}
            totalSteps={7}
            onVoteChange={v => setState(s => ({ ...s, maVote: v }))}
            onReasonChange={v => setState(s => ({ ...s, maVoteReason: v }))}
            onNext={handleMaVoteNext}
            onBack={goBack}
            saving={saving}
          />
        )}

        {step === 5 && (
          <StepOrientation
            onBack={goBack}
            onNext={handleOrientationNext}
            state={state}
            setState={setState}
          />
        )}

        {step >= 6 && (
          <StepComplete participant={participant} state={state} />
        )}

      </div>
    </div>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = {
  page: {
    padding: '2rem',
    maxWidth: '780px',
  },

  // Page header
  pageHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '1.5rem',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
  },
  pageEyebrow: {
    fontSize: '0.68rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    color: 'var(--gold)',
    margin: '0 0 0.4rem',
  },
  pageTitle: {
    fontSize: '1.6rem',
    fontWeight: 800,
    letterSpacing: '-0.03em',
    color: 'var(--text-primary)',
    margin: '0 0 0.5rem',
  },
  pageSubtitle: {
    fontSize: '0.85rem',
    color: 'var(--text-nav)',
    margin: 0,
    lineHeight: 1.6,
    maxWidth: '520px',
  },
  quorumBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: 'rgba(255,255,255,0.025)',
    border: '1px solid var(--hud-border)',
    borderRadius: '8px',
    padding: '0.75rem 1.25rem',
    minWidth: '110px',
    flexShrink: 0,
  },
  quorumLabel: {
    fontSize: '0.6rem',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    color: 'var(--text-nav)',
    marginBottom: '0.2rem',
  },
  quorumValue: {
    fontSize: '1.5rem',
    fontWeight: 800,
    color: 'var(--gold)',
    letterSpacing: '-0.03em',
    lineHeight: 1,
  },
  quorumSub: {
    fontSize: '0.62rem',
    color: 'var(--text-nav)',
    marginTop: '0.2rem',
    textAlign: 'center',
  },

  // Exit bar
  exitBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1rem',
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid var(--hud-border)',
    borderRadius: '6px',
    padding: '0.6rem 1rem',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
  },
  exitText: {
    fontSize: '0.75rem',
    color: 'var(--text-nav)',
  },
  exitBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    background: 'none',
    border: '1px solid var(--hud-border)',
    color: 'var(--text-nav)',
    fontSize: '0.75rem',
    padding: '0.35rem 0.75rem',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'color 0.12s, border-color 0.12s',
  },

  // Progress rail
  rail: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 0,
    marginBottom: '2rem',
    overflowX: 'auto',
    paddingBottom: '0.25rem',
  },
  railItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
    flex: 1,
    minWidth: '70px',
  },
  railDot: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    flexShrink: 0,
    transition: 'all 0.2s',
  },
  railDotActive: {
    background: 'var(--gold)',
    color: '#0a0a0f',
    boxShadow: '0 0 0 3px rgba(196,149,106,0.2)',
  },
  railDotDone: {
    background: 'var(--moss)',
    color: '#fff',
  },
  railDotFuture: {
    background: 'rgba(255,255,255,0.08)',
    color: 'var(--text-dim)',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  railLabel: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: '0.35rem',
    gap: '1px',
  },
  railPhase: {
    fontSize: '0.58rem',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: 'var(--text-dim)',
    fontWeight: 700,
  },
  railName: {
    fontSize: '0.65rem',
    color: 'var(--text-nav)',
    textAlign: 'center',
  },
  railLine: {
    position: 'absolute',
    top: '12px',
    left: '50%',
    right: '-50%',
    height: '1px',
    background: 'rgba(255,255,255,0.1)',
    zIndex: 0,
  },
  railLineDone: {
    background: 'var(--moss)',
    opacity: 0.5,
  },

  // Step shell
  stepArea: {
    marginTop: '0.5rem',
  },
  stepShell: {
    background: 'rgba(255,255,255,0.025)',
    border: '1px solid var(--hud-border)',
    borderRadius: '10px',
    overflow: 'hidden',
  },
  stepHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1rem',
    padding: '1.5rem 1.75rem 1.25rem',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
  },
  stepIconWrap: {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    background: 'rgba(196,149,106,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stepPhase: {
    fontSize: '0.65rem',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: 'var(--gold)',
    margin: '0 0 0.2rem',
    fontWeight: 700,
  },
  stepTitle: {
    fontSize: '1.15rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    margin: '0 0 0.4rem',
    letterSpacing: '-0.02em',
  },
  stepDesc: {
    fontSize: '0.825rem',
    color: 'var(--text-nav)',
    margin: 0,
    lineHeight: 1.6,
  },
  stepBody: {
    padding: '1.5rem 1.75rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  stepFooter: {
    display: 'flex',
    alignItems: 'center',
    padding: '1rem 1.75rem',
    borderTop: '1px solid rgba(255,255,255,0.04)',
    gap: '0.75rem',
  },

  // Buttons
  btnPrimary: {
    background: 'var(--gold)',
    border: 'none',
    color: '#0a0a0f',
    fontSize: '0.85rem',
    fontWeight: 700,
    padding: '0.6rem 1.4rem',
    borderRadius: '6px',
    cursor: 'pointer',
    letterSpacing: '0.01em',
    transition: 'opacity 0.15s',
  },
  btnSecondary: {
    background: 'none',
    border: '1px solid rgba(255,255,255,0.12)',
    color: 'var(--text-nav)',
    fontSize: '0.85rem',
    padding: '0.55rem 1rem',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  btnDisabled: {
    opacity: 0.4,
    cursor: 'default',
  },

  // Form elements
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
  },
  label: {
    fontSize: '0.8rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  required: {
    color: 'var(--rust)',
    marginLeft: '2px',
  },
  optional: {
    color: 'var(--text-dim)',
    fontWeight: 400,
    fontSize: '0.75rem',
  },
  fieldHint: {
    fontSize: '0.75rem',
    color: 'var(--text-nav)',
    margin: 0,
    lineHeight: 1.5,
  },
  input: {
    background: 'var(--app-bg)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '6px',
    color: 'var(--text-primary)',
    fontSize: '0.875rem',
    padding: '0.6rem 0.85rem',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    transition: 'border-color 0.12s',
  },
  textarea: {
    resize: 'vertical',
    lineHeight: 1.6,
  },
  errorNotice: {
    padding: '0.65rem 0.9rem',
    background: 'rgba(154,90,90,0.1)',
    border: '1px solid rgba(154,90,90,0.25)',
    borderRadius: '6px',
    color: 'var(--rust)',
    fontSize: '0.8rem',
  },

  // Warning box
  warnBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.6rem',
    padding: '0.75rem 1rem',
    background: 'rgba(154,90,90,0.08)',
    border: '1px solid rgba(154,90,90,0.2)',
    borderRadius: '6px',
  },
  warnTitle: {
    fontSize: '0.8rem',
    fontWeight: 700,
    color: 'var(--rust)',
  },
  warnBody: {
    fontSize: '0.8rem',
    color: 'var(--text-nav)',
  },

  // Document links
  docLinks: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  docLinkPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    background: 'rgba(196,149,106,0.1)',
    border: '1px solid rgba(196,149,106,0.25)',
    borderRadius: '6px',
    color: 'var(--gold)',
    fontSize: '0.82rem',
    fontWeight: 600,
    padding: '0.5rem 0.9rem',
    textDecoration: 'none',
    transition: 'background 0.12s',
  },
  docLinkSecondary: {
    color: 'var(--text-nav)',
    fontSize: '0.78rem',
    textDecoration: 'none',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    paddingBottom: '1px',
  },
  docMeta: {
    display: 'flex',
    gap: '1.5rem',
    flexWrap: 'wrap',
  },
  docMetaItem: {
    fontSize: '0.75rem',
    color: 'var(--text-nav)',
  },

  // Read confirmation checkbox
  checkRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    cursor: 'pointer',
    padding: '0.75rem 1rem',
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '6px',
  },
  checkbox: {
    width: '16px',
    height: '16px',
    accentColor: 'var(--gold)',
    cursor: 'pointer',
    flexShrink: 0,
  },
  checkLabel: {
    fontSize: '0.85rem',
    color: 'var(--text-primary)',
    fontWeight: 500,
  },

  // Vote grid
  voteGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem',
  },
  voteOption: {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '8px',
    padding: '0.85rem 1rem',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'border-color 0.15s, background 0.15s',
    width: '100%',
  },
  voteOptionSelected: {
    // dynamic colors applied inline
  },
  voteLabel: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.9rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    marginBottom: '0.3rem',
  },
  voteDesc: {
    fontSize: '0.78rem',
    color: 'var(--text-nav)',
    margin: 0,
    lineHeight: 1.55,
  },

  // Orientation
  orientationBlocks: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  orientBlock: {
    padding: '1rem 1.25rem',
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: '8px',
  },
  orientTitle: {
    fontSize: '0.85rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    margin: '0 0 0.5rem',
  },
  orientBody: {
    fontSize: '0.825rem',
    color: 'var(--text-nav)',
    margin: 0,
    lineHeight: 1.65,
  },
  formulaGrid: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
    marginTop: '0.25rem',
  },
  formulaItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.15rem',
  },
  formulaShare: {
    fontSize: '1.4rem',
    fontWeight: 800,
    letterSpacing: '-0.03em',
    lineHeight: 1,
  },
  formulaLabel: {
    fontSize: '0.68rem',
    color: 'var(--text-nav)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    fontWeight: 600,
  },

  // Complete screen
  completeWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: '3rem 2rem',
    background: 'rgba(255,255,255,0.025)',
    border: '1px solid var(--hud-border)',
    borderRadius: '10px',
  },
  completeMark: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    background: 'rgba(106,138,94,0.12)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1.25rem',
  },
  completeTitle: {
    fontSize: '1.5rem',
    fontWeight: 800,
    letterSpacing: '-0.03em',
    color: 'var(--text-primary)',
    margin: '0 0 0.75rem',
  },
  completeDesc: {
    fontSize: '0.9rem',
    color: 'var(--text-nav)',
    maxWidth: '420px',
    lineHeight: 1.65,
    margin: '0 0 1.75rem',
  },
  voteSummary: {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '8px',
    padding: '1rem 1.5rem',
    width: '100%',
    maxWidth: '360px',
    marginBottom: '1.25rem',
    textAlign: 'left',
  },
  voteSummaryTitle: {
    fontSize: '0.65rem',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: 'var(--text-dim)',
    margin: '0 0 0.75rem',
    fontWeight: 700,
  },
  voteSummaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.4rem 0',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
  },
  voteSummaryDoc: {
    fontSize: '0.8rem',
    color: 'var(--text-nav)',
  },
  completeNote: {
    fontSize: '0.78rem',
    color: 'var(--text-nav)',
    maxWidth: '420px',
    lineHeight: 1.65,
    margin: '0 0 1.75rem',
  },
  completeActions: {
    display: 'flex',
    gap: '0.75rem',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },

  // Misc
  rust: { color: 'var(--rust)' },
  moss: { color: 'var(--moss)' },
  sky:  { color: 'var(--sky)'  },
  gold: { color: 'var(--gold)' },
  'text-muted': { color: 'var(--text-muted)' },
}
