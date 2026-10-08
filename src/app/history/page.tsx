'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'

interface FoodLogItem {
  id: string
  quantity: number
  food: { calories: number; unit: string }
}

interface DayLog {
  id: string
  date: string
  items: FoodLogItem[]
}

function calcTotal(items: FoodLogItem[]) {
  return items.reduce((s, i) => {
    const isPer100 = i.food.unit === 'g' || i.food.unit === 'ml'
    const calories = isPer100 ? (i.food.calories * i.quantity) / 100 : (i.food.calories * i.quantity)
    return s + Math.round(calories)
  }, 0)
}

function IconChevron({ dir }: { dir: 'right' }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  )
}

export default function HistoryPage() {
  const [logs, setLogs] = useState<DayLog[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/logs').then(r => r.json()),
      fetch('/api/profile').then(r => r.json())
    ])
    .then(([logsData, profileData]) => {
      setLogs(logsData)
      setProfile(profileData)
      setLoading(false)
    })
  }, [])

  let maintenanceTdee = 2000
  if (profile && profile.weight && profile.height && profile.age) {
    let bmr = (10 * profile.weight) + (6.25 * profile.height) - (5 * profile.age)
    if (profile.gender === 'M') bmr += 5
    else bmr -= 161

    const multipliers: Record<string, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    }
    maintenanceTdee = Math.round(bmr * (multipliers[profile.activityLevel] || 1.2))
  }

  const TARGET = profile?.dailyTarget || maintenanceTdee

  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h1 className="page-title">Historique</h1>
          <div className="page-subtitle">Vos 30 derniers jours de suivi</div>
        </div>

        <div className="page-body">
          {loading ? (
            <div className="empty-state"><div className="empty-state-text">Chargement...</div></div>
          ) : logs.length === 0 ? (
            <div className="empty-state">
              <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <div className="empty-state-title">Aucun historique</div>
              <div className="empty-state-text">Commencez à enregistrer vos repas</div>
            </div>
          ) : (
            <>
              {/* Summary card */}
              <div className="card history-summary" style={{ marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-3)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Jours enregistrés</div>
                  <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -1 }}>{logs.length}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-3)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Moyenne kcal/jour</div>
                  <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -1 }}>
                    {Math.round(logs.reduce((s, l) => s + calcTotal(l.items), 0) / logs.length)}
                    <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--color-text-3)' }}> kcal</span>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-3)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Objectif atteint</div>
                  <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -1, color: 'var(--color-accent)' }}>
                    {logs.filter(l => {
                      const t = calcTotal(l.items)
                      return t >= TARGET * 0.85 && t <= TARGET * 1.15
                    }).length}
                    <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--color-text-3)' }}> jours</span>
                  </div>
                </div>
              </div>

              <div className="history-list">
                {logs.map(log => {
                  const d = new Date(log.date)
                  const total = calcTotal(log.items)
                  const pct = Math.min(100, Math.round((total / TARGET) * 100))
                  const diffKcal = total - maintenanceTdee
                  const weightDiff = diffKcal / 7700
                  const weightDiffStr = weightDiff > 0 ? `+${weightDiff.toFixed(2)}kg` : `${weightDiff.toFixed(2)}kg`
                  
                  return (
                    <a key={log.id} href={`/?date=${log.date.split('T')[0]}`} className="history-item">
                      <div className="history-date">
                        <div className="history-day">{d.getUTCDate()}</div>
                        <div className="history-month">{months[d.getUTCMonth()]}</div>
                      </div>
                      <div className="history-divider" />
                      <div className="history-info">
                        <div className="history-cals" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div>{total} <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--color-text-3)' }}>kcal</span></div>
                          <div style={{ fontSize: 12, fontWeight: 600, padding: '2px 6px', borderRadius: '4px', background: 'var(--color-surface-2)', color: weightDiff > 0 ? 'var(--color-danger)' : (weightDiff < 0 ? 'var(--color-accent)' : 'var(--color-text-3)') }}>
                            {weightDiffStr}
                          </div>
                        </div>
                        <div className="history-items-count">{log.items.length} aliment{log.items.length > 1 ? 's' : ''}</div>
                        <div className="history-bar">
                          <div
                            className="history-bar-fill"
                            style={{
                              width: `${pct}%`,
                              background: total > TARGET * 1.15
                                ? 'var(--color-danger)'
                                : total >= TARGET * 0.85
                                ? 'var(--color-accent)'
                                : 'var(--color-carbs)',
                            }}
                          />
                        </div>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-3)', minWidth: 32, textAlign: 'right' }}>
                        {pct}%
                      </div>
                      <IconChevron dir="right" />
                    </a>
                  )
                })}
              </div>
            </>

          )}
        </div>
      </main>
    </div>
  )
}
