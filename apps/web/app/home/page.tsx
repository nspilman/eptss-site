import { Metadata } from 'next';
import HomepageContent from '../page';

export const metadata: Metadata = {
  title: "Home | Everyone Plays the Same Song",
  description: "Every quarter, our community picks one song. Everyone creates their own unique cover version. Then we celebrate with a virtual listening party! Join our next round.",
};

// Home route that displays the homepage content without redirecting to dashboard
const HomePage = async () => {
  return <HomepageContent />;
};

export default HomePage;
