'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Heart, MessageCircle, Share2, Bookmark, Home, PlusSquare, User, Settings, Menu, X, UploadCloud,
    Type, Image as ImageIcon, Video, Mic, Link as LinkIcon, MessageSquare, Loader2
} from 'lucide-react';

// --- Firebase SDK Imports ---
import { onAuthStateChanged, signInAnonymously, signInWithCustomToken } from 'firebase/auth';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

// --- Local Firebase Imports ---
import { auth, db, storage } from '../lib/firebase';


// --- Environment App ID ---
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';


// NOTE: Components are kept in one file for this environment.
const Navbar = ({ onMenuClick, user }) => (
    <nav className="sticky top-0 z-30 bg-gray-900/50 backdrop-blur-lg border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
                <div className="flex items-center space-x-4">
                    <button onClick={onMenuClick} className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700/50 transition-colors lg:hidden">
                        <Menu className="w-6 h-6" />
                    </button>
                    <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">CyberFeed</span>
                </div>
                <div className="hidden md:flex items-center space-x-4">
                    <a href="#" className="text-gray-300 hover:text-white transition-colors">Home</a>
                    <a href="#" className="text-gray-300 hover:text-white transition-colors">About</a>
                    <a href="#" className="text-gray-300 hover:text-white transition-colors">Docs</a>
                    <a href="#" className="text-gray-300 hover:text-white transition-colors">Community</a>
                </div>
                <div className="flex items-center">
                     {user ? (
                         <img src={user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`} alt="User Profile" className="w-8 h-8 rounded-full"/>
                     ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-700 animate-pulse"></div>
                     )}
                     <button className="ml-4 px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors">Logout</button>
                </div>
            </div>
        </div>
    </nav>
);

const Footer = () => (
    <footer className="bg-gray-900/50 border-t border-gray-800/50 mt-12">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center text-gray-400">
            <p>&copy; 2025 CyberFeed. All rights reserved.</p>
        </div>
    </footer>
);

const PostCard = ({ post }) => {
    const renderContent = () => {
        switch (post.type) {
            case 'Photo':
                return (
                    <>
                        <p className="text-gray-300 mb-4 whitespace-pre-wrap">{post.content.text}</p>
                        <div className="relative h-64 overflow-hidden rounded-lg">
                            <img src={post.content.url} alt="Post content" className="w-full h-full object-cover"/>
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
                        <p className="text-xl italic text-white">"{post.content.quote}"</p>
                        <cite className="block text-right mt-2 text-gray-400">- {post.content.source}</cite>
                    </blockquote>
                );
            case 'Link':
                return (
                     <a href={post.content.url} target="_blank" rel="noopener noreferrer" className="block p-4 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg">
                        <p className="text-gray-400 mb-2">Link</p>
                        <p className="text-purple-400 font-bold truncate">{post.content.url}</p>
                        {post.content.text && <p className="text-gray-300 mt-2 whitespace-pre-wrap">{post.content.text}</p>}
                    </a>
                );
            default: // Text post
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
            className="group relative bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden hover:border-purple-500/50 transition-all duration-500 p-6"
        >
            <div className="flex items-center mb-4">
                <img src={post.author.photoURL} alt={post.author.displayName} className="w-10 h-10 rounded-full border-2 border-purple-500/30"/>
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
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="flex items-center space-x-2 text-gray-400 hover:text-red-400 transition-colors"><Heart className="w-5 h-5" /><span className="text-sm">{post.likes}</span></motion.button>
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="flex items-center space-x-2 text-gray-400 hover:text-blue-400 transition-colors"><MessageCircle className="w-5 h-5" /><span className="text-sm">{post.comments}</span></motion.button>
                </div>
                <div className="flex items-center space-x-2">
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="text-gray-400 hover:text-green-400 transition-colors"><Share2 className="w-5 h-5" /></motion.button>
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="text-gray-400 hover:text-yellow-400 transition-colors"><Bookmark className="w-5 h-5" /></motion.button>
                </div>
            </div>
        </motion.div>
    );
};

const CreatePostModal = ({ isOpen, onClose, user, onPostCreated }) => {
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
            // 1. Upload media if it exists
            if (file) {
                const storagePath = `artifacts/${appId}/public/posts/${user.uid}/${Date.now()}_${file.name}`;
                const storageRef = ref(storage, storagePath);
                const uploadTask = uploadBytesResumable(storageRef, file);

                mediaUrl = await new Promise((resolve, reject) => {
                    uploadTask.on('state_changed', 
                      (snapshot) => {}, // progress
                      (error) => reject(error),
                      () => getDownloadURL(uploadTask.snapshot.ref).then(resolve)
                    );
                });
            }

            // 2. Construct content object based on post type
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

            // 3. Add document to Firestore
            const firestorePath = `artifacts/${appId}/public/data/posts`;
            await addDoc(collection(db, firestorePath), {
                author: {
                    uid: user.uid,
                    displayName: user.displayName || 'CyberUser',
                    photoURL: user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`
                },
                type: postType,
                content: finalContent,
                tags: content.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
                likes: 0,
                comments: 0,
                timestamp: serverTimestamp()
            });

            // 4. Success: Reset and close
            onPostCreated(); // Callback to switch page to feed
            handleClose();

        } catch (error) {
            console.error("Error creating post:", error);
            setIsUploading(false); // Re-enable button on error
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
                                    {postType === 'Photo' && <img src={filePreview} alt="Preview" className="max-h-full rounded-md object-contain" />}
                                    {postType === 'Video' && <video src={filePreview} className="max-h-full rounded-md" controls />}
                                    {postType === 'Audio' && <audio src={filePreview} controls />}
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

const MobileSidebar = ({ isOpen, onClose, onPostClick, activePage, setActivePage }) => {
    const navItems = [
        { name: 'Feed', icon: Home, action: () => setActivePage('Feed') },
        { name: 'Post', icon: PlusSquare, action: onPostClick },
        { name: 'Profile', icon: User, action: () => setActivePage('Profile') },
        { name: 'Settings', icon: Settings, action: () => setActivePage('Settings') },
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

const LeftSidebar = ({ onPostClick, activePage, setActivePage }) => {
    const navItems = [
        { name: 'Feed', icon: Home, action: () => setActivePage('Feed') },
        { name: 'Post', icon: PlusSquare, action: onPostClick },
        { name: 'Profile', icon: User, action: () => setActivePage('Profile') },
        { name: 'Settings', icon: Settings, action: () => setActivePage('Settings') },
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

const HomePage = () => {
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [activePage, setActivePage] = useState('Feed');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);

    useEffect(() => {
        // Auth listener
        const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
            } else {
                 try {
                     if (typeof __initial_auth_token !== 'undefined') {
                        await signInWithCustomToken(auth, __initial_auth_token);
                     } else {
                        await signInAnonymously(auth);
                     }
                } catch (error) {
                    console.error("Sign-in failed:", error);
                }
            }
        });

        // Firestore listener
        const firestorePath = `artifacts/${appId}/public/data/posts`;
        const q = query(collection(db, firestorePath), orderBy("timestamp", "desc"));
        const unsubscribeFirestore = onSnapshot(q, (snapshot) => {
            const postsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPosts(postsData);
            setIsLoading(false);
        }, error => {
            console.error("Error fetching posts: ", error);
            setIsLoading(false);
        });

        return () => {
            unsubscribeAuth();
            unsubscribeFirestore();
        };
    }, []);

    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans">
            <div className="fixed inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-pink-900/10 to-blue-900/10" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.15),rgba(255,255,255,0))]" />
            </div>
            <div className="relative z-10">
                <CreatePostModal 
                    isOpen={isPostModalOpen} 
                    onClose={() => setIsPostModalOpen(false)} 
                    user={user}
                    onPostCreated={() => setActivePage('Feed')}
                />
                <MobileSidebar 
                    isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} activePage={activePage} setActivePage={setActivePage}
                    onPostClick={() => { setIsSidebarOpen(false); setIsPostModalOpen(true); }}
                />
                <Navbar onMenuClick={() => setIsSidebarOpen(true)} user={user} />

                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col lg:flex-row gap-8">
                        <LeftSidebar activePage={activePage} setActivePage={setActivePage} onPostClick={() => setIsPostModalOpen(true)} />
                        <div className="flex-1 min-w-0">
                            <motion.section className="mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                                <h1 className="text-3xl sm:text-4xl font-bold mb-2">{activePage}</h1>
                                <p className="text-gray-400 text-lg">{activePage === 'Feed' ? "What's happening in your network today?" : `Manage your ${activePage.toLowerCase()}.`}</p>
                            </motion.section>
                            <div className="space-y-6">
                                <AnimatePresence>
                                    {isLoading ? ( <p>Loading feed...</p> ) : (
                                        posts.map((post) => ( <PostCard key={post.id} post={post} /> ))
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        </div>
    );
};

export default HomePage;
