/**
 * Project-agnostic navigation routes
 * For project-specific routes (signup, voting, submit, etc.), use the helper functions below
 */
export enum Navigation {
  FAQ = "/faq",
  HowItWorks = "/#how-it-works",
  Waitlist = "/waitlist",
  Feedback = "/feedback",
  Login = "/login",
  Home = "/",
  Dashboard = "/dashboard",
  Profile = "/dashboard/profile",
  Tasks = "/tasks",
  Admin = "/admin"
}

/**
 * Helper functions to build project-scoped routes
 * Use these instead of hardcoded paths for project-specific functionality
 */
export const getProjectRoute = {
  signUp: (projectSlug: string, roundSlug?: string) =>
    roundSlug ? `/projects/${projectSlug}/sign-up/${roundSlug}` : `/projects/${projectSlug}/sign-up`,

  submit: (projectSlug: string, roundId?: string) =>
    roundId ? `/projects/${projectSlug}/submit/${roundId}` : `/projects/${projectSlug}/submit`,

  voting: (projectSlug: string, roundSlug?: string) =>
    roundSlug ? `/projects/${projectSlug}/voting/${roundSlug}` : `/projects/${projectSlug}/voting`,

  rounds: (projectSlug: string) => `/projects/${projectSlug}/rounds`,

  round: (projectSlug: string, roundSlug: string) => `/projects/${projectSlug}/round/${roundSlug}`,

  discussions: (projectSlug: string) => `/projects/${projectSlug}/discussions`,

  dashboard: (projectSlug: string) => `/projects/${projectSlug}/dashboard`,

  reporting: (projectSlug: string) => `/projects/${projectSlug}/reporting`,
};

export const protectedRoutes = [
  Navigation.Dashboard,
  Navigation.Profile,
  Navigation.Tasks,
  Navigation.Feedback,
]