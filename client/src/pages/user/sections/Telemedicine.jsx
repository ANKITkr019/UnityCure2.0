import { useState } from 'react';
import { motion } from 'framer-motion';
import { Video, VideoOff, Mic, MicOff, Phone, Monitor, MessageSquare, Users } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Telemedicine() {
  const [inCall, setInCall] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  const upcomingCalls = [
    { doctor: 'Dr. Priya Sharma', time: 'Today, 3:00 PM', specialty: 'Cardiologist', avatar: 'PS' },
    { doctor: 'Dr. Rahul Verma', time: 'Tomorrow, 10:00 AM', specialty: 'Neurologist', avatar: 'RV' },
  ];

  return (
    <div className="space-y-6">
      {!inCall ? (
        <>
          {/* How it works */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-4">How Telemedicine Works</h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                { step: '1', title: 'Book Appointment', desc: 'Schedule a video call with your doctor' },
                { step: '2', title: 'Get Notified', desc: 'Receive a reminder 15 minutes before' },
                { step: '3', title: 'Join the Call', desc: 'Click Join when your session starts' },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <div className="w-10 h-10 rounded-full bg-teal-500/20 border border-teal-500/30 text-teal-400 font-bold text-sm flex items-center justify-center mx-auto mb-2">
                    {s.step}
                  </div>
                  <div className="text-white text-sm font-medium mb-1">{s.title}</div>
                  <div className="text-slate-500 text-xs">{s.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Calls */}
          <div>
            <h3 className="text-slate-400 text-sm font-medium mb-4 uppercase tracking-wider">Upcoming Video Calls</h3>
            <div className="space-y-3">
              {upcomingCalls.map((call, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass rounded-2xl p-5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-violet-400 font-bold">
                      {call.avatar}
                    </div>
                    <div>
                      <div className="text-white font-semibold">{call.doctor}</div>
                      <div className="text-slate-500 text-xs">{call.specialty}</div>
                      <div className="text-teal-400 text-xs mt-1">{call.time}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setInCall(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-500 text-slate-900 font-semibold text-sm hover:bg-teal-400 transition-all"
                  >
                    <Video size={15} /> Join Call
                  </button>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Instant Call */}
          <div className="glass rounded-2xl p-6 text-center">
            <Video size={32} className="text-teal-400 mx-auto mb-3" />
            <h3 className="text-white font-semibold mb-2">Instant Consultation</h3>
            <p className="text-slate-400 text-sm mb-4">Connect with an available doctor right now — no appointment needed.</p>
            <button
              onClick={() => toast('Instant consultation — book an appointment first to enable this feature.')}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-teal-400 text-slate-900 font-bold hover:opacity-90 transition-opacity"
            >
              Connect Now
            </button>
          </div>
        </>
      ) : (
        /* In-Call UI */
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4"
        >
          <div className="relative bg-slate-900 border border-white/10 rounded-3xl overflow-hidden aspect-video flex items-center justify-center">
            {/* Remote Video Placeholder */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-violet-400 font-bold text-2xl mx-auto mb-3">PS</div>
                <div className="text-white font-semibold">Dr. Priya Sharma</div>
                <div className="text-slate-400 text-sm mt-1">Video connecting...</div>
              </div>
            </div>

            {/* Self View */}
            <div className="absolute bottom-4 right-4 w-28 h-20 bg-slate-800 border border-white/10 rounded-xl flex items-center justify-center">
              <div className="text-slate-500 text-xs">You</div>
            </div>

            {/* Call Timer */}
            <div className="absolute top-4 left-4 px-3 py-1 bg-black/40 rounded-full text-xs text-white">
              00:02:34
            </div>
          </div>

          {/* Controls */}
          <div className="glass rounded-2xl p-4 flex items-center justify-center gap-4">
            <button
              onClick={() => setMicOn(!micOn)}
              className={'p-3 rounded-xl transition-all ' +
                (micOn ? 'bg-white/10 text-white hover:bg-white/15' : 'bg-red-500/20 text-red-400 border border-red-500/30')}
            >
              {micOn ? <Mic size={20} /> : <MicOff size={20} />}
            </button>
            <button
              onClick={() => setCamOn(!camOn)}
              className={'p-3 rounded-xl transition-all ' +
                (camOn ? 'bg-white/10 text-white hover:bg-white/15' : 'bg-red-500/20 text-red-400 border border-red-500/30')}
            >
              {camOn ? <Video size={20} /> : <VideoOff size={20} />}
            </button>
            <button className="p-3 rounded-xl bg-white/10 text-white hover:bg-white/15 transition-all">
              <Monitor size={20} />
            </button>
            <button className="p-3 rounded-xl bg-white/10 text-white hover:bg-white/15 transition-all">
              <MessageSquare size={20} />
            </button>
            <button
              onClick={() => { setInCall(false); toast('Call ended.'); }}
              className="p-3 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-all"
            >
              <Phone size={20} className="rotate-[135deg]" />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}