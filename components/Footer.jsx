'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Github, MessageCircle, Twitter, Heart, Sparkles } from 'lucide-react';
import Link from 'next/link';

const Footer = () => {
  const socialLinks = [
    {
      name: 'GitHub',
      icon: <Github className="w-6 h-6" />,
      href: 'https://github.com/VTG56',
      hoverColor: 'hover:text-purple-400',
      glowColor: 'group-hover:drop-shadow-[0_0_12px_rgba(147,51,234,0.8)]'
    },
    {
      name: 'WhatsApp',
      icon: <MessageCircle className="w-6 h-6" />,
      href: 'https://wa.me/917483166788',
      hoverColor: 'hover:text-green-400',
      glowColor: 'group-hover:drop-shadow-[0_0_12px_rgba(34,197,94,0.8)]'
    },
    {
      name: 'Twitter',
      icon: <Twitter className="w-6 h-6" />,
      href: 'https://twitter.com',
      hoverColor: 'hover:text-blue-400',
      glowColor: 'group-hover:drop-shadow-[0_0_12px_rgba(59,130,246,0.8)]'
    }
  ];

  const quickLinks = [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Support', href: '/support' },
    { name: 'Documentation', href: '/docs' }
  ];

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  return (
    <motion.footer 
      className="relative bg-gradient-to-b from-gray-900 to-black border-t border-transparent overflow-hidden"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={containerVariants}
    >
      {/* Enhanced gradient borders */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-80" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 blur-sm opacity-60" />
      
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl" />
        
        {/* Animated particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-1 h-1 rounded-full ${
              i % 3 === 0 ? 'bg-purple-400/30' : i % 3 === 1 ? 'bg-pink-400/30' : 'bg-blue-400/30'
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              bottom: `${Math.random() * 50}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.7, 0.3],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
      
      <div className="relative max-w-8xl mx-auto px-6 sm:px-8 lg:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-12">
          
          {/* Brand Section */}
          <motion.div 
            className="lg:col-span-1"
            variants={itemVariants}
          >
            <div className="mb-6">
              <h3 className="text-3xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-4">
                Chyrp-lite
              </h3>
              <p className="text-gray-400 leading-relaxed text-lg">
                The lightweight blogging platform that puts creativity first. Build, share, and grow your community with elegance and speed.
              </p>
            </div>
            
            {/* Made with love */}
            <motion.div 
              className="flex items-center gap-2 text-gray-500 text-sm"
              whileHover={{ scale: 1.05 }}
            >
              <span>Made with</span>
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Heart className="w-4 h-4 text-red-400 fill-current" />
              </motion.div>
              <span>by VTG56</span>
            </motion.div>
          </motion.div>

          {/* Quick Links */}
          <motion.div 
            className="lg:col-span-1"
            variants={itemVariants}
          >
            <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              Quick Links
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {quickLinks.map((link, index) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <Link
                    href={link.href}
                    className="group text-gray-400 hover:text-white transition-all duration-300 text-sm block py-2 px-3 rounded-lg hover:bg-gray-800/30"
                  >
                    <span className="relative">
                      {link.name}
                      <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 group-hover:w-full transition-all duration-300" />
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Social Links */}
          <motion.div 
            className="lg:col-span-1"
            variants={itemVariants}
          >
            <h4 className="text-xl font-bold text-white mb-6">Connect With Us</h4>
            <div className="flex flex-wrap gap-4">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group relative p-4 bg-gray-800/30 hover:bg-gray-700/50 rounded-2xl border border-gray-700/30 hover:border-purple-500/50 text-gray-400 ${social.hoverColor} transition-all duration-300 ${social.glowColor}`}
                  whileHover={{ 
                    scale: 1.1,
                    rotate: 5,
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ 
                    delay: 0.5 + (index * 0.1),
                    duration: 0.4,
                    type: "spring",
                    stiffness: 300
                  }}
                >
                  <div className="relative">
                    {social.icon}
                    
                    {/* Hover glow ring */}
                    <motion.div
                      className="absolute inset-0 border-2 border-current opacity-0 group-hover:opacity-30 rounded-full"
                      animate={{
                        scale: [1, 1.2, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                    
                    {/* Tooltip */}
                    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-800/90 backdrop-blur-sm text-white text-xs py-2 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap border border-gray-600/50">
                      {social.name}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800/90" />
                    </div>
                  </div>
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>
        
        {/* Bottom Bar */}
        <motion.div 
          className="pt-8 border-t border-gray-700/30"
          variants={itemVariants}
        >
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright with enhanced styling */}
            <motion.div 
              className="text-center md:text-left"
              whileHover={{ scale: 1.02 }}
            >
              <p className="text-gray-400 text-sm md:text-base">
                © 2025{' '}
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-bold">
                  Chyrp-lite
                </span>
                . All Rights Reserved.
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Building the future of lightweight blogging
              </p>
            </motion.div>

            {/* Version/Status */}
            <motion.div 
              className="flex items-center gap-3"
              variants={itemVariants}
            >
              <div className="px-4 py-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full border border-purple-500/30 backdrop-blur-sm">
                <span className="text-xs font-medium text-purple-300">v1.0.0 Beta</span>
              </div>
              <div className="flex items-center gap-2">
                <motion.div
                  className="w-2 h-2 bg-green-400 rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                <span className="text-xs text-gray-500">All systems operational</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
        
        {/* Enhanced bottom gradient line */}
        <motion.div 
          className="mt-8 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent relative"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, delay: 0.5 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 blur-sm opacity-50" />
        </motion.div>
      </div>
    </motion.footer>
  );
};

export default Footer;