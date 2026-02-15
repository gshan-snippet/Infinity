import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle, Loader2 } from 'lucide-react';

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

const InfinigamMessageList = () => {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [infinigram_user, setInfinigram_user] = useState<InfinigamUser | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('infinigram_user');
    if (!storedUser) {
      navigate('/infinigram/auth');
      return;
    }
    const user = JSON.parse(storedUser);
    setInfinigram_user(user);
    fetchContacts(user.email);
  }, [navigate]);

  const fetchContacts = async (email: string) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/infinigram/messages/list/${encodeURIComponent(email)}`);
      const data = await response.json();

      if (data.success) {
        setContacts(data.contacts);
      } else {
        setError(data.error || 'Failed to load contacts');
      }
    } catch (err) {
      console.error('Error fetching contacts:', err);
      setError('Failed to load contacts. Check if backend is running');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChat = (contact: Contact) => {
    navigate(`/infinigram/chat/${encodeURIComponent(contact.email)}`, { state: { contact } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <MessageCircle className="w-8 h-8 text-blue-400" />
            <h1 className="text-3xl font-bold text-white">Messages</h1>
          </div>
          <p className="text-slate-400">Chat with your followers</p>
        </motion.div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-200"
          >
            {error}
          </motion.div>
        )}

        {/* Loading */}
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center py-12"
          >
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          </motion.div>
        ) : contacts.length === 0 ? (
          // Empty State
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <MessageCircle className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">No conversations yet</h2>
            <p className="text-slate-400">
              You can only message users who follow you back.<br />
              Start by following someone in Explore! 🔍
            </p>
          </motion.div>
        ) : (
          // Contacts List
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            {contacts.map((contact, index) => (
              <motion.div
                key={contact.email}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className="bg-slate-800/50 border-slate-700 hover:border-blue-500 cursor-pointer transition-all"
                  onClick={() => handleOpenChat(contact)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      {/* Profile Photo */}
                      {contact.profilePhoto && (
                        <img
                          src={contact.profilePhoto}
                          alt={contact.username}
                          className="w-12 h-12 rounded-full object-cover border-2 border-blue-400"
                        />
                      )}
                      {!contact.profilePhoto && (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-2 border-blue-400">
                          <span className="text-white font-bold">
                            {contact.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}

                      {/* Username */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white truncate">
                          {contact.username}
                        </h3>
                        <p className="text-xs text-slate-400 truncate">
                          {contact.email}
                        </p>
                      </div>

                      {/* Arrow */}
                      <div className="text-slate-500 group-hover:text-blue-400">
                        →
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default InfinigamMessageList;
