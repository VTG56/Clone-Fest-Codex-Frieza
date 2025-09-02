// lib/firestorePaths.js

/**
 * This is the root path for all data related to a specific app instance.
 * It ensures that data from different deployments doesn't clash.
 * @param {string} appId - The unique identifier for the application instance.
 */
const appDataRoot = (appId) => `artifacts/${appId}/public/data`;
const appStorageRoot = (appId) => `artifacts/${appId}/public/posts`;


// --- Firestore Path Functions ---

/**
 * Returns the path for the main 'posts' collection.
 * @param {string} appId
 * @returns {string} - e.g., 'artifacts/app-id/public/data/posts'
 */
export const postsPath = (appId) => `${appDataRoot(appId)}/posts`;

/**
 * Returns the path for a specific post document.
 * @param {string} appId
 * @param {string} postId
 * @returns {string} - e.g., 'artifacts/app-id/public/data/posts/postId123'
 */
export const postPath = (appId, postId) => `${postsPath(appId)}/${postId}`;

/**
 * Returns the path for the 'comments' sub-collection of a specific post.
 * @param {string} appId
 * @param {string} postId
 * @returns {string} - e.g., 'artifacts/app-id/public/data/posts/postId123/comments'
 */
export const postCommentsPath = (appId, postId) => `${postPath(appId, postId)}/comments`;


// --- Storage Path Functions ---

/**
 * Returns the path for storing a post's media file in Firebase Storage.
 * @param {string} appId
 * @param {string} userId
 * @param {string} fileName
 * @returns {string} - e.g., 'artifacts/app-id/public/posts/userId123/timestamp_filename.jpg'
 */
export const postMediaPath = (appId, userId, fileName) => `${appStorageRoot(appId)}/${userId}/${Date.now()}_${fileName}`;