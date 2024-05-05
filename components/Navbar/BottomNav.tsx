interface TopNavProps {
    userId: string;
  }
  
  const BottomNav: React.FC<TopNavProps> = ({ userId }) => {
    // You can use the userId prop here to customize the TopNav component
    return (
      <div className="fixed bottom-0 left-0 w-full flex bg-red-500 mx-auto sm:hidden">
        {/* Example usage of userId */}
        <p>Welcome, {userId}!</p>
        {/* Add your other top navigation elements here */}
      </div>
    );
  };
  
  export default BottomNav;