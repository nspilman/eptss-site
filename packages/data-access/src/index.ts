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

// Re-export commonly used services
export * from './services/roundService';
export { formatDate } from './services/dateService';
export { getVotesByUserForRoundWithDetails, getDetailedVoteResults } from './services/votesService';
export { getUserSignupData } from './services/signupService';
export { getUnverifiedSignupByEmail } from './services/verificationService';
export { getAllFeedback, updateFeedbackPublicStatus, deleteFeedback } from './services/feedbackService';
export { getSignupSongsForRound, setRoundSong } from './services/roundService';
export { getActiveUsersCount, getUserDetails, getActiveUsers, getAllUsers, getUserInfo } from './services/userService';
export { saveTestRun } from './services/monitoringService';
export { addToMailingList } from './services/mailingListService';
export { createUser } from './services/userCreationService';
export { getSongByTitleAndArtist } from './services/songsService';
export { getNextQuarterlyRounds } from './utils/roundDateCalculator';
export { 
  hasReminderBeenSent, 
  recordReminderSent, 
  getUsersSignedUpForRound,
  hasUserSubmitted 
} from './services/emailReminderService';
export { determineRemindersToSend, type ReminderEmailType } from './utils/reminderEmailScheduler';
export type { Feedback, CreateFeedbackInput } from './services/feedbackService';

// Re-export actions
export * from './actions/signupActions';
export * from './actions/adminActions';
export * from './actions/feedbackActions';

// Re-export action-like service functions
export { verifySignupByEmail } from './services/signupService';

// Re-export Supabase utilities
export { createClient, getAuthUser } from './utils/supabase/server';

// Re-export schemas
export * from './schemas/signupSchemas';
export * from './schemas/submission';
export * from './schemas/voting';
