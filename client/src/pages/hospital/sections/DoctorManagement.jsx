import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Trash2, Edit3, CheckCircle, XCircle, Star } from 'lucide-react';
import toast from 'react-hot-toast';

const initialDoctors = [
  { id: 1, name: 'Dr. Priya Sharma', specialty: 'Cardiologist', phone: '9876543210', experience: 12, status: 'active', rating: 4.9 },
  { id: 2, name: 'Dr. Rahul Verma', specialty: 'Neurologist', phone: '9876543211', experience: 8, status: 'active', rating: 4.7 },
  { id: 3, name: 'Dr. Anjali Gupta', specialty: 'Pediatrician', phone: '9876543212', experience: 10, status: 'on-leave', rating: 4.8 },
  { id: 4, name: 'Dr. Suresh Patel', specialty: 'Orthopedist', phone: '9876543213', experience: 15, status: 'active', rating: 4.6 },
];

const specialties = ['Cardiologist', 'Neurologist', 'Pediatrician', 'Orthopedist', 'Dermatologist', 'General Physician', 'Surgeon', 'Radiologist'];

const emptyForm = { name: '', specialty: 'Cardiologist', phone: '', experience: '' };

export default function DoctorManagement() {
  const [doctors, setDoctors] = useState(initialDoctors);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);

  const filtered = doctors.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.specialty.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = () => {
    if (!form.name || !form.phone || !form.experience) {
      toast.error('Please fill all fields');
      return;
    }
    if (editId) {
      setDoctors(prev => prev.map(d => d.id === editId ? { ...d, ...form, experience: parseInt(form.experience) } : d));
      toast.success('Doctor updated');
      setEditId(null);
    } else {
      const newDoc = { ...form, id: Date.now(), experience: parseInt(form.experience), status: 'active', rating: 4.5 };
      setDoctors(prev => [...prev, newDoc]);
      toast.success('Doctor added successfully');
    }
    setForm(emptyForm);
    setShowForm(false);
  };

  const handleEdit = (doc) => {
    setForm({ name: doc.name, specialty: doc.specialty, phone: doc.phone, experience: doc.experience });
    setEditId(doc.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    setDoctors(prev => prev.filter(d => d.id !== id));
    toast.success('Doctor removed');
  };

  const toggleStatus = (id) => {
    setDoctors(prev => prev.map(d =>
      d.id === id ? { ...d, status: d.status === 'active' ? 'on-leave' : 'active' } : d
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search doctors..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/50"
          />
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setEditId(null); setForm(emptyForm); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-500/15 border border-violet-500/30 text-violet-400 text-sm font-semibold hover:bg-violet-500/25 transition-all"
        >
          <Plus size={16} /> Add Doctor
        </button>
      </div>

      {/* Add / Edit Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass rounded-2xl p-6 overflow-hidden"
          >
            <h3 className="text-white font-semibold mb-4">{editId ? 'Edit Doctor' : 'Add New Doctor'}</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Full Name</label>
                <input
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Dr. Full Name"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/50"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Specialty</label>
                <select
                  value={form.specialty}
                  onChange={e => setForm({ ...form, specialty: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500/50"
                >
                  {specialties.map(s => <option key={s} value={s} className="bg-slate-900">{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Phone</label>
                <input
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  placeholder="10-digit phone"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/50"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Experience (years)</label>
                <input
                  type="number"
                  value={form.experience}
                  onChange={e => setForm({ ...form, experience: e.target.value })}
                  placeholder="e.g. 5"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/50"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => { setShowForm(false); setEditId(null); setForm(emptyForm); }}
                className="px-4 py-2 rounded-xl border border-white/10 text-slate-400 text-sm hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-5 py-2 rounded-xl bg-violet-500 text-white text-sm font-semibold hover:bg-violet-400 transition-all"
              >
                {editId ? 'Update Doctor' : 'Add Doctor'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Doctors', value: doctors.length, color: 'text-violet-400' },
          { label: 'Active', value: doctors.filter(d => d.status === 'active').length, color: 'text-teal-400' },
          { label: 'On Leave', value: doctors.filter(d => d.status === 'on-leave').length, color: 'text-yellow-400' },
        ].map((s, i) => (
          <div key={i} className="glass rounded-xl p-4 text-center">
            <div className={'text-2xl font-bold ' + s.color}>{s.value}</div>
            <div className="text-slate-500 text-xs mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Doctor List */}
      <div className="space-y-3">
        {filtered.map((doc, i) => (
          <motion.div
            key={doc.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="glass rounded-2xl p-4 flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-teal-500/20 border border-white/10 flex items-center justify-center text-white font-bold shrink-0">
              {doc.name.split(' ').map(w => w[0]).join('').slice(1, 3)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-white font-semibold text-sm">{doc.name}</span>
                <span className={'text-xs px-2 py-0.5 rounded-full font-medium ' +
                  (doc.status === 'active' ? 'bg-teal-500/15 text-teal-400' : 'bg-yellow-500/15 text-yellow-400')
                }>
                  {doc.status === 'active' ? 'Active' : 'On Leave'}
                </span>
              </div>
              <div className="text-violet-400 text-xs">{doc.specialty}</div>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-slate-500 text-xs">{doc.experience} yrs exp</span>
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <Star size={10} className="text-yellow-400" fill="#facc15" /> {doc.rating}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => toggleStatus(doc.id)}
                className={'p-2 rounded-xl transition-all ' +
                  (doc.status === 'active'
                    ? 'bg-teal-500/10 text-teal-400 hover:bg-teal-500/20'
                    : 'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20'
                  )}
              >
                {doc.status === 'active' ? <CheckCircle size={15} /> : <XCircle size={15} />}
              </button>
              <button
                onClick={() => handleEdit(doc)}
                className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
              >
                <Edit3 size={15} />
              </button>
              <button
                onClick={() => handleDelete(doc.id)}
                className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}