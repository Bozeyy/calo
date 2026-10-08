'use client'

import { useState, useEffect, useRef } from 'react'

interface Food {
  id: string
  name: string
  calories: number
  protein: number | null
  carbs: number | null
  fat: number | null
  unit: string
  isDefault: boolean
}

interface Props {
  date: string
  onAdded: () => void
}

const MEAL_TYPES = [
  { value: 'breakfast', label: 'Petit-déjeuner' },
  { value: 'lunch', label: 'Déjeuner' },
  { value: 'dinner', label: 'Dîner' },
  { value: 'snack', label: 'Collation' },
  { value: 'other', label: 'Autre' },
]

export default function AddFoodPanel({ date, onAdded }: Props) {
  const [query, setQuery] = useState('')
  const [foods, setFoods] = useState<Food[]>([])
  const [selected, setSelected] = useState<Food | null>(null)
  const [quantity, setQuantity] = useState('100')
  const [mealType, setMealType] = useState('other')
  const [loading, setLoading] = useState(false)
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current)
    debounce.current = setTimeout(() => {
      fetch(`/api/foods?q=${encodeURIComponent(query)}`)
        .then(r => r.json())
        .then(setFoods)
    }, 200)
  }, [query])

  async function handleAdd() {
    if (!selected || !quantity) return
    setLoading(true)
    await fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ foodId: selected.id, quantity, mealType, date }),
    })
    setLoading(false)
    setSelected(null)
    setQuery('')
    setQuantity('100')
    onAdded()
  }

  const previewCals = selected
    ? Math.round(
        (selected.unit === 'g' || selected.unit === 'ml')
          ? (selected.calories * parseFloat(quantity || '0')) / 100
          : selected.calories * parseFloat(quantity || '0')
      )
    : 0

  return (
    <div className="add-panel">
      <div className="add-panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
          </svg>
          Ajouter un aliment
        </div>
      </div>

      <div className="add-panel-body">
        <div className="search-input-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            className="form-input"
            placeholder="Rechercher un aliment..."
            value={query}
            onChange={e => { setQuery(e.target.value); setSelected(null) }}
            id="food-search"
          />
        </div>

        {foods.length > 0 && (
          <div className="food-results">
            {foods.map(food => (
              <div
                key={food.id}
                className={`food-result-item ${selected?.id === food.id ? 'selected' : ''}`}
                onClick={() => { setSelected(food); setQuantity((food.unit === 'g' || food.unit === 'ml') ? '100' : '1') }}
              >
                <div>
                  <div className="food-result-name">{food.name}</div>
                  <div className="food-result-cals">
                    {food.calories} kcal / {food.unit === 'g' || food.unit === 'ml' ? `100${food.unit}` : `1 ${food.unit}`}
                  </div>
                </div>
                {!food.isDefault && (
                  <span className="food-result-badge">Perso</span>
                )}
              </div>
            ))}
          </div>
        )}

        {selected && (
          <>
            <div style={{ padding: '10px 12px', background: 'var(--color-accent-light)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--color-accent)' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-accent)' }}>{selected.name}</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-3)', marginTop: 2 }}>
                {selected.calories} kcal / {selected.unit === 'g' || selected.unit === 'ml' ? `100${selected.unit}` : `1 ${selected.unit}`}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Quantité ({selected.unit})</label>
              <input
                type="number"
                className="form-input"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                min="1"
                step="1"
                id="food-quantity"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Repas</label>
              <select
                className="form-select"
                value={mealType}
                onChange={e => setMealType(e.target.value)}
                id="food-meal-type"
              >
                {MEAL_TYPES.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderTop: '1px solid var(--color-border)' }}>
              <span style={{ fontSize: 13, color: 'var(--color-text-3)' }}>Total</span>
              <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text)', letterSpacing: -0.5 }}>
                {previewCals} <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--color-text-3)' }}>kcal</span>
              </span>
            </div>

            <button
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={handleAdd}
              disabled={loading}
              id="add-food-btn"
            >
              {loading ? 'Ajout...' : 'Ajouter'}
            </button>
          </>
        )}

        {!selected && foods.length === 0 && query === '' && (
          <p style={{ fontSize: 12, color: 'var(--color-text-3)', textAlign: 'center', padding: '12px 0' }}>
            Tapez pour rechercher parmi les aliments
          </p>
        )}
      </div>
    </div>
  )
}
