import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
} from "lucide-react";

export default function Login() {
  var token=null;
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setMessage("");
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setMessage("");

    try {
      setLoading(true);

      const apiUrl = import.meta.env.VITE_API_URL;

      if (!apiUrl) {
        throw new Error("VITE_API_URL is not configured.");
      }

      const { data } = await axios.post(
        `${apiUrl.replace(/\/+$/, "")}/api/auth/login`,
        {
          email: form.email.trim(),
          password: form.password,
        }
      );
      token=data.accessToken;

      
      if (token) {
        localStorage.setItem("token", data.token);
      }

      setMessage(data.message || "Login successful!");

      // Change this destination to your dashboard route.
      if (token) {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="register-page">
      {/* Left image section */}
      <section className="register-image">
        <div className="image-overlay">
          <span className="brand">WELCOME BACK</span>

          <h2>Your Success Starts Here</h2>

          <p>
            Sign in to access your sales operation portal,
            track performance, and discover new opportunities.
          </p>
        </div>
      </section>

      {/* Login form */}
      <section className="register-panel">
        <div className="register-form-wrapper login-form-wrapper">
          <h6>WELCOME BACK</h6>

          <h1>Sales Operations Sign In</h1>

          <p className="subtitle">
            Use Your work credentials or single Sign On to access the Sales Operation Portal.
          </p>

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div className="form-group">
              <label htmlFor="loginEmail">
                Email Address
              </label>

              <div className="input-with-icon">
                <Mail
                  className="field-icon"
                  size={18}
                  aria-hidden="true"
                />

                <input
                  id="loginEmail"
                  name="email"
                  type="email"
                  placeholder="Enter your email address"
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange}
                  maxLength={255}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <div className="login-password-heading">
                <label htmlFor="loginPassword">
                  Password
                </label>

                <Link to="/forgot-password">
                  Forgot Password?
                </Link>
              </div>

              <div className="input-with-icon">
                <LockKeyhole
                  className="field-icon"
                  size={18}
                  aria-hidden="true"
                />

                <input
                  id="loginPassword"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />

                <button
                  type="button"
                  className="show-password"
                  onClick={() =>
                    setShowPassword((prev) => !prev)
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Messages */}
            {error && (
              <p className="form-message error" role="alert">
                {error}
              </p>
            )}

            {message && (
              <p className="form-message success" role="status">
                {message}
              </p>
            )}

            {/* Submit */}
            <button
              className="create-account-btn"
              type="submit"
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <p className="login-link">
            Don't have an account?{" "}
            <Link to="/register">Create an account</Link>
          </p>
        </div>
      </section>
    </main>
  );
}