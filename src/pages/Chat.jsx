import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import api from '../services/api';
import useAuthStore from '../store/useAuthStore';
import VideoCall from '../components/VideoCall';

const Chat = () => {
  const { groupId } = useParams();
  const { user } = useAuthStore();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [stompClient, setStompClient] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Fetch history
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get(`/messages/${groupId}`);
        setMessages(response.data);
      } catch (error) {
        console.error('Failed to fetch messages', error);
      }
    };
    fetchHistory();
  }, [groupId]);

  // Connect WebSocket
  useEffect(() => {
    let client = null;
    let reconnectTimeout = null;

    const connectWebSocket = () => {
      // Derive WS URL from API URL (e.g., https://api.domain.com/api -> wss://api.domain.com/ws)
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
      const wsUrl = apiUrl.replace('/api', '/ws');
      const socket = new SockJS(wsUrl);
      client = Stomp.over(socket);
      client.debug = () => {}; // disable debug logs

      client.connect({}, () => {
        setIsConnected(true);
        client.subscribe(`/topic/group/${groupId}`, (message) => {
          const receivedMessage = JSON.parse(message.body);
          setMessages((prev) => {
            // Prevent duplicate messages if reconnected
            if (prev.some(m => m.id === receivedMessage.id)) return prev;
            return [...prev, receivedMessage];
          });
          setIsSending(false);
        });

        // Listen for group clear event
        client.subscribe(`/topic/group/${groupId}/clear`, () => {
          setMessages([]);
        });

        // Listen for message deletions
        client.subscribe(`/topic/group/${groupId}/delete`, (message) => {
          const deletedMessageId = parseInt(message.body);
          setMessages((prev) => prev.filter(m => m.id !== deletedMessageId));
        });
      }, (error) => {
        console.error("STOMP Error:", error);
        setIsConnected(false);
        // Try to reconnect in 3 seconds
        reconnectTimeout = setTimeout(connectWebSocket, 3000);
      });

      // Handle raw socket close events as well
      socket.onclose = () => {
        setIsConnected(false);
      };

      setStompClient(client);
    };

    connectWebSocket();

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (client) {
        client.disconnect();
      }
    };
  }, [groupId]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && stompClient && isConnected && !isSending) {
      setIsSending(true);
      const messageDto = {
        groupId: parseInt(groupId),
        senderId: user.id,
        content: newMessage,
        isAi: false,
        replyToId: replyingTo ? replyingTo.id : null,
        replyToSenderName: replyingTo ? (replyingTo.isAi ? 'TOM (AI)' : replyingTo.senderName) : null,
        replyToContent: replyingTo ? replyingTo.content : null
      };
      stompClient.send(`/app/chat/${groupId}/sendMessage`, {}, JSON.stringify(messageDto));
      setNewMessage('');
      setReplyingTo(null);
      
      // Fallback timeout in case the WebSocket response gets lost or delayed heavily
      setTimeout(() => setIsSending(false), 5000);
    }
  };

  return (
    <div className="h-screen bg-[#0f172a] flex flex-col relative overflow-hidden">
      {isVideoCallActive && (
        <VideoCall 
          groupId={groupId} 
          userId={user.id} 
          onClose={() => setIsVideoCallActive(false)} 
        />
      )}

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-800 border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
          >
            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <span className="text-red-500">⚠️</span> Clear Chat
            </h2>
            <p className="text-slate-300 text-sm mb-6">
              Are you sure you want to completely clear the chat for this group? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={async () => {
                  setShowClearConfirm(false);
                  try {
                    await api.delete(`/messages/group/${groupId}`);
                  } catch (err) {
                    if (err.response && err.response.status === 403) {
                      alert("Only the group creator can clear the chat.");
                    } else {
                      console.error("Failed to clear chat", err);
                      alert("Failed to clear chat.");
                    }
                  }
                }}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
              >
                Clear
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white/5 backdrop-blur-md border-b border-white/10 p-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <Link to="/dashboard/groups" className="text-slate-400 hover:text-white bg-white/5 p-2 rounded-lg transition-colors">
            ← Back
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white">Group Chat</h1>
            <p className="text-xs text-emerald-400 flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
              {isConnected ? 'Connected' : 'Connecting...'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {/* Clear Chat Button */}
          <button 
            onClick={() => setShowClearConfirm(true)}
            className="p-2 bg-red-500/20 text-red-400 rounded-lg border border-red-500/30 hover:bg-red-500/30 transition-colors"
            title="Clear entire chat"
          >
            🗑️ Clear Chat
          </button>
          
          {/* Video call button */}
          <button 
            onClick={() => setIsVideoCallActive(true)}
            className="p-2 bg-blue-500/20 text-blue-400 rounded-lg border border-blue-500/30 hover:bg-blue-500/30 transition-colors"
          >
            📹 Call
          </button>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 z-10 scrollbar-thin scrollbar-thumb-slate-700">
        <div className="max-w-5xl mx-auto flex flex-col space-y-4 w-full">
          {messages.map((msg, index) => {
            const isMe = msg.senderId === user.id;
            const isAI = msg.isAi;
            
            return (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={msg.id || index} 
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group`}
              >
                <div className={`flex items-end gap-2 max-w-[70%] ${isMe ? 'flex-row-reverse' : ''}`}>
                  {!isMe && (
                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-xs border ${isAI ? 'bg-purple-900 border-purple-500 text-purple-200' : 'bg-slate-700 border-white/10 text-white'}`}>
                      {isAI ? '🤖' : (msg.senderName?.charAt(0) || 'U')}
                    </div>
                  )}
                  
                  <div className={`p-3 rounded-2xl ${isMe ? 'bg-blue-600 rounded-br-sm' : isAI ? 'bg-gradient-to-r from-purple-900/80 to-blue-900/80 border border-purple-500/30 rounded-bl-sm' : 'bg-white/10 border border-white/5 rounded-bl-sm backdrop-blur-sm'}`}>
                    {!isMe && <p className={`text-xs mb-1 font-medium ${isAI ? 'text-purple-300' : 'text-slate-400'}`}>{isAI ? 'TOM (AI)' : msg.senderName}</p>}
                    
                    {msg.replyToId && (
                      <div className="mb-2 p-2 bg-black/20 rounded-lg border-l-2 border-white/40 text-xs">
                        <p className="font-bold text-white/70 mb-0.5">{msg.replyToSenderName}</p>
                        <p className="text-white/60 truncate max-w-[250px]">{msg.replyToContent}</p>
                      </div>
                    )}
                    
                    {msg.content.startsWith('File shared: ') ? (
                      msg.content.match(/\.(jpeg|jpg|gif|png)$/) != null ? (
                        <div className="mt-1 cursor-pointer">
                          <a href={msg.content.replace('File shared: ', '')} target="_blank" rel="noopener noreferrer">
                            <img src={msg.content.replace('File shared: ', '')} alt="shared file" className="max-w-full h-auto max-h-48 rounded-lg hover:opacity-90 transition-opacity" />
                          </a>
                        </div>
                      ) : (
                        <a href={msg.content.replace('File shared: ', '')} target="_blank" rel="noopener noreferrer" className="text-blue-300 underline underline-offset-2">
                          📎 View File
                        </a>
                      )
                    ) : (
                      <p className="text-white text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => setReplyingTo(msg)}
                      className="p-1.5 text-slate-400 hover:text-white bg-white/10 hover:bg-white/20 rounded-full"
                      title="Reply"
                    >
                      ↩
                    </button>
                    {isMe && (
                      <button 
                        onClick={async () => {
                          try {
                            await api.delete(`/messages/${msg.id}`);
                            // Optional local state update, but WebSocket handles it too
                          } catch (err) {
                            console.error("Failed to delete", err);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-400 bg-white/10 hover:bg-red-500/20 rounded-full"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white/5 backdrop-blur-md border-t border-white/10 z-10 flex flex-col items-center">
        {replyingTo && (
          <div className="w-full max-w-5xl mb-2 flex items-center justify-between bg-black/30 border-l-4 border-blue-500 p-3 rounded-r-xl">
            <div>
              <p className="text-xs font-bold text-blue-400">Replying to {replyingTo.isAi ? 'TOM (AI)' : replyingTo.senderName}</p>
              <p className="text-sm text-slate-300 truncate max-w-[400px]">{replyingTo.content}</p>
            </div>
            <button onClick={() => setReplyingTo(null)} className="text-slate-400 hover:text-white p-2">✕</button>
          </div>
        )}
        <form onSubmit={sendMessage} className="flex gap-2 w-full max-w-5xl items-center">
          <label className="p-3 bg-white/5 text-slate-400 rounded-xl hover:bg-white/10 hover:text-white transition-colors border border-white/10 cursor-pointer">
            📎
            <input type="file" className="hidden" onChange={async (e) => {
              if (e.target.files[0]) {
                const formData = new FormData();
                formData.append('file', e.target.files[0]);
                try {
                  const res = await api.post(`/files/upload/${groupId}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                  });
                  // Send file link as a message
                  if (stompClient && isConnected) {
                    const messageDto = {
                      groupId: parseInt(groupId),
                      senderId: user.id,
                      content: `File shared: ${res.data.fileUrl}`,
                      isAi: false
                    };
                    stompClient.send(`/app/chat/${groupId}/sendMessage`, {}, JSON.stringify(messageDto));
                  }
                } catch (err) {
                  console.error('Upload failed', err);
                  alert('Upload failed. Please check the backend console.');
                }
              }
            }} />
          </label>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={isSending}
            placeholder="Type a message or @TOM to ask AI..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-slate-400 disabled:opacity-50"
          />
          <button 
            type="submit" 
            disabled={!newMessage.trim() || !isConnected || isSending}
            className="px-6 py-3 bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-300 hover:to-blue-400 text-white rounded-xl font-bold shadow-lg shadow-blue-400/40 disabled:opacity-50 transition-all flex items-center justify-center min-w-[100px]"
          >
            {isSending ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
