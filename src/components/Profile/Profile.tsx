import { useEffect, useState } from "react";
import { auth, db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
import styles from "../css/dashboard.module.css";

interface UserProfile {
  fullName?: string;
  email: string;
  uid: string;
}

function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!auth.currentUser) return;

      const { uid, email } = auth.currentUser;

      // Try fetching extra details from Firestore
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setProfile({
          uid,
          email: email || "",
          fullName: docSnap.data().fullName || "",
        });
      } else {
        setProfile({ uid, email: email || "" });
      }

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
            backgroundColor: "gray",
            borderRadius: "50%",
            padding: "8px",
            objectFit: "contain",
          }}
        />

        <h3 className="mt-4">{profile.fullName || "Not set"}</h3>
        <p>{profile.email}</p>
      </div>
    </div>
  );
}

export default Profile;
