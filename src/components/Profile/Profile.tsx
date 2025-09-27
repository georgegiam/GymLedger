import { useEffect, useState } from "react";
import { auth, db } from "../../firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
import styles from "../css/dashboard.module.css";

interface UserProfile {
  fullName?: string;
  email: string;
  uid: string;
  currentWeight?: number;
}

function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!auth.currentUser) return;

      const { uid, email } = auth.currentUser;

      // Fetch user details from Firestore
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);

      let fullName = "";
      if (docSnap.exists()) {
        fullName = docSnap.data().fullName || "";
      }

      // Fetch latest weight from progress subcollection
      const progressRef = collection(db, "users", uid, "progress");
      const q = query(progressRef, orderBy("date", "desc"), limit(1));
      const progressSnap = await getDocs(q);

      let currentWeight: number | undefined;
      if (!progressSnap.empty) {
        const latest = progressSnap.docs[0].data();
        currentWeight = latest.weight;
      }

      setProfile({ uid, email: email || "", fullName, currentWeight });
      setLoading(false);
    };

    fetchProfile();
  }, []);

  if (loading) return <p>Loading profile...</p>;
  if (!profile) return <p>No profile data found.</p>;

  return (
    <div className={`${styles.dashboard} container w-50`}>
      <div className="container text-center mt-5">
        <img
          src="https://cdn-icons-png.flaticon.com/512/6016/6016314.png"
          alt="Dumbbell Icon"
          width="80"
          height="80"
          style={{
            backgroundColor: "#e6e8e6ff",
            borderRadius: "50%",
            padding: "10px",
            objectFit: "contain",
          }}
        />

        <h3 className="mt-4">{profile.fullName || "Not set"}</h3>
        <p>{profile.email}</p>
        {profile.currentWeight !== undefined && (
          <p>Current Weight: {profile.currentWeight} kg</p>
        )}
      </div>
    </div>
  );
}

export default Profile;
