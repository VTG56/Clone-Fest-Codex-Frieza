// pages/user/[uid].js
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { doc, getDoc, collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { postsCollectionRef } from '../../lib/firestoreRefs';
import { PostCard } from '../../components/home/HomeComponents';

const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

const UserProfilePage = () => {
  const router = useRouter();
  const { uid } = router.query;
  const [userProfile, setUserProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load user profile
  useEffect(() => {
    if (!uid) return;
    const fetchUser = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
          setUserProfile(userDoc.data());
        } else {
          setUserProfile(null);
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
      }
    };
    fetchUser();
  }, [uid]);

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
          <div className="mt-4 sm:mt-0">
            <h1 className="text-3xl font-bold text-white">{userProfile.displayName}</h1>
            <p className="text-gray-400">{userProfile.bio || "No bio yet"}</p>
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
