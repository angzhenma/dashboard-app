import { useState, useEffect } from "react";
import { useAuth } from "../context/useAuth";
import { LogIn, ShieldUser, Lock, Mail } from "lucide-react";

export function Login() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    document.title = "Login - Security Operations Center Dashboard";
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // prevents the browser from refreshing the page
    setIsLoading(true);
    setError("");

    try {
      await signIn(email, password);
    } catch {
      setError("Invalid security credentials. Access denied.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 p-4 font-sans text-slate-200">
      
      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-md border border-slate-700/60 rounded-2xl p-8 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
        
        <div className="flex flex-col items-center mb-8">
          <ShieldUser size={48} className="text-sky-500 mb-4 drop-shadow-[0_0_15px_rgba(56,189,248,0.4)]" />
          <h2 className="text-2xl font-bold text-white tracking-tight">SOC Gateway</h2>
          <p className="text-sm text-slate-400 mt-1">Authenticate to access telemetry</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          
          {/* Email Input Group */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Operator Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
                <Mail size={16} />
              </div>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all placeholder:text-slate-600"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          {/* Password Input Group */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="
                text-xs
                font-semibold
                text-slate-400
                uppercase
                tracking-wider
              "
            >
            Passcode
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
                <Lock size={16} />
              </div>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all placeholder:text-slate-600"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {/* Error Message Display */}
          {error && (
            <div className="text-red-400 text-xs font-medium bg-red-950/30 border border-red-900/50 p-2.5 rounded-lg text-center">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 w-full flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold py-3 px-4 rounded-lg transition-all duration-200 shadow-[0_0_15px_rgba(56,189,248,0.2)] hover:shadow-[0_0_25px_rgba(56,189,248,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LogIn size={18} />
            {isLoading ? "Authenticating..." : "Initialize Session"}
          </button>
        </form>
      </div>
    </div>
  );
}