import { useContext } from "react";
import { AuthContext } from "./authContextObject";


export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used with AuthProvider");
    }
    return context;
}