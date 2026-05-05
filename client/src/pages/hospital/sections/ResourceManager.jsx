import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BedDouble, Brain, Ambulance, Stethoscope, Save, RefreshCw, TrendingUp, MapPin } from 'lucide-react';
import api from '../../../services/api';
import toast from 'react-hot-toast';

const defaultResources = {
  totalBeds: 0, availableBeds: 0,
  icuBeds: 0, availableIcuBeds: 0,
  ambulances: 0, availableAmbulances: 0,
  doctors: 0, availableDoctors: 0,
};

export default function ResourceManager() {
  const [resources, setResources] = useState(defaultResources);
  const [original, setOriginal] = useState(defaultResources);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/hospital/stats')
      .then(res => {
        setResources(res.data.resources);
        setOriginal(res.data.resources);
      })
      .catch(() => toast.error('Failed to load resources'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (field, value) => {
    const num = parseInt(value) || 0;
    setResources(prev => ({ ...prev, [field]: num }));
  };

  const handleSave = async () => {
    // Validate
    if (resources.availableBeds > resources.totalBeds) {
      toast.error('Available beds cannot exceed total beds');
      return;
    }
    if (resources.availableIcuBeds > resources.icuBeds) {
      toast.error('Available ICU beds cannot exceed total ICU beds');
      return;
    }
    if (resources.availableAmbulances > resources.ambulances) {
      toast.error('Available ambulances cannot exceed total ambulances');
      return;
    }
    if (resources.availableDoctors > resources.doctors) {
      toast.error('Available doctors cannot exceed total doctors');
      return;
    }

    setSaving(true);
    try {
      await api.put('/hospital/resources', resources);
      setOriginal(resources);
      toast.success('Resources updated successfully');
    } catch {
      toast.error('Failed to update resources');
    } finally {
      setSaving(false);
    }
  };

  const resourceGroups = [
    {
      title: 'General Beds',
      icon: BedDouble,
      color: 'text-teal-400',
      bg: 'bg-teal-500/10',
      border: 'border-teal-500/20',
      totalKey: 'totalBeds',
      availKey: 'availableBeds',
    },
    {
      title: 'ICU Beds',
      icon: Brain,
      color: 'text-violet-400',
      bg: 'bg-violet-500/10',
      border: 'border-violet-500/20',
      totalKey: 'icuBeds',
      availKey: 'availableIcuBeds',
    },
    {
      title: 'Ambulances',
      icon: Ambulance,
      color: 'text-orange-400',
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/20',
      totalKey: 'ambulances',
      availKey: 'availableAmbulances',
    },
    {
      title: 'Doctors',
      icon: Stethoscope,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      totalKey: 'doctors',
      availKey: 'availableDoctors',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass rounded-2xl p-5 h-40 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Live Status Tiles */}
      <div>
        <h3 className="text-slate-400 text-sm font-medium mb-4 uppercase tracking-wider">Current Status</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {resourceGroups.map((g, i) => {
            const total = resources[g.totalKey] || 0;
            const avail = resources[g.availKey] || 0;
            const percent = total > 0 ? Math.round((avail / total) * 100) : 0;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className={'rounded-2xl p-5 border ' + g.bg + ' ' + g.border}
              >
                <div className={'w-10 h-10 rounded-xl ' + g.bg + ' flex items-center justify-center mb-3'}>
                  <g.icon size={20} className={g.color} />
                </div>
                <div className={'text-3xl font-bold ' + g.color}>{avail}</div>
                <div className="text-slate-400 text-xs mt-1">{g.title}</div>
                <div className="text-slate-600 text-xs">of {total} total</div>
                <div className="w-full h-1.5 bg-white/5 rounded-full mt-3 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: percent + '%' }}
                    transition={{ duration: 0.8 }}
                    className={'h-full rounded-full ' + g.bg.replace('/10', '/60')}
                    style={{ background: 'currentColor' }}
                  />
                </div>
                <div className="text-xs text-slate-600 mt-1">{percent}% available</div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Edit Resources */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-semibold">Update Resources</h3>
          <button
            onClick={() => setResources(original)}
            className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <RefreshCw size={13} /> Reset
          </button>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {resourceGroups.map((g, i) => (
            <div key={i} className={'rounded-xl p-4 border ' + g.border + ' ' + g.bg}>
              <div className="flex items-center gap-2 mb-4">
                <g.icon size={16} className={g.color} />
                <span className={'text-sm font-semibold ' + g.color}>{g.title}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block">Total</label>
                  <input
                    type="number"
                    min="0"
                    value={resources[g.totalKey]}
                    onChange={e => handleChange(g.totalKey, e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block">Available</label>
                  <input
                    type="number"
                    min="0"
                    max={resources[g.totalKey]}
                    value={resources[g.availKey]}
                    onChange={e => handleChange(g.availKey, e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500/50 transition-colors"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-6 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-teal-500 text-white font-bold text-sm hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-60"
        >
          {saving
            ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : <><Save size={15} /> Save Changes</>
          }
        </button>
      </div>
      <div className="glass rounded-2xl p-6 mt-6">
        <h3 className="text-white font-semibold mb-2">Hospital Location</h3>
        <p className="text-slate-400 text-sm mb-4">Set your location so patients can find you on the map.</p>
        <button
          onClick={() => {
            if (!navigator.geolocation) { toast.error('Geolocation not supported'); return; }
            navigator.geolocation.getCurrentPosition(async (pos) => {
              try {
                await api.put('/hospital/location', {
                  lat: pos.coords.latitude,
                  lng: pos.coords.longitude,
                  address: 'Auto-detected location',
                });
                toast.success('Location saved! You now appear on the patient map.');
              } catch {
                toast.error('Failed to save location');
              }
            }, () => toast.error('Allow location access in browser'));
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-500/15 border border-teal-500/30 text-teal-400 text-sm font-medium hover:bg-teal-500/25 transition-all"
        >
          📍 Set My Location on Map
        </button>
      </div>
    </div>
  );
}