import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { achievementApi, type Achievement, type AchievementStats } from "../api/achievementApi";
import PRCelebrationModal from "../components/PRCelebrationModal";
import { Trophy } from "lucide-react";
import "../components/PRCelebrationModal.css";

interface AchievementContextType {
  achievements: Achievement[];
  stats: AchievementStats | null;
  loading: boolean;
  celebratePR: (newAchievements: Achievement[]) => void;
  showPRToast: (title: string, message: string) => void;
  refreshAchievements: () => Promise<void>;
  markAllViewed: () => Promise<void>;
}

const AchievementContext = createContext<AchievementContextType | undefined>(undefined);

export const AchievementProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<AchievementStats | null>(null);
  const [loading, setLoading] = useState(false);

  // Modal celebration state
  const [modalAchievements, setModalAchievements] = useState<Achievement[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Live mini toast state
  const [toastData, setToastData] = useState<{ title: string; message: string } | null>(null);

  const refreshAchievements = useCallback(async () => {
    try {
      setLoading(true);
      const [list, statData] = await Promise.all([
        achievementApi.getAchievements().catch(() => []),
        achievementApi.getAchievementStats().catch(() => null),
      ]);
      setAchievements(list);
      setStats(statData);
    } catch (err) {
      console.error("Failed to load achievements:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Only fetch if authenticated (token present in localStorage)
    const token = localStorage.getItem("token");
    if (token) {
      refreshAchievements();
    }
  }, [refreshAchievements]);

  const celebratePR = useCallback((newAchievements: Achievement[]) => {
    if (!newAchievements || newAchievements.length === 0) return;
    setModalAchievements(newAchievements);
    setIsModalOpen(true);
    refreshAchievements();
  }, [refreshAchievements]);

  const showPRToast = useCallback((title: string, message: string) => {
    setToastData({ title, message });
    setTimeout(() => {
      setToastData(null);
    }, 4500);
  }, []);

  const markAllViewed = useCallback(async () => {
    try {
      await achievementApi.markViewed("all");
      await refreshAchievements();
    } catch (err) {
      console.error("Failed to mark achievements viewed:", err);
    }
  }, [refreshAchievements]);

  return (
    <AchievementContext.Provider
      value={{
        achievements,
        stats,
        loading,
        celebratePR,
        showPRToast,
        refreshAchievements,
        markAllViewed,
      }}
    >
      {children}

      {/* Global PR Celebration Modal */}
      <PRCelebrationModal
        isOpen={isModalOpen}
        achievements={modalAchievements}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Real-time Mini PR Toast Notification */}
      {toastData && (
        <div className="pr-live-toast" role="alert">
          <div className="pr-live-icon">
            <Trophy size={20} />
          </div>
          <div className="pr-live-info">
            <span className="pr-live-title">{toastData.title}</span>
            <span className="pr-live-text">{toastData.message}</span>
          </div>
        </div>
      )}
    </AchievementContext.Provider>
  );
};

export const useAchievements = () => {
  const context = useContext(AchievementContext);
  if (!context) {
    throw new Error("useAchievements must be used within an AchievementProvider");
  }
  return context;
};
