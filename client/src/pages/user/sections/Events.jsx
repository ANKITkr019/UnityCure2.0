import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const events = [
  { title: 'Free Blood Donation Camp', date: 'May 10, 2026', location: 'PMCH Dhanbad', attendees: 142, category: 'Camp', color: 'from-red-600/20 to-red-900/10 border-red-500/20' },
  { title: 'Diabetes Awareness Walk', date: 'May 14, 2026', location: 'Jubilee Park', attendees: 89, category: 'Awareness', color: 'from-violet-600/20 to-violet-900/10 border-violet-500/20' },
  { title: 'Mental Health Seminar', date: 'May 18, 2026', location: 'Online (Zoom)', attendees: 230, category: 'Seminar', color: 'from-teal-600/20 to-teal-900/10 border-teal-500/20' },
  { title: 'Yoga & Wellness Workshop', date: 'May 22, 2026', location: 'City Sports Complex', attendees: 64, category: 'Wellness', color: 'from-emerald-600/20 to-emerald-900/10 border-emerald-500/20' },
  { title: 'Cancer Screening Drive', date: 'May 28, 2026', location: 'Steel City Hospital', attendees: 175, category: 'Screening', color: 'from-orange-600/20 to-orange-900/10 border-orange-500/20' },
];

export default function Events() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-slate-400 text-sm">Upcoming health events in your area</p>
        <button className="text-teal-400 text-sm hover:underline">View All</button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {events.map((event, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={'rounded-2xl p-5 border bg-gradient-to-br ' + event.color}
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white font-medium">
                {event.category}
              </span>
            </div>
            <h3 className="text-white font-bold mb-3">{event.title}</h3>
            <div className="space-y-1.5 mb-4">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Calendar size={12} /> {event.date}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <MapPin size={12} /> {event.location}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Users size={12} /> {event.attendees} registered
              </div>
            </div>
            <button
              onClick={() => toast('Registered for ' + event.title + '!')}
              className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-medium transition-all flex items-center justify-center gap-2"
            >
              Register Now <ArrowRight size={13} />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}