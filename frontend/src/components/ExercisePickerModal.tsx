import { useState, useEffect, useMemo, useRef } from "react";
import { Search, X, Dumbbell } from "lucide-react";
import { useExercises } from "../context/ExerciseContext";

interface ExercisePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectExercise: (exerciseId: string) => void;
}

export default function ExercisePickerModal({
  isOpen,
  onClose,
  onSelectExercise,
}: ExercisePickerModalProps) {
  const { exercises } = useExercises();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMuscle, setSelectedMuscle] = useState("All");
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSearchTerm("");
      setSelectedMuscle("All");
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const muscleGroups = useMemo(() => {
    const groups = new Set<string>();
    exercises.forEach((ex) => {
      if (ex.muscleGroup) groups.add(ex.muscleGroup);
    });
    return ["All", ...Array.from(groups).sort()];
  }, [exercises]);

  const filteredExercises = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();
    return exercises.filter((ex) => {
      const matchesSearch =
        !query ||
        ex.name.toLowerCase().includes(query) ||
        ex.muscleGroup.toLowerCase().includes(query) ||
        ex.equipment.toLowerCase().includes(query);
      const matchesMuscle =
        selectedMuscle === "All" || ex.muscleGroup === selectedMuscle;
      return matchesSearch && matchesMuscle;
    });
  }, [exercises, searchTerm, selectedMuscle]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content picker-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-header-title">
            <Dumbbell size={20} className="modal-icon" />
            <h2>Select Exercise</h2>
          </div>
          <button
            className="btn-icon-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="picker-search-container">
          <div className="picker-search-bar">
            <Search size={18} className="picker-search-icon" />
            <input
              ref={searchInputRef}
              type="text"
              className="picker-search-input"
              placeholder="Search by name, muscle, equipment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                className="picker-clear-search"
                onClick={() => {
                  setSearchTerm("");
                  searchInputRef.current?.focus();
                }}
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="picker-chips">
            {muscleGroups.map((group) => (
              <button
                key={group}
                type="button"
                className={`picker-chip ${selectedMuscle === group ? "active" : ""}`}
                onClick={() => setSelectedMuscle(group)}
              >
                {group}
              </button>
            ))}
          </div>
        </div>

        <div className="picker-results-meta">
          <span>{filteredExercises.length} exercise{filteredExercises.length === 1 ? "" : "s"} found</span>
        </div>

        <div className="picker-list">
          {exercises.length === 0 ? (
            <div className="picker-empty-state">
              <p>Loading exercises...</p>
            </div>
          ) : filteredExercises.length === 0 ? (
            <div className="picker-empty-state">
              <p>No exercises match your search.</p>
              {(searchTerm || selectedMuscle !== "All") && (
                <button
                  type="button"
                  className="btn-secondary-sm"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedMuscle("All");
                  }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            filteredExercises.map((ex) => (
              <button
                key={ex.id}
                type="button"
                className="picker-item"
                onClick={() => {
                  onSelectExercise(ex.id);
                  onClose();
                }}
              >
                <div className="picker-item-info">
                  <div className="picker-item-name">{ex.name}</div>
                  <div className="picker-item-meta">
                    <span className="picker-meta-muscle">{ex.muscleGroup}</span>
                    <span className="picker-meta-dot">•</span>
                    <span className="picker-meta-equip">{ex.equipment}</span>
                  </div>
                </div>
                <span className="picker-item-add">+ Add</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
