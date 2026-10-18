import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { signup } from "../../services/authService";
import "./Signup.css";

function Signup() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();

  const [signupError, setSignupError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const password = watch("password", "");
  const confirmPassword = watch("confirmPassword", "");

  // signup
  async function onSubmit(data) {
    setSignupError("");

    try {
      const response = await signup(data);

      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));

      console.log("Signup Success");
      console.log(response);

      navigate("/login");
    } catch (error) {
      console.error("Signup failed:", error);
      setSignupError(
        error.response?.data?.message || "Email already exists."
      );
    }
  }

  // eye icon
  function EyeIcon() {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M2.06 12.35a1 1 0 0 1 0-.7C3.34 7.91 7.38 5 12 5c4.62 0 8.66 2.91 9.94 6.65a1 1 0 0 1 0 .7C20.66 16.09 16.62 19 12 19c-4.62 0-8.66-2.91-9.94-6.65Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }

  // eye off icon
  function EyeOffIcon() {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c5 0 8.27 4.11 9 7-.28 1.11-.91 2.29-1.86 3.36" />
        <path d="M6.61 6.61C4.62 7.84 3.28 9.62 3 12c.73 2.89 4 7 9 7 1.61 0 3.03-.43 4.25-1.14" />
        <line x1="3" y1="3" x2="21" y2="21" />
      </svg>
    );
  }

  return (
    <div className="signup-page">
      {/* background */}
      <div className="signup-glow signup-glow-one"></div>
      <div className="signup-glow signup-glow-two"></div>

      {/* top brand */}
      <header className="signup-topbar">
        <Link to="/login" className="signup-brand">
          <img src="/codesync_icon.svg" alt="CodeSync.AI" />
          <span>
            CodeSync<span>.AI</span>
          </span>
        </Link>

        {/* <div className="signup-login-link">
          <span>Already a member?</span>
          <Link to="/login">Sign in</Link>
        </div> */}
      </header>

      {/* main */}
      <main className="signup-main">
        {/* left intro */}
        <section className="signup-intro">
          <span className="signup-eyebrow">YOUR NEXT WORKSPACE</span>

          <h1>
            Start building
            <br />
            <span>something great.</span>
          </h1>

          <p>
            Create your CodeSync.AI account and bring your projects, AI
            workflows and collaboration into one place.
          </p>

          <div className="signup-stat-row">
            <div className="signup-stat">
              <strong>AI</strong>
              <span>Assisted coding</span>
            </div>

            <div className="signup-stat-divider"></div>

            <div className="signup-stat">
              <strong>Team</strong>
              <span>Collaboration</span>
            </div>

            <div className="signup-stat-divider"></div>

            <div className="signup-stat">
              <strong>1</strong>
              <span>Unified workspace</span>
            </div>
          </div>
        </section>

        {/* signup card */}
        <section className="signup-card">
          <div className="signup-card-header">
            <div className="signup-icon">
              <img src="/codesync_icon.svg" alt="" />
            </div>

            <div>
              <span>LET'S SYNC YOU IN</span>
              <h2>Create your account</h2>
            </div>
          </div>

          <p className="signup-description">
            AI's on. Team's in. You're next.
          </p>

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* name */}
            <div className="signup-input-group">
              <label>Name</label>

              <div className="signup-input-wrapper">
                <span className="signup-input-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 21a8 8 0 0 0-16 0" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </span>

                <input
                  type="text"
                  placeholder="Enter your name"
                  {...register("name", {
                    required: "Name is required",
                    minLength: {
                      value: 2,
                      message: "Name must be at least 2 characters",
                    },
                  })}
                />
              </div>

              {errors.name && (
                <p className="signup-error">{errors.name.message}</p>
              )}
            </div>

            {/* email */}
            <div className="signup-input-group">
              <label>Email address</label>

              <div className="signup-input-wrapper">
                <span className="signup-input-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <polyline points="3 7 12 13 21 7" />
                  </svg>
                </span>

                <input
                  type="email"
                  placeholder="you@example.com"
                  {...register("username", {
                    required: "Email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Please enter a valid email address",
                    },
                  })}
                />
              </div>

              {errors.username && (
                <p className="signup-error">{errors.username.message}</p>
              )}
            </div>

            {/* password */}
            <div className="signup-input-group">
              <label>Password</label>

              <div className="signup-input-wrapper">
                <span className="signup-input-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="4" y="10" width="16" height="11" rx="2" />
                    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                  </svg>
                </span>

                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters",
                    },
                    validate: {
                      uppercase: (value) =>
                        /[A-Z]/.test(value) ||
                        "Password must contain an uppercase letter",
                      lowercase: (value) =>
                        /[a-z]/.test(value) ||
                        "Password must contain a lowercase letter",
                      number: (value) =>
                        /[0-9]/.test(value) ||
                        "Password must contain a number",
                      special: (value) =>
                        /[^A-Za-z0-9]/.test(value) ||
                        "Password must contain a special character",
                    },
                  })}
                />

                <button
                  type="button"
                  className="signup-password-toggle"
                  onClick={() => setShowPassword((previous) => !previous)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>

              <div className="signup-password-hint">
                8+ characters · uppercase · lowercase · number · special
                character
              </div>

              {errors.password && (
                <p className="signup-error">{errors.password.message}</p>
              )}
            </div>

            {/* confirm password */}
            <div className="signup-input-group">
              <label>Confirm password</label>

              <div className="signup-input-wrapper">
                <span className="signup-input-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="4" y="10" width="16" height="11" rx="2" />
                    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                  </svg>
                </span>

                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Repeat your password"
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (value) =>
                      value === password || "Passwords do not match",
                  })}
                />

                <button
                  type="button"
                  className="signup-password-toggle"
                  onClick={() =>
                    setShowConfirmPassword((previous) => !previous)
                  }
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                >
                  {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>

              {errors.confirmPassword && (
                <p className="signup-error">
                  {errors.confirmPassword.message}
                </p>
              )}

              {!errors.confirmPassword &&
                confirmPassword &&
                password === confirmPassword && (
                  <p className="signup-match">✓ Passwords match</p>
                )}
            </div>

            {/* server error */}
            {signupError && (
              <div className="signup-server-error">
                <span>!</span>
                <p>{signupError}</p>
              </div>
            )}

            {/* submit */}
            <button type="submit" className="signup-submit">
              <span>Create Account</span>

              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>

            <div className="signup-footer-text">
              <span>Already have an account?</span>
              <Link to="/login">Sign in</Link>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}

export default Signup;