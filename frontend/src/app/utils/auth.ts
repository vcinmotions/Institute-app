import Cookies from "js-cookie";
import { getUser } from "@/lib/api";
import { store } from "@/store";
import { setUser, setToken } from "@/store/slices/authSlice";

export async function restoreSession() {
  const token = Cookies.get("token");
  if (!token) return null;

  try {
    const data = await getUser(token);

    store.dispatch(setUser(data.userdata));
    store.dispatch(setToken(token));

    return data.userdata;
  } catch (err) {
    console.log("Session restore failed");
    Cookies.remove("token");
    return null;
  }
}
