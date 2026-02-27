export type MotionPreference = "full" | "reduced";
export type ResolvedMotionMode = MotionPreference;

export const MOTION_PREFERENCE_KEY = "mincfo-motion-preference";

export const isMotionPreference = (value: string | null): value is MotionPreference =>
  value === "full" || value === "reduced";

export const resolveMotionMode = (preference: MotionPreference): ResolvedMotionMode => preference;
