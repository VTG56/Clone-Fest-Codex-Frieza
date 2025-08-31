"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, MessageCircle, Heart, User, Award, Hash, ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';

const mockPosts = [
  {
    id: 1,
    title: 'The Rise of AI in Web Development',
    author: 'NeoCoder',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face',
    excerpt: 'AI-powered tools are changing how we build. From code generation to design assistance...',
    likes: 154,
    comments: 23,
    image: 'https://images.unsplash.com/photo-1574856342880-9280145452f3?q=80&w=400&h=300&fit=crop&auto=format'
  },
  {
    id: 2,
    title: 'A Guide to Next.js 13 App Router',
    author: 'ReactMaster',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
    excerpt: 'From server components to nested layouts, here&apos;s everything you need to know about...',
    likes: 210,
    comments: 41,
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=400&h=300&fit=crop&auto=format'
  },
  {
    id: 3,
    title: 'Building a Full-Stack App with Firebase',
    author: 'DataJunkie',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=40&h=40&fit=crop&crop=face',
    excerpt: 'A step-by-step tutorial on setting up a robust backend using Firebase Authentication and Firestore.',
    likes: 89,
    comments: 17,
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=400&h=300&fit=crop&auto=format'
  },
  {
    id: 4,
    title: 'Exploring the World of Cyberpunk UI',
    author: 'SynthWave',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
    excerpt: 'Deep dive into the aesthetic of glowing neons, glitch effects, and futuristic typography in design.',
    likes: 312,
    comments: 56,
    image: 'https://images.unsplash.com/photo-1555949963-aa79dcee9814?q=80&w=400&h=300&fit=crop&auto=format'
  },
];

const mockTags = ['#AI', '#NextJS', '#Firebase', '#Cyberpunk', '#Design', '#WebDev', '#UI'];

const mockLeaderboard = [
  { id: 1, name: 'Ava', posts: 56, avatar: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=40&h=40&fit=crop&crop=face' },
  { id: 2, name: 'Jake', posts: 42, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face' },
  { id: 3, name: 'Sora', posts: 38, avatar: 'https://images.unsplash.com/photo-1493666324328-918991206f36?w=40&h=40&fit=crop&crop=face' },
  { id: 4, name: 'Kenji', posts: 31, avatar: 'https://images.unsplash.com/photo-1534528736684-2796e6221d60?w=40&h=40&fit=crop&crop=face' },
];

const CommunityPage = () => {
  const [activeTag, setActiveTag] = useState(null);

  const handleTagClick = (tag) => {
    setActiveTag(tag);
    // Mock functionality, no real filtering
    console.log(`Clicked on tag: ${tag}`);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            animate={{ scale: [1, 1.05, 1], rotate: [0, -2, 2, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="inline-block p-2 rounded-full mb-4"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(147, 51, 234, 0.3) 0%, rgba(219, 39, 119, 0.3) 100%)'
            }}
          >
            <Sparkles className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" size={48} />
          </motion.div>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white mb-4 leading-tight">
            Community Hub
          </h1>
          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto">
            Connect, share, and grow with the Chyrp-lite community.
          </p>
        </motion.div>

        {/* Featured Posts Section */}
        <section className="mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-8 text-center">Featured Posts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mockPosts.map((post) => (
              <motion.div
                key={post.id}
                className="bg-gray-800 rounded-2xl overflow-hidden shadow-lg border border-gray-700 hover:shadow-purple-500/30 transition-shadow duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                whileHover={{ scale: 1.02 }}
              >
                <Image
                  src={post.image}
                  alt={post.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-white mb-2">{post.title}</h3>
                  <div className="flex items-center space-x-2 text-gray-400 text-sm mb-4">
                    <Image src ={post.avatar} alt={post.author} className="w-8 h-8 rounded-full object-cover" />
                    <span>by {post.author}</span>
                  </div>
                  <p className="text-gray-300 leading-relaxed mb-4">{post.excerpt}</p>
                  <div className="flex items-center space-x-6 text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Heart size={16} className="text-pink-400" />
                      <span>{post.likes}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageCircle size={16} className="text-cyan-400" />
                      <span>{post.comments}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Trending Tags Section */}
        <section className="mb-16 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-8">Trending Tags</h2>
          <motion.div
            className="flex flex-wrap justify-center items-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            {mockTags.map((tag, index) => (
              <motion.div
                key={index}
                className={`px-4 py-2 rounded-full cursor-pointer transition-colors duration-300 ${activeTag === tag ? 'bg-purple-600 text-white shadow-lg' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleTagClick(tag)}
              >
                {tag}
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Leaderboard Section */}
        <section className="mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-8 text-center">Top Contributors</h2>
          <div className="bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-700">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {mockLeaderboard.map((user, index) => (
                <motion.div
                  key={user.id}
                  className="flex flex-col items-center text-center p-4 bg-gray-900 rounded-xl border border-gray-700"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(147, 51, 234, 0.4)' }}
                >
                  <motion.div
                    className="w-16 h-16 rounded-full overflow-hidden border-2 border-purple-500 mb-2"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  >
                    <Image src = {user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  </motion.div>
                  <h3 className="text-lg font-semibold text-white truncate">{user.name}</h3>
                  <p className="text-sm text-gray-400">{user.posts} Posts</p>
                  <motion.div
                    className="mt-2 text-xs font-bold text-pink-400"
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    #{index + 1}
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="p-8 bg-gray-800 rounded-2xl shadow-xl border border-gray-700"
          >
            <h2 className="text-3xl font-bold text-white mb-4">Join the Conversation</h2>
            <p className="text-gray-400 mb-6 max-w-xl mx-auto">
              Share your insights, ask questions, and collaborate with developers and designers from around the world.
            </p>
            <motion.button
              className="inline-flex items-center justify-center space-x-2 px-8 py-4 text-white font-bold rounded-full transition-all duration-300"
              style={{
                backgroundImage: 'linear-gradient(to right, var(--tw-gradient-stops))',
                '--tw-gradient-from': '#8B5CF6',
                '--tw-gradient-to': '#EC4899',
                '--tw-gradient-stops': 'var(--tw-gradient-from), var(--tw-gradient-to)'
              }}
              whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(147, 51, 234, 0.8)' }}
              whileTap={{ scale: 0.95 }}
            >
              <Sparkles size={20} className="text-white drop-shadow-md" />
              <span>Start a Discussion</span>
            </motion.button>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default CommunityPage;