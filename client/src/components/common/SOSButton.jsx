import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, MapPin, X, AlertTriangle, CheckCircle, Loader } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function SOSButton({ variant = 'floating' }) {
  const [state, setstate] = useState('idle'); // idle | confirming | locating | sending | sent
  const [nearbyHospitals, setNearbyHospitals] = useState([]);
  const [alertId, setAlertId] = useState(null);
  const timerRef = useRef(null);
  const [countdown, setCountdown] = useState(3);

  const handleSOS = () => {
    if (state !== 'idle') return;
    setstate('confirming');
    setCountdown(3);

    let count = 3;
    timerRef.current = setInterval(() => {
      count--;
      setCountdown(count);
      if (count <= 0) {
        clearInterval(timerRef.current);
        sendSOS();
      }
    }, 1000);
  };

  const cancelSOS = () => {
    clearInterval(timerRef.current);
    setstate('idle');
    setCountdown(3);
  };

  const sendSOS = () => {
    setstate('locating');

    const doSend = async (lat, lng, address) => {
      setstate('sending');
      try {
        const { data } = await api.post('/sos/send', {
          lat,
          lng,
          address,
          message: 'Emergency! Need immediate medical assistance.',
        });
        setAlertId(data.alertId);
        setNearbyHospitals(data.nearbyHospitals || []);
        setstate('sent');
        toast.success('SOS sent! ' + data.notifiedHospitals + ' hospitals notified.');
      } catch (err) {
        toast.error('SOS failed. Call 112 immediately!');
        setstate('idle');
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          doSend(
            pos.coords.latitude,
            pos.coords.longitude,
            'GPS location detected'
          );
        },
        () => {
          // Send without location
          doSend(0, 0, 'Location unavailable');
        },
        { timeout: 5000 }
      );
    } else {
      doSend(0, 0, 'Location unavailable');
    }
  };

  const reset = () => {
    setstate('idle');
    setNearbyHospitals([]);
    setAlertId(null);
    setCountdown(3);
  };

  // Floating variant (for dashboard)
  if (variant === 'floating') {
    return (
      <>
        {/* SOS Floating Button */}
        <motion.button
          onClick={handleSOS}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-24 left-6 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl bg-red-600 text-white font-bold shadow-2xl"
          style={{
            boxShadow: '0 0 0 0 rgba(239,68,68,0.7)',
            animation: state === 'idle' ? 'sos-pulse 1.8s infinite' : 'none',
          }}
        >
          <Phone size={18} className="animate-pulse" />
          SOS
        </motion.button>

        {/* Modal */}
        <AnimatePresence>
          {state !== 'idle' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-slate-900 border border-red-500/30 rounded-3xl p-6 w-full max-w-sm text-center"
              >
                <SOSModalContent
                  state={state}
                  countdown={countdown}
                  nearbyHospitals={nearbyHospitals}
                  onCancel={cancelSOS}
                  onReset={reset}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  // Inline variant (for landing page)
  return (
    <>
      <button
        onClick={handleSOS}
        className="sos-btn px-8 py-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-lg transition-all flex items-center gap-2"
      >
        <Phone size={20} className="animate-pulse" /> SOS Emergency
      </button>

      <AnimatePresence>
        {state !== 'idle' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-red-500/30 rounded-3xl p-6 w-full max-w-sm text-center"
            >
              <SOSModalContent
                state={state}
                countdown={countdown}
                nearbyHospitals={nearbyHospitals}
                onCancel={cancelSOS}
                onReset={reset}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function SOSModalContent({ state, countdown, nearbyHospitals, onCancel, onReset }) {
  if (state === 'confirming') {
    return (
      <>
        <div className="w-20 h-20 rounded-full bg-red-500/20 border-2 border-red-500/50 flex items-center justify-center mx-auto mb-4">
          <div className="text-4xl font-black text-red-400">{countdown}</div>
        </div>
        <h3 className="text-white font-bold text-xl mb-2">Sending SOS in {countdown}...</h3>
        <p className="text-slate-400 text-sm mb-6">
          Emergency alert will be sent to nearby hospitals. Your location will be shared.
        </p>
        <button
          onClick={onCancel}
          className="w-full py-3 rounded-xl border border-white/10 text-slate-300 font-semibold hover:bg-white/5 transition-all flex items-center justify-center gap-2"
        >
          <X size={18} /> Cancel SOS
        </button>
      </>
    );
  }

  if (state === 'locating') {
    return (
      <>
        <div className="w-20 h-20 rounded-full bg-orange-500/20 border-2 border-orange-500/40 flex items-center justify-center mx-auto mb-4">
          <MapPin size={32} className="text-orange-400 animate-bounce" />
        </div>
        <h3 className="text-white font-bold text-xl mb-2">Getting Your Location</h3>
        <p className="text-slate-400 text-sm">Please allow location access for faster response...</p>
      </>
    );
  }

  if (state === 'sending') {
    return (
      <>
        <div className="w-20 h-20 rounded-full bg-red-500/20 border-2 border-red-500/40 flex items-center justify-center mx-auto mb-4">
          <Loader size={32} className="text-red-400 animate-spin" />
        </div>
        <h3 className="text-white font-bold text-xl mb-2">Sending SOS Alert...</h3>
        <p className="text-slate-400 text-sm">Notifying nearby hospitals and emergency services.</p>
      </>
    );
  }

  if (state === 'sent') {
    return (
      <>
        <div className="w-20 h-20 rounded-full bg-teal-500/20 border-2 border-teal-500/40 flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} className="text-teal-400" />
        </div>
        <h3 className="text-white font-bold text-xl mb-2">SOS Alert Sent!</h3>
        <p className="text-slate-400 text-sm mb-4">
          Emergency services have been notified. Stay calm and stay where you are.
        </p>

        {nearbyHospitals.length > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-4 text-left">
            <div className="text-xs text-slate-400 uppercase tracking-wider mb-2">Notified Hospitals</div>
            <div className="space-y-2">
              {nearbyHospitals.slice(0, 3).map((h, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-white text-sm">{h.name}</span>
                  <a href={'tel:' + h.phone} className="text-teal-400 text-xs hover:underline">
                    {h.phone}
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4">
          <div className="text-red-400 text-xs font-semibold">If no response within 5 minutes:</div>
          <a href="tel:112" className="text-white font-bold text-lg">Call 112 (Emergency)</a>
        </div>

        <button
          onClick={onReset}
          className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-sm hover:bg-white/10 transition-all"
        >
          Close
        </button>
      </>
    );
  }

  return null;
}