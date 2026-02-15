import React, { createContext, useContext, useState, useEffect } from 'react';

interface Profile {
  name: string;
  email: string;
  location: string;
}

interface User {
  email: string;
  activities: any[];
  profile: Profile;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signup: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  saveActivity: (activity: any) => Promise<void>;
  getActivities: () => any[];
  updateProfile: (profile: Profile) => Promise<void>;
  getProfile: () => Profile | null;
  saveResourceClick: (resourceName: string, resourceType: string) => Promise<void>;
  saveGoal: (goal: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem('auth_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error('Error parsing stored user:', err);
      }
    }
    setLoading(false);
  }, []);

  const signup = async (email: string, password: string) => {
    const response = await fetch('http://localhost:5000/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    if (!data.success) throw new Error(data.error);

    // Create default profile with email
    const defaultProfile: Profile = {
      name: '',
      email: email,
      location: ''
    };

    const newUser: User = {
      email,
      activities: [],
      profile: defaultProfile
    };
    setUser(newUser);
    localStorage.setItem('auth_user', JSON.stringify(newUser));
  };

  const login = async (email: string, password: string) => {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    if (!data.success) throw new Error(data.error);

    // Get profile from backend
    let profile: Profile = {
      name: '',
      email: email,
      location: ''
    };

    if (data.profile) {
      profile = data.profile;
    }

    const newUser: User = {
      email,
      activities: data.activities || [],
      profile: profile
    };
    setUser(newUser);
    localStorage.setItem('auth_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_user');
    // Also logout from Infinigram if logged in
    localStorage.removeItem('infinigram_user');
    // Clear any Infinigram session data
    sessionStorage.removeItem('uploadedFile');
    sessionStorage.removeItem('uploadedFileUrl');
    sessionStorage.removeItem('mediaType');
    sessionStorage.removeItem('fileName');
    sessionStorage.removeItem('mediaSource');
    sessionStorage.removeItem('postData');
  };

  const saveActivity = async (activity: any) => {
    if (!user) return;

    const response = await fetch('http://localhost:5000/api/user/activity/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email, activity })
    });

    const data = await response.json();
    if (!data.success) throw new Error(data.error);

    // Update local user state - check if activity type exists and update it, or add new
    let updatedActivities = user.activities;

    // For daily_goal_tracker_data, we want to REPLACE not append
    if (activity.type === 'daily_goal_tracker_data') {
      updatedActivities = user.activities.filter(a => a.type !== 'daily_goal_tracker_data');
    }

    const updatedUser = {
      ...user,
      activities: [...updatedActivities, data.activity]
    };
    setUser(updatedUser);
    localStorage.setItem('auth_user', JSON.stringify(updatedUser));
  };

  const saveResourceClick = async (resourceName: string, resourceType: string) => {
    if (!user) return;

    try {
      await saveActivity({
        type: 'resource_click',
        resourceName: resourceName,
        resourceType: resourceType,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error saving resource click:', err);
    }
  };

  const updateProfile = async (profile: Profile) => {
    if (!user) return;

    // Save profile to backend
    const response = await fetch('http://localhost:5000/api/user/profile/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email, profile })
    });

    const data = await response.json();
    if (!data.success) throw new Error(data.error);

    // Save activity for profile update
    await saveActivity({
      type: 'profile_update',
      profile: profile,
      timestamp: new Date().toISOString()
    });

    // Update local user state
    const updatedUser = {
      ...user,
      profile: profile
    };
    setUser(updatedUser);
    localStorage.setItem('auth_user', JSON.stringify(updatedUser));
  };

  const saveGoal = async (goal: any) => {
    if (!user) return;

    try {
      await saveActivity({
        type: 'goal_confirmed',
        goal: goal.name,
        goalDate: goal.createdDate,
        goalDescription: goal.description,
        targetYear: goal.targetYear,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error saving goal:', err);
      throw err;
    }
  };

  const getActivities = () => user?.activities || [];

  const getProfile = () => user?.profile || null;

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout, saveActivity, getActivities, updateProfile, getProfile, saveResourceClick, saveGoal }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};