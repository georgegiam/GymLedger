import { useState, useEffect } from "react";
import { auth, db } from "../../firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import styles from "../css/dashboard.module.css";

interface ProgressEntry {
  id: string;
  date: string;
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
    const q = query(progressRef, orderBy("date", "asc")); // asc for chart
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
        weekday: "short",
        day: "numeric",
        month: "short",
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

      <div className="input-group mb-3">
        <input
          type="number"
          className="form-control"
          placeholder="Current Weight (kg)"
          value={weight}
          onChange={(e) => setWeight(Number(e.target.value))}
        />
        <button
          className="btn btn-primary"
          type="button"
          onClick={handleAddProgress}
        >
          Add Progress
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {entries.length > 0 && (
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={entries}
              margin={{ top: 20, right: 0, left: -30, bottom: 20 }} // remove left/right margin
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={["auto", "auto"]} />
              <Tooltip />
              <Line type="monotone" dataKey="weight" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <h5 className="mt-4">Progress History</h5>
      <ul className="list-group">
        {[...entries].reverse().map((entry) => (
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
