import { useState, useEffect } from "react";
import { auth, db } from "../../firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
import styles from "../css/dashboard.module.css";

interface ProgressEntry {
  id: string;
  date: string; // formatted date
  weight: number;
}

function Progress() {
  const [weight, setWeight] = useState<number | "">("");
  const [entries, setEntries] = useState<ProgressEntry[]>([]);
  const [error, setError] = useState("");

  const fetchProgress = async () => {
    if (!auth.currentUser) return;
    const progressRef = collection(
      db,
      "users",
      auth.currentUser.uid,
      "progress"
    );
    const q = query(progressRef, orderBy("date", "desc"));
    const snapshot = await getDocs(q);

    const fetched: ProgressEntry[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      date: doc.data().date,
      weight: doc.data().weight,
    }));

    setEntries(fetched);
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  const handleAddProgress = async () => {
    if (!auth.currentUser) {
      setError("You must be logged in");
      return;
    }
    if (weight === "" || weight <= 0) {
      setError("Enter a valid weight");
      return;
    }

    setError("");

    try {
      const progressRef = collection(
        db,
        "users",
        auth.currentUser.uid,
        "progress"
      );
      const formattedDate = new Date().toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      await addDoc(progressRef, {
        date: formattedDate,
        weight,
      });

      setWeight("");
      fetchProgress();
    } catch (err: any) {
      setError(err.message || "Failed to add progress");
    }
  };

  return (
    <div className={`${styles.dashboard} container w-50 mb-5`}>
      <h4>Weight Progress</h4>
      <hr />

      <div className="input-group mb-5">
        <input
          type="text"
          className="form-control"
          placeholder="Current Weight (kg)"
          aria-label="Recipient’s username"
          aria-describedby="button-addon2"
          value={weight}
          onChange={(e) => setWeight(Number(e.target.value))}
        />
        <button
          className="btn btn-primary"
          type="button"
          id="button-addon2"
          onClick={handleAddProgress}
        >
          Add Progress
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <h5>Progress History</h5>
      <ul className="list-group">
        {entries.map((entry) => (
          <li
            key={entry.id}
            className="list-group-item d-flex justify-content-between"
          >
            <span>{entry.date}</span>
            <strong>{entry.weight} kg</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Progress;
