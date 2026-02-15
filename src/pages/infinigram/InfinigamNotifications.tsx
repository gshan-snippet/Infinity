import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Bell, User, CheckCircle, XCircle, MessageCircle } from 'lucide-react';

interface FollowRequest {
  email: string;
  username: string;
  profilePhoto: string;
  userType: string;
}

interface MessageNotification {
  id: string;
  type: 'new_message';
  fromEmail: string;
  fromUsername: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface InfinigamUser {
  id: string;
  email: string;
  username: string;
  profilePhoto: string;
}

const InfinigamNotifications = () => {
  const navigate = useNavigate();
  const [infinigram_user, setInfinigram_user] = useState<InfinigamUser | null>(null);
  const [pendingRequests, setPendingRequests] = useState<FollowRequest[]>([]);
  const [messageNotifications, setMessageNotifications] = useState<MessageNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'follows' | 'messages'>('follows');

  useEffect(() => {
    const storedUser = localStorage.getItem('infinigram_user');
    if (!storedUser) {
      navigate('/infinigram/auth');
      return;
    }
    const user = JSON.parse(storedUser);
    setInfinigram_user(user);
    fetchNotifications(user.email);
  }, [navigate]);

  const fetchNotifications = async (email: string) => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:5000/api/infinigram/follow/pending/${encodeURIComponent(email)}`
      );
      const data = await response.json();
      if (data.success) {
        setPendingRequests(data.pendingRequests || []);
        setMessageNotifications(data.messageNotifications || []);
      } else {
        setError(data.error || 'Failed to load notifications');
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requesterEmail: string) => {
    if (!infinigram_user) return;

    try {
      const response = await fetch('http://localhost:5000/api/infinigram/follow/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromEmail: requesterEmail,
          toEmail: infinigram_user.email
        })
      });

      const data = await response.json();
      if (data.success) {
        setPendingRequests(pendingRequests.filter(req => req.email !== requesterEmail));
      } else {
        setError(data.error || 'Failed to accept request');
      }
    } catch (err) {
      console.error('Accept error:', err);
      setError('An error occurred');
    }
  };

  const handleReject = async (requesterEmail: string) => {
    if (!infinigram_user) return;

    try {
      const response = await fetch('http://localhost:5000/api/infinigram/follow/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromEmail: requesterEmail,
          toEmail: infinigram_user.email
        })
      });

      const data = await response.json();
      if (data.success) {
        setPendingRequests(pendingRequests.filter(req => req.email !== requesterEmail));
      } else {
        setError(data.error || 'Failed to reject request');
      }
    } catch (err) {
      console.error('Reject error:', err);
      setError('An error occurred');
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    if (!infinigram_user) return;

    try {
      const response = await fetch('http://localhost:5000/api/infinigram/notifications/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: infinigram_user.email,
          notificationId: notificationId
        })
      });

      const data = await response.json();
      if (data.success) {
        // Remove notification from local state
        setMessageNotifications(messageNotifications.filter(n => n.id !== notificationId));
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const handleOpenChat = async (notifId: string, fromEmail: string) => {
    // Delete the notification and then navigate
    await handleDeleteNotification(notifId);
    navigate(`/infinigram/chat/${encodeURIComponent(fromEmail)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Bell className="w-8 h-8 text-amber-500" />
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Notifications</h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400">Manage your follow requests and messages</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('follows')}
            className={`px-4 py-2 font-medium transition-all ${
              activeTab === 'follows'
                ? 'text-slate-900 dark:text-white border-b-2 border-blue-500'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Follow Requests ({pendingRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`px-4 py-2 font-medium transition-all flex items-center gap-2 ${
              activeTab === 'messages'
                ? 'text-slate-900 dark:text-white border-b-2 border-blue-500'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            Messages ({messageNotifications.length})
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
            <p className="text-red-700 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Follow Requests Tab */}
        {activeTab === 'follows' && (
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <p className="text-slate-600 dark:text-slate-400">Loading notifications...</p>
              </div>
            ) : pendingRequests.length === 0 ? (
              <Card className="border-0 shadow-md">
                <CardContent className="p-12 text-center">
                  <Bell className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-600 dark:text-slate-400 text-lg">No follow requests yet</p>
                  <p className="text-slate-500 dark:text-slate-500 text-sm mt-2">
                    When someone sends you a follow request, it will appear here
                  </p>
                </CardContent>
              </Card>
            ) : (
              pendingRequests.map((request) => (
                <motion.div
                  key={request.email}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        {/* User Info */}
                        <div className="flex items-center gap-4 flex-1">
                          {request.profilePhoto ? (
                            <img
                              src={request.profilePhoto}
                              alt={request.username}
                              className="w-14 h-14 rounded-full object-cover border-2 border-slate-200 dark:border-slate-700"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center flex-shrink-0">
                              <User className="w-7 h-7 text-white" />
                            </div>
                          )}

                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                              {request.username}
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                              wants to follow you
                            </p>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 ml-4">
                          <Button
                            onClick={() => handleAccept(request.email)}
                            className="gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Accept
                          </Button>
                          <Button
                            onClick={() => handleReject(request.email)}
                            variant="outline"
                            className="gap-2"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <p className="text-slate-600 dark:text-slate-400">Loading messages...</p>
              </div>
            ) : messageNotifications.length === 0 ? (
              <Card className="border-0 shadow-md">
                <CardContent className="p-12 text-center">
                  <MessageCircle className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-600 dark:text-slate-400 text-lg">No new messages</p>
                  <p className="text-slate-500 dark:text-slate-500 text-sm mt-2">
                    New messages from your followers will appear here
                  </p>
                </CardContent>
              </Card>
            ) : (
              messageNotifications.map((notif) => (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card
                    className="border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => handleOpenChat(notif.id, notif.fromEmail)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                          <MessageCircle className="w-7 h-7 text-white" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                            {notif.fromUsername}
                          </h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 truncate">
                            {notif.message}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                            {new Date(notif.timestamp).toLocaleString()}
                          </p>
                        </div>

                        {!notif.read && (
                          <div className="w-3 h-3 rounded-full bg-blue-500 flex-shrink-0" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default InfinigamNotifications;
