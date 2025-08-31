// components/feathers/Comments.js
import React, { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from "firebase/firestore";

export default function Comments({ postId }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    if (!postId) return;
    const q = query(collection(db, "posts", postId, "comments"), orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, (snap) => setComments(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    return () => unsub();
  }, [postId]);

  const handleAdd = async () => {
    if (!text.trim()) return;
    await addDoc(collection(db, "posts", postId, "comments"), {
      text: text.trim(),
      createdAt: serverTimestamp(),
    });
    setText("");
  };

  return (
    <div className="mt-3">
      <div className="space-y-2 max-h-40 overflow-auto mb-2">
        {comments.map(c => (
          <div key={c.id} className="text-sm bg-gray-800 p-2 rounded-md text-gray-200">
            {c.text}
          </div>
        ))}
        {comments.length === 0 && <div className="text-sm text-gray-400">No comments yet</div>}
      </div>

      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 p-2 rounded-md bg-gray-800 border border-gray-700 text-white"
        />
        <button onClick={handleAdd} className="px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-md">
          Send
        </button>
      </div>
    </div>
  );
}
