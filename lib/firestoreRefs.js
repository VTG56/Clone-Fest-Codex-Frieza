// lib/firestoreRefs.js

import { collection, doc } from 'firebase/firestore';
import { db } from './firebase'; // Your firebase config
import { postCommentsPath, postPath, postsPath } from './firestorePaths';

/**
 * Returns a Firestore collection reference to the posts collection.
 * @param {string} appId
 */
export const postsCollectionRef = (appId) => collection(db, postsPath(appId));

/**
 * Returns a Firestore document reference to a specific post.
 * @param {string} appId
 * @param {string} postId
 */
export const postDocRef = (appId, postId) => doc(db, postPath(appId, postId));

/**
 * Returns a Firestore collection reference to a post's comments sub-collection.
 * @param {string} appId
 * @param {string} postId
 */
export const postCommentsCollectionRef = (appId, postId) => collection(db, postCommentsPath(appId, postId));