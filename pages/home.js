// pages/home.js - UPDATED: Added search functionality integration
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import { onAuthStateChanged, signInAnonymously, signInWithCustomToken } from 'firebase/auth';
import { query, orderBy, onSnapshot } from 'firebase/firestore';

// Import centralized auth functions
import { auth } from '../lib/firebase';
import { logOut } from '../lib/auth';
import { postsCollectionRef } from '../lib/firestoreRefs';

// Import modular components with updated SearchBar
import { Navbar, Footer, PostCard, CreatePostModal } from '../components/home/HomeComponents';
import { MobileSidebar, LeftSidebar } from '../components/home/SidebarComponents';

// Environment App ID
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [activePage, setActivePage] = useState('Feed');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const router = useRouter();

  // Profile click handler
  const handleProfileClick = () => {
    router.push('/myprofile');
  };

  // Enhanced authentication handling
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userData = {
          ...currentUser,
          displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'ChyrpUser'
        };
        setUser(userData);
      } else {
        try {
          if (typeof __initial_auth_token !== 'undefined') {
            await signInWithCustomToken(auth, __initial_auth_token);
          } else {
            await signInAnonymously(auth);
          }
        } catch (error) {
          console.error("Sign-in failed:", error);
          router.push('/login');
        }
      }
    });

    const q = query(postsCollectionRef(appId), orderBy("timestamp", "desc"));
    const unsubscribeFirestore = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPosts(postsData);
      setIsLoading(false);
    }, error => {
      console.error("Error fetching posts: ", error);
      setIsLoading(false);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeFirestore();
    };
  }, [router]);

  // Logout handler with redirect
  const handleLogout = async () => {
    try {
      await logOut();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white font-sans flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your feed...</p>
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
        {/* Modals & Sidebars */}
        <CreatePostModal 
          isOpen={isPostModalOpen} 
          onClose={() => setIsPostModalOpen(false)} 
          user={user}
          onPostCreated={() => setActivePage('Feed')}
          appId={appId}
        />
        
        <MobileSidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
          activePage={activePage} 
          setActivePage={setActivePage}
          onPostClick={() => { setIsSidebarOpen(false); setIsPostModalOpen(true); }}
          onProfileClick={handleProfileClick}
        />
        
        {/* Updated Navbar with integrated search */}
        <Navbar 
          onMenuClick={() => setIsSidebarOpen(true)} 
          user={user} 
          onLogout={handleLogout}
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <LeftSidebar 
              activePage={activePage} 
              setActivePage={setActivePage} 
              onPostClick={() => setIsPostModalOpen(true)}
              onProfileClick={handleProfileClick}
            />
            
            <div className="flex-1 min-w-0">
              <motion.section 
                className="mb-8" 
                initial={{ opacity: 0, y: -20 }} 
                animate={{ opacity: 1, y: 0 }}
              >
                <h1 className="text-3xl sm:text-4xl font-bold mb-2">{activePage}</h1>
                <p className="text-gray-400 text-lg">
                  {activePage === 'Feed' ? "What's happening in your network today?" : `Manage your ${activePage.toLowerCase()}.`}
                </p>
              </motion.section>
              
              <div className="space-y-6">
                <AnimatePresence>
                  {posts.length === 0 ? (
                    <motion.div 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }}
                      className="text-center py-12"
                    >
                      <p className="text-gray-400 text-lg">No posts yet. Be the first to share something!</p>
                      <button
                        onClick={() => setIsPostModalOpen(true)}
                        className="mt-4 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg font-medium transition-all duration-300"
                      >
                        Create Your First Post
                      </button>
                    </motion.div>
                  ) : (
                    posts.map((post) => (
                      <PostCard 
                        key={post.id} 
                        post={post} 
                        user={user} 
                        appId={appId}
                      />
                    ))
                  )}
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

export default HomePage;