'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User, LogOut, Settings, Home, FileText, Users, Info } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { logOut } from '@/lib/auth';
import { useRouter } from 'next/router';
import Link from 'next/link';

const Navbar = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'Home', href: '/', icon: <Home className="w-4 h-4" /> },
    { name: 'About', href: '/about', icon: <Info className="w-4 h-4" /> },
    { name: 'Docs', href: '/docs', icon: <FileText className="w-4 h-4" /> },
    { name: 'Community', href: '/community', icon: <Users className="w-4 h-4" /> },
  ];

  const handleLogout = async () => {
    try {
      await logOut();
      router.push('/');
      setIsOpen(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const menuVariants = {
    closed: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    },
    open: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };

  const linkVariants = {
    hover: {
      scale: 1.05,
      transition: { duration: 0.2 }
    },
    tap: {
      scale: 0.95
    }
  };

  return (
    <motion.nav 
      className="sticky top-0 z-50 backdrop-blur-xl bg-gray-900/80 border-b border-gray-700/30"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Gradient border at top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-60" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 blur-sm opacity-40" />
      
      <div className="max-w-8xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex justify-between items-center h-20">
          {/* Enhanced Logo */}
          <motion.div
            className="flex-shrink-0"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              href="/"
              className="relative text-3xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent"
            >
              Chyrp-lite
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent blur-sm opacity-50" />
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden lg:block">
            <div className="flex items-center space-x-2">
              {navLinks.map((link) => (
                <motion.div key={link.name} className="relative">
                  <Link
                    href={link.href}
                    className="group relative px-6 py-3 text-gray-300 hover:text-white font-medium transition-all duration-300 rounded-xl overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      {link.icon}
                      {link.name}
                    </span>
                    
                    {/* Hover background */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"
                      whileHover={{ scale: 1.05 }}
                    />
                    
                    {/* Hover border */}
                    <div className="absolute inset-0 border border-purple-500/0 group-hover:border-purple-500/30 rounded-xl transition-all duration-300" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Enhanced Desktop Auth Buttons */}
          <div className="hidden lg:block">
            <div className="flex items-center space-x-4">
              {user ? (
                // Logged in state
                <>
                  <motion.button
                    onClick={() => router.push('/myprofile')}
                    className="group relative px-6 py-3 text-gray-300 hover:text-white font-medium border border-gray-600/50 hover:border-purple-500/50 rounded-xl transition-all duration-300 overflow-hidden"
                    variants={linkVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Profile
                    </span>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-gray-700/20 to-gray-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    />
                  </motion.button>
                  
                  <motion.button
                    onClick={handleLogout}
                    className="group relative px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-purple-500/30 overflow-hidden"
                    variants={linkVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <LogOut className="w-4 h-4" />
                      Logout
                    </span>
                    
                    {/* Shimmer effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 3,
                        ease: "easeInOut"
                      }}
                    />
                  </motion.button>
                </>
              ) : (
                // Logged out state
                <>
                  <motion.button
                    onClick={() => router.push('/login')}
                    className="group relative px-6 py-3 text-gray-300 hover:text-white font-medium border border-gray-600/50 hover:border-purple-500/50 rounded-xl transition-all duration-300 overflow-hidden"
                    variants={linkVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <span className="relative z-10">Login</span>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-gray-700/20 to-gray-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    />
                  </motion.button>
                  
                  <motion.button
                    onClick={() => router.push('/signup')}
                    className="group relative px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-purple-500/30 overflow-hidden"
                    variants={linkVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <span className="relative z-10">Sign Up</span>
                    
                    {/* Shimmer effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 3,
                        ease: "easeInOut"
                      }}
                    />
                  </motion.button>
                </>
              )}
            </div>
          </div>

          {/* Enhanced Mobile menu button */}
          <div className="lg:hidden">
            <motion.button
              onClick={() => setIsOpen(!isOpen)}
              className="relative p-3 text-gray-300 hover:text-white rounded-xl bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600/30 hover:border-purple-500/50 transition-all duration-300"
              whileTap={{ scale: 0.95 }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={isOpen ? 'close' : 'open'}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </motion.div>
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* Enhanced Mobile Navigation Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="lg:hidden overflow-hidden"
              initial="closed"
              animate="open"
              exit="closed"
              variants={menuVariants}
            >
              <div className="px-4 pt-4 pb-6 space-y-3 bg-gray-800/50 backdrop-blur-xl rounded-2xl mt-4 mb-4 border border-gray-700/30">
                {/* Navigation Links */}
                <div className="space-y-2">
                  {navLinks.map((link, index) => (
                    <motion.div
                      key={link.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.3 }}
                    >
                      <Link
                        href={link.href}
                        className="group flex items-center gap-3 text-gray-300 hover:text-white px-4 py-3 rounded-xl hover:bg-gray-700/50 transition-all duration-300"
                        onClick={() => setIsOpen(false)}
                      >
                        <span className="text-purple-400 group-hover:text-pink-400 transition-colors">
                          {link.icon}
                        </span>
                        <span className="font-medium">{link.name}</span>
                      </Link>
                    </motion.div>
                  ))}
                </div>
                
                {/* Auth Buttons */}
                <div className="pt-4 border-t border-gray-700/50">
                  <div className="flex flex-col space-y-3">
                    {user ? (
                      // Logged in mobile state
                      <>
                        <motion.button
                          onClick={() => {
                            router.push('/myprofile');
                            setIsOpen(false);
                          }}
                          className="group flex items-center gap-3 text-gray-300 hover:text-white px-4 py-3 rounded-xl border border-gray-600/50 hover:border-purple-500/50 hover:bg-gray-700/50 transition-all duration-300"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4, duration: 0.3 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <User className="w-4 h-4 text-purple-400 group-hover:text-pink-400 transition-colors" />
                          <span className="font-medium">Profile</span>
                        </motion.button>
                        
                        <motion.button
                          onClick={handleLogout}
                          className="group flex items-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-purple-500/30"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5, duration: 0.3 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Logout</span>
                        </motion.button>
                      </>
                    ) : (
                      // Logged out mobile state
                      <>
                        <motion.button
                          onClick={() => {
                            router.push('/login');
                            setIsOpen(false);
                          }}
                          className="flex items-center justify-center text-gray-300 hover:text-white px-4 py-3 rounded-xl border border-gray-600/50 hover:border-purple-500/50 hover:bg-gray-700/50 transition-all duration-300 font-medium"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4, duration: 0.3 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          Login
                        </motion.button>
                        
                        <motion.button
                          onClick={() => {
                            router.push('/signup');
                            setIsOpen(false);
                          }}
                          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-purple-500/30"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5, duration: 0.3 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          Sign Up
                        </motion.button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navbar;