import React, { useEffect, useState } from "react";
import { Trophy, Sparkles, X, ChevronRight, ChevronLeft, ArrowRight, Zap } from "lucide-react";
import type { Achievement } from "../api/achievementApi";
import "./PRCelebrationModal.css";

interface PRCelebrationModalProps {
  achievements: Achievement[];
  isOpen: boolean;
  onClose: () => void;
  onViewDetails?: (achievement: Achievement) => void;
}

// Synthesize pleasant celebratory chime using Web Audio API
const playCelebrationChime = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.1);

      gain.gain.setValueAtTime(0.001, ctx.currentTime + index * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + index * 0.1 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + index * 0.1 + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + index * 0.1);
      osc.stop(ctx.currentTime + index * 0.1 + 0.45);
    });
  } catch {
    // Audio context may be restricted by autoplay policy; silent fallback is intentional
  }
};

export default function PRCelebrationModal({
  achievements,
  isOpen,
  onClose,
  onViewDetails,
}: PRCelebrationModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (isOpen && achievements.length > 0) {
      setCurrentIndex(0);
      playCelebrationChime();
    }
  }, [isOpen, achievements]);

  if (!isOpen || !achievements || achievements.length === 0) return null;

  const current = achievements[currentIndex] || achievements[0];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % achievements.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + achievements.length) % achievements.length);
  };

  const is1RM = current.type === "PR_1RM" || current.metric === "oneRepMax";
  const unit = "kg";

  // Pre-generate confetti elements
  const confettiColors = ["#ffd700", "#b6f23a", "#ff4757", "#00d2d3", "#ff9f43", "#54a0ff", "#ffffff"];

  return (
    <div className="pr-modal-backdrop" onClick={onClose}>
      <div className="pr-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Confetti system */}
        <div className="pr-confetti-container" aria-hidden="true">
          {Array.from({ length: 32 }).map((_, i) => (
            <span
              key={i}
              className="pr-confetti-piece"
              style={
                {
                  left: `${(i * 3.1) % 100}%`,
                  backgroundColor: confettiColors[i % confettiColors.length],
                  animationDelay: `${(i * 0.11) % 2.5}s`,
                  animationDuration: `${2.2 + ((i * 0.17) % 1.5)}s`,
                  "--drift": `${((i % 7) - 3) * 35}px`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>

        {/* Close Button */}
        <button className="pr-close-btn" onClick={onClose} aria-label="Close celebration">
          <X size={18} />
        </button>

        {/* Trophy with glowing aura */}
        <div className="pr-trophy-wrapper">
          <div className="pr-trophy-glow" />
          <div className="pr-trophy-icon">
            <Trophy size={42} strokeWidth={2.2} />
          </div>
        </div>

        {/* Header Titles */}
        <div className="pr-tagline">
          <Sparkles size={16} /> Personal Record Broken <Sparkles size={16} />
        </div>
        <h2 className="pr-title">INCREDIBLE WORK!</h2>
        <p className="pr-subtitle">
          You pushed past your limits and set a brand new personal best.
        </p>

        {/* Multiple PR indicator dots if more than 1 */}
        {achievements.length > 1 && (
          <div className="pr-pagination-bar">
            {achievements.map((_, idx) => (
              <span
                key={idx}
                className={`pr-page-pill ${idx === currentIndex ? "active" : ""}`}
                onClick={() => setCurrentIndex(idx)}
              />
            ))}
          </div>
        )}

        {/* PR Main Card */}
        <div className="pr-item-card">
          <div className="pr-item-top">
            <h3 className="pr-item-exname">{current.exerciseName}</h3>
            <span className={`pr-item-badge ${!is1RM ? "weight" : ""}`}>
              {is1RM ? "1 Rep Max PR" : "Heaviest Lift PR"}
            </span>
          </div>

          {/* Comparison Delta Grid */}
          <div className="pr-delta-grid">
            <div className="pr-delta-col prev">
              <span className="pr-delta-label">Previous Best</span>
              <span className="pr-delta-val">
                {current.previousValue > 0 ? `${current.previousValue} ${unit}` : "First Log"}
              </span>
            </div>

            <div className="pr-delta-arrow">
              <ArrowRight size={20} />
            </div>

            <div className="pr-delta-col new">
              <span className="pr-delta-label">New Record</span>
              <span className="pr-delta-val">
                {current.value} {unit}
              </span>
            </div>
          </div>

          {/* Improvement highlight tag */}
          {current.improvement > 0 && (
            <div style={{ textAlign: "center", marginBottom: "14px" }}>
              <span className="pr-gain-tag">
                <Zap size={13} fill="currentColor" />
                +{current.improvement} {unit} Increase!
              </span>
            </div>
          )}

          {/* Set details breakdown */}
          <div className="pr-set-details">
            <span>Set Performed:</span>
            <span className="pr-set-lift">
              {current.weight} {unit} × {current.reps} {current.reps === 1 ? "rep" : "reps"}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pr-actions-row">
          {achievements.length > 1 && (
            <button className="pr-btn-secondary" onClick={handlePrev} title="Previous PR">
              <ChevronLeft size={18} />
            </button>
          )}

          <button className="pr-btn-primary" onClick={onClose}>
            Keep Crushing It!
          </button>

          {achievements.length > 1 && (
            <button className="pr-btn-secondary" onClick={handleNext} title="Next PR">
              <ChevronRight size={18} />
            </button>
          )}

          {onViewDetails && (
            <button
              className="pr-btn-secondary"
              onClick={() => {
                onClose();
                onViewDetails(current);
              }}
            >
              View History
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
