interface TopNavProps {
    userId: string;
  }
  
  const BottomNav: React.FC<TopNavProps> = ({ userId }) => {
    // You can use the userId prop here to customize the TopNav component
    return (
      <div className="top-nav">
        {/* Example usage of userId */}
        <p>Welcome, {userId}!</p>
        {/* Add your other top navigation elements here */}
      </div>
    );
  };
  
  export default BottomNav;