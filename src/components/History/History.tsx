import { useEffect, useState } from "react";
import { auth, db } from "../../firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
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
  date: Date;
  exercises: Exercise[];
}

function History() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

      const fetched: Workout[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        date: doc.data().date.toDate(), // Firestore timestamp → JS Date
        exercises: doc.data().exercises,
      }));

      setWorkouts(fetched);
      setLoading(false);
    };

    fetchWorkouts();
  }, []);

  if (loading) return <p>Loading workouts...</p>;
  if (workouts.length === 0) return <p>No workouts logged yet.</p>;

  return (
    <div className={`${styles.dashboard} container w-75 mb-5`}>
      <h4>Workout History</h4>
      {workouts.map((workout) => (
        <div key={workout.id} className="card mb-3">
          <div className="card-header">{workout.date.toLocaleDateString()}</div>
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
          </div>
        </div>
      ))}
    </div>
  );
}

export default History;
