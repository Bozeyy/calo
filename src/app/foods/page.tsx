'use client'

import { useState, useEffect, useCallback } from 'react'
import Sidebar from '@/components/Sidebar'
import AddFoodModal from '@/components/AddFoodModal'

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

function IconPlus() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  )
}

function IconSearch() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  )
}

export default function FoodsPage() {
  const [foods, setFoods] = useState<Food[]>([])
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState<'all' | 'default' | 'custom'>('all')
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchFoods = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/foods?q=${encodeURIComponent(query)}`)
    const data = await res.json()
    setFoods(data)
    setLoading(false)
  }, [query])

  useEffect(() => {
    const t = setTimeout(fetchFoods, 200)
    return () => clearTimeout(t)
  }, [fetchFoods])

  const filtered = foods.filter(f => {
    if (tab === 'default') return f.isDefault
    if (tab === 'custom') return !f.isDefault
    return true
  })

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div className="page-header-row">
            <div>
              <h1 className="page-title">Aliments</h1>
              <div className="page-subtitle">{foods.length} aliments disponibles</div>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => setShowModal(true)}
              id="add-food-modal-btn"
            >
              <IconPlus />
              Nouvel aliment
            </button>
          </div>
        </div>

        <div className="page-body">
          {/* Search */}
          <div style={{ position: 'relative', marginBottom: 16, maxWidth: 400 }}>
            <div style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-3)' }}>
              <IconSearch />
            </div>
            <input
              type="text"
              className="form-input"
              placeholder="Rechercher un aliment..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              style={{ paddingLeft: 34 }}
              id="foods-search"
            />
          </div>

          {/* Tabs */}
          <div className="tabs">
            <button className={`tab-btn ${tab === 'all' ? 'active' : ''}`} onClick={() => setTab('all')} id="tab-all">
              Tous ({foods.length})
            </button>
            <button className={`tab-btn ${tab === 'default' ? 'active' : ''}`} onClick={() => setTab('default')} id="tab-default">
              Base ({foods.filter(f => f.isDefault).length})
            </button>
            <button className={`tab-btn ${tab === 'custom' ? 'active' : ''}`} onClick={() => setTab('custom')} id="tab-custom">
              Personnalisés ({foods.filter(f => !f.isDefault).length})
            </button>
          </div>

          {loading ? (
            <div className="empty-state"><div className="empty-state-text">Chargement...</div></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <div className="empty-state-title">Aucun aliment trouvé</div>
              <div className="empty-state-text">
                {tab === 'custom'
                  ? 'Ajoutez votre premier aliment personnalisé'
                  : 'Essayez un autre terme de recherche'}
              </div>
            </div>
          ) : (
            <div className="foods-grid">
              {filtered.map(food => (
                <div key={food.id} className="food-card">
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                    <div className="food-card-name">{food.name}</div>
                    <span className={`food-badge ${food.isDefault ? '' : 'food-badge-custom'}`}>
                      {food.isDefault ? 'Base' : 'Perso'}
                    </span>
                  </div>
                  <div className="food-card-cals">
                    {food.calories}
                    <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--color-text-3)' }}> kcal</span>
                  </div>
                  <div className="food-card-sub">
                    pour {food.unit === 'g' || food.unit === 'ml' ? `100${food.unit}` : `1 ${food.unit}`}
                  </div>

                  {(food.protein !== null || food.carbs !== null || food.fat !== null) && (
                    <div className="food-card-macros">
                      {food.protein !== null && (
                        <span className="macro-tag macro-tag-p">P {food.protein}g</span>
                      )}
                      {food.carbs !== null && (
                        <span className="macro-tag macro-tag-c">G {food.carbs}g</span>
                      )}
                      {food.fat !== null && (
                        <span className="macro-tag macro-tag-f">L {food.fat}g</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {showModal && (
        <AddFoodModal
          onCreated={fetchFoods}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}
