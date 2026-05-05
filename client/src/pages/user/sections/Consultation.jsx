import { useState } from 'react';
import { motion } from 'framer-motion';
import { Stethoscope, Search, Star, Clock, Video, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const doctors = [
  { name: 'Dr. Priya Sharma', specialty: 'Cardiologist', rating: 4.9, exp: '12 yrs', fee: 500, available: true, avatar: 'PS' },
  { name: 'Dr. Rahul Verma', specialty: 'Neurologist', rating: 4.7, exp: '8 yrs', fee: 600, available: true, avatar: 'RV' },
  { name: 'Dr. Anjali Gupta', specialty: 'Pediatrician', rating: 4.8, exp: '10 yrs', fee: 400, available: false, avatar: 'AG' },
  { name: 'Dr. Suresh Patel', specialty: 'Orthopedist', rating: 4.6, exp: '15 yrs', fee: 700, available: true, avatar: 'SP' },
  { name: 'Dr. Meena Joshi', specialty: 'Dermatologist', rating: 4.9, exp: '7 yrs', fee: 450, available: true, avatar: 'MJ' },
  { name: 'Dr. Arun Singh', specialty: 'General Physician', rating: 4.5, exp: '5 yrs', fee: 300, available: true, avatar: 'AS' },
];

const specialties = ['All', 'Cardiologist', 'Neurologist', 'Pediatrician', 'Orthopedist', 'Dermatologist', 'General Physician'];

export default function Consultation() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [selected, setSelected] = useState(null);

  const filtered = doctors.filter(d =>
    (filter === 'All' || d.specialty === filter) &&
    (d.name.toLowerCase().includes(search.toLowerCase()) || d.specialty.toLowerCase().includes(search.toLowerCase()))
  );

  const handleBook = (doctor) => {
    toast.success('Appointment request sent to ' + doctor.name);
    setSelected(null);
  };

  return (
    <div className="space-y-6">
      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search doctors or specialties..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-teal-500/50 transition-colors"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {specialties.map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={'px-3 py-2 rounded-xl text-xs whitespace-nowrap transition-all ' +
                (filter === s
                  ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                  : 'bg-white/5 text-slate-400 border border-white/10 hover:text-white'
                )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Doctor Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((doc, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="glass rounded-2xl p-5"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500/30 to-violet-500/30 border border-white/10 flex items-center justify-center text-white font-bold">
                {doc.avatar}
              </div>
              <div className="flex-1">
                <div className="text-white font-semibold text-sm">{doc.name}</div>
                <div className="text-teal-400 text-xs">{doc.specialty}</div>
                <div className="flex items-center gap-1 mt-1">
                  <Star size={11} className="text-yellow-400" fill="#facc15" />
                  <span className="text-xs text-slate-400">{doc.rating} • {doc.exp}</span>
                </div>
              </div>
              <span className={'text-xs px-2 py-0.5 rounded-full font-medium ' +
                (doc.available ? 'bg-teal-500/20 text-teal-400' : 'bg-slate-500/20 text-slate-500')}>
                {doc.available ? 'Available' : 'Busy'}
              </span>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/5">
              <div>
                <div className="text-xs text-slate-500">Consultation fee</div>
                <div className="text-white font-bold">₹{doc.fee}</div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => toast('Video consultation — available in Telemedicine tab')}
                  className="p-2 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 hover:bg-violet-500/20 transition-all"
                >
                  <Video size={14} />
                </button>
                <button
                  disabled={!doc.available}
                  onClick={() => setSelected(doc)}
                  className={'px-3 py-2 rounded-xl text-xs font-semibold transition-all ' +
                    (doc.available
                      ? 'bg-teal-500/15 border border-teal-500/30 text-teal-400 hover:bg-teal-500/25'
                      : 'bg-white/5 border border-white/5 text-slate-600 cursor-not-allowed'
                    )}
                >
                  Book
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Booking Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-white/10 rounded-3xl p-6 w-full max-w-md"
          >
            <h3 className="text-white font-bold text-lg mb-1">Book Appointment</h3>
            <p className="text-slate-400 text-sm mb-6">with {selected.name}</p>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Preferred Date</label>
                <input type="date"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500/50"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Preferred Time</label>
                <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500/50">
                  <option className="bg-slate-900">Morning — 9:00 AM</option>
                  <option className="bg-slate-900">Morning — 10:00 AM</option>
                  <option className="bg-slate-900">Afternoon — 2:00 PM</option>
                  <option className="bg-slate-900">Evening — 5:00 PM</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Reason for visit</label>
                <textarea
                  rows={3}
                  placeholder="Brief description of your symptoms..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-teal-500/50 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setSelected(null)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-400 text-sm hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleBook(selected)}
                className="flex-1 py-2.5 rounded-xl bg-teal-500 text-slate-900 text-sm font-bold hover:bg-teal-400 transition-all flex items-center justify-center gap-2"
              >
                <Calendar size={14} /> Confirm Booking
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}