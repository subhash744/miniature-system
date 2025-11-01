import { getAllUsers, saveUserProfile, generateUserId, generateBadges } from "./storage"

export function initializeMockData() {
  // Removed all mock data generation to create a 0-user ready web app
  // This function now does nothing but can be called without side effects
  if (typeof window === "undefined") return

  const existingUsers = getAllUsers()
  // No longer generate mock users
  return
}
