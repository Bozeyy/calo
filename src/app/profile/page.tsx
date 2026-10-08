'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState({
    weight: '',
    height: '',
    age: '',
    gender: 'M',
    activityLevel: 'sedentary',
    dailyTarget: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
  const [calculatedTdee, setCalculatedTdee] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/profile')
      .then(res => {
        if (!res.ok) throw new Error()
        return res.json()
      })
      .then(data => {
        setProfile({
          weight: data.weight?.toString() || '',
          height: data.height?.toString() || '',
          age: data.age?.toString() || '',
          gender: data.gender || 'M',
          activityLevel: data.activityLevel || 'sedentary',
          dailyTarget: data.dailyTarget?.toString() || ''
        })
        setLoading(false)
      })
      .catch(() => router.push('/login'))
  }, [router])

  const calculateTDEE = () => {
    const w = parseFloat(profile.weight)
    const h = parseFloat(profile.height)
    const a = parseInt(profile.age)

    if (!w || !h || !a) {
      setStatusMessage({
        text: 'Veuillez renseigner votre poids, taille et âge pour calculer votre métabolisme.',
        type: 'error'
      })
      return
    }

    // Mifflin-St Jeor Equation
    let bmr = (10 * w) + (6.25 * h) - (5 * a)
    if (profile.gender === 'M') {
      bmr += 5
    } else {
      bmr -= 161
    }

    const multipliers: Record<string, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    }

    const tdee = Math.round(bmr * (multipliers[profile.activityLevel] || 1.2))
    setCalculatedTdee(tdee)
    setProfile(prev => ({ ...prev, dailyTarget: tdee.toString() }))
    setStatusMessage({
      text: `Calcul terminé ! Vos besoins estimés sont de ${tdee} kcal/jour. Vous pouvez enregistrer ce choix.`,
      type: 'success'
    })
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setStatusMessage(null)

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      })
      if (!res.ok) throw new Error()
      setStatusMessage({
        text: 'Votre profil et vos objectifs ont été mis à jour avec succès !',
        type: 'success'
      })
    } catch {
      setStatusMessage({
        text: 'Une erreur est survenue lors de l\'enregistrement de vos modifications.',
        type: 'error'
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="app-shell">
        <Sidebar />
        <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: 'var(--color-text-3)', fontSize: '14px' }}>Chargement du profil...</div>
        </main>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div className="page-header-row">
            <div>
              <h1 className="page-title">Mon Profil</h1>
              <p className="page-subtitle">Configurez votre métabolisme et votre objectif calorique journalier</p>
            </div>
          </div>
        </div>

        <div className="page-body" style={{ maxWidth: '680px', margin: '0 auto', width: '100%' }}>
          <form onSubmit={handleSave}>
            {/* Carte Calculateur Métabolique */}
            <div className="profile-card">
              <div className="profile-card-header">
                <div className="profile-card-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 14 14" />
                  </svg>
                </div>
                <div>
                  <h2 className="profile-card-title">Paramètres Corporels & Métabolisme</h2>
                  <p className="profile-card-desc">Formule de Mifflin-St Jeor pour estimer votre dépense énergétique (TDEE)</p>
                </div>
              </div>

              <div className="profile-card-body">
                {/* Sélecteur Sexe */}
                <div className="form-group">
                  <label className="form-label">Sexe biologique</label>
                  <div className="profile-segmented-control">
                    <button
                      type="button"
                      className={`profile-segment-btn ${profile.gender === 'M' ? 'active' : ''}`}
                      onClick={() => setProfile({ ...profile, gender: 'M' })}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="10" cy="14" r="5" />
                        <line x1="19" y1="5" x2="13.6" y2="10.4" />
                        <line x1="19" y1="5" x2="14" y2="5" />
                        <line x1="19" y1="5" x2="19" y2="10" />
                      </svg>
                      Homme
                    </button>
                    <button
                      type="button"
                      className={`profile-segment-btn ${profile.gender === 'F' ? 'active' : ''}`}
                      onClick={() => setProfile({ ...profile, gender: 'F' })}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="9" r="5" />
                        <line x1="12" y1="14" x2="12" y2="21" />
                        <line x1="9" y1="18" x2="15" y2="18" />
                      </svg>
                      Femme
                    </button>
                  </div>
                </div>

                {/* Mesures physiques */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Poids</label>
                    <div className="profile-input-group">
                      <input
                        type="number"
                        step="0.1"
                        className="form-input"
                        value={profile.weight}
                        onChange={e => setProfile({ ...profile, weight: e.target.value })}
                        placeholder="70"
                        style={{ paddingRight: '40px' }}
                      />
                      <span className="profile-input-suffix">kg</span>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Taille</label>
                    <div className="profile-input-group">
                      <input
                        type="number"
                        className="form-input"
                        value={profile.height}
                        onChange={e => setProfile({ ...profile, height: e.target.value })}
                        placeholder="175"
                        style={{ paddingRight: '40px' }}
                      />
                      <span className="profile-input-suffix">cm</span>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Âge</label>
                    <div className="profile-input-group">
                      <input
                        type="number"
                        className="form-input"
                        value={profile.age}
                        onChange={e => setProfile({ ...profile, age: e.target.value })}
                        placeholder="28"
                        style={{ paddingRight: '44px' }}
                      />
                      <span className="profile-input-suffix">ans</span>
                    </div>
                  </div>
                </div>

                {/* Niveau d'activité */}
                <div className="form-group">
                  <label className="form-label">Niveau d&apos;activité quotidienne</label>
                  <select
                    className="form-select"
                    value={profile.activityLevel}
                    onChange={e => setProfile({ ...profile, activityLevel: e.target.value })}
                  >
                    <option value="sedentary">Sédentaire (Bureau, peu ou pas de sport)</option>
                    <option value="light">Légèrement actif (1 à 3 séances de sport / sem)</option>
                    <option value="moderate">Modérément actif (3 à 5 séances modérées / sem)</option>
                    <option value="active">Très actif (6 à 7 séances intenses / sem)</option>
                    <option value="very_active">Extrêmement actif (Métier physique + entraînement)</option>
                  </select>
                </div>

                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{ alignSelf: 'flex-start', display: 'inline-flex', gap: '8px', padding: '10px 16px', fontWeight: 600 }}
                  onClick={calculateTDEE}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="4" y="2" width="16" height="20" rx="2" />
                    <line x1="8" y1="6" x2="16" y2="6" />
                    <line x1="16" y1="14" x2="16" y2="18" />
                    <path d="M16 10h.01" />
                    <path d="M12 10h.01" />
                    <path d="M8 10h.01" />
                    <path d="M12 14h.01" />
                    <path d="M8 14h.01" />
                    <path d="M12 18h.01" />
                    <path d="M8 18h.01" />
                  </svg>
                  Calculer mes besoins journaliers
                </button>
              </div>
            </div>

            {/* Carte Objectif Calorique Quotidien */}
            <div className="profile-card">
              <div className="profile-card-header">
                <div className="profile-card-icon" style={{ background: '#fdf6ec', color: '#c47c2e' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </div>
                <div>
                  <h2 className="profile-card-title">Cible Calorique Journalière</h2>
                  <p className="profile-card-desc">L&apos;objectif retenu pour votre tableau de bord quotidien</p>
                </div>
              </div>

              <div className="profile-card-body">
                <div className="profile-target-box">
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-accent)' }}>
                      Cible de consommation
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-2)', marginTop: '2px' }}>
                      Cette valeur met à jour votre jauge et vos calculs sur l&apos;accueil.
                    </div>
                  </div>
                  <div className="profile-input-group" style={{ maxWidth: '180px' }}>
                    <input
                      type="number"
                      className="form-input"
                      value={profile.dailyTarget}
                      onChange={e => setProfile({ ...profile, dailyTarget: e.target.value })}
                      placeholder="2000"
                      style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-accent)', paddingRight: '48px' }}
                    />
                    <span className="profile-input-suffix">kcal</span>
                  </div>
                </div>

                {calculatedTdee && (
                  <div style={{ fontSize: '13px', color: 'var(--color-text-2)', background: 'var(--color-surface-2)', padding: '12px 14px', borderRadius: 'var(--radius-sm)' }}>
                    💡 <strong>Conseil :</strong> Pour une perte de poids durable, visez un déficit d&apos;environ 300 à 500 kcal ({calculatedTdee - 400} kcal). Pour une prise de masse, un surplus de 200 à 300 kcal ({calculatedTdee + 250} kcal).
                  </div>
                )}
              </div>
            </div>

            {/* Notification message */}
            {statusMessage && (
              <div className={`profile-banner-alert ${statusMessage.type}`} style={{ marginBottom: '20px' }}>
                {statusMessage.type === 'success' ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                )}
                <span>{statusMessage.text}</span>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
              style={{ width: '100%', padding: '12px', fontSize: '15px', fontWeight: 600, justifyContent: 'center' }}
            >
              {saving ? 'Enregistrement en cours...' : 'Enregistrer mon profil'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}

