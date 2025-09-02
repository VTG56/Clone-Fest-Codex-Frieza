// components/home/HomeComponents.js - FIXED: Modularized home page components
'use client';

import Image from 'next/image';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Heart, MessageCircle, Share2, Bookmark, Home, PlusSquare, User, Settings, Menu, X, UploadCloud,
    Type, Image as ImageIcon, Video, Mic, Link as LinkIcon, MessageSquare, Loader2, Send, Twitter, Copy
} from 'lucide-react';
import Link from 'next/link';
import { serverTimestamp, query, orderBy, onSnapshot, updateDoc, arrayUnion, arrayRemove, increment, addDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../../lib/firebase';
import { postMediaPath } from '../../lib/firestorePaths';
import { postsCollectionRef, postDocRef, postCommentsCollectionRef } from '../../lib/firestoreRefs';

// FIXED: Modular Navbar Component
export const Navbar = ({ onMenuClick, user, onLogout }) => (
  <nav className="sticky top-0 z-30 bg-gray-900/50 backdrop-blur-lg border-b border-gray-800/50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-16">
        <div className="flex items-center space-x-4">
          <button onClick={onMenuClick} className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700/50 transition-colors lg:hidden">
            <Menu className="w-6 h-6" />
          </button>
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Chyrp-Lite</span>
        </div>
        <div className="hidden md:flex items-center space-x-4">
          <Link href="#" className="text-gray-300 hover:text-white transition-colors">Home</Link>
          <Link href="#" className="text-gray-300 hover:text-white transition-colors">About</Link>
          <Link href="#" className="text-gray-300 hover:text-white transition-colors">Docs</Link>
          <Link href="#" className="text-gray-300 hover:text-white transition-colors">Community</Link>
        </div>
        <div className="flex items-center">
          {user ? (
            <Image 
              src={user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`} 
              alt="User Profile" 
              className="w-8 h-8 rounded-full" 
              width={32} 
              height={32}
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-700 animate-pulse"></div>
          )}
          <button 
            onClick={onLogout}
            className="ml-4 px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  </nav>
);

// FIXED: Modular Footer Component
export const Footer = () => (
  <footer className="bg-gray-900/50 border-t border-gray-800/50 mt-12">
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center text-gray-400">
      <p>&copy; 2025 Chyrp-Lite. All rights reserved.</p>
    </div>
  </footer>
);

// FIXED: Modular PostCard Component
export const PostCard = ({ post, user, appId }) => {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const shareRef = useRef(null);

  const hasLiked = useMemo(() => Array.isArray(post.likes) && post.likes.includes(user?.uid), [post.likes, user?.uid]);
  const postRef = postDocRef(appId, post.id);

  // Close share options if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (shareRef.current && !shareRef.current.contains(event.target)) {
        setShowShareOptions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [shareRef]);

  const handleLike = async () => {
    if (!user) return;
    if (hasLiked) {
      await updateDoc(postRef, { likes: arrayRemove(user.uid) });
    } else {
      await updateDoc(postRef, { likes: arrayUnion(user.uid) });
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: `Check out this post on Chyrp-Lite!`,
      text: `Post by ${post.author.displayName}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.error('Error using Web Share API:', error);
      }
    } else {
      setShowShareOptions(prev => !prev);
    }
  };

  const copyToClipboard = () => {
    const url = window.location.href;
    const textArea = document.createElement("textarea");
    textArea.value = url;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      console.log('Link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
    document.body.removeChild(textArea);
    setShowShareOptions(false);
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;
    setIsCommenting(true);
    try {
      await addDoc(postCommentsCollectionRef(appId, post.id), {
        author: {
          uid: user.uid,
          displayName: user.displayName || 'ChyrpUser',
          photoURL: user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`
        },
        text: newComment,
        timestamp: serverTimestamp()
      });
      await updateDoc(postRef, { comments: increment(1) });
      setNewComment("");
    } catch (error) {
      console.error("Error posting comment:", error);
    } finally {
      setIsCommenting(false);
    }
  };

  useEffect(() => {
    if (showComments) {
      setIsLoadingComments(true);
      const q = query(postCommentsCollectionRef(appId, post.id), orderBy("timestamp", "desc"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const commentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setComments(commentsData);
        setIsLoadingComments(false);
      });
      return () => unsubscribe();
    }
  }, [showComments, post.id, appId]);

  const renderContent = () => {
    switch (post.type) {
      case 'Photo':
        return (
          <>
            <p className="text-gray-300 mb-4 whitespace-pre-wrap">{post.content.text}</p>
            <div className="relative h-64 overflow-hidden rounded-lg">
              <Image src={post.content.url} alt="Post content" className="w-full h-full object-contain" layout="fill"/>
            </div>
          </>
        );
      case 'Video':
        return (
          <>
            <p className="text-gray-300 mb-4 whitespace-pre-wrap">{post.content.text}</p>
            <video controls className="w-full rounded-lg">
              <source src={post.content.url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </>
        );
      case 'Audio':
        return (
          <>
            <p className="text-gray-300 mb-4 whitespace-pre-wrap">{post.content.text}</p>
            <audio controls className="w-full">
              <source src={post.content.url} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          </>
        );
      case 'Quote':
        return (
          <blockquote className="border-l-4 border-purple-500 p-4 bg-gray-800/50 rounded-r-lg">
            <p className="text-xl italic text-white">{post.content.quote}</p>
            <cite className="block text-right mt-2 text-gray-400">- {post.content.source}</cite>
          </blockquote>
        );
      case 'Link':
        return (
          <Link href={post.content.url} target="_blank" rel="noopener noreferrer" className="block p-4 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg">
            <p className="text-gray-400 mb-2">Link</p>
            <p className="text-purple-400 font-bold truncate">{post.content.url}</p>
            {post.content.text && <p className="text-gray-300 mt-2 whitespace-pre-wrap">{post.content.text}</p>}
          </Link>
        );
      default:
        return <p className="text-gray-300 whitespace-pre-wrap">{post.content.text}</p>;
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="group bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden hover:border-purple-500/50 transition-all duration-500"
    >
      <div className="p-6">
        <div className="flex items-center mb-4">
          <Image 
            src={post.author.photoURL} 
            alt={post.author.displayName} 
            className="w-10 h-10 rounded-full border-2 border-purple-500/30" 
            width={40} 
            height={40}
          />
          <div className="ml-3">
            <p className="text-white font-medium">{post.author.displayName}</p>
            <p className="text-gray-400 text-sm">{post.timestamp?.toDate().toLocaleString()}</p>
          </div>
        </div>
        
        <div className="mb-4">
          {renderContent()}
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map(tag => (
              <span key={tag} className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full border border-purple-500/30">#{tag}</span>
            ))}
          </div>
        )}
        
        <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
          <div className="flex items-center space-x-4">
            <motion.button onClick={handleLike} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className={`flex items-center space-x-2 transition-colors ${hasLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}>
              <Heart className={`w-5 h-5 ${hasLiked ? 'fill-current' : ''}`} />
              <span className="text-sm font-semibold">{post.likes?.length || 0}</span>
            </motion.button>
            <motion.button onClick={() => setShowComments(!showComments)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="flex items-center space-x-2 text-gray-400 hover:text-blue-400 transition-colors">
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm font-semibold">{post.comments || 0}</span>
            </motion.button>
          </div>
          <div className="flex items-center space-x-2 relative" ref={shareRef}>
            <motion.button onClick={handleShare} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="text-gray-400 hover:text-green-400 transition-colors">
              <Share2 className="w-5 h-5" />
            </motion.button>
            <AnimatePresence>
            {showShareOptions && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-full right-0 mb-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-2 z-10"
              >
                <Link href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(`Check out this post by ${post.author.displayName}`)}`} target="_blank" rel="noopener noreferrer" className="flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-md">
                  <Twitter className="w-4 h-4 mr-2" /> Share on Twitter
                </Link>
                <Link href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out this post by ${post.author.displayName}: ${window.location.href}`)}`} target="_blank" rel="noopener noreferrer" className="flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-md">
                  <MessageSquare className="w-4 h-4 mr-2" /> Share on WhatsApp
                </Link>
                <button onClick={copyToClipboard} className="w-full flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-md">
                  <Copy className="w-4 h-4 mr-2" /> Copy Link
                </button>
              </motion.div>
            )}
            </AnimatePresence>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="text-gray-400 hover:text-yellow-400 transition-colors">
              <Bookmark className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>
      <AnimatePresence>
      {showComments && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="bg-gray-900/50 px-6 pt-4 pb-6 border-t border-gray-700/50"
        >
          <h4 className="font-bold text-white mb-4">Comments</h4>
          {user && (
            <form onSubmit={handlePostComment} className="flex items-start space-x-3 mb-4">
              <Image src={user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`} alt="Your avatar" className="w-9 h-9 rounded-full" width={36} height={36}/>
              <div className="flex-1 relative">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 pr-10 text-white focus:ring-1 focus:ring-purple-500 focus:border-purple-500 resize-none"
                  rows="1"
                  onInput={(e) => {
                    e.target.style.height = 'auto';
                    e.target.style.height = `${e.target.scrollHeight}px`;
                  }}
                />
                <button type="submit" disabled={isCommenting || !newComment.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-purple-400 disabled:opacity-50">
                  {isCommenting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5"/>}
                </button>
              </div>
            </form>
          )}
          <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
            {isLoadingComments ? (
              <p className="text-gray-400">Loading comments...</p>
            ) : comments.length > 0 ? (
              comments.map(comment => (
                <div key={comment.id} className="flex items-start space-x-3">
                  <Image src={comment.author.photoURL} alt={comment.author.displayName} className="w-9 h-9 rounded-full" layout='fill'/>
                  <div className="flex-1 bg-gray-800 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-white text-sm">{comment.author.displayName}</p>
                      <p className="text-xs text-gray-500">{comment.timestamp?.toDate().toLocaleTimeString()}</p>
                    </div>
                    <p className="text-gray-300 mt-1">{comment.text}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400">No comments yet.</p>
            )}
          </div>
        </motion.div>
      )}
      </AnimatePresence>
    </motion.div>
  );
};

// FIXED: Modular CreatePostModal Component
export const CreatePostModal = ({ isOpen, onClose, user, onPostCreated, appId }) => {
  const [step, setStep] = useState(1);
  const [postType, setPostType] = useState(null);
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [content, setContent] = useState({ text: '', url: '', quote: '', source: '', tags: '' });
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const postTypes = [
    { name: 'Text', icon: Type }, { name: 'Photo', icon: ImageIcon }, { name: 'Video', icon: Video },
    { name: 'Audio', icon: Mic }, { name: 'Link', icon: LinkIcon }, { name: 'Quote', icon: MessageSquare },
  ];

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFilePreview(URL.createObjectURL(selectedFile));
    }
  };

  const resetState = () => {
    setStep(1); setPostType(null); setFile(null); setFilePreview(null);
    setContent({ text: '', url: '', quote: '', source: '', tags: '' });
    setIsUploading(false);
  };

  const handleClose = () => { if (!isUploading) { resetState(); onClose(); } };

  const handlePost = async () => {
    if (!postType || !user) return;
    setIsUploading(true);

    let finalContent = {};
    let mediaUrl = '';
    
    try {
      if (file) {
        const storagePath = postMediaPath(appId, user.uid, file.name);
        const storageRef = ref(storage, storagePath);
        const uploadTask = uploadBytesResumable(storageRef, file);

        mediaUrl = await new Promise((resolve, reject) => {
          uploadTask.on('state_changed', 
            (snapshot) => {},
            (error) => reject(error),
            () => getDownloadURL(uploadTask.snapshot.ref).then(resolve)
          );
        });
      }

      switch (postType) {
        case 'Photo': case 'Video': case 'Audio':
          finalContent = { text: content.text, url: mediaUrl };
          break;
        case 'Text':
          finalContent = { text: content.text };
          break;
        case 'Link':
          finalContent = { text: content.text, url: content.url };
          break;
        case 'Quote':
          finalContent = { quote: content.quote, source: content.source };
          break;
        default:
          throw new Error("Invalid post type");
      }

      await addDoc(postsCollectionRef(appId), {
        author: {
          uid: user.uid,
          displayName: user.displayName || 'ChyrpUser',
          photoURL: user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`
        },
        type: postType,
        content: finalContent,
        tags: content.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        likes: [],
        comments: 0,
        timestamp: serverTimestamp()
      });

      onPostCreated();
      handleClose();

    } catch (error) {
      console.error("Error creating post:", error);
      setIsUploading(false);
    }
  };
  
  const handleContentChange = (e) => setContent({...content, [e.target.name]: e.target.value });

  const renderStepTwo = () => {
    const isMedia = ['Photo', 'Video', 'Audio'].includes(postType);
    return (
      <div className="flex flex-col h-full">
        <div className="flex-grow space-y-4">
          {isMedia && (
            <div onClick={() => fileInputRef.current.click()} className="w-full h-48 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-purple-500 hover:text-purple-400 transition-colors cursor-pointer">
              {filePreview ? (
                <>
                  <div className="relative w-full h-full overflow-hidden rounded-md"> 
                    {postType === 'Photo' && (
                      <Image 
                        src={filePreview} 
                        alt="Preview" 
                        layout="fill" //  <- Add this
                        objectFit="contain" // <- Use objectFit with layout="fill"
                        className="rounded-md" 
                
                      />
                    )}
                    {postType === 'Video' && <video src={filePreview} className="w-full h-full object-contain rounded-md" controls />}
                    {postType === 'Audio' && <audio src={filePreview} controls />}
                  </div>
                </>
              ) : ( <> <UploadCloud className="w-12 h-12 mb-2" /> <span>Click to upload {postType}</span> </> )}
            </div>
          )}
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept={postType === 'Photo' ? 'image/*' : postType === 'Video' ? 'video/*' : 'audio/*'} />
          
          {postType === 'Text' && <textarea name="text" value={content.text} onChange={handleContentChange} placeholder="What's on your mind?" className="w-full h-40 p-2 bg-gray-800 border border-gray-700 rounded-md" />}
          {postType === 'Link' && <input name="url" value={content.url} onChange={handleContentChange} type="url" placeholder="https://example.com" className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md" />}
          {postType === 'Quote' && (
            <>
              <textarea name="quote" value={content.quote} onChange={handleContentChange} placeholder="The quote..." className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md" />
              <input name="source" value={content.source} onChange={handleContentChange} type="text" placeholder="Source" className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md" />
            </>
          )}
          {(isMedia || postType === 'Link' || postType === 'Text') && <textarea name="text" value={content.text} onChange={handleContentChange} placeholder="Add a caption or text..." className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md" />}
          <input name="tags" value={content.tags} onChange={handleContentChange} type="text" placeholder="Tags (comma-separated)" className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md" />
        </div>
        <div className="flex justify-between items-center mt-6">
          <button onClick={() => setStep(1)} disabled={isUploading} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg disabled:opacity-50">Back</button>
          <button onClick={handlePost} disabled={isUploading} className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg disabled:opacity-50 flex items-center">
            {isUploading && <Loader2 className="animate-spin w-5 h-5 mr-2" />}
            {isUploading ? 'Posting...' : 'Post'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={handleClose}>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-2xl bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8" onClick={(e) => e.stopPropagation()}>
            <button onClick={handleClose} disabled={isUploading} className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:bg-gray-700/50"><X className="w-6 h-6" /></button>
            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
                {step === 1 ? (
                  <>
                    <h2 className="text-2xl font-bold text-white mb-6 text-center">What would you like to post?</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {postTypes.map(type => (
                        <motion.button key={type.name} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { setPostType(type.name); setStep(2); }} className="flex flex-col items-center justify-center p-6 bg-gray-800/50 hover:bg-purple-500/20 rounded-lg border border-gray-700 hover:border-purple-500">
                          <type.icon className="w-10 h-10 mb-2 text-purple-400" />
                          <span className="text-white font-semibold">{type.name}</span>
                        </motion.button>
                      ))}
                    </div>
                  </>
                ) : ( renderStepTwo() )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};