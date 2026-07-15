import { useState } from "react";
import { Link } from "react-router-dom";

function ForgotPassword() {
  const [email, setEmail] = useState("");

  const inputStyle = {
    backgroundColor: "var(--surface-2)",
    borderColor: "var(--hairline-strong)",
    color: "var(--ink)",
  };

  const handleFocus = (e) => {
    e.target.style.borderColor = "var(--primary)";
  };
  const handleBlur = (e) => {
    e.target.style.borderColor = "var(--hairline-strong)";
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        backgroundColor: "var(--canvas)",
        backgroundImage:
          "radial-gradient(60% 50% at 50% 0%, var(--primary-soft), transparent 70%)",
      }}
    >
      <div
        className="w-full max-w-md p-8"
        style={{
          backgroundColor: "var(--surface-1)",
          border: "1px solid var(--hairline)",
          borderRadius: "var(--radius-xl)",
          boxShadow: "var(--shadow-md)",
        }}
      >
        {/* Header */}
        <div className="mb-8">
          <div
            className="w-11 h-11 flex items-center justify-center text-lg font-bold"
            style={{
              backgroundColor: "var(--primary)",
              color: "var(--on-primary)",
              borderRadius: "var(--radius-md)",
            }}
          >
            P
          </div>
          <h1 className="text-2xl font-bold mt-5" style={{ color: "var(--ink)" }}>
            Reset your password
          </h1>
          <p className="text-sm mt-2" style={{ color: "var(--ink-muted)" }}>
            Enter your email and we'll send you a reset link
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
              className="w-full rounded-lg border px-4 py-3 outline-none transition"
              style={inputStyle}
              onFocus={handleFocus}
              onBlur={handleBlur}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-lg font-semibold transition duration-300 hover:opacity-90"
            style={{
              backgroundColor: "var(--primary)",
              color: "var(--on-primary)",
              borderRadius: "var(--radius-md)",
            }}
          >
            Send Email
          </button>

          {/* Footer */}
          <p className="text-center text-sm" style={{ color: "var(--ink-subtle)" }}>
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold hover:underline"
              style={{ color: "var(--primary)" }}
            >
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default ForgotPassword;
