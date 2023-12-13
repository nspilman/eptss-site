export const ButtonsContainer = ({
  children,
}: {
  children: React.ReactElement[];
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-center items-center">
      {children}
    </div>
  );
};
