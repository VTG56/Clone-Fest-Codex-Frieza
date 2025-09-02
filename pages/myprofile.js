// pages/myprofile.js
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Edit3, Save, X, Instagram, Facebook, Twitter, Globe, MapPin, Calendar, Mail, User as UserIcon } from 'lucide-react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

const MyProfile = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userProfile, setUserProfile] = useState({
    displayName: '',
    bio: '',
    location: '',
    website: '',
    instagram: '',
    facebook: '',
    twitter: '',
    joinDate: ''
  });
  const [editForm, setEditForm] = useState({});

  // Load user profile data
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) return;
      
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          // Prioritize Firestore as the source of truth for the display name
          const firestoreDisplayName = userData.displayName || userData.username || 'ChyrpUser';

          // --- SELF-HEALING LOGIC ---
          // If the Auth profile's displayName is missing or different, fix it.
          // This repairs existing accounts affected by the bug in auth.js.
          if (auth.currentUser && auth.currentUser.displayName !== firestoreDisplayName) {
            await updateProfile(auth.currentUser, { displayName: firestoreDisplayName });
            console.log("Auth profile self-healed and updated.");
          }
          
          setUserProfile({
            displayName: firestoreDisplayName, // Always use the reliable name from Firestore
            bio: userData.bio || '',
            location: userData.location || '',
            website: userData.website || '',
            instagram: userData.instagram || '',
            facebook: userData.facebook || '',
            twitter: userData.twitter || '',
            joinDate: userData.joinDate || new Date().toISOString()
          });
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserProfile();
  }, [user]);

  const handleEdit = () => {
    setEditForm({ ...userProfile });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditForm({});
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);

    try {
      // Update Firestore document
      await updateDoc(doc(db, 'users', user.uid), {
        username: editForm.displayName,
        displayName: editForm.displayName,
        bio: editForm.bio,
        location: editForm.location,
        website: editForm.website,
        instagram: editForm.instagram,
        facebook: editForm.facebook,
        twitter: editForm.twitter
      });

      // Update Firebase Auth profile
      if (auth.currentUser) {
  await updateProfile(auth.currentUser, {
    displayName: editForm.displayName
  });
}


      setUserProfile({ ...editForm });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-pink-900/10 to-blue-900/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.15),rgba(255,255,255,0))]" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="sticky top-0 z-30 bg-gray-900/50 backdrop-blur-lg border-b border-gray-800/50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <button
                onClick={() => router.push('/home')}
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
                <span className="font-medium">Back to Feed</span>
              </button>
              
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                My Profile
              </span>
              
              {!isEditing ? (
                <button
                  onClick={handleEdit}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit</span>
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleCancel}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isSaving ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>{isSaving ? 'Saving...' : 'Save'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden"
          >
            {/* Profile Header */}
            <div className="relative">
              {/* Cover Background */}
              <div className="h-48 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-800/50 to-transparent" />
              </div>

              {/* Profile Picture and Basic Info */}
              <div className="relative px-6 pb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-end space-y-4 sm:space-y-0 sm:space-x-6 -mt-16">
                  <div className="relative">
                    <Image
                      src={user?.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.uid}`}
                      alt="Profile"
                      className="w-32 h-32 rounded-full border-4 border-gray-800 bg-gray-800"
                      width={128}
                      height={128}
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    {!isEditing ? (
                      <>
                        <h1 className="text-3xl font-bold text-white mb-2">{userProfile.displayName}</h1>
                        <p className="text-gray-400 mb-4">{user?.email}</p>
                        {userProfile.bio && (
                          <p className="text-gray-300 leading-relaxed">{userProfile.bio}</p>
                        )}
                      </>
                    ) : (
                      <div className="space-y-4 w-full">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Display Name</label>
                          <input
                            type="text"
                            name="displayName"
                            value={editForm.displayName || ''}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Your display name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
                          <textarea
                            name="bio"
                            value={editForm.bio || ''}
                            onChange={handleInputChange}
                            rows="3"
                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                            placeholder="Tell us about yourself..."
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Details */}
            <div className="px-6 pb-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-white flex items-center">
                    <UserIcon className="w-5 h-5 mr-2 text-purple-400" />
                    Personal Information
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Location */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <MapPin className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-300">Location</span>
                      </div>
                      {!isEditing ? (
                        <span className="text-white">{userProfile.location || 'Not specified'}</span>
                      ) : (
                        <input
                          type="text"
                          name="location"
                          value={editForm.location || ''}
                          onChange={handleInputChange}
                          className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:ring-1 focus:ring-purple-500"
                          placeholder="Your location"
                        />
                      )}
                    </div>

                    {/* Website */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Globe className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-300">Website</span>
                      </div>
                      {!isEditing ? (
                        userProfile.website ? (
                          <Link href={userProfile.website} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 transition-colors truncate max-w-48">
                            {userProfile.website}
                          </Link>
                        ) : (
                          <span className="text-gray-500">Not specified</span>
                        )
                      ) : (
                        <input
                          type="url"
                          name="website"
                          value={editForm.website || ''}
                          onChange={handleInputChange}
                          className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:ring-1 focus:ring-purple-500"
                          placeholder="https://your-website.com"
                        />
                      )}
                    </div>

                    {/* Join Date */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-300">Joined</span>
                      </div>
                      <span className="text-white">
  {userProfile.joinDate
    ? new Date(userProfile.joinDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'Unknown'}
</span>

                    </div>

                    {/* Email */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-300">Email</span>
                      </div>
                      <span className="text-white truncate max-w-48">{user?.email}</span>
                    </div>
                  </div>
                </div>

                {/* Social Links */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-white flex items-center">
                    <Globe className="w-5 h-5 mr-2 text-pink-400" />
                    Social Links
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Instagram */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Instagram className="w-5 h-5 text-pink-500" />
                        <span className="text-gray-300">Instagram</span>
                      </div>
                      {!isEditing ? (
                        userProfile.instagram ? (
                          <Link href={`https://instagram.com/${userProfile.instagram}`} target="_blank" rel="noopener noreferrer" className="text-pink-400 hover:text-pink-300 transition-colors">
                            @{userProfile.instagram}
                          </Link>
                        ) : (
                          <span className="text-gray-500">Not connected</span>
                        )
                      ) : (
                        <div className="flex items-center">
                          <span className="text-gray-400 mr-1">@</span>
                          <input
                            type="text"
                            name="instagram"
                            value={editForm.instagram || ''}
                            onChange={handleInputChange}
                            className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:ring-1 focus:ring-purple-500"
                            placeholder="username"
                          />
                        </div>
                      )}
                    </div>

                    {/* Facebook */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Facebook className="w-5 h-5 text-blue-500" />
                        <span className="text-gray-300">Facebook</span>
                      </div>
                      {!isEditing ? (
                        userProfile.facebook ? (
                          <Link href={`https://facebook.com/${userProfile.facebook}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors">
                            {userProfile.facebook}
                          </Link>
                        ) : (
                          <span className="text-gray-500">Not connected</span>
                        )
                      ) : (
                        <input
                          type="text"
                          name="facebook"
                          value={editForm.facebook || ''}
                          onChange={handleInputChange}
                          className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:ring-1 focus:ring-purple-500"
                          placeholder="username or profile"
                        />
                      )}
                    </div>

                    {/* Twitter */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Twitter className="w-5 h-5 text-blue-400" />
                        <span className="text-gray-300">Twitter</span>
                      </div>
                      {!isEditing ? (
                        userProfile.twitter ? (
                          <Link href={`https://twitter.com/${userProfile.twitter}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors">
                            @{userProfile.twitter}
                          </Link>
                        ) : (
                          <span className="text-gray-500">Not connected</span>
                        )
                      ) : (
                        <div className="flex items-center">
                          <span className="text-gray-400 mr-1">@</span>
                          <input
                            type="text"
                            name="twitter"
                            value={editForm.twitter || ''}
                            onChange={handleInputChange}
                            className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:ring-1 focus:ring-purple-500"
                            placeholder="username"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Stats */}
              <div className="mt-8 pt-6 border-t border-gray-700/50">
                <div className="grid grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="text-2xl font-bold text-white">0</div>
                    <div className="text-sm text-gray-400">Posts</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">0</div>
                    <div className="text-sm text-gray-400">Followers</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">0</div>
                    <div className="text-sm text-gray-400">Following</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Recent Activity (Future Feature) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-8 bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6"
          >
            <h3 className="text-xl font-semibold text-white mb-4">Recent Activity</h3>
            <div className="text-center py-8">
              <p className="text-gray-400">Your recent posts and activity will appear here.</p>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default MyProfile;