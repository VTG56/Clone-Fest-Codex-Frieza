// components/feathers/PostList.js
import React, { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  deleteDoc,
  getDocs,
  collection as col,
} from "firebase/firestore";
import TextCard from "./TextCard";
import PostForm from "./PostForm";
import { motion } from "framer-motion";
import { Plus, Trash2, Edit } from "lucide-react";

export default function PostList() {
  const [posts, setPosts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, async (snap) => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      // optionally attach comments count (one way: read subcollection sizes)
      const withCounts = await Promise.all(docs.map(async (p) => {
        try {
          const commentsSnap = await getDocs(col(db, "posts", p.id, "comments"));
          return { ...p, _commentsCount: commentsSnap.size };
        } catch { return { ...p, _commentsCount: 0 }; }
      }));
      setPosts(withCounts);
    });
    return () => unsub();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this post?")) return;
    await deleteDoc(doc(db, "posts", id));
  };

  const startEdit = (post) => {
    setEditing(post);
    setShowForm(true);
  };

  const onSaved = () => {
    setEditing(null);
    setShowForm(false);
  };

  return (
    <div className="relative p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map(p => (
          <div key={p.id} className="aspect-square">
            <div className="relative h-full">
              {/* overlay small buttons */}
              <div className="absolute top-2 right-2 flex gap-2 z-10">
                <button onClick={() => startEdit(p)} className="px-3 py-1 rounded-full bg-gradient-to-r from-blue-400 to-pink-400 text-white text-sm flex items-center gap-1">
                  <Edit className="w-4 h-4" /> Edit
                </button>
                <button onClick={() => handleDelete(p.id)} className="px-3 py-1 rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm flex items-center gap-1">
                  <Trash2 className="w-4 h-4" /> Del
                </button>
              </div>

              <TextCard post={p} />
            </div>
          </div>
        ))}
      </div>

      {/* floating + button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        onClick={() => { setShowForm(true); setEditing(null); }}
        className="fixed bottom-8 right-8 w-20 h-20 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 text-white text-4xl shadow-2xl flex items-center justify-center"
      >
        <Plus />
      </motion.button>

      {showForm && (
        <PostForm
          editing={editing}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSaved={onSaved}
        />
      )}
    </div>
  );
}
