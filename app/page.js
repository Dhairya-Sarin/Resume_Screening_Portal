'use client'
import { useState, useEffect, useRef } from 'react'
import { RESUMES, JOB_DESCRIPTIONS } from '../lib/resumes'

const RESUMES_PER_EVALUATOR = 20

// ============================================================
// SEEDED RANDOM — same email always gets same resumes
// ============================================================
function seededShuffle(arr, seed) {
  const shuffled = [...arr]
  let h = 0
  for (let i = 0; i < seed.length; i++) {
    h = ((h << 5) - h + seed.charCodeAt(i)) | 0
  }
  for (let i = shuffled.length - 1; i > 0; i--) {
    h = ((h << 5) - h + i) | 0
    const j = Math.abs(h) % (i + 1)
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function selectResumesForEvaluator(email) {
  // Ensure balanced category coverage: 5 per category from 4 categories = 20
  const categories = [...new Set(RESUMES.map(r => r.category))]
  const perCat = Math.floor(RESUMES_PER_EVALUATOR / categories.length)

  const selected = []
  for (const cat of categories) {
    const catResumes = RESUMES.filter(r => r.category === cat)
    const shuffled = seededShuffle(catResumes, email + cat)
    selected.push(...shuffled.slice(0, perCat))
  }

  // Fill remainder if categories don't divide evenly
  const remaining = RESUMES_PER_EVALUATOR - selected.length
  if (remaining > 0) {
    const unused = RESUMES.filter(r => !selected.find(s => s.id === r.id))
    const extra = seededShuffle(unused, email + 'extra')
    selected.push(...extra.slice(0, remaining))
  }

  // Final shuffle so categories are mixed
  return seededShuffle(selected, email + 'final')
}

// ============================================================
// RATING SCALE COMPONENT
// ============================================================
function RatingScale({ name, value, onChange, leftLabel, rightLabel }) {
  return (
    <div>
      <div style={{
        display: 'flex', gap: 0, marginTop: 4,
        borderRadius: 8, overflow: 'hidden',
        border: '1px solid var(--border)',
      }}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            style={{
              flex: 1, padding: '12px 0',
              border: 'none',
              borderRight: n < 10 ? '1px solid var(--border)' : 'none',
              background: value === n ? 'var(--accent)' : 'white',
              color: value === n ? 'white' : 'var(--ink)',
              fontFamily: 'DM Sans, sans-serif',
              fontSize: 14, fontWeight: value === n ? 700 : 500,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {n}
          </button>
        ))}
      </div>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        fontSize: 11, color: 'var(--muted)', marginTop: 4, padding: '0 4px',
      }}>
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
    </div>
  )
}

// ============================================================
// PROGRESS BAR
// ============================================================
function ProgressBar({ current, total, phase }) {
  const pct = phase === 'intro' ? 0 : phase === 'done' ? 100 : ((current) / total) * 100
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: 'white', borderBottom: '1px solid var(--border)',
      padding: '8px 24px',
      display: 'flex', alignItems: 'center', gap: 16,
    }}>
      <div style={{
        flex: 1, height: 4, background: '#e8e4de', borderRadius: 2, overflow: 'hidden',
      }}>
        <div style={{
          width: `${pct}%`, height: '100%',
          background: 'var(--accent)',
          borderRadius: 2,
          transition: 'width 0.4s ease',
        }} />
      </div>
      <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>
        {phase === 'intro' ? 'Getting started' :
          phase === 'done' ? 'Complete!' :
            `Resume ${current + 1} of ${total}`}
      </span>
    </div>
  )
}

