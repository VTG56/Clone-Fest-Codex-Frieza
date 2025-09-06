// pages/user/[uid].js
'use client';
import { ArrowLeft } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { doc, getDoc, collection, query, where, orderBy, onSnapshot, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../../lib/firebase';
import { postsCollectionRef } from '../../lib/firestoreRefs';
import { PostCard } from '../../components/home/HomeComponents';

const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

const UserProfilePage = () => {
  const router = useRouter();
  const { uid } = router.query;
  const [user] = useAuthState(auth);
  const [userProfile, setUserProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  // Load user profile
  useEffect(() => {
    if (!uid) return;
    const fetchUser = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserProfile(userData);
          setFollowersCount(userData.followers?.length || 0);
          setFollowingCount(userData.following?.length || 0);
          
          // Check if current user is following this profile
          if (user && userData.followers) {
            setIsFollowing(userData.followers.includes(user.uid));
          }
        } else {
          setUserProfile(null);
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
      }
    };
    fetchUser();
  }, [uid, user]);

  // Load user's posts
  useEffect(() => {
    if (!uid) return;
    const q = query(
      postsCollectionRef(appId),
      where("author.uid", "==", uid),
      orderBy("timestamp", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPosts(postsData);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [uid]);

  // Handle follow/unfollow
  const handleFollowToggle = async () => {
    if (!user || !uid || user.uid === uid) return;
    
    setIsFollowLoading(true);
    try {
      const profileUserRef = doc(db, 'users', uid);
      const currentUserRef = doc(db, 'users', user.uid);

      if (isFollowing) {
        // Unfollow
        await updateDoc(profileUserRef, {
          followers: arrayRemove(user.uid)
        });
        await updateDoc(currentUserRef, {
          following: arrayRemove(uid)
        });
        setIsFollowing(false);
        setFollowersCount(prev => prev - 1);
      } else {
        // Follow
        await updateDoc(profileUserRef, {
          followers: arrayUnion(user.uid)
        });
        await updateDoc(currentUserRef, {
          following: arrayUnion(uid)
        });
        setIsFollowing(true);
        setFollowersCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    } finally {
      setIsFollowLoading(false);
    }
  };

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p className="text-gray-400">User not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      {/* Background */}
      {/* Header */}
<div className="sticky top-0 z-30 bg-gray-900/50 backdrop-blur-lg border-b border-gray-800/50 mb-6">
  <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex items-center justify-between h-16">
      <button
        onClick={() => {
          if (window.history.length > 1) {
            router.back();
          } else {
            router.push('/home');
          }
        }}
        className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-6 h-6" />
        <span className="font-medium">Back to Feed</span>
      </button>

      <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
  {userProfile?.displayName || "User"}
</span>


      {/* spacer to balance header like in myprofile */}
      <div className="w-20"></div>
    </div>
  </div>
</div>

      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-pink-900/10 to-blue-900/10" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* User Info */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start sm:space-x-6 mb-8">
          <Image
            src={userProfile.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${uid}`}
            alt="Profile"
            className="w-32 h-32 rounded-full border-4 border-gray-800 bg-gray-800"
            width={128}
            height={128}
          />
          <div className="mt-4 sm:mt-0 flex-1">
            <h1 className="text-3xl font-bold text-white">{userProfile.displayName}</h1>
            <p className="text-gray-400 mb-2">{userProfile.bio || "No bio yet"}</p>
            
            {/* Follower/Following counts */}
            <div className="flex space-x-6 mb-4">
              <span className="text-gray-300">
                <span className="font-semibold text-white">{followersCount}</span> followers
              </span>
              <span className="text-gray-300">
                <span className="font-semibold text-white">{followingCount}</span> following
              </span>
            </div>

            {/* Follow/Unfollow button - only show if not viewing own profile and user is logged in */}
            {user && user.uid !== uid && (
              <button
                onClick={handleFollowToggle}
                disabled={isFollowLoading}
                className={`px-6 py-2 rounded-full font-semibold transition-all duration-200 ${
                  isFollowing
                    ? 'bg-gray-700 hover:bg-gray-600 text-white border border-gray-600'
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg'
                } ${isFollowLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isFollowLoading ? 'Loading...' : isFollowing ? 'Unfollow' : 'Follow'}
              </button>
            )}
          </div>
        </div>

        {/* User's Posts */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-semibold mb-4">Posts</h2>
          {isLoading ? (
            <p className="text-gray-400">Loading posts...</p>
          ) : posts.length === 0 ? (
            <p className="text-gray-500">No posts yet.</p>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} user={null} appId={appId} />
              ))}
            </div>
          )}
        </motion.section>
      </div>
    </div>
  );
};

export default UserProfilePage;