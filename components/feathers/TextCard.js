// components/feathers/TextCard.js
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Trash2, Edit, Heart, MessageCircle } from "lucide-react";
import Comments from "./Comments";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { doc, updateDoc, increment } from "firebase/firestore";

export default function TextCard({ post }) {
  const [showComments, setShowComments] = useState(false);
  const [liked, setLiked] = useState(false);

  const handleLike = async () => {
    if (liked) return;
    try {
      await updateDoc(doc(db, "posts", post.id), { likes: increment(1) });
      setLiked(true);
    } catch (e) {
      console.error(e);
    }
  };

  const openComments = () => setShowComments(prev => !prev);

  return (
    <motion.div
      layout
      className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-4 flex flex-col gap-3 h-full"
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex justify-between items-start gap-2">
        <div>
          <h3 className="text-lg font-bold text-white">{post.title}</h3>
          <p className="text-gray-300 text-sm mt-1 line-clamp-3">{post.content}</p>
        </div>

        {/* Edit / Delete placeholders (parent handles actual edit/delete) */}
      </div>

      {/* attachments - show top 1 or grid */}
      {post.attachments?.length > 0 && (
        <div className="grid grid-cols-1 gap-2">
          {post.attachments.slice(0, 2).map((att, i) => (
            <div key={i} className="w-full aspect-square overflow-hidden rounded-lg">
              {att.type === "video" ? (
                <video src={att.url} controls className="w-full h-full object-cover" />
              ) : (
                <Image src={att.url} alt="" className="w-full h-full object-cover" />
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3 mt-auto">
        <motion.button
          onClick={handleLike}
          whileTap={{ scale: 0.95 }}
          className={`flex items-center gap-2 px-3 py-1 rounded-full font-semibold text-sm ${liked ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white" : "bg-gray-700/40 text-gray-200"}`}
        >
          <Heart className="w-4 h-4" /> {post.likes || 0}
        </motion.button>

        <motion.button
          onClick={openComments}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 text-white font-semibold text-sm"
        >
          <MessageCircle className="w-4 h-4" /> {(post._commentsCount) || '…'}
        </motion.button>

        {/* top-right small controls: edit/delete will be placed by parent; to keep this component focused, parent can overlay controls */}
      </div>

      {showComments && <Comments postId={post.id} />}
    </motion.div>
  );
}
