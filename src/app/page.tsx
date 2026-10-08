'use client'

import { useState, useEffect, useCallback } from 'react'
import Sidebar from '@/components/Sidebar'
import AddFoodPanel from '@/components/AddFoodPanel'

interface FoodLogItem {
  id: string
  quantity: number
  mealType: string
  food: {
    id: string
    name: string
    calories: number
    protein: number | null
    carbs: number | null
    fat: number | null
    unit: string
  }
}

interface DayLog {
  date: string
  items: FoodLogItem[]
}

const MEAL_LABELS: Record<string, string> = {
  breakfast: 'Petit-déjeuner',
  lunch: 'Déjeuner',
  dinner: 'Dîner',
  snack: 'Collation',
  other: 'Autre',
}

const MEAL_ORDER = ['breakfast', 'lunch', 'dinner', 'snack', 'other']

function formatDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function displayDate(dateStr: string, todayStr: string): string {
  if (!dateStr || !todayStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  const today = new Date(todayStr + 'T00:00:00')
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  if (formatDate(d) === formatDate(today)) return 'Aujourd\'hui'
  if (formatDate(d) === formatDate(yesterday)) return 'Hier'

  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
}

function calcCals(item: FoodLogItem) {
  return Math.round((item.food.calories * item.quantity) / 100)
}
function calcMacro(item: FoodLogItem, key: 'protein' | 'carbs' | 'fat') {
  const v = item.food[key]
  if (v === null) return 0
  return Math.round((v * item.quantity) / 100 * 10) / 10
}

function IconTrash() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
    </svg>
  )
}

function IconChevron({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      {dir === 'left'
        ? <polyline points="15 18 9 12 15 6"/>
        : <polyline points="9 18 15 12 9 6"/>
      }
    </svg>
  )
}

function WeekChart({ logs, todayStr }: { logs: { date: string; total: number }[]; todayStr: string }) {
  const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

  if (!todayStr) {
    return (
      <div className="week-chart">
        {days.map((day, i) => (
          <div key={i} className="week-bar-wrap">
            <div className="week-bar-col">
              <div className="week-bar" style={{ height: '3%' }} />
            </div>
            <span className="week-day">{day}</span>
          </div>
        ))}
      </div>
    )
  }

  const today = new Date(todayStr + 'T00:00:00')
  const weekData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - (today.getDay() === 0 ? 6 : today.getDay() - 1) + i)
    const dateStr = formatDate(d)
    const log = logs.find(l => l.date.startsWith(dateStr))
    return { day: days[i], dateStr, total: log?.total || 0 }
  })
  const max = Math.max(...weekData.map(d => d.total), 2000)

  return (
    <div className="week-chart">
      {weekData.map((d, i) => (
        <div key={i} className="week-bar-wrap">
          <div className="week-bar-col">
            <div
              className={`week-bar ${d.dateStr === todayStr ? 'today' : ''}`}
              style={{ height: `${Math.max(3, (d.total / max) * 100)}%` }}
              title={`${d.total} kcal`}
            />
          </div>
          <span className={`week-day ${d.dateStr === todayStr ? 'today' : ''}`}>{d.day}</span>
        </div>
      ))}
    </div>
  )
}

