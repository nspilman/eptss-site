export enum Navigation {
  FAQ = "/faq",
  HowItWorks = "/#how-it-works",
  SignUp = "/sign-up",
  Submit = "/submit",
  Rounds = "/rounds",
  Voting = "/voting",
  Waitlist = "/waitlist",
  Feedback = "/feedback",
  Login = "/login",
  Home = "/",
  Dashboard = "/dashboard",
  Profile = "/dashboard/profile",
  Tasks = "/tasks",
  CurrentRound = "/round/current",
  Admin = "/admin"
}

export const protectedRoutes = [
  Navigation.Submit,
  Navigation.Voting,
  Navigation.Dashboard,
  Navigation.Profile,
  Navigation.Tasks,
  Navigation.Feedback,
]