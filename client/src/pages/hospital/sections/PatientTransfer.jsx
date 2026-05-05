import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock, ArrowRight, AlertTriangle, User } from 'lucide-react';
import toast from 'react-hot-toast';

const mockRequests = [
  { id: 1, patient: 'Ramesh Kumar', age: 58, condition: 'Cardiac Arrest', fromHospital: 'City Clinic', urgency: 'critical', status: 'pending', time: '10 min ago', bloodGroup: 'O+' },
  { id: 2, patient: 'Sunita Devi', age: 34, condition: 'High-Risk Pregnancy', fromHospital: 'PHC Jharia', urgency: 'high', status: 'pending', time: '25 min ago', bloodGroup: 'B+' },
  { id: 3, patient: 'Vikram Singh', age: 45, condition: 'Head Injury (TBI)', fromHospital: 'Steel City Hospital', urgency: 'medium', status: 'approved', time: '1 hr ago', bloodGroup: 'A+' },
  { id: 4, patient: 'Meena Patel', age: 62, condition: 'Stroke', fromHospital: 'Lifeline Medical', urgency: 'critical', status: 'rejected', time: '2 hr ago', bloodGroup: 'AB-' },
];

const urgencyConfig = {
  critical: { color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', label: 'Critical' },
  high:     { color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20', label: 'High' },
  medium:   { color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20', label: 'Medium' },
};

const statusConfig = {
  pending:  { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  approved: { icon: CheckCircle, color: 'text-teal-400', bg: 'bg-teal-500/10' },
  rejected: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
};

export default function PatientTransfer() {
  const [requests, setRequests] = useState(mockRequests);
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter);

  const handleAction = (id, action) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: action } : r));
    toast.success('Transfer request ' + action);
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pending', value: requests.filter(r => r.status === 'pending').length, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
          { label: 'Approved', value: requests.filter(r => r.status === 'approved').length, color: 'text-teal-400', bg: 'bg-teal-500/10 border-teal-500/20' },
          { label: 'Rejected', value: requests.filter(r => r.status === 'rejected').length, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
        ].map((s, i) => (
          <div key={i} className={'glass rounded-xl p-4 text-center border ' + s.bg}>
            <div className={'text-2xl font-bold ' + s.color}>{s.value}</div>
            <div className="text-slate-500 text-xs mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {['all', 'pending', 'approved', 'rejected'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={'px-3 py-1.5 rounded-xl text-xs capitalize transition-all ' +
              (filter === f
                ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                : 'bg-white/5 text-slate-400 border border-white/10 hover:text-white'
              )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Request Cards */}
      <div className="space-y-4">
        {filtered.map((req, i) => {
          const u = urgencyConfig[req.urgency];
          const s = statusConfig[req.status];
          return (
            <motion.div
              key={req.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="glass rounded-2xl p-5"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center">
                    <User size={18} className="text-slate-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold">{req.patient}</span>
                      <span className="text-slate-500 text-xs">Age {req.age}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">{req.bloodGroup}</span>
                    </div>
                    <div className="text-slate-400 text-sm mt-0.5">{req.condition}</div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                      <ArrowRight size={11} />
                      <span>From: {req.fromHospital}</span>
                      <span>• {req.time}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={'text-xs px-2.5 py-1 rounded-full border font-medium ' + u.bg + ' ' + u.color}>
                    {u.label}
                  </span>
                  <span className={'p-1.5 rounded-lg ' + s.bg}>
                    <s.icon size={14} className={s.color} />
                  </span>
                </div>
              </div>

              {req.status === 'pending' && (
                <div className="flex gap-3 pt-3 border-t border-white/5">
                  <button
                    onClick={() => handleAction(req.id, 'rejected')}
                    className="flex-1 py-2 rounded-xl border border-red-500/30 text-red-400 text-sm hover:bg-red-500/10 transition-all flex items-center justify-center gap-2"
                  >
                    <XCircle size={14} /> Reject
                  </button>
                  <button
                    onClick={() => handleAction(req.id, 'approved')}
                    className="flex-1 py-2 rounded-xl bg-teal-500/15 border border-teal-500/30 text-teal-400 text-sm font-semibold hover:bg-teal-500/25 transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={14} /> Approve Transfer
                  </button>
                </div>
              )}

              {req.status !== 'pending' && (
                <div className={'pt-3 border-t border-white/5 text-xs font-medium ' + s.color}>
                  Transfer {req.status}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}