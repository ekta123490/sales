
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  UserRound,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
} from "lucide-react";

const initialForm = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const rules = [
    {
      label: "At least 12 characters",
      valid: form.password.length >= 12,
    },
    {
      label: "No more than 72 characters",
      valid: form.password.length <= 72,
    },
    {
      label: "One uppercase letter (A-Z)",
      valid: /[A-Z]/.test(form.password),
    },
    {
      label: "One lowercase letter (a-z)",
      valid: /[a-z]/.test(form.password),
    },
    {
      label: "One number (0-9)",
      valid: /[0-9]/.test(form.password),
    },
    {
      label: "One special character (!@#$%)",
      valid: /[^A-Za-z0-9]/.test(form.password),
    },
  ];

  const passwordValid = rules.every((rule) => rule.valid);

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

    if (!passwordValid) {
      setError("Please meet all password requirements.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!agreeTerms) {
      setError(
        "Please agree to the Terms of Service and Privacy Policy."
      );
      return;
    }

    try {
      setLoading(true);

      const apiUrl = import.meta.env.VITE_API_URL;

      if (!apiUrl) {
        throw new Error("VITE_API_URL is not configured.");
      }

      const { data } = await axios.post(
        `${apiUrl.replace(/\/+$/, "")}/api/auth/register`,
        {
          name: form.fullName.trim(),
          email: form.email.trim(),
          password: form.password,
        }
      );

      // Registration succeeded.
      setMessage(data.message || "Registration successful!");

      // Reset the form.
      setForm({ ...initialForm });
      setAgreeTerms(false);
      setShowPassword(false);
      setShowConfirmPassword(false);

      // Redirect to Login after successful registration.
      navigate("/login", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Registration failed. Please try again."
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
          <span className="brand">CREATE YOUR FUTURE</span>

          <h2>Start Your Journey With Us</h2>

          <p>
            Join our community and discover new opportunities.
            Your journey starts with a single step.
          </p>
        </div>
      </section>

      {/* Registration form section */}
      <section className="register-panel">
        <div className="register-form-wrapper">
          <h6>Welcome to</h6>

          <h1>Create Your Account</h1>

          <p className="subtitle">
            Get started with the sales operation portal and
            unlock insights to drive a higher-performing sales
            organization.
          </p>

          <form onSubmit={handleSubmit}>
            {/* Full Name */}
            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>

              <div className="input-with-icon">
                <UserRound className="field-icon" size={18} />

                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  autoComplete="name"
                  value={form.fullName}
                  onChange={handleChange}
                  minLength={2}
                  maxLength={100}
                  required
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="form-group">
              <label htmlFor="email">Email Address</label>

              <div className="input-with-icon">
                <Mail className="field-icon" size={18} />

                <input
                  id="email"
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
              <label htmlFor="password">Password</label>

              <div className="input-with-icon">
                <LockKeyhole
                  className="field-icon"
                  size={18}
                />

                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                  value={form.password}
                  onChange={handleChange}
                  maxLength={72}
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

              <ul className="password-rules">
                {rules.map((rule) => (
                  <li
                    key={rule.label}
                    className={rule.valid ? "valid" : ""}
                  >
                    <span>{rule.valid ? "✓" : "○"}</span>
                    {rule.label}
                  </li>
                ))}
              </ul>
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label htmlFor="confirmPassword">
                Confirm Password
              </label>

              <div className="input-with-icon">
                <LockKeyhole
                  className="field-icon"
                  size={18}
                />

                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={
                    showConfirmPassword ? "text" : "password"
                  }
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  maxLength={72}
                  required
                />

                <button
                  type="button"
                  className="show-password"
                  onClick={() =>
                    setShowConfirmPassword((prev) => !prev)
                  }
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>

              {form.confirmPassword &&
                form.password !== form.confirmPassword && (
                  <p className="field-error">
                    Passwords do not match.
                  </p>
                )}
            </div>

            {/* Terms and Privacy */}
            <label className="terms">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) =>
                  setAgreeTerms(e.target.checked)
                }
                required
              />

              <span>
                I agree to the{" "}
                <a href="/terms">Terms of Service</a> and{" "}
                <a href="/privacy">Privacy Policy</a>.
              </span>
            </label>

            {/* Error Message */}
            {error && (
              <p className="form-message error" role="alert">
                {error}
              </p>
            )}

            {/* Success Message */}
            {message && (
              <p
                className="form-message success"
                role="status"
              >
                {message}
              </p>
            )}

            {/* Submit Button */}
            <button
              className="create-account-btn"
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Creating Account..."
                : "Create Account"}
            </button>
          </form>

          {/* Login Link */}
          <p className="login-link">
            Already have an account?{" "}
            <Link to="/login">Sign in</Link>
          </p>
        </div>
      </section>
    </main>
  );
}