export default function HomePage() {
  const [date, setDate] = useState('')
  const [today, setToday] = useState('')
  const [log, setLog] = useState<DayLog | null>(null)
  const [weekLogs, setWeekLogs] = useState<{ date: string; total: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [userTarget, setUserTarget] = useState(2000)

  const fetchLog = useCallback(async () => {
    if (!date) return
    setLoading(true)
    const res = await fetch(`/api/logs?date=${date}`)
    const data = await res.json()
    setLog(data)
    setLoading(false)
  }, [date])

  useEffect(() => {
    const todayStr = formatDate(new Date())
    setToday(todayStr)
    setDate(todayStr)
    
    // Fetch user target
    fetch('/api/profile')
      .then(r => r.json())
      .then(data => {
        if (data.dailyTarget) setUserTarget(data.dailyTarget)
      })
      .catch(e => console.error(e))
  }, [])

  useEffect(() => {
    fetchLog()
  }, [fetchLog])

  useEffect(() => {
    fetch('/api/logs')
      .then(r => r.json())
      .then((logs: { date: string; items: FoodLogItem[] }[]) => {
        setWeekLogs(logs.map(l => ({
          date: l.date,
          total: l.items.reduce((sum, item) => sum + calcCals(item), 0),
        })))
      })
  }, [log])

  async function deleteItem(id: string) {
    await fetch(`/api/logs/${id}`, { method: 'DELETE' })
    fetchLog()
  }

  function prevDay() {
    const d = new Date(date + 'T00:00:00')
    d.setDate(d.getDate() - 1)
    setDate(formatDate(d))
  }

  function nextDay() {
    const d = new Date(date + 'T00:00:00')
    d.setDate(d.getDate() + 1)
    const today = formatDate(new Date())
    const next = formatDate(d)
    if (next <= today) setDate(next)
  }

  const items = log?.items || []
  const totalCals = items.reduce((s, i) => s + calcCals(i), 0)
  const totalProtein = items.reduce((s, i) => s + calcMacro(i, 'protein'), 0)
  const totalCarbs = items.reduce((s, i) => s + calcMacro(i, 'carbs'), 0)
  const totalFat = items.reduce((s, i) => s + calcMacro(i, 'fat'), 0)

  const TARGET = userTarget
  const pct = Math.min(100, Math.round((totalCals / TARGET) * 100))

  const byMeal = MEAL_ORDER.reduce<Record<string, FoodLogItem[]>>((acc, m) => {
    acc[m] = items.filter(i => i.mealType === m)
    return acc
  }, {})

  const isToday = date === today

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div className="page-header-row">
            <div>
              <h1 className="page-title">Journal alimentaire</h1>
              <div className="page-subtitle">Suivez votre apport calorique quotidien</div>
            </div>
            <div className="date-nav">
              <button className="btn btn-ghost btn-sm btn-icon" onClick={prevDay} id="prev-day-btn">
                <IconChevron dir="left" />
              </button>
              <span className="date-display">{displayDate(date, today)}</span>
              <button
                className="btn btn-ghost btn-sm btn-icon"
                onClick={nextDay}
                disabled={isToday}
                style={{ opacity: isToday ? 0.3 : 1 }}
                id="next-day-btn"
              >
                <IconChevron dir="right" />
              </button>
            </div>
          </div>
        </div>

        <div className="page-body">
          {/* Stats */}
          <div className="stats-grid">
            <div className="stat-card" style={{ gridColumn: 'span 2' }}>
              <div className="stat-label">Calories du jour</div>
              <div className="stat-value">
                {totalCals}
                <span className="stat-unit">/ {TARGET} kcal</span>
              </div>
              <div className="stat-bar">
                <div className="stat-bar-fill" style={{ width: `${pct}%` }} />
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-text-3)', marginTop: 6 }}>
                {TARGET - totalCals > 0
                  ? `${TARGET - totalCals} kcal restantes`
                  : `Objectif dépassé de ${totalCals - TARGET} kcal`}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Semaine</div>
              <WeekChart logs={weekLogs} todayStr={today} />
            </div>
            <div className="stat-card">
              <div className="stat-label">Repas</div>
              <div className="stat-value">
                {items.length}
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-text-3)', marginTop: 4 }}>aliments consommés</div>
            </div>
          </div>

          {/* Macros */}
          <div className="macro-row" style={{ marginBottom: 24 }}>
            <div className="macro-pill">
              <div className="macro-pill-label">Protéines</div>
              <div className="macro-pill-value macro-protein">{totalProtein.toFixed(1)}<span style={{ fontSize: 12, fontWeight: 400, color: 'var(--color-text-3)' }}> g</span></div>
            </div>
            <div className="macro-pill">
              <div className="macro-pill-label">Glucides</div>
              <div className="macro-pill-value macro-carbs">{totalCarbs.toFixed(1)}<span style={{ fontSize: 12, fontWeight: 400, color: 'var(--color-text-3)' }}> g</span></div>
            </div>
            <div className="macro-pill">
              <div className="macro-pill-label">Lipides</div>
              <div className="macro-pill-value macro-fat">{totalFat.toFixed(1)}<span style={{ fontSize: 12, fontWeight: 400, color: 'var(--color-text-3)' }}> g</span></div>
            </div>
          </div>

          <div className="content-grid">
            {/* Log */}
            <div>
              {loading ? (
                <div className="empty-state">
                  <div className="empty-state-text">Chargement...</div>
                </div>
              ) : items.length === 0 ? (
                <div className="empty-state">
                  <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 2h18l-2 7H5L3 2z"/><path d="M5 9l1 10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-10"/>
                    <path d="M9 14h6"/>
                  </svg>
                  <div className="empty-state-title">Aucun aliment enregistré</div>
                  <div className="empty-state-text">Recherchez un aliment pour commencer</div>
                </div>
              ) : (
                MEAL_ORDER.filter(m => byMeal[m].length > 0).map(mealType => {
                  const mealItems = byMeal[mealType]
                  const mealCals = mealItems.reduce((s, i) => s + calcCals(i), 0)
                  return (
                    <div key={mealType} className="meal-section">
                      <div className="meal-header">
                        <div className="meal-title">{MEAL_LABELS[mealType]}</div>
                        <div className="meal-cals">{mealCals} kcal</div>
                      </div>
                      {mealItems.map(item => (
                        <div key={item.id} className="log-item">
                          <div className="log-item-dot" />
                          <div className="log-item-info">
                            <div className="log-item-name">{item.food.name}</div>
                            <div className="log-item-meta">
                              {item.quantity}{item.food.unit}
                              {item.food.protein !== null && ` · P: ${calcMacro(item, 'protein')}g`}
                              {item.food.carbs !== null && ` · G: ${calcMacro(item, 'carbs')}g`}
                              {item.food.fat !== null && ` · L: ${calcMacro(item, 'fat')}g`}
                            </div>
                          </div>
                          <div className="log-item-cals">{calcCals(item)} kcal</div>
                          <button
                            className="log-item-delete"
                            onClick={() => deleteItem(item.id)}
                            title="Supprimer"
                          >
                            <IconTrash />
                          </button>
                        </div>
                      ))}
                    </div>
                  )
                })
              )}
            </div>

            {/* Add panel */}
            <div>
              <AddFoodPanel date={date} onAdded={fetchLog} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
