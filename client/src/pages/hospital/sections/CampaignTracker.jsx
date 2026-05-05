import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Megaphone, Users, Calendar, TrendingUp, Edit3, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const initialCampaigns = [
  { id: 1, title: 'Blood Donation Drive', target: 200, reached: 142, startDate: '2026-05-01', endDate: '2026-05-15', status: 'active', category: 'Donation' },
  { id: 2, title: 'Free Eye Checkup Camp', target: 500, reached: 500, startDate: '2026-04-10', endDate: '2026-04-20', status: 'completed', category: 'Checkup' },
  { id: 3, title: 'Diabetes Awareness Week', target: 1000, reached: 340, startDate: '2026-05-10', endDate: '2026-05-17', status: 'upcoming', category: 'Awareness' },
  { id: 4, title: 'Maternal Health Program', target: 150, reached: 89, startDate: '2026-05-05', endDate: '2026-05-30', status: 'active', category: 'Maternal' },
];

const statusColors = {
  active:    'bg-teal-500/15 text-teal-400 border-teal-500/30',
  completed: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
  upcoming:  'bg-violet-500/15 text-violet-400 border-violet-500/30',
};

export default function CampaignTracker() {
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', target: '', startDate: '', endDate: '', category: 'Awareness' });

  const handleAdd = () => {
    if (!form.title || !form.target || !form.startDate || !form.endDate) {
      toast.error('Please fill all fields');
      return;
    }
    setCampaigns(prev => [...prev, {
      id: Date.now(),
      ...form,
      target: parseInt(form.target),
      reached: 0,
      status: 'upcoming',
    }]);
    setForm({ title: '', target: '', startDate: '', endDate: '', category: 'Awareness' });
    setShowForm(false);
    toast.success('Campaign created!');
  };

  const handleDelete = (id) => {
    setCampaigns(prev => prev.filter(c => c.id !== id));
    toast.success('Campaign removed');
  };

  const totalReach = campaigns.reduce((a, c) => a + c.reached, 0);
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Campaigns', value: campaigns.length, color: 'text-violet-400' },
          { label: 'Active Now', value: activeCampaigns, color: 'text-teal-400' },
          { label: 'Total Reach', value: totalReach.toLocaleString(), color: 'text-orange-400' },
        ].map((s, i) => (
          <div key={i} className="glass rounded-xl p-4 text-center">
            <div className={'text-2xl font-bold ' + s.color}>{s.value}</div>
            <div className="text-slate-500 text-xs mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Add Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-500/15 border border-violet-500/30 text-violet-400 text-sm font-semibold hover:bg-violet-500/25 transition-all"
        >
          <Plus size={16} /> New Campaign
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6"
        >
          <h3 className="text-white font-semibold mb-4">Create Campaign</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs text-slate-400 mb-1.5 block">Campaign Title</label>
              <input
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Free Blood Donation Drive"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/50"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Target Participants</label>
              <input
                type="number"
                value={form.target}
                onChange={e => setForm({ ...form, target: e.target.value })}
                placeholder="e.g. 500"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/50"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Category</label>
              <select
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500/50"
              >
                {['Awareness', 'Donation', 'Checkup', 'Screening', 'Maternal', 'Wellness'].map(c => (
                  <option key={c} value={c} className="bg-slate-900">{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Start Date</label>
              <input
                type="date"
                value={form.startDate}
                onChange={e => setForm({ ...form, startDate: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500/50"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">End Date</label>
              <input
                type="date"
                value={form.endDate}
                onChange={e => setForm({ ...form, endDate: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500/50"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl border border-white/10 text-slate-400 text-sm hover:bg-white/5">Cancel</button>
            <button onClick={handleAdd} className="px-5 py-2 rounded-xl bg-violet-500 text-white text-sm font-semibold hover:bg-violet-400 transition-all">Create Campaign</button>
          </div>
        </motion.div>
      )}

      {/* Campaign Cards */}
      <div className="space-y-4">
        {campaigns.map((c, i) => {
          const percent = Math.round((c.reached / c.target) * 100);
          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="glass rounded-2xl p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Megaphone size={16} className="text-violet-400" />
                    <span className="text-white font-semibold">{c.title}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Calendar size={11} /> {c.startDate} → {c.endDate}</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">{c.category}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={'text-xs px-2.5 py-1 rounded-full border font-medium ' + statusColors[c.status]}>
                    {c.status}
                  </span>
                  <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Progress */}
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-slate-400 flex items-center gap-1"><Users size={11} /> {c.reached.toLocaleString()} reached</span>
                  <span className="text-xs text-slate-400">Target: {c.target.toLocaleString()}</span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: Math.min(percent, 100) + '%' }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                    className={'h-full rounded-full ' +
                      (percent >= 100 ? 'bg-teal-500' : percent >= 60 ? 'bg-violet-500' : 'bg-orange-500')
                    }
                  />
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className={'text-xs font-semibold ' + (percent >= 100 ? 'text-teal-400' : 'text-violet-400')}>
                    {Math.min(percent, 100)}% complete
                  </span>
                  {percent >= 100 && <span className="text-xs text-teal-400">🎉 Target reached!</span>}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}