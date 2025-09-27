import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebase";
import { collection, addDoc } from "firebase/firestore";
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
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false); // <-- modal state
  const navigate = useNavigate();

  const handleAddExercise = () =>
    setExercises([...exercises, { name: "", sets: [] }]);
  const handleRemoveExercise = (index: number) =>
    setExercises(exercises.filter((_, i) => i !== index));
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

  const validateWorkout = () => {
    if (!auth.currentUser) {
      setError("You must be logged in");
      return false;
    }
    if (exercises.length === 0) {
      setError("Please add at least one exercise");
      return false;
    }
    for (const exercise of exercises) {
      if (exercise.sets.length === 0) {
        setError(
          `Exercise "${exercise.name || "Unnamed"}" must have at least one set`
        );
        return false;
      }
      for (const set of exercise.sets) {
        if (set.reps <= 0 || set.weight <= 0) {
          setError("All sets must have reps > 0 and weight > 0");
          return false;
        }
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    setError("");
    if (!validateWorkout()) return;

    try {
      const workoutRef = collection(
        db,
        "users",
        auth.currentUser!.uid,
        "workouts"
      );
      const formattedDate = new Date().toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      await addDoc(workoutRef, { date: formattedDate, exercises, notes });

      setExercises([]);
      setNotes("");
      setShowConfirm(false);
      navigate("/dashboardBase/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to add workout");
    }
  };

  return (
    <>
      <div className={`${styles.dashboard} container w-50 mb-5`}>
        <div className="d-flex mb-3 mt-4">
          <div className="me-auto align-self-center">
            <h4>New Workout</h4>
          </div>
          <div className="align-self-center">
            <button type="submit" className="btn btn-sm btn-success ">
              <i className="fa-solid fa-check me-1"></i> Complete Workout
            </button>
          </div>
        </div>
        <hr />
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (validateWorkout()) setShowConfirm(true); // show modal
          }}
        >
          {exercises.map((exercise, exerciseIndex) => (
            <div key={exerciseIndex} className="mb-3 shadow-lg p-3">
              <div className="container text-end mb-3 p-0">
                <div>
                  <a
                    className="text-decoration-none text-danger"
                    onClick={() => handleRemoveExercise(exerciseIndex)}
                  >
                    Remove Exercise
                  </a>
                </div>
              </div>

              <input
                type="text"
                placeholder="Exercise name"
                className="form-control mb-3"
                value={exercise.name}
                onChange={(e) =>
                  handleExerciseNameChange(exerciseIndex, e.target.value)
                }
                required
              />
              {exercise.sets.map((set, setIndex) => (
                <div key={setIndex} className="d-flex mb-3">
                  <div className="flex-fill">
                    <input
                      type="number"
                      placeholder="Reps"
                      className="form-control"
                      value={set.reps === 0 ? "" : set.reps}
                      onChange={(e) =>
                        handleSetChange(
                          exerciseIndex,
                          setIndex,
                          "reps",
                          e.target.value === "" ? 0 : Number(e.target.value)
                        )
                      }
                      required
                    />
                  </div>
                  <div className="flex-fill ms-3">
                    <input
                      type="number"
                      placeholder="Weight (kg)"
                      className="form-control"
                      value={set.weight === 0 ? "" : set.weight}
                      onChange={(e) =>
                        handleSetChange(
                          exerciseIndex,
                          setIndex,
                          "weight",
                          e.target.value === "" ? 0 : Number(e.target.value)
                        )
                      }
                      required
                    />
                  </div>
                  <div className="align-self-center ms-3">
                    <a onClick={() => handleRemoveSet(exerciseIndex, setIndex)}>
                      <i className="fa-solid fa-trash"></i>
                    </a>
                  </div>
                </div>
              ))}

              <div className="container text-center mb-3 mt-4">
                <a
                  className="text-decoration-none cursor-pointer"
                  onClick={() => handleAddSet(exerciseIndex)}
                >
                  <i className="fa-solid fa-plus me-2"></i>Add Set
                </a>
              </div>
            </div>
          ))}

          <button
            type="button"
            className="btn btn-primary mb-3 w-100"
            onClick={handleAddExercise}
          >
            <i className="fa-solid fa-plus me-2"></i>Add Exercise
          </button>

          <div className="mb-3 shadow-lg p-3">
            <label className="form-label">Notes</label>
            <textarea
              className="form-control"
              placeholder="Add any notes about your workout..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            ></textarea>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}
        </form>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div
          className="modal d-block"
          tabIndex={-1}
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Workout</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowConfirm(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to complete this workout?</p>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowConfirm(false)}
                >
                  Cancel
                </button>
                <button className="btn btn-success" onClick={handleSubmit}>
                  Yes, Complete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AddWorkout;
