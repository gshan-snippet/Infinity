import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  fromEmail: string;
  toEmail: string;
  fromUsername: string;
  toUsername: string;
  text: string;
  timestamp: string;
  read: boolean;
}

interface Contact {
  email: string;
  username: string;
  profilePhoto: string;
}

interface InfinigamUser {
  id: string;
  email: string;
  username: string;
  profilePhoto: string;
}

const InfinigamChat = () => {
  const navigate = useNavigate();
  const { otherEmail } = useParams();
  const location = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [contact, setContact] = useState<Contact | null>(location.state?.contact || null);
  const [infinigram_user, setInfinigram_user] = useState<InfinigamUser | null>(null);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('infinigram_user');
    if (!storedUser || !otherEmail) {
      navigate('/infinigram/messages');
      return;
    }

    const user = JSON.parse(storedUser);
    setInfinigram_user(user);
    fetchChatHistory(user.email, decodeURIComponent(otherEmail));
  }, [navigate, otherEmail]);

  const fetchChatHistory = async (email: string, otherUserEmail: string) => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:5000/api/infinigram/messages/${encodeURIComponent(email)}/${encodeURIComponent(otherUserEmail)}`
      );
      const data = await response.json();

      if (data.success) {
        setMessages(data.messages);
        setContact(data.otherUser);
      } else {
        setError(data.error || 'Failed to load chat');
      }
    } catch (err) {
      console.error('Error fetching chat:', err);
      setError('Failed to load chat. Check if backend is running');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !infinigram_user || !contact) return;

    try {
      setSending(true);
      const response = await fetch('http://localhost:5000/api/infinigram/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromEmail: infinigram_user.email,
          toEmail: contact.email,
          text: messageText.trim()
        })
      });

      const data = await response.json();

      if (data.success) {
        // Add message to local state
        setMessages([...messages, data.message]);
        setMessageText('');
      } else {
        setError(data.error || 'Failed to send message');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-800/50 p-4">
        <div className="flex items-center gap-3 max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/infinigram/messages')}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-300" />
          </button>

          {contact && (
            <div className="flex-1 flex items-center gap-3">
              {contact.profilePhoto && (
                <img
                  src={contact.profilePhoto}
                  alt={contact.username}
                  className="w-10 h-10 rounded-full object-cover border-2 border-blue-400"
                />
              )}
              {!contact.profilePhoto && (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-2 border-blue-400">
                  <span className="text-white font-bold text-sm">
                    {contact.username.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}

              <div>
                <h2 className="font-bold text-white">{contact.username}</h2>
                <p className="text-xs text-slate-400">Active now</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 max-w-4xl mx-auto w-full">
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-200"
          >
            {error}
          </motion.div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-slate-400">No messages yet. Say hi! 👋</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, index) => {
              const isOwn = msg.fromEmail === infinigram_user?.email;
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      isOwn
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-slate-700 text-slate-100 rounded-bl-none'
                    }`}
                  >
                    <p className="break-words">{msg.text}</p>
                    <p className={`text-xs mt-1 ${isOwn ? 'text-blue-200' : 'text-slate-400'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </motion.div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="border-t border-slate-700 bg-slate-800/50 p-4">
        <div className="max-w-4xl mx-auto flex gap-2">
          <Input
            type="text"
            placeholder="Type a message..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={sending}
            className="flex-1 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
          />
          <Button
            onClick={handleSendMessage}
            disabled={sending || !messageText.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InfinigamChat;
