import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  query, 
  where 
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const firestore = getFirestore(app);

export async function findUserByEmail(email) {
  const usersRef = collection(firestore, 'users');
  const q = query(usersRef, where('email', '==', email));
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    // If they look for 'admin' and it does not exist, let's auto-seed it!
    if (email === 'admin') {
      const defaultAdmin = {
        id: 'admin-user-id',
        name: 'Admin',
        email: 'admin',
        passwordHash: '$2b$10$syq2ix9HvQKTlTI2sL4dauIE4a14RG5bHItA6dUXZsWRCalMtrtrG',
        isAdmin: true
      };
      await setDoc(doc(firestore, 'users', defaultAdmin.id), defaultAdmin);
      return defaultAdmin;
    }
    return null;
  }
  
  const docSnap = querySnapshot.docs[0];
  return { id: docSnap.id, ...docSnap.data() };
}

export async function findUserById(id) {
  const userDoc = doc(firestore, 'users', id);
  const docSnap = await getDoc(userDoc);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
}

export async function createUser(user) {
  const usersRef = collection(firestore, 'users');
  const querySnapshot = await getDocs(usersRef);
  
  // First user is automatically admin (excluding our pre-seeded admin-user-id if present)
  const nonAdminUsers = querySnapshot.docs.filter(docSnap => docSnap.id !== 'admin-user-id');
  if (nonAdminUsers.length === 0) {
    user.isAdmin = true;
  } else {
    user.isAdmin = false;
  }
  
  const userId = user.id || doc(usersRef).id;
  user.id = userId;
  
  await setDoc(doc(firestore, 'users', userId), user);
  return user;
}

export async function getUsers() {
  const usersRef = collection(firestore, 'users');
  const querySnapshot = await getDocs(usersRef);
  const users = [];
  querySnapshot.forEach(docSnap => {
    users.push({ id: docSnap.id, ...docSnap.data() });
  });
  return users;
}

export async function deleteUser(id) {
  // Delete user document
  await deleteDoc(doc(firestore, 'users', id));
  
  // Query and delete all posts by this user
  const postsRef = collection(firestore, 'posts');
  const q = query(postsRef, where('authorId', '==', id));
  const querySnapshot = await getDocs(q);
  
  const deletePromises = [];
  querySnapshot.forEach(docSnap => {
    deletePromises.push(deleteDoc(doc(firestore, 'posts', docSnap.id)));
  });
  await Promise.all(deletePromises);
}

export async function getPosts() {
  const postsRef = collection(firestore, 'posts');
  const querySnapshot = await getDocs(postsRef);
  const posts = [];
  querySnapshot.forEach(docSnap => {
    posts.push({ id: docSnap.id, ...docSnap.data() });
  });
  // Sort by newest first
  return posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function getPostById(id) {
  const postDoc = doc(firestore, 'posts', id);
  const docSnap = await getDoc(postDoc);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
}

export async function createPost(post) {
  const postsRef = collection(firestore, 'posts');
  const postId = post.id || doc(postsRef).id;
  post.id = postId;
  await setDoc(doc(firestore, 'posts', postId), post);
  return post;
}

export async function deletePost(id) {
  await deleteDoc(doc(firestore, 'posts', id));
}
