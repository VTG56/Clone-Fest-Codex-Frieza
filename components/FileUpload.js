// components/FileUpload.js
import React from "react";

export default function FileUpload({ onFilesSelected }) {
  return (
    <input
      type="file"
      multiple
      accept="image/*,video/*,.gif"
      onChange={(e) => onFilesSelected(e.target.files)}
      className="mt-2 p-2 border border-gray-600 rounded-lg bg-gray-700 text-white"
    />
  );
}
