import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth, db } from "../../firebase";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
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
  date: string; // <-- now a formatted string
  exercises: Exercise[];
  notes?: string;
}

function Dashboard() {
  const [fullName, setFullName] = useState<string>("");
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (!auth.currentUser) {
        navigate("/login");
        return;
      }

      // Fetch user full name
      const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
      if (userDoc.exists()) {
        setFullName(userDoc.data().fullName);
      } else {
        setFullName("Unknown User");
      }

      // Fetch 3 latest workouts
      const workoutsRef = collection(
        db,
        "users",
        auth.currentUser.uid,
        "workouts"
      );
      const q = query(workoutsRef, orderBy("date", "desc"), limit(3));
      const snapshot = await getDocs(q);

      const fetched: Workout[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        date: doc.data().date, // already a formatted string
        exercises: doc.data().exercises,
        notes: doc.data().notes || "",
      }));

      setWorkouts(fetched);
    };

    fetchData();
  }, [navigate]);

  return (
    <div className={`${styles.dashboard} container w-50 mb-5`}>
      <div className="d-flex mb-3">
        <div className="me-auto">
          <h4>{fullName}</h4>
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

      <div className="row row-cols-1 row-cols-md-3 g-4">
        {workouts.length === 0 && <p>No workouts logged yet.</p>}

        {workouts.map((workout) => (
          <div key={workout.id} className="col">
            <div className="card h-100">
              <div className="card-header">{workout.date}</div>
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
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
