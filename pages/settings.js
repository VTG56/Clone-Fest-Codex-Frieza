// pages/settings.js - User Settings Page
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { onAuthStateChanged, updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import {
  User, Mail, Lock, Bell, Shield, Palette, Globe, Camera, Save, ArrowLeft,
  Eye, EyeOff, Loader2, Check, X, Upload, AlertCircle, Settings as SettingsIcon
} from 'lucide-react';
import { auth, db, storage } from '../lib/firebase';
import { logOut } from '../lib/auth';
import { Navbar, Footer } from '../components/home/HomeComponents';

// Environment App ID
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

const SettingsPage = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showPasswords, setShowPasswords] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  // Form states
  const [profileData, setProfileData] = useState({
    displayName: '',
    email: '',
    bio: '',
    username: '',
    photoURL: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: false,
    postPrivacy: 'public',
    theme: 'dark',
    language: 'en'
  });

  // Tabs configuration
  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'security', name: 'Security', icon: Lock },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'privacy', name: 'Privacy', icon: Shield }
  ];

  // Authentication and data loading
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        // Load user profile data
        setProfileData({
          displayName: currentUser.displayName || '',
          email: currentUser.email || '',
          bio: '',
          username: currentUser.displayName || currentUser.email?.split('@')[0] || '',
          photoURL: currentUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.uid}`
        });

        // Load additional user data from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setProfileData(prev => ({
              ...prev,
              bio: userData.bio || '',
              username: userData.username || prev.username
            }));
          }
        } catch (error) {
          console.error("Error loading user data:", error);
        }
        
        setLoading(false);
      } else {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logOut();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Show message helper
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  // Handle profile image selection
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setProfileImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Upload profile image
  const uploadProfileImage = async () => {
    if (!profileImage || !user) return null;

    const storageRef = ref(storage, `artifacts/${appId}/users/${user.uid}/profile.jpg`);
    const uploadTask = uploadBytesResumable(storageRef, profileImage);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => reject(error),
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then(resolve);
        }
      );
    });
  };

  // Save profile data
  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);

    try {
      let photoURL = profileData.photoURL;
      
      // Upload new image if selected
      if (profileImage) {
        photoURL = await uploadProfileImage();
        setUploadProgress(0);
      }

      // Update Firebase Auth profile
      await updateProfile(user, {
        displayName: profileData.displayName,
        photoURL: photoURL
      });

      // Update Firestore document
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: profileData.displayName,
        username: profileData.username,
        bio: profileData.bio,
        avatar: photoURL
      });

      setProfileData(prev => ({ ...prev, photoURL }));
      setProfileImage(null);
      setImagePreview(null);
      showMessage('success', 'Profile updated successfully!');
    } catch (error) {
      console.error("Error updating profile:", error);
      showMessage('error', 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async () => {
    if (!user || !passwordData.currentPassword || !passwordData.newPassword) {
      showMessage('error', 'Please fill in all password fields.');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showMessage('error', 'New passwords do not match.');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showMessage('error', 'Password must be at least 6 characters.');
      return;
    }

    setSaving(true);
    try {
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email, passwordData.currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // Update password
      await updatePassword(user, passwordData.newPassword);
      
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showMessage('success', 'Password updated successfully!');
    } catch (error) {
      console.error("Error updating password:", error);
      if (error.code === 'auth/wrong-password') {
        showMessage('error', 'Current password is incorrect.');
      } else {
        showMessage('error', 'Failed to update password. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  // Save preferences
  const handleSavePreferences = async () => {
    if (!user) return;
    setSaving(true);

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        preferences: preferences
      });
      showMessage('success', 'Preferences updated successfully!');
    } catch (error) {
      console.error("Error updating preferences:", error);
      showMessage('error', 'Failed to update preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white font-sans flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading settings...</p>
        </div>
      </div>
    );
  }

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div className="flex flex-col items-center mb-8">
        <div className="relative group">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-purple-500/30 mb-4">
            <Image
              src={imagePreview || profileData.photoURL}
              alt="Profile"
              width={128}
              height={128}
              className="w-full h-full object-cover"
            />
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-4 right-0 p-2 bg-purple-600 rounded-full hover:bg-purple-700 transition-colors"
          >
            <Camera className="w-4 h-4" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
        </div>
        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="w-full max-w-xs bg-gray-700 rounded-full h-2 mb-4">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Display Name</label>
          <input
            type="text"
            value={profileData.displayName}
            onChange={(e) => setProfileData(prev => ({ ...prev, displayName: e.target.value }))}
            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
          <input
            type="text"
            value={profileData.username}
            onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
        <input
          type="email"
          value={profileData.email}
          disabled
          className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg opacity-50 cursor-not-allowed"
        />
        <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
        <textarea
          value={profileData.bio}
          onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
          rows="4"
          className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
          placeholder="Tell us about yourself..."
        />
      </div>

      <button
        onClick={handleSaveProfile}
        disabled={saving}
        className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 flex items-center justify-center"
      >
        {saving ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : <Save className="w-5 h-5 mr-2" />}
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700/50">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Lock className="w-5 h-5 mr-2 text-purple-400" />
          Change Password
        </h3>
        
        <div className="space-y-4">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-300 mb-2">Current Password</label>
            <input
              type={showPasswords ? "text" : "password"}
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-1 focus:ring-purple-500 focus:border-purple-500 pr-10"
            />
          </div>
          
          <div className="relative">
            <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
            <input
              type={showPasswords ? "text" : "password"}
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-1 focus:ring-purple-500 focus:border-purple-500 pr-10"
            />
          </div>
          
          <div className="relative">
            <label className="block text-sm font-medium text-gray-300 mb-2">Confirm New Password</label>
            <input
              type={showPasswords ? "text" : "password"}
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-1 focus:ring-purple-500 focus:border-purple-500 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPasswords(!showPasswords)}
              className="absolute right-3 top-9 p-1 text-gray-400 hover:text-white"
            >
              {showPasswords ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <button
          onClick={handlePasswordChange}
          disabled={saving}
          className="mt-6 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 flex items-center"
        >
          {saving ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : <Lock className="w-5 h-5 mr-2" />}
          {saving ? 'Updating...' : 'Update Password'}
        </button>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700/50">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Bell className="w-5 h-5 mr-2 text-purple-400" />
          Notification Preferences
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
            <div>
              <h4 className="font-medium">Email Notifications</h4>
              <p className="text-sm text-gray-400">Receive updates via email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.emailNotifications}
                onChange={(e) => setPreferences(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
            <div>
              <h4 className="font-medium">Push Notifications</h4>
              <p className="text-sm text-gray-400">Receive browser notifications</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.pushNotifications}
                onChange={(e) => setPreferences(prev => ({ ...prev, pushNotifications: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
        </div>

        <button
          onClick={handleSavePreferences}
          disabled={saving}
          className="mt-6 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 flex items-center"
        >
          {saving ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : <Save className="w-5 h-5 mr-2" />}
          {saving ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </div>
  );

  const renderPrivacyTab = () => (
    <div className="space-y-6">
      <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700/50">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Shield className="w-5 h-5 mr-2 text-purple-400" />
          Privacy Settings
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Default Post Privacy</label>
            <select
              value={preferences.postPrivacy}
              onChange={(e) => setPreferences(prev => ({ ...prev, postPrivacy: e.target.value }))}
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="public">Public</option>
              <option value="friends">Friends Only</option>
              <option value="private">Private</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleSavePreferences}
          disabled={saving}
          className="mt-6 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 flex items-center"
        >
          {saving ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : <Save className="w-5 h-5 mr-2" />}
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );

  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile': return renderProfileTab();
      case 'security': return renderSecurityTab();
      case 'notifications': return renderNotificationsTab();
      case 'privacy': return renderPrivacyTab();
      default: return renderProfileTab();
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-pink-900/10 to-blue-900/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.15),rgba(255,255,255,0))]" />
      </div>

      <div className="relative z-10">
        <Navbar 
          onMenuClick={() => {}} 
          user={user} 
          onLogout={handleLogout}
        />

        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center mb-8">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700/50 transition-colors mr-4"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold flex items-center">
                <SettingsIcon className="w-8 h-8 mr-3 text-purple-400" />
                Settings
              </h1>
              <p className="text-gray-400">Manage your account and preferences</p>
            </div>
          </div>

          {/* Message Display */}
          <AnimatePresence>
            {message.text && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`mb-6 p-4 rounded-lg flex items-center ${
                  message.type === 'success' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}
              >
                {message.type === 'success' ? <Check className="w-5 h-5 mr-2" /> : <AlertCircle className="w-5 h-5 mr-2" />}
                {message.text}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Tabs Navigation */}
            <div className="lg:w-64">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-4">
                <div className="space-y-2">
                  {tabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-300 ${
                        activeTab === tab.id ? 'bg-purple-500/20 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                      }`}
                    >
                      <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-purple-400' : ''}`} />
                      <span className="font-medium">{tab.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {renderTabContent()}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </div>
  );
};

export default SettingsPage;