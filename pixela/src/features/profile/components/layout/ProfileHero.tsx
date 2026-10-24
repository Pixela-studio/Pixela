import { UserResponse } from "@/api/auth/types";
import { UserAvatar } from "@/features/profile/components";
import { clsx } from "clsx";

interface ProfileHeroProps {
  user: UserResponse;
}

const STYLES = {
  // Hero Section (Premium Look)
  heroSection: "relative h-[40vh] min-h-[300px] w-full isolate",
  heroBackground: "absolute inset-0 z-0",
  heroGradient:
    "absolute inset-0 bg-gradient-to-t from-pixela-ink via-pixela-ink/60 to-transparent z-10",
  heroContent: "absolute -bottom-16 left-0 w-full z-20",

  // Header User Info (Overlapping Hero)
  userInfoContainer:
    "max-w-7xl mx-auto flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8 pb-4 px-4 md:px-8 w-full",
  avatarWrapper: "relative group",
  avatarRing: "hidden",
  avatarContainer:
    "relative w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-pixela-ink shadow-2xl overflow-hidden bg-pixela-surface",
  userDetails: "flex-1 text-center md:text-left mb-2",
  userName:
    "text-4xl md:text-5xl font-bold text-white font-outfit mb-2 tracking-tight drop-shadow-lg",
  userBadges: "flex flex-wrap justify-center md:justify-start gap-3",
  badge:
    "px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider backdrop-blur-md border",
  badgeAdmin: "bg-pixela-accent/20 border-pixela-accent/50 text-pixela-accent",
  badgeUser: "bg-white/10 border-white/20 text-gray-300",
} as const;

export const ProfileHero = ({ user }: ProfileHeroProps) => {
  return (
    <section className={STYLES.heroSection}>
      <div className={STYLES.heroBackground}>
        {/* Dynamic Banner */}
        <div
          className="absolute inset-0 bg-cover bg-center transition duration-700"
          style={{
            backgroundImage: `url('${user.cover_url || "https://images.unsplash.com/photo-1574267432553-4b4628081c31?q=80&w=2831&auto=format&fit=crop"}')`,
            opacity: 0.4,
          }}
        />
        <div className={STYLES.heroGradient} />
      </div>

      <div className={STYLES.heroContent}>
        <div className={STYLES.userInfoContainer}>
          <div className={STYLES.avatarWrapper}>
            <div className={STYLES.avatarRing} />
            <div className={STYLES.avatarContainer}>
              <UserAvatar
                profileImage={user.photo_url}
                name={user.name}
                size="full"
                className="!mb-0 !border-0"
              />
            </div>
          </div>

          <div className={STYLES.userDetails}>
            <h1 className={STYLES.userName}>{user.name}</h1>
            <div className={STYLES.userBadges}>
              <span
                className={clsx(
                  STYLES.badge,
                  user.is_admin ? STYLES.badgeAdmin : STYLES.badgeUser,
                )}
              >
                {user.is_admin ? "Admin" : "Miembro"}
              </span>
              <span className={clsx(STYLES.badge, STYLES.badgeUser)}>
                Unido en{" "}
                {!isNaN(new Date(user.created_at).getTime())
                  ? new Date(user.created_at).getFullYear()
                  : new Date().getFullYear()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
