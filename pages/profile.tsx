function ProfilePage({ pioneer }) {
  return <div>{pioneer}</div>;
}

export async function getServerSideProps() {
  return {
    props: {
      pioneer: "weOutHere",
      notFound: process.env.NODE_ENV === "production",
    }, // will be passed to the page component as props
  };
}

export default ProfilePage;
