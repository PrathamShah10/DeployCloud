import { jwtDecode } from "jwt-decode";

interface JwtPayload {
  exp: number;
}

export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded: JwtPayload = jwtDecode<JwtPayload>(token);
    const currentTime = Date.now() / 1000; // in seconds
    return decoded.exp < currentTime;
  } catch (error) {
    console.error("Error decoding token:", error);
    return true; // Assume token is expired if there's an error
  }
};
