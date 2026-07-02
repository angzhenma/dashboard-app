import { useEffect } from "react";

export function Login() {
    useEffect(() => {
        document.title = "Login - Security Operations Center";
    }, []);
    return (
        <div>
            <h2>Login</h2>
            <form>
                <div>
                    <label htmlFor="username">Username:</label>
                    <input type="text" id="username" />
                </div>
                <div>
                    <label htmlFor="password">Password:</label>
                    <input type="password" id="password" />
                </div>
                <button type="submit">Login</button>
            </form>
        </div>
    );
}