// ============================================================
// MAIN PAGE
// ============================================================
export default function Home() {
  const [phase, setPhase] = useState('intro') // intro | evaluating | done
  const [currentIdx, setCurrentIdx] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [myResumes, setMyResumes] = useState([])
  const topRef = useRef(null)

  // Evaluator info
  const [evaluator, setEvaluator] = useState({
    name: '', email: '', role: '', years: '', categories: [],
  })

  // All evaluations — initialized when resumes are assigned
  const [evaluations, setEvaluations] = useState([])

  const current = evaluations[currentIdx]
  const resume = myResumes[currentIdx]
  const totalResumes = myResumes.length

  useEffect(() => {
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [currentIdx, phase])

  // Assign resumes when evaluator starts
  const startEvaluation = () => {
    const assigned = selectResumesForEvaluator(evaluator.email.toLowerCase().trim())
    setMyResumes(assigned)
    setEvaluations(assigned.map(r => ({
      resume_id: r.id,
      category: r.category,
      overall_score: null,
      experience_score: null,
      education_score: null,
      skills_score: null,
      communication_score: null,
      justification: '',
    })))
    setPhase('evaluating')
  }

  // Update current evaluation
  const updateField = (field, value) => {
    const updated = [...evaluations]
    updated[currentIdx] = { ...updated[currentIdx], [field]: value }
    setEvaluations(updated)
  }

  // Validate current evaluation
  const isCurrentValid = () => {
    if (!current) return false
    return current.overall_score && current.experience_score && current.education_score &&
      current.skills_score && current.communication_score && current.justification.trim().length > 10
  }

  // Validate evaluator info
  const isEvaluatorValid = () => {
    return evaluator.name.trim() && evaluator.email.trim() &&
      evaluator.role.trim() && evaluator.years
  }

  // Navigate
  const goNext = () => {
    if (currentIdx < totalResumes - 1) {
      setCurrentIdx(currentIdx + 1)
    } else {
      handleSubmit()
    }
  }

  const goPrev = () => {
    if (currentIdx > 0) setCurrentIdx(currentIdx - 1)
  }

  // Submit all
  const handleSubmit = async () => {
    setSubmitting(true)
    setError(null)
    try {
      const payload = {
        evaluator,
        assigned_resume_ids: myResumes.map(r => r.id),
        evaluations,
        submitted_at: new Date().toISOString(),
        version: '2.0',
      }

      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error('Submission failed')
      setPhase('done')
    } catch (err) {
      setError('Submission failed. Please try again or contact the researcher.')
      setSubmitting(false)
    }
  }

  // ===================== INTRO SCREEN =====================
  if (phase === 'intro') {
    return (
      <>
        <ProgressBar current={0} total={RESUMES_PER_EVALUATOR} phase="intro" />
        <div ref={topRef} style={{ maxWidth: 680, margin: '0 auto', padding: '80px 20px 60px' }}>
          {/* Header */}
          <div style={{
            background: 'var(--accent)', borderRadius: '14px 14px 0 0',
            padding: '44px 40px 36px', color: 'white', position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: -50, right: -50,
              width: 180, height: 180, borderRadius: '50%',
              background: 'rgba(255,255,255,0.06)',
            }} />
            <div style={{
              display: 'inline-block', padding: '3px 12px', marginBottom: 16,
              background: 'rgba(255,255,255,0.15)', borderRadius: 20,
              fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase',
            }}>
              Academic Research Study
            </div>
            <h1 style={{
              fontFamily: 'Source Serif 4, serif', fontSize: 28, fontWeight: 700,
              lineHeight: 1.2, marginBottom: 10, letterSpacing: -0.3,
            }}>
              Resume Evaluation for<br />AI Hiring Research
            </h1>
            <p style={{ fontSize: 14, opacity: 0.88, lineHeight: 1.6, maxWidth: 520 }}>
              Your expert judgment will be compared against AI model evaluations
              to study how artificial intelligence assesses job candidates.
            </p>
          </div>

          {/* Info */}
          <div style={{
            background: 'var(--paper)', border: '1px solid var(--border)',
            borderTop: 'none', padding: '28px 40px',
          }}>
            <div style={{
              background: '#f0f4ff', border: '1px solid #c5d3f0', borderRadius: 8,
              padding: '14px 18px', fontSize: 13, color: '#2c3e6b', marginBottom: 24,
            }}>
              <strong>What you'll do:</strong> Evaluate <strong>{RESUMES_PER_EVALUATOR} resumes</strong> against
              job descriptions using a 1-10 scoring rubric. Takes about <strong>15-20 minutes</strong>.
              Each person receives a different random set of resumes to maximize coverage.
              You'll be acknowledged in the published paper.
            </div>

            <h3 style={{
              fontFamily: 'Source Serif 4, serif', fontSize: 17, fontWeight: 600, marginBottom: 16,
            }}>
              Scoring Rubric
            </h3>
            {[
              ['1-2', 'Poor fit', 'Major gaps, wrong field, severely underqualified'],
              ['3-4', 'Below average', 'Some relevant experience but significant gaps'],
              ['5-6', 'Average', 'Meets some requirements but not a strong match'],
              ['7-8', 'Good fit', 'Meets most requirements, interview-worthy'],
              ['9-10', 'Excellent', 'Meets or exceeds all requirements, top candidate'],
            ].map(([range, label, desc]) => (
              <div key={range} style={{
                display: 'flex', gap: 14, padding: '10px 0',
                borderBottom: '1px solid #eee', fontSize: 13,
              }}>
                <span style={{
                  fontFamily: 'JetBrains Mono, monospace', fontWeight: 600,
                  color: 'var(--accent)', minWidth: 36,
                }}>{range}</span>
                <span><strong>{label}.</strong> {desc}</span>
              </div>
            ))}
          </div>

          {/* Evaluator Form */}
          <div style={{
            background: 'var(--paper)', border: '1px solid var(--border)',
            borderTop: 'none', padding: '28px 40px',
          }}>
            <h3 style={{
              fontFamily: 'Source Serif 4, serif', fontSize: 17, fontWeight: 600, marginBottom: 20,
            }}>
              About You
            </h3>

            {[
              { key: 'name', label: 'Full Name', placeholder: 'For paper acknowledgment', type: 'text' },
              { key: 'email', label: 'Email', placeholder: 'your@email.com — also determines which resumes you review', type: 'email' },
              { key: 'role', label: 'Current Role', placeholder: 'e.g., Senior Recruiter, HR Manager', type: 'text' },
            ].map(({ key, label, placeholder, type }) => (
              <div key={key} style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                  {label} <span style={{ color: 'var(--error)' }}>*</span>
                </label>
                <input
                  type={type}
                  placeholder={placeholder}
                  value={evaluator[key]}
                  onChange={e => setEvaluator({ ...evaluator, [key]: e.target.value })}
                  style={{
                    width: '100%', padding: '10px 14px',
                    border: '1px solid var(--border)', borderRadius: 6,
                    fontFamily: 'DM Sans, sans-serif', fontSize: 14, background: 'white',
                  }}
                />
              </div>
            ))}

            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                Years of hiring experience <span style={{ color: 'var(--error)' }}>*</span>
              </label>
              <select
                value={evaluator.years}
                onChange={e => setEvaluator({ ...evaluator, years: e.target.value })}
                style={{
                  width: '100%', padding: '10px 14px',
                  border: '1px solid var(--border)', borderRadius: 6,
                  fontFamily: 'DM Sans, sans-serif', fontSize: 14, background: 'white',
                }}
              >
                <option value="">Select...</option>
                <option>Less than 1 year</option>
                <option>1-3 years</option>
                <option>3-5 years</option>
                <option>5-10 years</option>
                <option>10+ years</option>
              </select>
            </div>
          </div>

          {/* Start Button */}
          <div style={{
            background: 'var(--paper)', border: '1px solid var(--border)',
            borderTop: 'none', borderRadius: '0 0 14px 14px',
            padding: '24px 40px 32px', textAlign: 'center',
          }}>
            <button
              disabled={!isEvaluatorValid()}
              onClick={startEvaluation}
              style={{
                padding: '14px 48px', fontSize: 15, fontWeight: 600,
                fontFamily: 'DM Sans, sans-serif',
                background: isEvaluatorValid() ? 'var(--accent)' : 'var(--border)',
                color: isEvaluatorValid() ? 'white' : 'var(--muted)',
                border: 'none', borderRadius: 8, cursor: isEvaluatorValid() ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s',
              }}
            >
              Begin Evaluation →
            </button>
            {!isEvaluatorValid() && (
              <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>
                Fill in all fields above to continue
              </p>
            )}
            <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 12 }}>
              You'll be assigned {RESUMES_PER_EVALUATOR} resumes from a pool of {RESUMES.length}.
              Each evaluator gets a unique set to maximize research coverage.
            </p>
          </div>
        </div>
      </>
    )
  }

  // ===================== DONE SCREEN =====================
  if (phase === 'done') {
    return (
      <>
        <ProgressBar current={totalResumes} total={totalResumes} phase="done" />
        <div ref={topRef} style={{
          maxWidth: 580, margin: '0 auto', padding: '120px 20px 60px', textAlign: 'center',
        }}>
          <div style={{
            background: 'var(--paper)', border: '1px solid var(--border)',
            borderRadius: 14, padding: '60px 40px', boxShadow: 'var(--card-shadow)',
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'var(--accent-light)', color: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px', fontSize: 28,
            }}>✓</div>
            <h2 style={{
              fontFamily: 'Source Serif 4, serif', fontSize: 24, fontWeight: 700, marginBottom: 12,
            }}>Thank You, {evaluator.name.split(' ')[0]}!</h2>
            <p style={{ color: 'var(--muted)', fontSize: 14, maxWidth: 400, margin: '0 auto', lineHeight: 1.7 }}>
              Your {totalResumes} evaluations have been recorded. Your expert judgment
              will be compared against AI model outputs to study how AI assesses candidates.
              You'll be acknowledged in the published paper and will receive early access to findings.
            </p>
          </div>
        </div>
      </>
    )
  }

  // ===================== EVALUATION SCREEN =====================
  if (!resume || !current) return null

  const jobDesc = JOB_DESCRIPTIONS[resume.category] || ''

  return (
    <>
      <ProgressBar current={currentIdx} total={totalResumes} phase="evaluating" />
      <div ref={topRef} style={{ maxWidth: 720, margin: '0 auto', padding: '60px 20px 100px' }}>

        <div style={{
          background: 'var(--paper)', border: '1px solid var(--border)',
          borderRadius: 14, overflow: 'hidden', boxShadow: 'var(--card-shadow)',
        }}>

          {/* Category Badge + Counter */}
          <div style={{
            padding: '20px 36px', borderBottom: '1px solid var(--border)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{
              padding: '4px 14px', background: 'var(--accent-light)',
              color: 'var(--accent)', borderRadius: 20,
              fontSize: 12, fontWeight: 600, letterSpacing: 0.3,
            }}>
              {resume.category.replace(/-/g, ' ')}
            </span>
            <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 500 }}>
              {currentIdx + 1} / {totalResumes}
            </span>
          </div>

          {/* Job Description */}
          <div style={{ padding: '24px 36px', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{
              fontFamily: 'Source Serif 4, serif', fontSize: 15, fontWeight: 600,
              marginBottom: 10, color: 'var(--accent)',
            }}>
              Job Description
            </h3>
            <div style={{
              background: 'var(--accent-light)', border: '1px solid #c2d4bf',
              borderRadius: 8, padding: '16px 20px',
              fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre-wrap',
            }}>
              {jobDesc}
            </div>
          </div>

          {/* Resume */}
          <div style={{ padding: '24px 36px', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{
              fontFamily: 'Source Serif 4, serif', fontSize: 15, fontWeight: 600,
              marginBottom: 10,
            }}>
              Resume
            </h3>
            <div
              dangerouslySetInnerHTML={{ __html: resume.html || resume.text }}
              style={{
                background: 'white', border: '1px solid var(--border)',
                borderRadius: 8, padding: '20px 24px',
                maxHeight: 500, overflowY: 'auto',
                fontSize: 13, lineHeight: 1.6, color: '#333',
              }}
            />
            </div>

            {/* Scoring */}
            <div style={{ padding: '28px 36px' }}>
              <h3 style={{
                fontFamily: 'Source Serif 4, serif', fontSize: 15, fontWeight: 600,
                marginBottom: 20,
              }}>
                Your Evaluation
              </h3>

              {[
                { key: 'overall_score', label: 'Overall Fit', left: 'Poor fit', right: 'Excellent fit' },
                { key: 'experience_score', label: 'Relevant Experience', left: 'No relevant experience', right: 'Exceeds requirements' },
                { key: 'education_score', label: 'Education Match', left: 'Wrong field / no degree', right: 'Perfect match' },
                { key: 'skills_score', label: 'Skills Alignment', left: 'No matching skills', right: 'All skills + extras' },
                { key: 'communication_score', label: 'Communication Quality', left: 'Poorly written', right: 'Exceptionally clear' },
              ].map(({ key, label, left, right }) => (
                <div key={key} style={{ marginBottom: 22 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, display: 'block' }}>
                    {label} <span style={{ color: 'var(--error)', fontSize: 11 }}>*</span>
                  </label>
                  <RatingScale
                    name={`${key}_${currentIdx}`}
                    value={current[key]}
                    onChange={v => updateField(key, v)}
                    leftLabel={left}
                    rightLabel={right}
                  />
                </div>
              ))}

              <div style={{ marginBottom: 8 }}>
                <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block' }}>
                  Justification <span style={{ color: 'var(--error)', fontSize: 11 }}>*</span>
                </label>
                <textarea
                  placeholder="Briefly explain your overall score in 2-3 sentences. What stood out positively or negatively?"
                  value={current.justification}
                  onChange={e => updateField('justification', e.target.value)}
                  style={{
                    width: '100%', minHeight: 90, padding: '12px 14px',
                    border: '1px solid var(--border)', borderRadius: 6,
                    fontFamily: 'DM Sans, sans-serif', fontSize: 13, resize: 'vertical',
                    lineHeight: 1.6,
                  }}
                />
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
                  {current.justification.length} characters
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div style={{
              padding: '20px 36px 28px',
              borderTop: '1px solid var(--border)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <button
                onClick={goPrev}
                disabled={currentIdx === 0}
                style={{
                  padding: '10px 24px', fontSize: 13, fontWeight: 600,
                  fontFamily: 'DM Sans, sans-serif',
                  background: 'white', color: currentIdx === 0 ? 'var(--border)' : 'var(--ink)',
                  border: '1px solid var(--border)', borderRadius: 6,
                  cursor: currentIdx === 0 ? 'not-allowed' : 'pointer',
                }}
              >
                ← Previous
              </button>

              {error && (
                <span style={{ fontSize: 12, color: 'var(--error)' }}>{error}</span>
              )}

              <button
                onClick={goNext}
                disabled={!isCurrentValid() || submitting}
                style={{
                  padding: '10px 28px', fontSize: 13, fontWeight: 600,
                  fontFamily: 'DM Sans, sans-serif',
                  background: isCurrentValid() ? 'var(--accent)' : 'var(--border)',
                  color: isCurrentValid() ? 'white' : 'var(--muted)',
                  border: 'none', borderRadius: 6,
                  cursor: isCurrentValid() ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s',
                }}
              >
                {submitting ? 'Submitting...' :
                  currentIdx === totalResumes - 1 ? 'Submit All ✓' : 'Next Resume →'}
              </button>
            </div>
          </div>
        </div>
      </>
      )
}
