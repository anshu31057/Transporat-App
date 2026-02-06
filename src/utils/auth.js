import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';

export const getUserRole = async (uid) => {
  if (!uid) {
    return null;
  }

  const userDoc = await getDoc(doc(db, 'users', uid));

  if (!userDoc.exists()) {
    return null;
  }

  const { role } = userDoc.data() || {};

  if (role !== 'admin' && role !== 'owner') {
    return null;
  }

  return role;
};
