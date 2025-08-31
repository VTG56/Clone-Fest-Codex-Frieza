'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useEffect, useMemo } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, Filter, Hash, Calendar, TrendingUp, Users, Settings } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Image from 'next/image';
import Footer from '@/components/Footer';
import Link from 'next/link';
const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Mock user data
  const username = "CyberUser";

  // Mock posts data
  const mockPosts = useMemo(() => [
    {
      id: 1,
      author: "TechMaster",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face",
      title: "The Future of Web Development",
      excerpt: "Exploring the latest trends in Next.js and serverless architecture...",
      image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=300&fit=crop",
      likes: 42,
      comments: 8,
      timestamp: "2 hours ago",
      tags: ["webdev", "nextjs", "tech"]
    },
    {
      id: 2,
      author: "DesignGuru",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face",
      title: "Cyberpunk UI Design Principles",
      excerpt: "How to create stunning neon interfaces that capture the cyberpunk aesthetic...",
      image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=600&h=300&fit=crop",
      likes: 67,
      comments: 15,
      timestamp: "4 hours ago",
      tags: ["design", "ui", "cyberpunk"]
    },
    {
      id: 3,
      author: "CodeNinja",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
      title: "Building Scalable Firebase Apps",
      excerpt: "Best practices for structuring your Firebase backend for maximum performance...",
      likes: 23,
      comments: 5,
      timestamp: "6 hours ago",
      tags: ["firebase", "backend", "scaling"]
    }
  ], []);
  

  useEffect(() => {
    setPosts(mockPosts);
}, [mockPosts]);


  const loadMorePosts = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      const newPosts = mockPosts.map(post => ({
        ...post,
        id: post.id + posts.length,
        timestamp: "just now"
      }));
      setPosts(prev => [...prev, ...newPosts]);
      setIsLoading(false);
    }, 1000);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        duration: 0.5
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const PostCard = ({ post, index }) => (
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: 1.02, y: -5 }}
      className="group relative"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <div className="relative bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden hover:border-purple-500/50 transition-all duration-500">
        {/* Glow effect on hover */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Image */}
        {post.image && (
          <div className="relative h-48 overflow-hidden">
            <Image 
              src={post.image}
              alt={post.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 to-transparent" />
          </div>
        )}

        <div className="p-6">
          {/* Author */}
          <div className="flex items-center mb-4">
            <Image
              src={post.avatar || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face`}
              alt={post.author}
              className="w-10 h-10 rounded-full border-2 border-purple-500/30"
            />
            <div className="ml-3">
              <p className="text-white font-medium">{post.author}</p>
              <p className="text-gray-400 text-sm">{post.timestamp}</p>
            </div>
          </div>

          {/* Content */}
          <h3 className="text-xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-purple-400 group-hover:to-pink-400 transition-all duration-300">
            {post.title}
          </h3>
          
          {post.excerpt && (
            <p className="text-gray-400 mb-4 line-clamp-2">{post.excerpt}</p>
          )}

          {/* Tags */}
          {post.tags && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map(tag => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full border border-purple-500/30"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="flex items-center space-x-2 text-gray-400 hover:text-red-400 transition-colors"
              >
                <Heart className="w-5 h-5" />
                <span className="text-sm">{post.likes}</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="flex items-center space-x-2 text-gray-400 hover:text-blue-400 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm">{post.comments}</span>
              </motion.button>
            </div>

            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="text-gray-400 hover:text-green-400 transition-colors"
              >
                <Share2 className="w-5 h-5" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="text-gray-400 hover:text-yellow-400 transition-colors"
              >
                <Bookmark className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const Sidebar = () => (
    <motion.div
      className="hidden lg:block lg:w-80 space-y-6"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      {/* Filters */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Filter className="w-5 h-5 mr-2 text-purple-400" />
          Filters
        </h3>
        <div className="space-y-3">
          {['All Posts', 'Following', 'Trending', 'Recent'].map(filter => (
            <motion.button
              key={filter}
              whileHover={{ scale: 1.02, x: 5 }}
              className="w-full text-left px-3 py-2 text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-all"
            >
              {filter}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Popular Tags */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Hash className="w-5 h-5 mr-2 text-pink-400" />
          Popular Tags
        </h3>
        <div className="flex flex-wrap gap-2">
          {['webdev', 'design', 'cyberpunk', 'nextjs', 'firebase', 'ui', 'tech'].map(tag => (
            <motion.span
              key={tag}
              whileHover={{ scale: 1.05 }}
              className="px-3 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 text-sm rounded-full border border-purple-500/30 cursor-pointer hover:border-purple-400/50 transition-all"
            >
              #{tag}
            </motion.span>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-blue-400" />
          Quick Stats
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Posts Today</span>
            <span className="text-white font-semibold">24</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Active Users</span>
            <span className="text-white font-semibold">1.2k</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Your Posts</span>
            <span className="text-white font-semibold">8</span>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-pink-900/10 to-blue-900/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.15),rgba(255,255,255,0))]" />
      </div>

      <div className="relative z-10">
        <Navbar />

        {/* Hero Banner */}
        <motion.section
          className="py-12 px-4 sm:px-6 lg:px-8 border-b border-gray-800/50"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">
              Welcome back, <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">{username}</span>
            </h1>
            <p className="text-gray-400 text-lg">{"What's happening in your network today?"}</p>
          </div>
        </motion.section>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Posts Feed */}
            <div className="flex-1">
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {posts.map((post, index) => (
                  <PostCard key={post.id} post={post} index={index} />
                ))}
              </motion.div>

              {/* Infinite Scroll Trigger */}
              <motion.div 
                className="mt-12 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                <motion.button
                  onClick={loadMorePosts}
                  disabled={isLoading}
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-full transition-all duration-300 disabled:opacity-50"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Loading...</span>
                    </div>
                  ) : (
                    'Load More Posts'
                  )}
                </motion.button>
              </motion.div>
            </div>

            {/* Sidebar */}
            <Sidebar />
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default HomePage;