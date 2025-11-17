// This route allows logged-in users to view the home page
// Root route (/) redirects authenticated users to /dashboard, but /home always shows the homepage
import { Metadata } from 'next';
import Homepage from '../page';

export const metadata: Metadata = {
  title: "Home | Everyone Plays the Same Song",
  description: "Every quarter, our community picks one song. Everyone creates their own unique cover version. Then we celebrate with a virtual listening party! Join our next round.",
};

const HomePage = async () => {
  return <Homepage />;
};

export default HomePage;
