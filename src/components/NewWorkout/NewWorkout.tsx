import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import styles from "../css/dashboard.module.css";

interface Set {
  reps: number;
  weight: number;
}

interface Exercise {
  name: string;
  sets: Set[];
}

function AddWorkout() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleAddExercise = () => {
    setExercises([...exercises, { name: "", sets: [] }]);
  };

  const handleRemoveExercise = (index: number) => {
    const newExercises = exercises.filter((_, i) => i !== index);
    setExercises(newExercises);
  };

  const handleExerciseNameChange = (index: number, name: string) => {
    const newExercises = [...exercises];
    newExercises[index].name = name;
    setExercises(newExercises);
  };

  const handleAddSet = (exerciseIndex: number) => {
    const newExercises = [...exercises];
    newExercises[exerciseIndex].sets.push({ reps: 0, weight: 0 });
    setExercises(newExercises);
  };

  const handleRemoveSet = (exerciseIndex: number, setIndex: number) => {
    const newExercises = [...exercises];
    newExercises[exerciseIndex].sets = newExercises[exerciseIndex].sets.filter(
      (_, i) => i !== setIndex
    );
    setExercises(newExercises);
  };

  const handleSetChange = (
    exerciseIndex: number,
    setIndex: number,
    field: "reps" | "weight",
    value: number
  ) => {
    const newExercises = [...exercises];
    newExercises[exerciseIndex].sets[setIndex][field] = value;
    setExercises(newExercises);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!auth.currentUser) {
      setError("You must be logged in");
      return;
    }

    if (exercises.length === 0) {
      setError("Please add at least one exercise");
      return;
    }

    // Validate that each exercise has at least one set and each set has reps and weight > 0
    for (const exercise of exercises) {
      if (exercise.sets.length === 0) {
        setError(
          `Exercise "${exercise.name || "Unnamed"}" must have at least one set`
        );
        return;
      }
      for (const set of exercise.sets) {
        if (set.reps <= 0 || set.weight <= 0) {
          setError(`All sets must have reps > 0 and weight > 0`);
          return;
        }
      }
    }

    try {
      const workoutRef = collection(
        db,
        "users",
        auth.currentUser.uid,
        "workouts"
      );
      await addDoc(workoutRef, {
        date: Timestamp.fromDate(new Date()),
        exercises,
      });

      setExercises([]);
      navigate("/dashboardBase/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to add workout");
    }
  };

  return (
    <div className={`${styles.dashboard} container w-50 mb-5`}>
      <h4>Add New Workout</h4>
      <form onSubmit={handleSubmit}>
        {exercises.map((exercise, exerciseIndex) => (
          <div
            key={exerciseIndex}
            className="mb-3 border p-2 position-relative"
          >
            <button
              type="button"
              className="btn btn-sm btn-danger position-absolute top-0 end-0 m-2"
              onClick={() => handleRemoveExercise(exerciseIndex)}
            >
              Remove Exercise
            </button>

            <label className="form-label">Exercise Name</label>
            <input
              type="text"
              placeholder="Exercise name"
              className="form-control mb-2"
              value={exercise.name}
              onChange={(e) =>
                handleExerciseNameChange(exerciseIndex, e.target.value)
              }
              required
            />

            {exercise.sets.map((set, setIndex) => (
              <div key={setIndex} className="d-flex mb-2 gap-2 align-items-end">
                <div className="flex-fill">
                  <label className="form-label">Reps</label>
                  <input
                    type="number"
                    placeholder="Reps"
                    className="form-control"
                    value={set.reps}
                    onChange={(e) =>
                      handleSetChange(
                        exerciseIndex,
                        setIndex,
                        "reps",
                        Number(e.target.value)
                      )
                    }
                    required
                  />
                </div>

                <div className="flex-fill">
                  <label className="form-label">Weight (kg)</label>
                  <input
                    type="number"
                    placeholder="Weight"
                    className="form-control"
                    value={set.weight}
                    onChange={(e) =>
                      handleSetChange(
                        exerciseIndex,
                        setIndex,
                        "weight",
                        Number(e.target.value)
                      )
                    }
                    required
                  />
                </div>

                <button
                  type="button"
                  className="btn btn-sm btn-danger"
                  onClick={() => handleRemoveSet(exerciseIndex, setIndex)}
                >
                  Remove Set
                </button>
              </div>
            ))}

            <button
              type="button"
              className="btn btn-sm btn-secondary mb-2"
              onClick={() => handleAddSet(exerciseIndex)}
            >
              Add Set
            </button>
          </div>
        ))}

        <button
          type="button"
          className="btn btn-sm btn-primary mb-3"
          onClick={handleAddExercise}
        >
          Add Exercise
        </button>

        {error && <div className="alert alert-danger">{error}</div>}

        <button type="submit" className="btn btn-success w-100">
          Save Workout
        </button>
      </form>
    </div>
  );
}

export default AddWorkout;
