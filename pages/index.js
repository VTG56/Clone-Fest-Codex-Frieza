import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Users, Sparkles, Star, ChevronDown } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useRouter } from 'next/router';
import Link from 'next/link';

const LandingPage = () => {
  const router = useRouter();
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        duration: 0.6
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.6, -0.05, 0.01, 0.99]
      }
    }
  };

  const floatAnimation = {
    y: [-10, 10, -10],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  const features = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Lightning Fast",
      description: "Built with Next.js and Firebase for blazing-fast performance. SSR/SSG optimization ensures your content loads instantly.",
      gradient: "from-purple-500 to-pink-500",
      delay: 0
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "Beautiful & Simple",
      description: "Intuitive design meets powerful functionality. Create stunning content with our rich editor and customizable themes.",
      gradient: "from-pink-500 to-blue-500",
      delay: 0.2
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Community First",
      description: "Built for creators who value authentic connections. Engage your audience with comments, reactions, and social features.",
      gradient: "from-blue-500 to-purple-500",
      delay: 0.4
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-hidden relative">
      {/* Enhanced Animated Background */}
      <div className="fixed inset-0 z-0">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-gray-900 to-pink-900/30" />
        
        {/* Dynamic gradient overlay */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/15 rounded-full blur-3xl animate-pulse delay-2000" />
        </div>
        
        {/* Radial gradient for depth */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
        
        {/* Enhanced particles */}
        <div className="absolute inset-0">
          {[...Array(60)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute rounded-full ${
                i % 3 === 0 ? 'bg-purple-400/30' : i % 3 === 1 ? 'bg-pink-400/30' : 'bg-blue-400/30'
              }`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: Math.random() * 4 + 1 + 'px',
                height: Math.random() * 4 + 1 + 'px',
              }}
              animate={{
                y: [-20, -120, -20],
                opacity: [0, 0.8, 0],
                scale: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 4 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 3,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>

        {/* Grid overlay for tech feel */}
        <div className="absolute inset-0 opacity-[0.02]" 
             style={{
               backgroundImage: `
                 linear-gradient(rgba(120,119,198,0.5) 1px, transparent 1px),
                 linear-gradient(90deg, rgba(120,119,198,0.5) 1px, transparent 1px)
               `,
               backgroundSize: '50px 50px'
             }} 
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <Navbar />

        {/* Enhanced Hero Section */}
        <motion.section 
          className="min-h-screen flex items-center justify-center px-6 sm:px-8 lg:px-12 pt-20"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <div className="text-center max-w-7xl mx-auto">
            <motion.div variants={itemVariants} className="mb-12">
              {/* Floating badge */}
              <motion.div 
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800/50 backdrop-blur-md border border-purple-500/30 rounded-full mb-8 text-sm font-medium"
                animate={floatAnimation}
              >
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Next-Gen Blogging Platform
                </span>
              </motion.div>

              {/* Enhanced main heading */}
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black mb-8 leading-tight">
                <motion.span 
                  className="block bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent"
                  animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  style={{
                    backgroundSize: '200% 200%'
                  }}
                >
                  Chyrp-lite
                </motion.span>
              </h1>
              
              <motion.p 
                className="text-xl sm:text-2xl md:text-3xl text-gray-300 font-light tracking-wide max-w-4xl mx-auto leading-relaxed"
                variants={itemVariants}
              >
                The lightweight blogging platform that puts{' '}
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-semibold">
                  creativity first
                </span>
                . Build, share, and grow your community with elegance and speed.
              </motion.p>
            </motion.div>

            {/* Enhanced CTA buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20"
              variants={itemVariants}
            >
              <motion.button
                onClick={() => router.push('/login')}
                className="group relative px-10 py-5 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-2xl font-bold text-lg overflow-hidden shadow-2xl shadow-purple-500/25"
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 25px 50px -12px rgba(147, 51, 234, 0.4)"
                }}
                whileTap={{ scale: 0.95 }}
                animate={{
                  boxShadow: [
                    "0 20px 40px -12px rgba(147, 51, 234, 0.2)",
                    "0 25px 50px -12px rgba(147, 51, 234, 0.3)",
                    "0 20px 40px -12px rgba(147, 51, 234, 0.2)"
                  ]
                }}
                transition={{
                  boxShadow: {
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }
                }}
              >
                <span className="relative z-10 flex items-center gap-3">
                  Start Creating
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
                </span>
                
                {/* Enhanced hover effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-pink-600 via-blue-600 to-purple-600"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
                
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

              <motion.button
                onClick={() => router.push('/docs')}
                className="group px-10 py-5 bg-gray-800/50 backdrop-blur-md border-2 border-purple-500/50 rounded-2xl font-bold text-lg hover:bg-gray-700/50 hover:border-purple-400 transition-all duration-300 shadow-lg"
                whileHover={{ 
                  scale: 1.05,
                  backgroundColor: "rgba(55, 65, 81, 0.6)"
                }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="flex items-center gap-3">
                  Explore Features
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Sparkles className="w-5 h-5 text-purple-400" />
                  </motion.div>
                </span>
              </motion.button>
            </motion.div>

            {/* Enhanced scroll indicator */}
            <motion.div
              className="absolute bottom-12 left-1/2 transform -translate-x-1/2 cursor-pointer"
              animate={{ y: [0, 15, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              variants={itemVariants}
              onClick={() => {
                document.getElementById('features').scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <div className="flex flex-col items-center gap-3 text-purple-400 hover:text-pink-400 transition-colors">
                <span className="text-sm font-medium">Discover More</span>
                <div className="w-8 h-12 border-2 border-purple-400/50 rounded-full flex justify-center relative overflow-hidden">
                  <motion.div 
                    className="w-1.5 h-3 bg-gradient-to-b from-purple-400 to-pink-400 rounded-full mt-2"
                    animate={{ y: [0, 16, 0], opacity: [1, 0, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
                <ChevronDown className="w-5 h-5" />
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Enhanced Features Section */}
        <motion.section 
          id="features"
          className="py-32 px-6 sm:px-8 lg:px-12 relative"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          {/* Section background effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/5 to-transparent" />
          
          <div className="max-w-8xl mx-auto relative">
            <motion.div className="text-center mb-20" variants={itemVariants}>
              <motion.div 
                className="inline-block px-6 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-purple-500/30 rounded-full mb-6"
                animate={floatAnimation}
              >
                <span className="text-sm font-semibold text-purple-300">Why Choose Us</span>
              </motion.div>
              
              <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-8 leading-tight">
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                  Power Meets
                </span>
                <br />
                <span className="text-white">Simplicity</span>
              </h2>
              
              <p className="text-xl sm:text-2xl text-gray-400 max-w-4xl mx-auto leading-relaxed">
                Experience the perfect blend of cutting-edge technology and intuitive design. 
                Built for creators who demand both performance and elegance.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="group relative h-full"
                  whileHover={{ y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="relative p-10 bg-gray-800/30 backdrop-blur-xl rounded-3xl border border-gray-700/50 hover:border-purple-500/50 transition-all duration-500 h-full group-hover:bg-gray-800/50">
                    
                    {/* Dynamic glow effect */}
                    <motion.div 
                      className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500`}
                      animate={{
                        scale: [1, 1.05, 1],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                    
                    {/* Animated icon container */}
                    <motion.div 
                      className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${feature.gradient} mb-8 shadow-lg`}
                      whileHover={{ 
                        rotate: [0, -10, 10, 0],
                        scale: 1.1 
                      }}
                      transition={{ duration: 0.5 }}
                    >
                      {feature.icon}
                    </motion.div>

                    <h3 className="text-3xl font-bold mb-6 text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-purple-400 group-hover:to-pink-400 transition-all duration-300">
                      {feature.title}
                    </h3>

                    <p className="text-gray-400 text-lg leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                      {feature.description}
                    </p>

                    {/* Decorative bottom accent */}
                    <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-b-3xl`} />
                    
                    {/* Hover particle effect */}
                    <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
                      {[...Array(6)].map((_, i) => (
                        <motion.div
                          key={i}
                          className={`absolute w-1 h-1 rounded-full ${
                            i % 2 === 0 ? 'bg-purple-400' : 'bg-pink-400'
                          } opacity-0 group-hover:opacity-60`}
                          style={{
                            left: `${20 + (i * 15)}%`,
                            top: `${30 + (i * 10)}%`,
                          }}
                          animate={{
                            y: [0, -20, 0],
                            opacity: [0, 0.6, 0],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.2,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        <Footer />
      </div>
    </div>
  );
};

export default LandingPage;