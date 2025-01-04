export enum Navigation {
  FAQ = "/faq",
  HowItWorks = "/#how-it-works",
  SignUp = "/sign-up",
  Submit = "/submit",
  Rounds = "#rounds",
  Voting = "/voting",
  Waitlist = "/waitlist",
  Login = "/login"
  // Profile = "/profile",
}

export const protectedRoutes = [
  Navigation.SignUp,
  Navigation.SignUp,
  Navigation.Voting
]