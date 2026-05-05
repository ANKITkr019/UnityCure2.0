import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, Plus } from 'lucide-react';

const mockAppointments = [
  { id: 1, doctor: 'Dr. Priya Sharma', specialty: 'Cardiologist', date: '2026-05-10', time: '10:00 AM', status: 'confirmed', fee: 500 },
  { id: 2, doctor: 'Dr. Rahul Verma', specialty: 'Neurologist', date: '2026-05-14', time: '2:00 PM', status: 'pending', fee: 600 },
  { id: 3, doctor: 'Dr. Anjali Gupta', specialty: 'Pediatrician', date: '2026-04-28', time: '9:00 AM', status: 'completed', fee: 400 },
  { id: 4, doctor: 'Dr. Suresh Patel', specialty: 'Orthopedist', date: '2026-04-20', time: '5:00 PM', status: 'cancelled', fee: 700 },
];

const statusConfig = {
  confirmed: { icon: CheckCircle, color: 'text-teal-400', bg: 'bg-teal-500/10 border-teal-500/20', label: 'Confirmed' },
  pending:   { icon: AlertCircle, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20', label: 'Pending' },
  completed: { icon: CheckCircle, color: 'text-slate-400', bg: 'bg-slate-500/10 border-slate-500/20', label: 'Completed' },
  cancelled: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', label: 'Cancelled' },
};

export default function Appointments() {
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all'
    ? mockAppointments
    : mockAppointments.filter(a => a.status === filter);

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {['all', 'confirmed', 'pending', 'completed', 'cancelled'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={'px-3 py-1.5 rounded-xl text-xs capitalize transition-all ' +
                (filter === f
                  ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                  : 'bg-white/5 text-slate-400 border border-white/10 hover:text-white'
                )}
            >
              {f}
            </button>
          ))}
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-500/15 border border-teal-500/30 text-teal-400 text-sm hover:bg-teal-500/25 transition-all">
          <Plus size={14} /> New
        </button>
      </div>

      {/* Calendar Strip */}
      <div className="glass rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Calendar size={16} className="text-teal-400" />
          <span className="text-white text-sm font-medium">May 2026</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {Array.from({ length: 14 }, (_, i) => {
            const day = i + 1;
            const hasAppt = mockAppointments.some(a => parseInt(a.date.split('-')[2]) === day);
            return (
              <div key={day} className={'shrink-0 w-12 h-14 rounded-xl flex flex-col items-center justify-center text-xs cursor-pointer transition-all ' +
                (hasAppt ? 'bg-teal-500/20 border border-teal-500/30 text-teal-400' : 'bg-white/5 border border-white/5 text-slate-500 hover:bg-white/10')
              }>
                <span className="text-xs text-slate-500">
                  {['S','M','T','W','T','F','S'][(day + 2) % 7]}
                </span>
                <span className="font-bold mt-0.5">{day}</span>
                {hasAppt && <span className="w-1 h-1 rounded-full bg-teal-400 mt-1" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Appointment List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center text-slate-500">No appointments found.</div>
        ) : filtered.map((appt, i) => {
          const s = statusConfig[appt.status];
          return (
            <motion.div
              key={appt.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="glass rounded-2xl p-5 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-500/20 to-violet-500/20 border border-white/10 flex items-center justify-center text-white font-bold text-sm">
                  {appt.doctor.split(' ').map(w => w[0]).join('').slice(1, 3)}
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">{appt.doctor}</div>
                  <div className="text-slate-500 text-xs">{appt.specialty}</div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <Calendar size={11} /> {appt.date}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <Clock size={11} /> {appt.time}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-white font-bold text-sm">₹{appt.fee}</div>
                </div>
                <span className={'text-xs px-2.5 py-1 rounded-full border font-medium ' + s.bg + ' ' + s.color}>
                  {s.label}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}