// pages/myprofile.js
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Edit3, Save, X, Instagram, Facebook, Twitter, 
  Globe, MapPin, Calendar, Mail, User as UserIcon, Trash2 
} from 'lucide-react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';
import { 
  doc, getDoc, setDoc, query, where, orderBy, onSnapshot, deleteDoc 
} from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { auth, db, storage } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from '../contexts/AuthContext';
import { postsCollectionRef, postDocRef } from '../lib/firestoreRefs';
import { PostCard } from '../components/home/HomeComponents';

const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

const MyProfile = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [posts, setPosts] = useState([]);
  const [isPostsLoading, setIsPostsLoading] = useState(true);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  const [userProfile, setUserProfile] = useState({
    displayName: '',
    bio: '',
    location: '',
    website: '',
    instagram: '',
    facebook: '',
    twitter: '',
    joinDate: '',
    photoURL: ''
  });
  const [editForm, setEditForm] = useState({});

  // Load user profile data
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          const firestoreDisplayName = userData.displayName || userData.username || 'ChyrpUser';
          
          if (auth.currentUser && auth.currentUser.displayName !== firestoreDisplayName) {
            await updateProfile(auth.currentUser, { displayName: firestoreDisplayName });
          }
          
          setUserProfile({
            displayName: firestoreDisplayName,
            bio: userData.bio || '',
            location: userData.location || '',
            website: userData.website || '',
            instagram: userData.instagram || '',
            facebook: userData.facebook || '',
            twitter: userData.twitter || '',
            joinDate: userData.joinDate || new Date().toISOString(),
            photoURL: userData.photoURL || user?.photoURL || ''
          });

          // Set follow counts
          setFollowersCount(userData.followers?.length || 0);
          setFollowingCount(userData.following?.length || 0);

        } else {
          const newProfileData = {
            displayName: user.displayName || 'ChyrpUser',
            email: user.email,
            uid: user.uid,
            joinDate: new Date().toISOString(),
            bio: '', location: '', website: '', instagram: '', facebook: '', twitter: '',
            photoURL: user?.photoURL || '',
            followers: [],
            following: []
          };
          
          await setDoc(userDocRef, newProfileData); 
          setUserProfile(newProfileData);
          setFollowersCount(0);
          setFollowingCount(0);
        }
      } catch (error) {
        console.error('Error loading or creating profile document:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserProfile();
  }, [user]);

  // Real-time listener for follow counts
  useEffect(() => {
    if (!user) return;

    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        const userData = doc.data();
        setFollowersCount(userData.followers?.length || 0);
        setFollowingCount(userData.following?.length || 0);
      }
    });

    return () => unsubscribe();
  }, [user]);

  // Load user posts
  useEffect(() => {
    if (!user) return;
    const q = query(
      postsCollectionRef(appId),
      where("author.uid", "==", user.uid),
      orderBy("timestamp", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPosts(postsData);
      setIsPostsLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const handleDelete = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await deleteDoc(postDocRef(appId, postId));
      console.log("Deleted post:", postId);
    } catch (err) {
      console.error("Error deleting post:", err);
    }
  };

  const handleProfilePicUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;

    try {
      const fileRef = ref(storage, `avatars/${user.uid}/${Date.now()}_${file.name}`);
      await uploadBytes(fileRef, file);
      const photoURL = await getDownloadURL(fileRef);

      // Save in Firestore
      await setDoc(doc(db, "users", user.uid), { photoURL }, { merge: true });

      // Save in Auth
      await updateProfile(auth.currentUser, { photoURL });

      // Update state
      setUserProfile(prev => ({ ...prev, photoURL }));
      console.log("Profile picture updated:", photoURL);
    } catch (err) {
      console.error("Error uploading profile pic:", err);
    }
  };

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
      await setDoc(doc(db, 'users', user.uid), {
        username: editForm.displayName,
        displayName: editForm.displayName,
        bio: editForm.bio,
        location: editForm.location,
        website: editForm.website,
        instagram: editForm.instagram,
        facebook: editForm.facebook,
        twitter: editForm.twitter,
        email: user.email, 
        uid: user.uid,
      }, { merge: true });

      if (auth.currentUser && auth.currentUser.displayName !== editForm.displayName) {
        await updateProfile(auth.currentUser, {
          displayName: editForm.displayName
        });
      }

      setUserProfile({ ...userProfile, ...editForm });
      setIsEditing(false);

    } catch (error) {
      console.error('Error saving profile:', error);
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
              <div className="h-48 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-800/50 to-transparent" />
              </div>

              <div className="relative px-6 pb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-end space-y-4 sm:space-y-0 sm:space-x-6 -mt-16">
                  <div className="relative group">
                    <Image
                      src={userProfile.photoURL || user?.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.uid}`}
                      alt="Profile"
                      className="w-32 h-32 rounded-full border-4 border-gray-800 bg-gray-800 object-cover"
                      width={128}
                      height={128}
                    />
                    {isEditing && (
                      <>
                        <input
                          type="file"
                          accept="image/*"
                          id="profilePicInput"
                          className="hidden"
                          onChange={handleProfilePicUpload}
                        />
                        <label
                          htmlFor="profilePicInput"
                          className="absolute inset-0 flex items-center justify-center bg-black/50 text-white text-sm rounded-full opacity-0 group-hover:opacity-100 cursor-pointer"
                        >
                          Change
                        </label>
                      </>
                    )}
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

            {/* Profile Stats */}
            <div className="px-6 pb-6">
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-white">{posts.length}</div>
                  <div className="text-sm text-gray-400">Posts</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{followersCount}</div>
                  <div className="text-sm text-gray-400">Followers</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{followingCount}</div>
                  <div className="text-sm text-gray-400">Following</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* User's Posts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mt-8 bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6"
          >
            <h3 className="text-xl font-semibold text-white mb-4">My Posts</h3>
            {isPostsLoading ? (
              <p className="text-gray-400">Loading posts...</p>
            ) : posts.length === 0 ? (
              <p className="text-gray-500">No posts yet.</p>
            ) : (
              <div className="space-y-6">
                {posts.map((post) => (
                  <div key={post.id} className="relative">
                    <PostCard post={post} user={user} appId={appId} />
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm flex items-center space-x-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default MyProfile;