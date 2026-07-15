import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

    const handleLogin = (e) =>{
      e.preventDefault();
      navigate("/");
    }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background:
          "radial-gradient(60% 60% at 50% 0%, var(--primary-soft), transparent 70%), var(--canvas)",
      }}
    >
      <div
        className="w-full max-w-md p-8"
        style={{
          background: "var(--surface-1)",
          border: "1px solid var(--hairline)",
          borderRadius: "var(--radius-xl)",
          boxShadow: "var(--shadow-md)",
        }}
      >
        {/* Header */}
        <div className="mb-8">
          <div
            className="w-12 h-12 flex items-center justify-center text-xl font-bold"
            style={{
              background: "var(--primary)",
              color: "var(--on-primary)",
              borderRadius: "var(--radius-md)",
            }}
          >
            P
          </div>
          <h1
            className="text-2xl font-bold mt-5"
            style={{ color: "var(--ink)" }}
          >
            Welcome back
          </h1>
          <p className="text-sm mt-1.5" style={{ color: "var(--ink-muted)" }}>
            Sign in to continue to your account
          </p>
        </div>

        {/* Form */}
        <form className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--ink-muted)" }}
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-3 outline-none transition"
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--hairline-strong)",
                borderRadius: "var(--radius-md)",
                color: "var(--ink)",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--primary)")}
              onBlur={(e) =>
                (e.target.style.borderColor = "var(--hairline-strong)")
              }
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--ink-muted)" }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              className="w-full px-4 py-3 outline-none transition"
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--hairline-strong)",
                borderRadius: "var(--radius-md)",
                color: "var(--ink)",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--primary)")}
              onBlur={(e) =>
                (e.target.style.borderColor = "var(--hairline-strong)")
              }
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Forgot */}
          <div className="flex items-center justify-end text-sm">
            <Link
              to="/forgot"
              className="hover:underline"
              style={{ color: "var(--primary)" }}
            >
              Forgot Password?
            </Link>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            onClick={(e) => handleLogin(e)}
            className="w-full py-3 font-semibold transition duration-300 hover:opacity-90"
            style={{
              background: "var(--primary)",
              color: "var(--on-primary)",
              borderRadius: "var(--radius-md)",
            }}
          >
            Login
          </button>

          {/* Footer */}
          <p className="text-center text-sm" style={{ color: "var(--ink-subtle)" }}>
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-semibold hover:underline"
              style={{ color: "var(--primary)" }}
            >
              Sign Up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
