import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { io } from 'socket.io-client';
import { Video, VideoOff, Mic, MicOff, Phone, Copy, CheckCircle, Users } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';

const SOCKET_URL = 'http://localhost:5000';
const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export default function DoctorCall() {
  const { user } = useAuth();
  const [stage, setStage] = useState('lobby');
  const [roomId, setRoomId] = useState('');
  const [inputRoom, setInputRoom] = useState('');
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [patientName, setPatientName] = useState('');
  const [copied, setCopied] = useState(false);
  const [remoteStream, setRemoteStream] = useState(false);

  const socketRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const timerRef = useRef(null);

  const generateRoomId = () => 'UC-' + Math.random().toString(36).substring(2, 8).toUpperCase();

  const startLocalStream = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localStreamRef.current = stream;
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    return stream;
  };

  const createPeerConnection = useCallback((targetSocketId) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    peerConnectionRef.current = pc;
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => pc.addTrack(track, localStreamRef.current));
    }
    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
        setRemoteStream(true);
      }
    };
    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit('ice-candidate', { to: targetSocketId, candidate: event.candidate });
      }
    };
    return pc;
  }, []);

  const startRoom = async () => {
    const rid = generateRoomId();
    setRoomId(rid);
    try {
      await startLocalStream();
      setStage('waiting');
      socketRef.current = io(SOCKET_URL);
      socketRef.current.on('connect', () => {
        socketRef.current.emit('join-room', {
          roomId: rid, userId: user?.id,
          userName: user?.name || 'Doctor', role: 'hospital',
        });
      });
      socketRef.current.on('user-joined', async ({ socketId, userName }) => {
        setPatientName(userName);
        setStage('call');
        startTimer();
        const pc = createPeerConnection(socketId);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socketRef.current.emit('offer', { to: socketId, offer });
      });
      setupSignaling();
    } catch { setStage('lobby'); }
  };

  const joinRoom = async () => {
    if (!inputRoom.trim()) { toast.error('Enter room code'); return; }
    const rid = inputRoom.trim().toUpperCase();
    setRoomId(rid);
    try {
      await startLocalStream();
      setStage('call');
      startTimer();
      socketRef.current = io(SOCKET_URL);
      socketRef.current.on('connect', () => {
        socketRef.current.emit('join-room', {
          roomId: rid, userId: user?.id,
          userName: user?.name || 'Doctor', role: 'hospital',
        });
      });
      socketRef.current.on('existing-users', async (users) => {
        if (users.length > 0) {
          const target = users[0];
          setPatientName(target.userName);
          const pc = createPeerConnection(target.socketId);
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socketRef.current.emit('offer', { to: target.socketId, offer });
        }
      });
      setupSignaling();
    } catch { setStage('lobby'); }
  };

  const setupSignaling = () => {
    socketRef.current.on('offer', async ({ from, offer }) => {
      const pc = createPeerConnection(from);
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socketRef.current.emit('answer', { to: from, answer });
      setStage('call');
      startTimer();
    });
    socketRef.current.on('answer', async ({ answer }) => {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });
    socketRef.current.on('ice-candidate', async ({ candidate }) => {
      if (peerConnectionRef.current) {
        try { await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate)); } catch {}
      }
    });
    socketRef.current.on('call-ended', () => { toast('Patient ended the call.'); endCall(); });
    socketRef.current.on('user-left', () => { toast('Patient left.'); setRemoteStream(false); });
  };

  const startTimer = () => {
    setCallDuration(0);
    timerRef.current = setInterval(() => setCallDuration(prev => prev + 1), 1000);
  };

  const endCall = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (peerConnectionRef.current) peerConnectionRef.current.close();
    if (localStreamRef.current) localStreamRef.current.getTracks().forEach(t => t.stop());
    if (socketRef.current) { socketRef.current.emit('end-call', { roomId }); socketRef.current.disconnect(); }
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    setStage('lobby'); setRemoteStream(false); setCallDuration(0); setRoomId('');
  }, [roomId]);

  const toggleMic = () => {
    const audio = localStreamRef.current?.getAudioTracks()[0];
    if (audio) { audio.enabled = !audio.enabled; setMicOn(audio.enabled); }
  };

  const toggleCam = () => {
    const video = localStreamRef.current?.getVideoTracks()[0];
    if (video) { video.enabled = !video.enabled; setCamOn(video.enabled); }
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    toast.success('Room code copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    return m + ':' + (s % 60).toString().padStart(2, '0');
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (localStreamRef.current) localStreamRef.current.getTracks().forEach(t => t.stop());
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  if (stage === 'lobby') {
    return (
      <div className="space-y-6 max-w-2xl">
        <div className="glass rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-2">Start Patient Consultation</h3>
          <p className="text-slate-400 text-sm mb-4">Create a room and share the code with your patient.</p>
          <button onClick={startRoom}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-500 to-teal-500 text-white font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
            <Video size={18} /> Start Video Room
          </button>
        </div>
        <div className="glass rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-2">Join Patient's Room</h3>
          <p className="text-slate-400 text-sm mb-4">Enter the room code from the patient.</p>
          <div className="flex gap-3">
            <input value={inputRoom} onChange={e => setInputRoom(e.target.value.toUpperCase())}
              placeholder="Enter room code"
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/50 uppercase" />
            <button onClick={joinRoom}
              className="px-5 py-2.5 rounded-xl bg-violet-500/15 border border-violet-500/30 text-violet-400 font-semibold text-sm hover:bg-violet-500/25 transition-all">
              Join
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'waiting') {
    return (
      <div className="max-w-md mx-auto">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-3xl p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-violet-500/20 border-2 border-violet-500/40 flex items-center justify-center mx-auto mb-6">
            <Users size={32} className="text-violet-400" />
          </div>
          <h2 className="text-white font-bold text-xl mb-2">Waiting for Patient</h2>
          <p className="text-slate-400 text-sm mb-6">Share this room code with your patient.</p>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-4">
            <div className="text-slate-400 text-xs mb-2 uppercase tracking-wider">Room Code</div>
            <div className="text-3xl font-bold text-violet-400 tracking-widest mb-3">{roomId}</div>
            <button onClick={copyRoomId}
              className="flex items-center gap-2 mx-auto px-4 py-2 rounded-xl bg-violet-500/15 border border-violet-500/30 text-violet-400 text-sm hover:bg-violet-500/25 transition-all">
              {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy Code'}
            </button>
          </div>
          <div className="relative bg-slate-900 rounded-2xl overflow-hidden mb-4" style={{ height: '140px' }}>
            <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
          </div>
          <button onClick={endCall}
            className="w-full py-2.5 rounded-xl border border-red-500/30 text-red-400 text-sm hover:bg-red-500/10 transition-all">
            Cancel
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div className="relative bg-slate-900 border border-white/10 rounded-3xl overflow-hidden" style={{ height: '420px' }}>
        <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
        {!remoteStream && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900">
            <div className="w-20 h-20 rounded-full bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 font-bold text-2xl mb-3">
              {patientName ? patientName.charAt(0).toUpperCase() : '?'}
            </div>
            <div className="text-white font-semibold">{patientName || 'Patient'}</div>
            <div className="text-slate-400 text-sm mt-1">Connecting...</div>
          </div>
        )}
        <div className="absolute bottom-4 right-4 w-32 h-24 bg-slate-800 border-2 border-white/20 rounded-xl overflow-hidden shadow-xl">
          <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
        </div>
        <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-black/50 backdrop-blur rounded-full">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-white text-xs font-mono">{formatTime(callDuration)}</span>
        </div>
      </div>
      <div className="glass rounded-2xl p-4 flex items-center justify-center gap-4">
        <button onClick={toggleMic}
          className={'p-3.5 rounded-xl transition-all ' + (micOn ? 'bg-white/10 text-white' : 'bg-red-500/20 text-red-400 border border-red-500/30')}>
          {micOn ? <Mic size={20} /> : <MicOff size={20} />}
        </button>
        <button onClick={toggleCam}
          className={'p-3.5 rounded-xl transition-all ' + (camOn ? 'bg-white/10 text-white' : 'bg-red-500/20 text-red-400 border border-red-500/30')}>
          {camOn ? <Video size={20} /> : <VideoOff size={20} />}
        </button>
        <button onClick={copyRoomId}
          className="p-3.5 rounded-xl bg-white/10 text-white hover:bg-white/15 transition-all">
          {copied ? <CheckCircle size={20} className="text-teal-400" /> : <Copy size={20} />}
        </button>
        <button onClick={endCall}
          className="p-3.5 rounded-xl bg-red-500 hover:bg-red-600 text-white transition-all">
          <Phone size={20} className="rotate-[135deg]" />
        </button>
      </div>
    </motion.div>
  );
}