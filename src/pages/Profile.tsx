import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, User, Mail, MapPin, Save, X, Target, Trophy, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';

const locations = [
  'New Delhi',
  'Mumbai',
  'Bangalore',
  'Hyderabad',
  'Chennai',
  'Kolkata',
  'Pune',
  'Ahmedabad',
  'Jaipur',
  'Other'
];

const stats = [
  { label: 'Active Goals', value: 3, icon: Target, color: 'text-primary' },
  { label: 'Completed', value: 1, icon: Trophy, color: 'text-green-500' },
  { label: 'Days Active', value: 45, icon: Clock, color: 'text-amber-500' },
];

const Profile = () => {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    location: ''
  });

  // Load profile data on mount
  useEffect(() => {
    if (user?.profile) {
      setFormData({
        name: user.profile.name || '',
        email: user.profile.email || user.email || '',
        location: user.profile.location || ''
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    setError(null);
    setLoading(true);

    try {
      if (!formData.name.trim()) {
        setError('Name is required');
        setLoading(false);
        return;
      }

      if (!formData.email.trim()) {
        setError('Email is required');
        setLoading(false);
        return;
      }

      await updateProfile({
        name: formData.name,
        email: formData.email,
        location: formData.location
      });

      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset to current profile data
    if (user?.profile) {
      setFormData({
        name: user.profile.name || '',
        email: user.profile.email || user.email || '',
        location: user.profile.location || ''
      });
    }
    setIsEditing(false);
    setError(null);
  };

  const getAvatarLetter = () => {
    return (formData.name?.charAt(0) || user?.email?.charAt(0) || 'U').toUpperCase();
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header with gradient */}
      <div className="h-32 gradient-primary" />

      <div className="container mx-auto px-4 -mt-16">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Profile Card */}
          <Card variant="elevated" className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Avatar */}
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground text-3xl font-bold">
                  {getAvatarLetter()}
                </div>

                {/* Info */}
                <div className="flex-1 text-center sm:text-left">
                  <h1 className="font-display text-2xl font-bold mb-1">
                    {formData.name || 'Profile'}
                  </h1>
                  <p className="text-muted-foreground mb-4">
                    {formData.location ? `${formData.location} • ` : ''}{formData.email}
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      CareerVerse Member
                    </span>
                  </div>
                </div>

                {/* Edit/Save Button */}
                {!isEditing ? (
                  <Button 
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      onClick={handleCancel}
                      disabled={loading}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSaveProfile}
                      disabled={loading}
                      className="bg-gradient-to-r from-primary to-accent text-white"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {loading ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-6 p-4 rounded-xl bg-red-50/50 dark:bg-red-900/20 border border-red-200/40 dark:border-red-700/40"
            >
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </motion.div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {stats.map((stat) => (
              <Card key={stat.label} variant="default">
                <CardContent className="p-4 text-center">
                  <stat.icon className={`h-6 w-6 mx-auto mb-2 ${stat.color}`} />
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Edit Form or Details */}
          {isEditing ? (
            <Card>
              <CardHeader>
                <CardTitle>Edit Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Full Name *
                  </label>
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className="rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Email *
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your@email.com"
                    className="rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Location
                  </label>
                  <select
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg bg-white/70 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-700/50 text-slate-900 dark:text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  >
                    <option value="">Select a location</option>
                    {locations.map((location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Profile Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 p-3 rounded-xl bg-muted/50">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Full Name</p>
                    <p className="font-medium">{formData.name || 'Not set'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 rounded-xl bg-muted/50">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="font-medium">{formData.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 rounded-xl bg-muted/50">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="font-medium">{formData.location || 'Not set'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
