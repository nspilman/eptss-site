// Re-export providers (db and schema are kept internal - use providers instead)
export * from './providers/roundProvider/roundProvider';
export * from './providers/votesProvider/votesProvider';
export * from './providers/adminProvider/adminProvider';
export * from './providers/roundsProvider/roundsProvider';
export * from './providers/userParticipationProvider/userParticipationProvider';
export * from './providers/monitoringProvider/monitoringProvider';
export * from './providers/feedbackProvider/feedbackProvider';
export * from './providers/userSessionProvider/userSessionProvider';
export * from './providers/signupProvider/signupProvider';
export * from './providers/profileProvider/profileProvider';
// Note: blogProvider is NOT exported from main index
// because it uses fs module which is Node.js only.
// Import it directly from './providers/blogProvider/blogProvider' in server components or API routes only.

// Re-export commonly used services
export * from './services/roundService';
export { getAllProjects, getProjectBySlug, getUserProjects } from './services/projectService';
export type { ProjectInfo } from './services/projectService';
export * from './utils/projectUtils';
export { formatDate } from './services/dateService';
export { getVotesByUserForRoundWithDetails, getDetailedVoteResults } from './services/votesService';
export { getUserSignupData, checkSignupCap } from './services/signupService';
export { getUnverifiedSignupByEmail } from './services/verificationService';
export { getAllFeedback, updateFeedbackPublicStatus, deleteFeedback } from './services/feedbackService';
export { getSignupSongsForRound, setRoundSong } from './services/roundService';
export {
  getActiveUsersCount,
  getUserDetails,
  getActiveUsers,
  getAllUsers,
  getUserInfo,
  getPublicProfileByUsername,
  getUserPrivacySettings,
  updateUserPrivacySettings,
  getUserById,
  getUserSocialLinks,
  createUserSocialLink,
  updateUserSocialLink,
  deleteUserSocialLink,
  getUserEmbeddedMedia,
  createUserEmbeddedMedia,
  updateUserEmbeddedMedia,
  deleteUserEmbeddedMedia,
  updateUserProfilePicture
} from './services/userService';
export {
  getUserSignups,
  getUserSubmissions,
  getUserVotes,
  getUserParticipationCounts
} from './services/profileService';
export { saveTestRun } from './services/monitoringService';
export { getSongByTitleAndArtist } from './services/songsService';
// Note: addToMailingList and createUser are NOT exported from main index
// because they import db which uses Node.js modules (net, tls, perf_hooks).
// Import them directly from their service files in API routes only.
export { getNextQuarterlyRounds } from './utils/roundDateCalculator';
export { 
  hasReminderBeenSent, 
  recordReminderSent, 
  getUsersSignedUpForRound,
  hasUserSubmitted 
} from './services/emailReminderService';
export { determineRemindersToSend, type ReminderEmailType } from './utils/reminderEmailScheduler';
export type { Feedback, CreateFeedbackInput } from './services/feedbackService';
export {
  createReflection,
  getReflectionBySlug,
  getReflectionsByRound,
  getReflectionsByUser,
  updateReflection,
  deleteReflection,
  getUserInitialReflectionForRound,
  getUserReflectionsForRound,
  getAllPublicReflections,
  getPublicReflectionsByUsername,
  getContentSlugById
} from './services/reflectionService';
export type { Reflection, CreateReflectionInput, UpdateReflectionInput, ReflectionType } from './services/reflectionService';
export {
  createOrGetTag,
  getTagBySlug,
  getAllTags,
  searchTags
} from './services/tagService';
export {
  getAllNotifications,
  getAllNotificationsCount
} from './services/notificationService';
export type { Notification } from './db/schema';
export type { NotificationWithUser } from './services/notificationService';

// Notification Email Service (for admin testing)
export { processNotificationEmails, sendNotificationEmailForUser } from './services/notificationEmailService';

// Actions have been moved to @eptss/actions package
// Import actions from '@eptss/actions' instead

// Re-export rate limiter configuration
export { setRateLimiters, type RateLimiter } from './config/rateLimiters';

// Re-export action-like service functions
export { verifySignupByEmail } from './services/signupService';

// Note: createClient and getAuthUser are NOT exported from the main index
// because they use next/headers which causes issues in client components.
// Import them directly from '@eptss/data-access/utils/supabase/server' if needed in API routes.

// Re-export schemas
export * from './schemas/signupSchemas';
export * from './schemas/submission';
export * from './schemas/voting';

// Re-export types
export type { AudioFileFields, Submission } from './types/round';

// Re-export project utils
export {
  getAllProjectSlugs,
  getAllProjectIds,
  isValidProjectId,
} from './utils/projectUtils';

// Re-export project constants
export { COVER_PROJECT_ID, ORIGINAL_PROJECT_ID } from './db/schema';

// Note: db and schema are generally kept internal.
// For special packages like @eptss/project-config, import from '@eptss/data-access/db'
