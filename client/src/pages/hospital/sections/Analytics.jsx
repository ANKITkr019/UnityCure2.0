import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Users, BedDouble, Activity, BarChart3 } from 'lucide-react';
import api from '../../../services/api';

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const admissionsData = [42, 58, 35, 67, 71, 45, 38];
const dischargeData  = [38, 52, 30, 61, 65, 40, 35];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
const monthlyData = [180, 220, 195, 260, 310, 280];

function BarChart({ data, labels, color, height = 120 }) {
  const max = Math.max(...data);
  return (
    <div className="flex items-end gap-2" style={{ height }}>
      {data.map((val, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: ((val / max) * (height - 24)) + 'px' }}
            transition={{ duration: 0.6, delay: i * 0.05 }}
            className={'w-full rounded-t-md ' + color}
            style={{ minHeight: 4 }}
          />
          <span className="text-xs text-slate-600">{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

function LineChart({ data, labels, color }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const H = 100;
  const W = 100;
  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * W,
    y: H - ((v - min) / range) * H,
  }));
  const path = pts.map((p, i) => (i === 0 ? 'M' : 'L') + p.x + ',' + p.y).join(' ');

  return (
    <div className="space-y-2">
      <svg viewBox={'0 0 ' + W + ' ' + H} className="w-full h-24" preserveAspectRatio="none">
        <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="2" fill={color} />
        ))}
      </svg>
      <div className="flex justify-between">
        {labels.map((l, i) => <span key={i} className="text-xs text-slate-600">{l}</span>)}
      </div>
    </div>
  );
}

export default function Analytics() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/hospital/stats')
      .then(res => setStats(res.data.stats))
      .catch(() => {});
  }, []);

  const kpis = [
    { label: 'Bed Occupancy', value: (stats?.occupancyRate ?? 0) + '%', trend: '+3%', up: true, color: 'text-teal-400', icon: BedDouble },
    { label: 'ICU Occupancy', value: (stats?.icuOccupancy ?? 0) + '%', trend: '+5%', up: true, color: 'text-violet-400', icon: Activity },
    { label: 'Doctor Availability', value: (stats?.doctorAvailability ?? 0) + '%', trend: '-2%', up: false, color: 'text-emerald-400', icon: Users },
    { label: 'Ambulance Available', value: (stats?.ambulanceAvailability ?? 0) + '%', trend: '+1%', up: true, color: 'text-orange-400', icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass rounded-2xl p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <kpi.icon size={16} className={kpi.color} />
              <span className={'flex items-center gap-0.5 text-xs font-medium ' + (kpi.up ? 'text-teal-400' : 'text-red-400')}>
                {kpi.up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                {kpi.trend}
              </span>
            </div>
            <div className={'text-2xl font-bold ' + kpi.color}>{kpi.value}</div>
            <div className="text-slate-500 text-xs mt-1">{kpi.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Weekly Admissions Chart */}
      <div className="glass rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-1">Weekly Admissions vs Discharges</h3>
        <p className="text-slate-500 text-xs mb-6">This week's patient flow</p>
        <div className="flex gap-4 mb-4">
          <span className="flex items-center gap-1.5 text-xs text-teal-400"><span className="w-3 h-3 rounded bg-teal-500/50 inline-block" /> Admissions</span>
          <span className="flex items-center gap-1.5 text-xs text-violet-400"><span className="w-3 h-3 rounded bg-violet-500/50 inline-block" /> Discharges</span>
        </div>
        <div className="relative">
          <BarChart data={admissionsData} labels={weekDays} color="bg-teal-500/50" height={140} />
          <div className="absolute inset-0">
            <BarChart data={dischargeData} labels={weekDays} color="bg-violet-500/30" height={140} />
          </div>
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="glass rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-1">6-Month Patient Trend</h3>
        <p className="text-slate-500 text-xs mb-4">Total patients served per month</p>
        <LineChart data={monthlyData} labels={months} color="#00d4aa" />
        <div className="mt-4 grid grid-cols-3 gap-3">
          {[
            { label: 'Peak Month', value: 'May', color: 'text-teal-400' },
            { label: 'Total Patients', value: monthlyData.reduce((a, b) => a + b, 0).toLocaleString(), color: 'text-violet-400' },
            { label: 'Avg / Month', value: Math.round(monthlyData.reduce((a, b) => a + b, 0) / monthlyData.length), color: 'text-orange-400' },
          ].map((s, i) => (
            <div key={i} className="bg-white/3 rounded-xl p-3 text-center">
              <div className={'text-lg font-bold ' + s.color}>{s.value}</div>
              <div className="text-slate-500 text-xs">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Resource Utilization */}
      <div className="glass rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-4">Resource Utilization</h3>
        <div className="space-y-4">
          {[
            { label: 'General Beds', percent: stats?.occupancyRate ?? 65, color: 'bg-teal-500' },
            { label: 'ICU Beds', percent: stats?.icuOccupancy ?? 80, color: 'bg-violet-500' },
            { label: 'Ambulances (deployed)', percent: 100 - (stats?.ambulanceAvailability ?? 40), color: 'bg-orange-500' },
            { label: 'Doctors (on duty)', percent: 100 - (stats?.doctorAvailability ?? 30), color: 'bg-emerald-500' },
          ].map((item, i) => (
            <div key={i}>
              <div className="flex justify-between mb-1.5">
                <span className="text-slate-300 text-sm">{item.label}</span>
                <span className="text-slate-400 text-sm">{item.percent}%</span>
              </div>
              <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: item.percent + '%' }}
                  transition={{ duration: 0.8, delay: i * 0.1 }}
                  className={'h-full rounded-full ' + item.color}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}