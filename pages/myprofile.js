"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ArrowLeft, Edit, Save, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
const MyProfilePage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ username: '', bio: '', avatar: '' });
  const [fetchLoading, setFetchLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        setFetchLoading(true);
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const data = userDoc.data();
            setProfile(data);
            setFormData({ username: data.username, bio: data.bio, avatar: data.avatar });
          } else {
            console.error("No user profile found in Firestore.");
            setError("Profile not found.");
          }
        } catch (err) {
          console.error("Error fetching profile:", err);
          setError("Failed to fetch profile data.");
        } finally {
          setFetchLoading(false);
        }
      } else {
        setFetchLoading(false);
      }
    };

    if (!loading) {
      fetchProfile();
    }
  }, [user, loading]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setSaveSuccess(false);

    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        username: formData.username,
        bio: formData.bio,
        avatar: formData.avatar,
      });

      // Update local state to reflect changes
      setProfile({ ...profile, ...formData });
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000); // Hide success message after 3 seconds
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to save profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || fetchLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-2xl font-bold mb-4">You are not signed in.</p>
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-3 bg-purple-600 rounded-full font-semibold hover:bg-purple-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-xl mx-auto"
        >
          <motion.button
            onClick={() => router.push('/home')}
            className="flex items-center space-x-2 text-purple-400 hover:text-pink-400 transition-colors mb-8"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft size={20} />
            <span>Back to Home</span>
          </motion.button>
          
          <div className="bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-700">
            <div className="flex flex-col items-center text-center">
              <motion.img
                src={profile.avatar || `https://api.dicebear.com/8.x/bottts/svg?seed=${profile.username}`}
                alt="Profile Avatar"
                className="w-24 h-24 rounded-full border-4 border-purple-500 shadow-lg mb-4 object-cover"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              />
              <h1 className="text-3xl font-bold text-white mb-2">{profile.username}</h1>
              <p className="text-gray-400 text-sm italic">
                {profile.bio || "No bio yet."}
              </p>
            </div>

            <div className="mt-8">
              <div className="flex items-center justify-between mb-2 text-gray-400">
                <span className="flex items-center">
                  <UserIcon size={16} className="mr-2" />
                  User ID:
                </span>
                <span className="font-mono text-xs text-pink-400 break-all">{profile.uid}</span>
              </div>
              <div className="flex items-center justify-between text-gray-400">
                <span className="flex items-center">
                  <Save size={16} className="mr-2" />
                  Joined:
                </span>
                <span className="text-sm">{new Date(profile.joinDate).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex justify-center mt-8">
              <motion.button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-full transition-all duration-300 shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Edit size={18} />
                <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
              </motion.button>
            </div>

            <AnimatePresence>
              {isEditing && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.5 }}
                  onSubmit={handleSaveProfile}
                  className="mt-8 overflow-hidden"
                >
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="username" className="block text-sm font-medium text-gray-400">Username</label>
                      <input
                        type="text"
                        name="username"
                        id="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="bio" className="block text-sm font-medium text-gray-400">Bio</label>
                      <textarea
                        name="bio"
                        id="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        rows="3"
                        className="mt-1 block w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="avatar" className="block text-sm font-medium text-gray-400">Avatar URL</label>
                      <input
                        type="url"
                        name="avatar"
                        id="avatar"
                        value={formData.avatar}
                        onChange={handleInputChange}
                        className="mt-1 block w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                  
                  {error && (
                    <p className="mt-4 text-sm text-red-500 text-center">{error}</p>
                  )}
                  {saveSuccess && (
                    <p className="mt-4 text-sm text-green-400 text-center">Profile saved successfully!</p>
                  )}

                  <div className="mt-6">
                    <motion.button
                      type="submit"
                      disabled={isSaving}
                      className="w-full flex justify-center items-center space-x-2 px-4 py-3 bg-purple-600 rounded-full font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isSaving ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Save size={18} />
                          <span>Save Changes</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default MyProfilePage;
