import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Settings, FileText, Heart, MessageSquare, Calendar, MapPin, ExternalLink, Mail } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
const ProfilePage = ({ id }) => {
  const [activeTab, setActiveTab] = useState('posts');

  // Mock data - in real app, this would come from Firebase
  const profileData = {
    id: id || 'user123',
    username: 'Vishwaradhya_56',
    displayName: 'Vishwa the GOAT',
    bio: 'Digital nomad • Code architect • Armwrestling enthusiast 🌃\nBuilding the future one commit at a time.',
    avatar: 'https://tse2.mm.bing.net/th/id/OIP.lTa0Pb9Dx_9kgVHFnZQOfwHaEJ?pid=Api&P=0&h=180',
    followers: 702000000,
    following: 256,
    posts: 42,
    joinDate: 'March 2023',
    location: 'Kittanahalli',
    website: 'sp.rvcesip2025.org'
  };

  const mockPosts = [
  {
    id: 1,
    author: "TechMaster",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face",
    title: 'Building Cyberpunk UIs',
    excerpt: "A deep dive into the design principles of cyberpunk user interfaces, focusing on neon glow and futuristic typography.",
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop',
    likes: 23,
    comments: 5,
    timestamp: "1 day ago",
    tags: ["ui", "design", "cyberpunk"]
  },
  {
    id: 2,
    author: "CodeNinja",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
    title: 'Next.js Performance Tips',
    excerpt: "Learn how to optimize your Next.js application with server-side rendering, static site generation, and code splitting.",
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=300&fit=crop',
    likes: 45,
    comments: 12,
    timestamp: "1 day ago",
    tags: ["nextjs", "webdev", "performance"]
  },
  {
    id: 3,
    author: "DesignGuru",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face",
    title: 'Neon Gradient Magic',
    excerpt: "A tutorial on creating captivating neon gradients for your web projects using CSS and Tailwind.",
    image: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=400&h=300&fit=crop',
    likes: 67,
    comments: 8,
    timestamp: "2 days ago",
    tags: ["design", "css", "tailwind"]
  },
  {
    id: 4,
    author: "CyberUser",
    avatar: "https://api.dicebear.com/8.x/bottts/svg?seed=CyberUser",
    title: 'Firebase + Next.js Guide',
    excerpt: "Integrating Firebase authentication and Firestore with your Next.js application for a full-stack experience.",
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
    likes: 89,
    comments: 15,
    timestamp: "2 days ago",
    tags: ["firebase", "backend", "nextjs"]
  },
  {
    id: 5,
    author: "WebWeaver",
    avatar: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=40&h=40&fit=crop&crop=face",
    title: 'Dark Mode Design',
    excerpt: "Best practices for implementing a consistent and user-friendly dark mode in your web applications.",
    image: 'https://images.unsplash.com/photo-1566438480900-0609be27a4be?w=400&h=300&fit=crop',
    likes: 34,
    comments: 7,
    timestamp: "3 days ago",
    tags: ["ui", "design", "darkmode"]
  },
  {
    id: 6,
    author: "CodeGeek",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=40&h=40&fit=crop&crop=face",
    title: 'Code Aesthetics',
    excerpt: "Why clean, readable code matters, and how to improve your coding style with simple formatting tips.",
    image: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=400&h=300&fit=crop',
    likes: 56,
    comments: 11,
    timestamp: "3 days ago",
    tags: ["programming", "best-practices", "software"]
  },
  {
    id: 7,
    author: "DataDriver",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face",
    title: 'Intro to Serverless Functions',
    excerpt: "An overview of serverless architecture and how to get started with Firebase Functions or Vercel Edge Functions.",
    image: "https://images.unsplash.com/photo-1622646243810-7e04f0d619a9?w=400&h=300&fit=crop",
    likes: 72,
    comments: 9,
    timestamp: "4 days ago",
    tags: ["serverless", "backend", "cloud"]
  },
  {
    id: 8,
    author: "UIWizard",
    avatar: "https://images.unsplash.com/photo-1493666324328-918991206f36?w=40&h=40&fit=crop&crop=face",
    title: 'Interactive Animations with Framer Motion',
    excerpt: "Creating fluid and dynamic user interfaces using the Framer Motion library for React.",
    image: "https://images.unsplash.com/photo-1594922647648-5c4e9c7c25c3?w=400&h=300&fit=crop",
    likes: 91,
    comments: 18,
    timestamp: "4 days ago",
    tags: ["animation", "react", "framer-motion"]
  }
];

  const tabs = [
    { id: 'posts', label: 'Posts', icon: FileText },
    { id: 'about', label: 'About', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Navbar */}
      <nav className="relative z-50 border-b border-cyan-500/20 bg-slate-900/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Chyrp
              </div>
              <div className="hidden md:block text-cyan-400/60">|</div>
              <div className="hidden md:block text-slate-300">Profile</div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-lg bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-400 hover:from-cyan-500/30 hover:to-purple-500/30 transition-all duration-300">
                <User size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-6 mb-8 shadow-2xl shadow-cyan-500/10"
        >
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
            {/* Avatar */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full animate-pulse"></div>
              <Image
                src={profileData.avatar} 
                alt={profileData.username}
                className="relative w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-transparent bg-gradient-to-r from-cyan-400 to-purple-400 p-1"
              />
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-400 rounded-full border-4 border-slate-900 shadow-lg shadow-green-400/50"></div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
                {profileData.displayName}
              </h1>
              <p className="text-cyan-400/80 text-lg mb-3">@{profileData.username}</p>
              <p className="text-slate-300 mb-4 whitespace-pre-line">{profileData.bio}</p>
              
              {/* Stats */}
              <div className="flex justify-center md:justify-start space-x-6 text-sm">
                <div className="text-center">
                  <div className="text-xl font-bold text-cyan-400">{profileData.posts}</div>
                  <div className="text-slate-400">Posts</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-purple-400">{profileData.followers}</div>
                  <div className="text-slate-400">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-pink-400">{profileData.following}</div>
                  <div className="text-slate-400">Following</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 transform hover:scale-105">
                Follow
              </button>
              <button className="px-6 py-2 border border-cyan-500/30 text-cyan-400 rounded-lg font-medium hover:bg-cyan-500/10 transition-all duration-300">
                Message
              </button>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          {/* Desktop Tabs */}
          <div className="hidden md:flex bg-slate-800/30 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 flex-1 justify-center ${
                  activeTab === tab.id
                    ? 'text-white bg-gradient-to-r from-cyan-500/20 to-purple-500/20 shadow-lg shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-cyan-400 hover:bg-slate-700/30'
                }`}
              >
                <tab.icon size={20} />
                <span>{tab.label}</span>
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-lg border border-cyan-500/30"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Mobile Tabs */}
          <div className="md:hidden space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-6 py-4 rounded-xl font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'text-white bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 shadow-lg shadow-cyan-500/20'
                    : 'text-slate-400 bg-slate-800/30 border border-slate-700/30 hover:text-cyan-400 hover:bg-slate-700/50'
                }`}
              >
                <tab.icon size={24} />
                <span className="text-lg">{tab.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            {activeTab === 'posts' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="group bg-slate-800/30 backdrop-blur-xl border border-slate-700/30 rounded-xl overflow-hidden hover:border-cyan-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/10"
                  >
                    <div className="relative overflow-hidden">
                      <Image src ={post.image} alt={post.title} className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-white mb-3 group-hover:text-cyan-400 transition-colors duration-300">
                        {post.title}
                      </h3>
                      <div className="flex items-center justify-between text-sm text-slate-400">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <Heart size={16} className="text-pink-400" />
                            <span>{post.likes}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MessageSquare size={16} className="text-cyan-400" />
                            <span>{post.comments}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {activeTab === 'about' && (
              <div className="bg-slate-800/30 backdrop-blur-xl border border-slate-700/30 rounded-xl p-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-cyan-400 mb-4 flex items-center">
                      <User size={24} className="mr-2" />
                      About {profileData.displayName}
                    </h3>
                    <p className="text-slate-300 leading-relaxed mb-6">
                      Passionate full-stack developer with a love for cutting-edge technology and cyberpunk aesthetics. 
                      Specializing in React, Next.js, and Firebase development. Always exploring new ways to create 
                      immersive digital experiences that push the boundaries of modern web development.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center text-slate-300">
                        <Calendar size={20} className="text-purple-400 mr-3" />
                        Joined {profileData.joinDate}
                      </div>
                      <div className="flex items-center text-slate-300">
                        <MapPin size={20} className="text-pink-400 mr-3" />
                        {profileData.location}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center text-slate-300">
                        <ExternalLink size={20} className="text-cyan-400 mr-3" />
                        <Link href={`https://${profileData.website}`} className="text-cyan-400 hover:text-cyan-300 transition-colors">
                          {profileData.website}
                        </Link>
                      </div>
                      <div className="flex items-center text-slate-300">
                        <Mail size={20} className="text-green-400 mr-3" />
                        Available for collaboration
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="bg-slate-800/30 backdrop-blur-xl border border-slate-700/30 rounded-xl p-8">
                <h3 className="text-2xl font-semibold text-cyan-400 mb-6 flex items-center">
                  <Settings size={24} className="mr-2" />
                  Profile Settings
                </h3>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Display Name</label>
                      <input 
                        type="text" 
                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300"
                        placeholder="Enter your display name"
                        defaultValue={profileData.displayName}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Username</label>
                      <input 
                        type="text" 
                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
                        placeholder="Enter your username"
                        defaultValue={profileData.username}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Bio</label>
                    <textarea 
                      rows={4}
                      className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 resize-none"
                      placeholder="Tell us about yourself..."
                      defaultValue={profileData.bio}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Location</label>
                      <input 
                        type="text" 
                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all duration-300"
                        placeholder="Your location"
                        defaultValue={profileData.location}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Website</label>
                      <input 
                        type="url" 
                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300"
                        placeholder="https://yourwebsite.com"
                        defaultValue={`https://${profileData.website}`}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4 pt-6">
                    <button 
                      type="button"
                      className="px-6 py-3 border border-slate-600 text-slate-300 rounded-lg font-medium hover:bg-slate-700/30 transition-all duration-300"
                    >
                      Cancel
                    </button>
                    <button 
                      type="button"
                      className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 transform hover:scale-105"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-cyan-500/20 bg-slate-900/80 backdrop-blur-xl mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Chyrp
              </div>
              <div className="text-slate-400 text-sm">
                © 2025 Next-gen blogging platform
              </div>
            </div>
            <div className="flex items-center space-x-6 text-sm text-slate-400">
              <Link href="#" className="hover:text-cyan-400 transition-colors duration-300">About</Link>
              <Link href="#" className="hover:text-purple-400 transition-colors duration-300">Privacy</Link>
              <Link href="#" className="hover:text-pink-400 transition-colors duration-300">Terms</Link>
              <Link href="#" className="hover:text-cyan-400 transition-colors duration-300">Support</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ProfilePage;