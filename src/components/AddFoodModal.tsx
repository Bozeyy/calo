'use client'

import { useState } from 'react'

interface Props {
  onCreated: () => void
  onClose: () => void
}

export default function AddFoodModal({ onCreated, onClose }: Props) {
  const [form, setForm] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    unit: 'g',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.calories) {
      setError('Le nom et les calories sont requis')
      return
    }
    setLoading(true)
    const res = await fetch('/api/foods', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      onCreated()
      onClose()
    } else {
      const data = await res.json()
      setError(data.error || 'Erreur')
    }
    setLoading(false)
  }

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal">
        <div className="modal-title">Nouvel aliment</div>

        <form className="modal-form" onSubmit={handleSubmit}>
          {error && <div className="auth-error">{error}</div>}

          <div className="form-group">
            <label className="form-label">Nom de l&apos;aliment</label>
            <input
              type="text"
              name="name"
              className="form-input"
              placeholder="Ex. Quinoa cuit"
              value={form.name}
              onChange={handleChange}
              id="food-name-input"
              autoFocus
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Calories (kcal)</label>
              <input
                type="number"
                name="calories"
                className="form-input"
                placeholder="120"
                value={form.calories}
                onChange={handleChange}
                id="food-calories-input"
                min="0"
                step="0.1"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Unité</label>
              <select name="unit" className="form-select" value={form.unit} onChange={handleChange} id="food-unit-select">
                <option value="g">g (gramme)</option>
                <option value="ml">ml (millilitre)</option>
              </select>
            </div>
          </div>

          <div style={{ fontSize: 12, color: 'var(--color-text-3)', marginTop: -6 }}>
            Valeurs nutritionnelles pour 100g / 100ml
          </div>

          <div className="form-row-3">
            <div className="form-group">
              <label className="form-label">Protéines (g)</label>
              <input
                type="number"
                name="protein"
                className="form-input"
                placeholder="—"
                value={form.protein}
                onChange={handleChange}
                id="food-protein-input"
                min="0"
                step="0.1"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Glucides (g)</label>
              <input
                type="number"
                name="carbs"
                className="form-input"
                placeholder="—"
                value={form.carbs}
                onChange={handleChange}
                id="food-carbs-input"
                min="0"
                step="0.1"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Lipides (g)</label>
              <input
                type="number"
                name="fat"
                className="form-input"
                placeholder="—"
                value={form.fat}
                onChange={handleChange}
                id="food-fat-input"
                min="0"
                step="0.1"
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading} id="save-food-btn">
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
