import { useForm } from "react-hook-form";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../../services/authService";
import "./Login.css";

function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();

  const [loginError, setLoginError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // login submit
  async function onSubmit(data) {
    setLoginError("");

    try {
      const response = await login(data);

      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));

      console.log("Login Success");
      console.log(response);

      navigate("/dashboard");
    } catch (error) {
      console.error("Login Failed");
      console.error(error);

      if (error.response?.status === 404) {
        setLoginError("Wrong username or password.");
      } else {
        setLoginError("Unable to login. Please try again.");
      }
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
    <div className="login-page">
      {/* background glows */}
      <div className="background-glow glow1"></div>
      <div className="background-glow glow2"></div>

      <div className="login-container">
        {/* left hero */}
        <section className="login-hero">
          <div className="hero-circle hero-circle-one"></div>
          <div className="hero-circle hero-circle-two"></div>

          <div className="hero-brand">
            <img src="/codesync_icon.svg" alt="CodeSync.AI" />
            <span>
              CodeSync<span className="brand-dot">.AI</span>
            </span>
          </div>

          <div className="hero-content">
            <div className="hero-label">AI POWERED DEVELOPMENT</div>

            <h1>
              Build smarter.
              <br />
              <span>Ship together.</span>
            </h1>

            <p>
              Synchronize your codebase, collaborate with your team, and
              accelerate your development workflow with AI.
            </p>

            <div className="hero-points">
              <div className="hero-point">
                <span className="point-icon">✦</span>
                <span>AI-powered coding</span>
              </div>

              <div className="hero-point">
                <span className="point-icon">✦</span>
                <span>Real-time collaboration</span>
              </div>

              <div className="hero-point">
                <span className="point-icon">✦</span>
                <span>One workspace for your team</span>
              </div>
            </div>
          </div>

          <div className="hero-footer">© 2026 CodeSync.AI</div>
        </section>

        {/* right login */}
        <section className="login-form-section">
          <div className="login-form-wrapper">
            <div className="form-brand">
              <img src="/codesync_icon.svg" alt="CodeSync.AI" />
              <span>
                CodeSync<span>.AI</span>
              </span>
            </div>

            <div className="form-header">
              <span className="form-eyebrow">NO PULLS. NO CONFLICTS.</span>

              <h2>Just sign in and build.</h2>

              <p>
                Everything's already synced. You're the only thing missing.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              {/* email */}
              <div className="input-group">
                <label>Email address</label>

                <div className="input-wrapper">
                  <span className="input-icon">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
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
                    placeholder="Enter your email"
                    {...register("username", {
                      required: "Email is required",
                    })}
                  />
                </div>

                {errors.username && (
                  <p className="error">{errors.username.message}</p>
                )}
              </div>

              {/* password */}
              <div className="input-group">
                <label>Password</label>

                <div className="password-input-wrapper">
                  <span className="input-icon">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
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
                    placeholder="Enter your password"
                    {...register("password", {
                      required: "Password is required",
                    })}
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword((previous) => !previous)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>

                {errors.password && (
                  <p className="error">{errors.password.message}</p>
                )}
              </div>

              {/* login error */}
              {loginError && <p className="login-error">{loginError}</p>}

              {/* login button */}
              <button className="login-btn" type="submit">
                <span>Login</span>

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

              {/* sign up */}
              <div className="bottom-text">
                <span>Don't have an account?</span>
                <Link to="/signup">Sign Up</Link>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Login;