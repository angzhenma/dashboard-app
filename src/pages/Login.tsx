import { useEffect } from "react";
import Dashboard from "./Dashboard";
// import { cardStyles } from "./Dashboard";
import { fetchUserCredentials } from "../mockData";
import { LogIn } from "lucide-react";

export function Login() {
  const userAuth = async (username: string, password: string) => {
    const credentials = await fetchUserCredentials();
    const [credential] = Array.isArray(credentials)
      ? credentials
      : [credentials];
    return (
      credential?.username === username && credential?.password === password
    );
  };

  const handleLogin = async (username: string, password: string) => {
    const isAuthenticated = await userAuth(username, password);
    if (isAuthenticated) {
      return <Dashboard />;
    } else {
      alert("Invalid username or password");
    }
  };
  useEffect(() => {
    document.title = "Login - Security Operations Center Dashboard";
  }, []);
  return (
    <div
        className="
            flex
            flex-col
            items-center
            justify-center
            h-screen
            bg-[var(--soc-background)]
        "
    >
      <div
        className="
          bg-[var(--soc-card)]
          border
          border-[var(--soc-border)]
          rounded-lg
          p-5
          shadow-md
        "
      >
        <h2
            className="
                text-center
                mb-5
                text-2xl
                font-bold
                text-[var(--soc-text)]
            "
        >
          Login
        </h2>
        <form>
          <div>
            <label htmlFor="username">Username:</label>
            <input type="text" id="username" />
          </div>
          <div>
            <label htmlFor="password">Password:</label>
            <input type="password" id="password" />
          </div>
          <button
            type="submit"
            onClick={(e) => {
              e.preventDefault();
              const username = (
                document.getElementById("username") as HTMLInputElement
              ).value;
              const password = (
                document.getElementById("password") as HTMLInputElement
              ).value;
              handleLogin(username, password);
            }}
          >
            <LogIn size={16} />
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
