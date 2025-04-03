export enum Navigation {
  FAQ = "/faq",
  HowItWorks = "/#how-it-works",
  SignUp = "/sign-up",
  Submit = "/submit",
  Rounds = "/rounds",
  Voting = "/voting",
  Waitlist = "/waitlist",
  Login = "/login",
  Home = "/",
  Dashboard = "/dashboard",
  Profile = "/profile",
  Tasks = "/tasks",
  CurrentRound = "/round/current"
}

export const protectedRoutes = [
  Navigation.Submit,
  Navigation.Voting,
  Navigation.Dashboard,
  Navigation.Profile,
  Navigation.Tasks,
]