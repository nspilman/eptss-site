import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
export const useLocalStorageAuthFromParams = () => {
  const router = useRouter();
  const { cuevacito } = router.query;
  const localStorageLoggedInKey = "jeesmanchipski";
  const localStorageIsLoggedIn =
    (typeof window !== "undefined" &&
      localStorage.getItem(localStorageLoggedInKey)) ||
    false;
  const [isLoggedIn, setIsLoggedIn] = useState(
    cuevacito === "deVerdad" || localStorageIsLoggedIn === "Jomromski"
  );

  useEffect(() => {
    if (isLoggedIn) {
      localStorage.setItem(localStorageLoggedInKey, "Jomromski");
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (cuevacito) {
      if (cuevacito === "deVerdad") {
        setIsLoggedIn(true);
      }
    }
  }, [cuevacito]);
  return {
    isLoggedIn,
  };
};
