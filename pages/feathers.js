// pages/feathers.js
import React from "react";
import PostList from "@/components/feathers/PostList";
import { motion } from "framer-motion";
import Image from "next/image";
export default function FeathersPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <motion.h1 initial={{ y: -20, opacity: 0 }} animate={{ y:0, opacity:1 }} transition={{ duration: .5 }} className="text-5xl sm:text-6xl font-bold text-center mb-6">
        <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent animate-pulse">Text</span>
        <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Posts</span>
      </motion.h1>

      <PostList />
    </div>
  );
}
