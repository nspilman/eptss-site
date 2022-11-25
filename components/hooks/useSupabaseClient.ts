import { getSupabaseClient } from "../../utils/getSupabaseClient";

export const useSupabase = () => {
  return getSupabaseClient();
};
