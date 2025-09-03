// components/home/SidebarComponents.js - UPDATED per profile navigation requirement
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, PlusSquare, User, Settings, X } from 'lucide-react';
import { useRouter } from 'next/router';

// ✅ Updated MobileSidebar
export const MobileSidebar = ({ isOpen, onClose, onPostClick, activePage, setActivePage, onProfileClick }) => {
  const router = useRouter();

  const navItems = [
    { name: 'Feed', icon: Home, action: () => setActivePage('Feed') },
    { name: 'Post', icon: PlusSquare, action: onPostClick },
    { name: 'Profile', icon: User, action: onProfileClick }, // ✅ Changed from setActivePage
    { name: 'Settings', icon: Settings, action: () => router.push('/settings') },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 left-0 h-full w-72 bg-gray-900/80 backdrop-blur-xl border-r border-gray-700/50 z-50 flex flex-col p-6 lg:hidden"
          >
            <div className="flex items-center justify-between mb-8">
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Menu</span>
              <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:bg-gray-700/50 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex flex-col space-y-2">
              {navItems.map(item => (
                <button
                  key={item.name}
                  onClick={() => {
                    item.action();
                    onClose();
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-300 ${
                    activePage === item.name
                      ? 'bg-purple-500/20 text-white shadow-lg'
                      : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                  }`}
                >
                  <item.icon className={`w-6 h-6 ${activePage === item.name ? 'text-purple-400' : ''}`} />
                  <span className="font-semibold text-lg">{item.name}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// ✅ Updated LeftSidebar
export const LeftSidebar = ({ onPostClick, activePage, setActivePage, onProfileClick }) => {
  const router = useRouter();

  const navItems = [
    { name: 'Feed', icon: Home, action: () => setActivePage('Feed') },
    { name: 'Post', icon: PlusSquare, action: onPostClick },
    { name: 'Profile', icon: User, action: onProfileClick }, // ✅ Changed
    { name: 'Settings', icon: Settings, action: () => router.push('/settings') },
  ];

  return (
    <div className="hidden lg:block w-64">
      <div className="sticky top-24 bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-4 space-y-2">
        {navItems.map(item => (
          <button
            key={item.name}
            onClick={item.action}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-300 ${
              activePage === item.name ? 'bg-purple-500/20 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
            }`}
          >
            <item.icon className={`w-6 h-6 ${activePage === item.name ? 'text-purple-400' : ''}`} />
            <span className="font-semibold">{item.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
