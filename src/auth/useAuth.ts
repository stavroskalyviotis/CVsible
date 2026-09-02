import { useContext } from "react";
import { AuthContext } from "./authContextCore";

export function useAuth() {
  return useContext(AuthContext);
}
