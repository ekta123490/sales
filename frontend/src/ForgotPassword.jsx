import { useState } from "react";
import axios from "axios";
import { Mail, ArrowLeft } from "lucide-react";
import './index.css'

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    setMessage("");
    setError("");

    try {
      setLoading(true);

      const apiUrl = import.meta.env.VITE_API_URL;

      if (!apiUrl) {
        throw new Error("VITE_API_URL is not configured.");
      }

      const { data } = await axios.post(
        `${apiUrl.replace(/\/+$/, "")}/api/auth/forgot-password`,
        {
          email: email.trim(),
        }
      );

      setMessage(
        data.message ||
          "If an account exists for this email, password reset instructions will be sent."
      );
      setEmail("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to send reset instructions. Please try again."
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
          <span className="brand">ACCOUNT RECOVERY</span>

          <h2>Let's Get You Back on Track</h2>

          <p>
            Forgot your password? Don't worry.
            We'll help you regain access to your
            account and continue your journey with us.
          </p>
        </div>
      </section>

      {/* Right form section */}
      <section className="register-panel">
        <div className="register-form-wrapper forgot-password-wrapper">
          <h6>Sales Operations Portal</h6>

          <h1>Forgot Password</h1>

          <p className="subtitle">
            No Problem, Enter Your email addres and we'll send you a link to reset Password.
          </p>

          <form onSubmit={handleSubmit}>
            {/* Email address */}
            <div className="form-group">
              <label htmlFor="forgotEmail">
                Email Address
              </label>

              <div className="input-with-icon">
                <Mail
                  className="field-icon"
                  size={18}
                  aria-hidden="true"
                />

                <input
                  id="forgotEmail"
                  name="email"
                  type="email"
                  placeholder="Enter your email address"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                    setMessage("");
                  }}
                  maxLength={255}
                  required
                />
              </div>
            </div>

            

            {/* Success message */}
            {message && (
              <p className="form-message success" role="status">
                {message}
              </p>
            )}

            {/* Send reset link */}
            <button
              className="create-account-btn"
              type="submit"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          {/* Back to sign in */}
          <p className="login-link forgot-back-link">
            <a href="/login">
              <ArrowLeft size={15} aria-hidden="true" />
              <span>Back to Sign In</span>
            </a>
          </p>
          <div className="reset-link-notification" role="status">
  <Mail size={16} aria-hidden="true" />
  <span>Reset link not sent yet? Please check your email and try again.</span>
</div>
        </div>
      </section>
    </main>
  );
}