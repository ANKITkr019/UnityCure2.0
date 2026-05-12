import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BedDouble, Ambulance, Stethoscope, Brain, ArrowRight, TrendingUp, AlertCircle } from 'lucide-react';
import api from '../../../services/api';

const ads = [
  { title: 'Free Health Checkup', desc: 'Book your annual checkup at zero cost this month.', color: 'from-teal-600/30 to-teal-900/20', tag: 'Offer' },
  { title: 'Diabetes Care Program', desc: 'Join our 30-day diabetes management program.', color: 'from-violet-600/30 to-violet-900/20', tag: 'Program' },
  { title: 'Mental Wellness Week', desc: 'Free counselling sessions available all week.', color: 'from-pink-600/30 to-pink-900/20', tag: 'Free' },
];

export default function Overview() {
  const [resources, setResources] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adIndex, setAdIndex] = useState(0);

  useEffect(() => {
    api.get('/user/resources')
      .then(res => setResources(res.data))
      .catch(() => setResources({ totals: { totalBeds: 0, icuBeds: 0, ambulances: 0, doctors: 0 } }))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const t = setInterval(() => setAdIndex(i => (i + 1) % ads.length), 3500);
    return () => clearInterval(t);
  }, []);

  const tiles = [
    { label: 'Available Beds', value: resources?.totals.totalBeds, icon: BedDouble, color: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/20' },
    { label: 'ICU Beds', value: resources?.totals.icuBeds, icon: Brain, color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
    { label: 'Ambulances', value: resources?.totals.ambulances, icon: Ambulance, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
    { label: 'Doctors Online', value: resources?.totals.doctors, icon: Stethoscope, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  ];

  return (
    <div className="space-y-6">
      {/* Resource Tiles */}
      <div>
        <h2 className="text-slate-400 text-sm font-medium mb-4 uppercase tracking-wider">Live Resource Availability</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {tiles.map((tile, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={'rounded-2xl p-5 border hover-lift ' + tile.bg + ' ' + tile.border}
            >
              <div className={'w-10 h-10 rounded-xl ' + tile.bg + ' flex items-center justify-center mb-3'}>
                <tile.icon size={20} className={tile.color} />
              </div>
              <div className={'text-3xl font-bold mb-1 ' + tile.color}>
                {loading ? (
                  <div className="h-8 w-12 bg-white/5 rounded animate-pulse" />
                ) : (
                  tile.value ?? '—'
                )}
              </div>
              <div className="text-slate-400 text-xs">{tile.label}</div>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp size={11} className="text-slate-600" />
                <span className="text-slate-600 text-xs">Live data</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Ads Carousel */}
      <div>
        <h2 className="text-slate-400 text-sm font-medium mb-4 uppercase tracking-wider">Health Programs</h2>
        <div className="relative overflow-hidden rounded-2xl">
          {ads.map((ad, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: i === adIndex ? 1 : 0, x: i === adIndex ? 0 : 40 }}
              transition={{ duration: 0.4 }}
              className={'absolute inset-0 bg-gradient-to-r ' + ad.color + ' border border-white/5 rounded-2xl p-6 flex items-center justify-between ' + (i === adIndex ? '' : 'pointer-events-none')}
              style={{ position: i === adIndex ? 'relative' : 'absolute' }}
            >
              <div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/10 text-white mb-2 inline-block">{ad.tag}</span>
                <h3 className="text-white font-bold text-lg">{ad.title}</h3>
                <p className="text-slate-300 text-sm mt-1">{ad.desc}</p>
              </div>
              <button className="shrink-0 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 text-white text-sm rounded-xl transition-all flex items-center gap-2">
                Learn More <ArrowRight size={14} />
              </button>
            </motion.div>
          ))}
          {/* Dots */}
          <div className="flex justify-center gap-1.5 mt-3">
            {ads.map((_, i) => (
              <button
                key={i}
                onClick={() => setAdIndex(i)}
                className={'h-1.5 rounded-full transition-all ' + (i === adIndex ? 'w-4 bg-teal-400' : 'w-1.5 bg-slate-600')}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-slate-400 text-sm font-medium mb-4 uppercase tracking-wider">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Book Consultation', color: 'bg-teal-500/10 border-teal-500/20 text-teal-400', icon: Stethoscope },
            { label: 'Emergency SOS', color: 'bg-red-500/10 border-red-500/20 text-red-400', icon: AlertCircle },
            { label: 'Video Call Doctor', color: 'bg-violet-500/10 border-violet-500/20 text-violet-400', icon: Brain },
            { label: 'Find Hospital', color: 'bg-blue-500/10 border-blue-500/20 text-blue-400', icon: Ambulance },
          ].map((action, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={'p-4 rounded-2xl border text-left transition-all ' + action.color}
            >
              <action.icon size={20} className="mb-2" />
              <div className="text-sm font-medium">{action.label}</div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Hospital List */}
      {resources?.hospitals?.length > 0 && (
        <div>
          <h2 className="text-slate-400 text-sm font-medium mb-4 uppercase tracking-wider">Connected Hospitals</h2>
          <div className="space-y-2">
            {resources.hospitals.slice(0, 5).map((h, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass rounded-xl px-5 py-3 flex items-center justify-between"
              >
                <div>
                  <div className="text-white text-sm font-medium">{h.hospitalName}</div>
                  <div className="text-slate-500 text-xs">{h.city}</div>
                </div>
                <div className="flex gap-4 text-xs text-slate-400">
                  <span className="text-teal-400 font-semibold">{h.resources.availableBeds} beds</span>
                  <span className="text-violet-400 font-semibold">{h.resources.availableIcuBeds} ICU</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}