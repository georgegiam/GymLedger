import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { auth, db } from "../../firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  deleteDoc,
} from "firebase/firestore";
import styles from "../css/dashboard.module.css";

interface Set {
  reps: number;
  weight: number;
}

interface Exercise {
  name: string;
  sets: Set[];
}

interface Workout {
  id: string;
  date: string; // <-- formatted string
  exercises: Exercise[];
  notes?: string;
}

function History() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWorkouts = async () => {
    if (!auth.currentUser) return;

    const workoutsRef = collection(
      db,
      "users",
      auth.currentUser.uid,
      "workouts"
    );
    const q = query(workoutsRef, orderBy("date", "desc"));
    const snapshot = await getDocs(q);

    const fetched: Workout[] = snapshot.docs.map((doc) => {
      const timestamp = doc.data().date;
      const dateStr =
        timestamp instanceof Object && "toDate" in timestamp
          ? formatDate(timestamp.toDate())
          : String(timestamp);

      return {
        id: doc.id,
        date: dateStr,
        exercises: doc.data().exercises,
        notes: doc.data().notes || "",
      };
    });

    setWorkouts(fetched);
    setLoading(false);
  };

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const handleDelete = async (workoutId: string) => {
    if (!auth.currentUser) return;
    if (!window.confirm("Are you sure you want to delete this workout?"))
      return;

    try {
      const workoutDoc = doc(
        db,
        "users",
        auth.currentUser.uid,
        "workouts",
        workoutId
      );
      await deleteDoc(workoutDoc);

      setWorkouts((prev) => prev.filter((w) => w.id !== workoutId));
    } catch (err: any) {
      alert(err.message || "Failed to delete workout");
    }
  };

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  };

  if (loading) return <p>Loading workouts...</p>;
  if (workouts.length === 0)
    return (
      <div className={`${styles.dashboard} container w-50 mb-5`}>
        <div className="d-flex mb-3">
          <div className="me-auto">
            <h4>Workout History</h4>
          </div>
          <div className="align-self-center">
            <Link
              to="/dashboardBase/newWorkout"
              className="btn btn-sm btn-primary"
            >
              <i className="fa-solid fa-plus me-2"></i>New workout
            </Link>
          </div>
        </div>
        <hr />
        <p>No workouts logged yet.</p>
      </div>
    );

  return (
    <div className={`${styles.dashboard} container w-50 mb-5`}>
      <div className="d-flex mb-3">
        <div className="me-auto">
          <h4>Workout History</h4>
        </div>
        <div className="align-self-center">
          <Link
            to="/dashboardBase/newWorkout"
            className="btn btn-sm btn-primary"
          >
            <i className="fa-solid fa-plus me-2"></i>New workout
          </Link>
        </div>
      </div>

      <hr />
      <h4>Workout History</h4>
      {workouts.map((workout) => (
        <div key={workout.id} className="card mb-3">
          <div className="card-header d-flex justify-content-between align-items-center">
            <span>{workout.date}</span>
            <button
              className="btn btn-sm btn-danger"
              onClick={() => handleDelete(workout.id)}
            >
              Delete
            </button>
          </div>
          <div className="card-body">
            {workout.exercises.map((exercise, i) => (
              <div key={i} className="mb-2">
                <strong>{exercise.name}</strong>
                <ul className="list-group list-group-flush">
                  {exercise.sets.map((set, j) => (
                    <li key={j} className="list-group-item">
                      Set {j + 1}: {set.reps} reps @ {set.weight} kg
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {workout.notes && (
              <div className="mt-2">
                <strong>Notes:</strong>
                <p>{workout.notes}</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default History;
