// components/feathers/PostForm.js
import React, { useState } from "react";
import { db, storage } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, updateDoc, doc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { motion } from "framer-motion";
import Image from "next/image";
export default function PostForm({ onClose, onSaved, editing }) {
  // editing: { id, title, content, attachments } or null
  const [title, setTitle] = useState(editing?.title || "");
  const [content, setContent] = useState(editing?.content || "");
  const [attachments, setAttachments] = useState(editing?.attachments || []);
  const [filesToUpload, setFilesToUpload] = useState([]);
  const [loading, setLoading] = useState(false);

  const uploadFile = async (file) => {
    const fileRef = ref(storage, `attachments/${Date.now()}-${file.name}`);
    await uploadBytes(fileRef, file);
    return await getDownloadURL(fileRef);
  };

  const handleFilesChange = (e) => {
    const files = Array.from(e.target.files || []);
    setFilesToUpload((prev) => [...prev, ...files]);
  };

  const handleRemoveAttachment = (idx) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Upload new files
    const uploadedUrls = [];
    for (const f of filesToUpload) {
      const url = await uploadFile(f);
      // detect type
      let type = "image";
      if (f.type.startsWith("video")) type = "video";
      else if (f.type.endsWith("gif")) type = "gif";
      uploadedUrls.push({ url, type, name: f.name });
    }

    const combinedAttachments = [...attachments, ...uploadedUrls];

    if (editing && editing.id) {
      const docRef = doc(db, "posts", editing.id);
      await updateDoc(docRef, {
        title,
        content,
        attachments: combinedAttachments,
        updatedAt: serverTimestamp(),
      });
    } else {
      await addDoc(collection(db, "posts"), {
        title,
        content,
        attachments: combinedAttachments,
        likes: 0,
        createdAt: serverTimestamp(),
      });
    }

    setLoading(false);
    onSaved?.();
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
    >
      <motion.form
        initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
        onSubmit={handleSubmit}
        className="bg-gray-900 p-6 rounded-2xl w-full max-w-xl text-white"
      >
        <h3 className="text-2xl font-bold mb-3">{editing ? "Edit Post" : "New Text Post"}</h3>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="w-full p-3 rounded-md bg-gray-800 border border-gray-700 mb-3"
          required
        />

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write content (supports plain text / markdown)"
          rows={5}
          className="w-full p-3 rounded-md bg-gray-800 border border-gray-700 mb-3"
          required
        />

        {/* Existing attachments preview */}
        {attachments.length > 0 && (
          <div className="mb-3 grid grid-cols-3 gap-2">
            {attachments.map((att, i) => (
              <div key={i} className="relative">
                {att.type === "video" ? (
                  <video src={att.url} controls className="w-full h-24 object-cover rounded-md" />
                ) : (
                  <Image src={att.url} alt="" className="w-full h-24 object-cover rounded-md" />
                )}
                <button
                  type="button"
                  onClick={() => handleRemoveAttachment(i)}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Styled file upload label */}
        <label className="inline-block mb-3">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold cursor-pointer">
            Upload attachments
          </span>
          <input
            onChange={handleFilesChange}
            multiple
            accept="image/*,video/*,.gif"
            type="file"
            className="hidden"
          />
        </label>

        {/* show pending uploads */}
        {filesToUpload.length > 0 && (
          <div className="mb-3 text-sm text-gray-300">
            {filesToUpload.map((f, i) => (
              <div key={i} className="flex justify-between items-center">
                <span>{f.name}</span>
                <span className="text-xs text-gray-400">pending</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-3 mt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg py-3 font-semibold"
          >
            {loading ? "Saving..." : (editing ? "Update Post" : "Add Post")}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-700 rounded-lg py-3 px-4"
          >
            Cancel
          </button>
        </div>
      </motion.form>
    </motion.div>
  );
}
