import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import {
  Video, VideoOff, Mic, MicOff, Phone, Monitor,
  MessageSquare, Users, Copy, CheckCircle, Send, X
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';

const SOCKET_URL = 'http://localhost:5000';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export default function Telemedicine() {
  const { user } = useAuth();
  const [stage, setStage] = useState('lobby'); // lobby | waiting | call
  const [roomId, setRoomId] = useState('');
  const [inputRoom, setInputRoom] = useState('');
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [remoteUserName, setRemoteUserName] = useState('');
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [remoteStream, setRemoteStream] = useState(false);

  const socketRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const timerRef = useRef(null);

  const generateRoomId = () => {
    return 'UC-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const startLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      return stream;
    } catch (err) {
      toast.error('Camera/mic access denied. Please allow permissions.');
      throw err;
    }
  };

  const createPeerConnection = useCallback((targetSocketId) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    peerConnectionRef.current = pc;

    // Add local tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    // Remote stream
    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
        setRemoteStream(true);
      }
    };

    // ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit('ice-candidate', {
          to: targetSocketId,
          candidate: event.candidate,
        });
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        toast.success('Call connected!');
      }
    };

    return pc;
  }, []);

  const startCall = async () => {
    const newRoomId = generateRoomId();
    setRoomId(newRoomId);

    try {
      await startLocalStream();
      setStage('waiting');

      // Connect socket
      socketRef.current = io(SOCKET_URL);

      socketRef.current.on('connect', () => {
        socketRef.current.emit('join-room', {
          roomId: newRoomId,
          userId: user?.id,
          userName: user?.name || 'Patient',
          role: 'user',
        });
      });

      socketRef.current.on('user-joined', async ({ socketId, userName }) => {
        setRemoteUserName(userName);
        toast.success(userName + ' joined the call!');
        setStage('call');
        startTimer();

        // Create offer
        const pc = createPeerConnection(socketId);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        socketRef.current.emit('offer', { to: socketId, offer });
      });

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
          await peerConnectionRef.current.setRemoteDescription(
            new RTCSessionDescription(answer)
          );
        }
      });

      socketRef.current.on('ice-candidate', async ({ candidate }) => {
        if (peerConnectionRef.current) {
          try {
            await peerConnectionRef.current.addIceCandidate(
              new RTCIceCandidate(candidate)
            );
          } catch (e) {}
        }
      });

      socketRef.current.on('call-message', (msg) => {
        setMessages(prev => [...prev, msg]);
      });

      socketRef.current.on('call-ended', () => {
        toast('The other person ended the call.');
        endCall();
      });

      socketRef.current.on('user-left', () => {
        toast('The other person left.');
        setRemoteStream(false);
      });

    } catch (err) {
      setStage('lobby');
    }
  };

  const joinCall = async () => {
    if (!inputRoom.trim()) {
      toast.error('Enter a room code');
      return;
    }
    const rid = inputRoom.trim().toUpperCase();
    setRoomId(rid);

    try {
      await startLocalStream();
      setStage('call');
      startTimer();

      socketRef.current = io(SOCKET_URL);

      socketRef.current.on('connect', () => {
        socketRef.current.emit('join-room', {
          roomId: rid,
          userId: user?.id,
          userName: user?.name || 'Patient',
          role: 'user',
        });
      });

      socketRef.current.on('existing-users', async (users) => {
        if (users.length > 0) {
          const target = users[0];
          setRemoteUserName(target.userName);
          const pc = createPeerConnection(target.socketId);
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socketRef.current.emit('offer', { to: target.socketId, offer });
        }
      });

      socketRef.current.on('offer', async ({ from, offer }) => {
        const pc = createPeerConnection(from);
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socketRef.current.emit('answer', { to: from, answer });
      });

      socketRef.current.on('answer', async ({ answer }) => {
        if (peerConnectionRef.current) {
          await peerConnectionRef.current.setRemoteDescription(
            new RTCSessionDescription(answer)
          );
        }
      });

      socketRef.current.on('ice-candidate', async ({ candidate }) => {
        if (peerConnectionRef.current) {
          try {
            await peerConnectionRef.current.addIceCandidate(
              new RTCIceCandidate(candidate)
            );
          } catch (e) {}
        }
      });

      socketRef.current.on('call-message', (msg) => {
        setMessages(prev => [...prev, msg]);
      });

      socketRef.current.on('call-ended', () => {
        toast('Call ended.');
        endCall();
      });

      socketRef.current.on('user-left', () => {
        toast('The other person left.');
        setRemoteStream(false);
      });

    } catch (err) {
      setStage('lobby');
    }
  };

  const startTimer = () => {
    setCallDuration(0);
    timerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  };

  const endCall = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (peerConnectionRef.current) peerConnectionRef.current.close();
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
    }
    if (socketRef.current) {
      socketRef.current.emit('end-call', { roomId });
      socketRef.current.disconnect();
    }
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    setStage('lobby');
    setRemoteStream(false);
    setMessages([]);
    setCallDuration(0);
    setRoomId('');
  }, [roomId]);

  const toggleMic = () => {
    if (localStreamRef.current) {
      const audio = localStreamRef.current.getAudioTracks()[0];
      if (audio) {
        audio.enabled = !audio.enabled;
        setMicOn(audio.enabled);
      }
    }
  };

  const toggleCam = () => {
    if (localStreamRef.current) {
      const video = localStreamRef.current.getVideoTracks()[0];
      if (video) {
        video.enabled = !video.enabled;
        setCamOn(video.enabled);
      }
    }
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    toast.success('Room code copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const sendChatMessage = () => {
    if (!chatInput.trim() || !socketRef.current) return;
    socketRef.current.emit('call-message', {
      roomId,
      message: chatInput,
      userName: user?.name || 'You',
    });
    setChatInput('');
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return m + ':' + sec;
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(t => t.stop());
      }
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  /* ── LOBBY ── */
  if (stage === 'lobby') {
    return (
      <div className="space-y-6 max-w-2xl">
        {/* How it works */}
        <div className="glass rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-4">How Telemedicine Works</h3>
          <div className="grid grid-cols-3 gap-4">
            {[
              { step: '1', title: 'Start a Call', desc: 'Generate a unique room code' },
              { step: '2', title: 'Share Code', desc: 'Share room code with your doctor' },
              { step: '3', title: 'Connect', desc: 'Doctor joins and call starts' },
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

        {/* Start new call */}
        <div className="glass rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-2">Start New Consultation</h3>
          <p className="text-slate-400 text-sm mb-4">
            Generate a room code and share it with your doctor.
          </p>
          <button
            onClick={startCall}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-teal-400 text-slate-900 font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          >
            <Video size={18} /> Start Video Call
          </button>
        </div>

        {/* Join existing call */}
        <div className="glass rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-2">Join a Call</h3>
          <p className="text-slate-400 text-sm mb-4">
            Enter the room code shared by your doctor.
          </p>
          <div className="flex gap-3">
            <input
              value={inputRoom}
              onChange={e => setInputRoom(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && joinCall()}
              placeholder="Enter room code (e.g. UC-ABC123)"
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-teal-500/50 uppercase"
            />
            <button
              onClick={joinCall}
              className="px-5 py-2.5 rounded-xl bg-violet-500/15 border border-violet-500/30 text-violet-400 font-semibold text-sm hover:bg-violet-500/25 transition-all"
            >
              Join
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── WAITING ── */
  if (stage === 'waiting') {
    return (
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-3xl p-8 text-center"
        >
          <div className="w-20 h-20 rounded-full bg-teal-500/20 border-2 border-teal-500/40 flex items-center justify-center mx-auto mb-6">
            <Video size={32} className="text-teal-400" />
          </div>
          <h2 className="text-white font-bold text-xl mb-2">Waiting for Doctor</h2>
          <p className="text-slate-400 text-sm mb-6">
            Share this room code with your doctor to start the call.
          </p>

          {/* Room code display */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6">
            <div className="text-slate-400 text-xs mb-2 uppercase tracking-wider">Room Code</div>
            <div className="text-3xl font-bold text-teal-400 tracking-widest mb-3">{roomId}</div>
            <button
              onClick={copyRoomId}
              className="flex items-center gap-2 mx-auto px-4 py-2 rounded-xl bg-teal-500/15 border border-teal-500/30 text-teal-400 text-sm hover:bg-teal-500/25 transition-all"
            >
              {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy Code'}
            </button>
          </div>

          {/* Waiting animation */}
          <div className="flex justify-center gap-1 mb-6">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                className="w-2 h-2 rounded-full bg-teal-400"
              />
            ))}
          </div>

          {/* Local preview */}
          <div className="relative bg-slate-900 rounded-2xl overflow-hidden mb-4" style={{ height: '160px' }}>
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 left-2 text-xs text-white bg-black/40 px-2 py-0.5 rounded-full">
              You (preview)
            </div>
          </div>

          <button
            onClick={endCall}
            className="w-full py-2.5 rounded-xl border border-red-500/30 text-red-400 text-sm hover:bg-red-500/10 transition-all"
          >
            Cancel
          </button>
        </motion.div>
      </div>
    );
  }

  /* ── IN CALL ── */
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      {/* Video Grid */}
      <div className="relative bg-slate-900 border border-white/10 rounded-3xl overflow-hidden" style={{ height: '420px' }}>
        {/* Remote Video */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />

        {/* Remote placeholder (when no stream) */}
        {!remoteStream && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900">
            <div className="w-20 h-20 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-violet-400 font-bold text-2xl mb-3">
              {remoteUserName ? remoteUserName.charAt(0).toUpperCase() : '?'}
            </div>
            <div className="text-white font-semibold">{remoteUserName || 'Waiting...'}</div>
            <div className="text-slate-400 text-sm mt-1">Connecting video...</div>
          </div>
        )}

        {/* Self View */}
        <div className="absolute bottom-4 right-4 w-32 h-24 bg-slate-800 border-2 border-white/20 rounded-xl overflow-hidden shadow-xl">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          {!camOn && (
            <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
              <VideoOff size={20} className="text-slate-500" />
            </div>
          )}
        </div>

        {/* Top Info Bar */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-black/50 backdrop-blur rounded-full">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-white text-xs font-mono">{formatTime(callDuration)}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-black/50 backdrop-blur rounded-full">
            <Users size={12} className="text-teal-400" />
            <span className="text-white text-xs">{remoteUserName || 'Waiting...'}</span>
          </div>
          {/* Room Code */}
          <button
            onClick={copyRoomId}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-black/50 backdrop-blur rounded-full text-xs text-teal-400 hover:bg-black/70 transition-all"
          >
            <Copy size={11} /> {roomId}
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="glass rounded-2xl p-4 flex items-center justify-center gap-4">
        <button
          onClick={toggleMic}
          className={'p-3.5 rounded-xl transition-all ' +
            (micOn ? 'bg-white/10 text-white hover:bg-white/15' : 'bg-red-500/20 text-red-400 border border-red-500/30')}
        >
          {micOn ? <Mic size={20} /> : <MicOff size={20} />}
        </button>
        <button
          onClick={toggleCam}
          className={'p-3.5 rounded-xl transition-all ' +
            (camOn ? 'bg-white/10 text-white hover:bg-white/15' : 'bg-red-500/20 text-red-400 border border-red-500/30')}
        >
          {camOn ? <Video size={20} /> : <VideoOff size={20} />}
        </button>
        <button
          onClick={() => setChatOpen(!chatOpen)}
          className={'p-3.5 rounded-xl transition-all relative ' +
            (chatOpen ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30' : 'bg-white/10 text-white hover:bg-white/15')}
        >
          <MessageSquare size={20} />
          {messages.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-teal-500 text-slate-900 text-xs flex items-center justify-center font-bold">
              {messages.length}
            </span>
          )}
        </button>
        <button
          onClick={copyRoomId}
          className="p-3.5 rounded-xl bg-white/10 text-white hover:bg-white/15 transition-all"
          title="Copy room code"
        >
          {copied ? <CheckCircle size={20} className="text-teal-400" /> : <Copy size={20} />}
        </button>
        <button
          onClick={endCall}
          className="p-3.5 rounded-xl bg-red-500 hover:bg-red-600 text-white transition-all"
        >
          <Phone size={20} className="rotate-[135deg]" />
        </button>
      </div>

      {/* In-Call Chat */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass rounded-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <span className="text-white text-sm font-medium">In-Call Chat</span>
              <button onClick={() => setChatOpen(false)} className="text-slate-400 hover:text-white">
                <X size={16} />
              </button>
            </div>
            <div className="h-40 overflow-y-auto px-4 py-3 space-y-2">
              {messages.length === 0 ? (
                <div className="text-slate-600 text-xs text-center mt-4">No messages yet</div>
              ) : messages.map((msg, i) => (
                <div key={i} className="text-sm">
                  <span className="text-teal-400 font-semibold">{msg.userName}: </span>
                  <span className="text-slate-300">{msg.message}</span>
                  <span className="text-slate-600 text-xs ml-2">{msg.time}</span>
                </div>
              ))}
            </div>
            <div className="px-4 pb-3 flex gap-2">
              <input
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendChatMessage()}
                placeholder="Type a message..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-teal-500/50"
              />
              <button
                onClick={sendChatMessage}
                className="p-2 rounded-xl bg-teal-500/15 border border-teal-500/30 text-teal-400 hover:bg-teal-500/25 transition-all"
              >
                <Send size={15} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}