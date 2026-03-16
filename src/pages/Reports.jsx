import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../utils/api'
import toast from 'react-hot-toast'
import {
  FileText, Download, Activity, Calendar, ChevronRight,
  TrendingDown, Zap, RefreshCw, Database, Cpu
} from 'lucide-react'

export default function Reports() {
  const [units, setUnits]       = useState([])
  const [analyses, setAnalyses] = useState({})
  const [loading, setLoading]   = useState(true)
  const [expanded, setExpanded] = useState({})
  const navigate = useNavigate()

  useEffect(() => {
    const load = async () => {
      try {
        // v5: fetch engineer's linked units, then history per unit
        const unitRes = await api.get('/compressors/units/my')
        const us = Array.isArray(unitRes.data)
          ? unitRes.data
          : (unitRes.data?.items || unitRes.data?.units || [])
        setUnits(us)
        // Expand first unit by default
        if (us.length) setExpanded({ [us[0].id]: true })
        // Load history for all units in parallel
        const hist = {}
        await Promise.all(us.map(async u => {
          try {
            const r = await api.get(`/analysis/history/${u.id}?limit=20`)
            hist[u.id] = Array.isArray(r.data)
              ? r.data
              : (r.data?.data || r.data?.items || r.data?.results || r.data?.analyses || [])
          } catch { hist[u.id] = [] }
        }))
        setAnalyses(hist)
      } catch { toast.error('Failed to load') }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const downloadReport = async (type, unit, result) => {
    try {
      // Fetch full analysis result from backend if we don't have analysis_results object
      let analysisData = result
      if (!result.scores && result.id) {
        try {
          const r = await api.get(`/analysis/result/${result.id}`)
          analysisData = r.data
        } catch { /* use what we have */ }
      }

      const payload = {
        compressor_id:    unit.id,
        compressor_name:  `${unit.unit_id} - ${unit.type?.name || 'Compressor'}`,
        company_name:     unit.location || 'Industrial Facility',
        analysis_results: {
          power_saving_percent:      analysisData.power_saving_percent      || 0,
          best_electrical_power:     analysisData.best_electrical_power     || 0,
          best_mechanical_power:     analysisData.best_mechanical_power     || 0,
          baseline_electrical_power: analysisData.baseline_electrical_power || 0,
          best_spc:                  analysisData.best_spc                  || 0,
          scores:                    analysisData.scores                    || {},
          optimal_parameters:        analysisData.optimal_parameters        || {},
          feature_importance:        analysisData.feature_importance        || {},
          scatter_data:              analysisData.scatter_data              || [],
          cluster_data:              analysisData.cluster_data              || [],
          histogram_data:            analysisData.histogram_data            || [],
          training_curve:            analysisData.training_curve            || [],
          cluster_stats:             analysisData.cluster_stats             || {},
          kw_saved:            analysisData.kw_saved            || 0,
          energy_saved_kwh:    analysisData.energy_saved_kwh    || 0,
          cost_saved_annual:   analysisData.cost_saved_annual   || 0,
          cost_saved_monthly:  analysisData.cost_saved_monthly  || 0,
        },
        user_params:    analysisData.user_params || {},
        include_graphs: true,
      }

      const res = await api.post(`/reports/${type}`, payload, { responseType: 'blob' })
      const url = URL.createObjectURL(new Blob([res.data]))
      const a   = document.createElement('a')
      a.href     = url
      a.download = `report_${result.id?.slice(0,8)}.${type === 'pdf' ? 'pdf' : 'xlsx'}`
      a.click()
      URL.revokeObjectURL(url)
      toast.success(`${type.toUpperCase()} report downloaded!`)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Download failed')
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="spinner-yellow w-12 h-12 mx-auto mb-4"/>
        <p className="text-slate-400 font-mono text-sm">Loading reports...</p>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-800 text-white">Reports</h1>
          <p className="text-slate-400 text-sm mt-1">View and download analysis history</p>
        </div>
        <button onClick={() => window.location.reload()}
          className="p-2.5 text-slate-400 hover:text-yellow-400 transition-colors rounded-xl hover:bg-yellow-400/10">
          <RefreshCw size={18}/>
        </button>
      </div>

      {units.length === 0 ? (
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}
          className="card text-center py-20" style={{border:'1px solid rgba(255,255,255,0.07)'}}>
          <FileText size={36} className="text-slate-600 mx-auto mb-4"/>
          <h3 className="font-display font-700 text-white text-xl mb-2">No Reports Yet</h3>
          <p className="text-slate-500 text-sm mb-6">Run your first analysis to generate reports</p>
          <button onClick={() => navigate('/dashboard')}
            className="btn-primary inline-flex items-center gap-2 px-6 py-2.5 text-sm">
            <Cpu size={14}/> Go to Dashboard
          </button>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {units.map((unit, i) => {
            const results  = analyses[unit.id] || []
            const isOpen   = expanded[unit.id]
            const avgSaving = results.length
              ? results.reduce((s,r) => s + (r.power_saving_percent||0), 0) / results.length
              : null

            return (
              <motion.div key={unit.id} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}}
                className="card" style={{border:'1px solid rgba(255,255,255,0.07)'}}>

                {/* Unit header — click to expand */}
                <div className="flex items-center justify-between cursor-pointer"
                  onClick={() => setExpanded(p => ({...p, [unit.id]: !p[unit.id]}))}>
                  <h2 className="font-display font-700 text-white text-lg flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center">
                      <Cpu size={16} className="text-yellow-400"/>
                    </div>
                    <div>
                      <div>{unit.unit_id}</div>
                      <div className="text-slate-500 text-xs font-mono font-400 mt-0.5">{unit.type?.name} · {unit.location || 'No location'}</div>
                    </div>
                  </h2>
                  <div className="flex items-center gap-3">
                    <span className="tag-yellow">{results.length} analyses</span>
                    {avgSaving != null && (
                      <span className="text-xs text-green-400 font-mono flex items-center gap-1">
                        <TrendingDown size={10}/>{avgSaving.toFixed(1)}% avg
                      </span>
                    )}
                    <button onClick={e => { e.stopPropagation(); navigate(`/analysis/${unit.id}`) }}
                      className="text-xs text-cyan-400 hover:text-cyan-300 font-display font-600 transition-colors flex items-center gap-1">
                      <Activity size={12}/> New Analysis
                    </button>
                    <ChevronRight size={16} className={`text-slate-500 transition-transform ${isOpen ? 'rotate-90' : ''}`}/>
                  </div>
                </div>

                {/* Analysis history list */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}}
                      className="overflow-hidden">
                      <div className="mt-4 pt-4 border-t border-white/6">
                        {results.length === 0 ? (
                          <p className="text-slate-500 text-sm font-mono py-4">
                            No analyses yet.{' '}
                            <button onClick={() => navigate(`/analysis/${unit.id}`)}
                              className="text-yellow-400 hover:underline">Run first analysis!</button>
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {results.map(a => (
                              <div key={a.id}
                                className="flex items-center justify-between bg-primary-800/50 rounded-xl px-4 py-3 group hover:bg-primary-800/80 transition-colors">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <Database size={13} className="text-slate-500"/>
                                    <span className="text-sm text-slate-200 font-display font-500 truncate max-w-[220px]">
                                      {a.dataset?.original_filename || a.filename || 'Dataset'}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 font-mono">
                                    <span className="flex items-center gap-1">
                                      <Calendar size={10}/>{a.created_at?.substring(0,10)}
                                    </span>
                                    {a.dataset?.clean_rows && <span>{a.dataset.clean_rows} rows</span>}
                                    {a.power_saving_percent != null && (
                                      <span className="text-green-400 flex items-center gap-0.5">
                                        <TrendingDown size={10}/>-{a.power_saving_percent?.toFixed(1)}% energy
                                      </span>
                                    )}
                                    {a.best_electrical_power != null && (
                                      <span className="text-cyan-400 flex items-center gap-0.5">
                                        <Zap size={10}/>{a.best_electrical_power?.toFixed(1)} kW
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  {a.scores && (
                                    <span className="text-xs font-mono text-cyan-400">
                                      R²: {(a.scores.r2 || 0).toFixed(0)}%
                                    </span>
                                  )}
                                  {/* Re-run with same dataset */}
                                  {a.dataset_id && (
                                    <button
                                      onClick={() => navigate(`/analysis/${unit.id}/${a.dataset_id}`)}
                                      className="p-1.5 text-slate-500 hover:text-yellow-400 rounded-lg hover:bg-yellow-400/10 transition-all"
                                      title="Re-run analysis">
                                      <Activity size={13}/>
                                    </button>
                                  )}
                                  <button
                                    onClick={() => downloadReport('excel', unit, a)}
                                    className="p-1.5 text-slate-500 hover:text-green-400 rounded-lg hover:bg-green-400/10 transition-all"
                                    title="Download Excel">
                                    <Download size={13}/>
                                  </button>
                                  <button
                                    onClick={() => downloadReport('pdf', unit, a)}
                                    className="p-1.5 text-slate-500 hover:text-cyan-400 rounded-lg hover:bg-cyan-400/10 transition-all"
                                    title="Download PDF">
                                    <FileText size={13}/>
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
