import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Peer from 'peerjs';

const VideoCall = ({ onClose, groupId, userId }) => {
  const [peerId, setPeerId] = useState('');
  const [remotePeerIdValue, setRemotePeerIdValue] = useState('');
  const [peerInstance, setPeerInstance] = useState(null);
  const [isCalling, setIsCalling] = useState(false);
  const [isReceivingCall, setIsReceivingCall] = useState(false);
  const [callerCall, setCallerCall] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);

  const currentUserVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    // Generate a predictable peer ID for this user in this group
    const customId = `nexus_group_${groupId}_user_${userId}`;
    const peer = new Peer(customId, {
      host: '0.peerjs.com',
      port: 443,
      path: '/'
    });

    peer.on('open', (id) => {
      setPeerId(id);
    });

    peer.on('call', (call) => {
      setIsReceivingCall(true);
      setCallerCall(call);
    });

    setPeerInstance(peer);

    // Get local video stream immediately
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((mediaStream) => {
      setLocalStream(mediaStream);
      if (currentUserVideoRef.current) {
        currentUserVideoRef.current.srcObject = mediaStream;
        currentUserVideoRef.current.play();
      }
    }).catch(err => console.error("Failed to get local stream", err));

    return () => {
      peer.destroy();
    };
  }, [groupId, userId]);

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoMuted(!videoTrack.enabled);
      }
    }
  };

  const call = (remotePeerId) => {
    setIsCalling(true);
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((mediaStream) => {
      const call = peerInstance.call(remotePeerId, mediaStream);

      call.on('stream', (remoteStream) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
          remoteVideoRef.current.play();
        }
      });
    });
  };

  const answerCall = () => {
    setIsReceivingCall(false);
    setIsCalling(true);
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((mediaStream) => {
      callerCall.answer(mediaStream);
      callerCall.on('stream', (remoteStream) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
          remoteVideoRef.current.play();
        }
      });
    });
  };

  const rejectCall = () => {
    setIsReceivingCall(false);
    callerCall.close();
  };

  const endCall = () => {
    setIsCalling(false);
    if (peerInstance) {
      peerInstance.destroy(); // or specific call destroy
    }
    onClose();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="absolute inset-0 z-50 bg-slate-900/90 backdrop-blur-xl flex flex-col p-4"
    >
      <div className="flex justify-between items-center mb-4 p-4 bg-white/5 rounded-2xl border border-white/10">
        <h2 className="text-xl font-bold text-white">Video Call</h2>
        <button onClick={endCall} className="px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors font-medium border border-red-500/30">
          End Call
        </button>
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-4 relative">
        {/* Remote Video (Big) */}
        <div className="flex-1 bg-black rounded-3xl border border-white/10 overflow-hidden relative shadow-2xl flex items-center justify-center">
          <video ref={remoteVideoRef} className="w-full h-full object-cover" />
          {!isCalling && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-10 p-8 text-center">
              {isReceivingCall ? (
                <div className="animate-pulse">
                  <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl shadow-[0_0_50px_rgba(59,130,246,0.5)]">
                    📞
                  </div>
                  <h3 className="text-xl font-bold text-white mb-6">Incoming Call...</h3>
                  <div className="flex gap-4">
                    <button onClick={answerCall} className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium shadow-lg transition-all">Accept</button>
                    <button onClick={rejectCall} className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium shadow-lg transition-all">Reject</button>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-medium text-slate-300 mb-4">Waiting for others to join...</h3>
                  <div className="flex gap-2 max-w-sm mx-auto">
                    <input 
                      type="text" 
                      placeholder="Enter a user's Peer ID to call" 
                      value={remotePeerIdValue} 
                      onChange={e => setRemotePeerIdValue(e.target.value)} 
                      className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white outline-none"
                    />
                    <button 
                      onClick={() => call(remotePeerIdValue)}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors"
                    >
                      Call
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-4">Your Peer ID: <span className="font-mono text-emerald-400 select-all">{peerId}</span></p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Local Video (Small / PiP) */}
        <div className="w-full md:w-64 h-48 md:h-auto md:absolute bottom-4 right-4 bg-slate-800 rounded-2xl border-2 border-white/20 overflow-hidden shadow-2xl z-20 flex flex-col">
          <div className="flex-1 relative">
            <video ref={currentUserVideoRef} className={`w-full h-full object-cover transform scale-x-[-1] ${isVideoMuted ? 'hidden' : 'block'}`} muted />
            {isVideoMuted && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center text-2xl text-slate-400">
                  📷
                </div>
              </div>
            )}
          </div>
          <div className="bg-slate-900/80 backdrop-blur-md p-2 flex justify-center gap-4">
            <button 
              onClick={toggleAudio}
              className={`p-3 rounded-full transition-colors ${isAudioMuted ? 'bg-red-500 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-200'}`}
              title={isAudioMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isAudioMuted ? '🔇' : '🎙️'}
            </button>
            <button 
              onClick={toggleVideo}
              className={`p-3 rounded-full transition-colors ${isVideoMuted ? 'bg-red-500 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-200'}`}
              title={isVideoMuted ? 'Enable Video' : 'Disable Video'}
            >
              {isVideoMuted ? '🚫' : '📹'}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default VideoCall;
