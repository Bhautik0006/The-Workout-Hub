import {useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import AuthLayout from "../components/AuthLayout";
import FormInput from "../components/FormInput";

import "./AuthPages.css";

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");

  const [height, setHeight] = useState("");
  const [heightUnit, setHeightUnit] = useState<"cm" | "in">("cm");

  const [weight, setWeight] = useState("");
  const [weightUnit, setWeightUnit] = useState<"kg" | "lb">("kg");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();

    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const registrationData = {
        name,
        username,
        email,
        password,

        ...(dob && {
          dob,
        }),

        ...(gender && {
          gender,
        }),

        ...(height && {
          height: {
            value: Number(height),
            unit: heightUnit,
          },
        }),

        ...(weight && {
          weight: {
            value: Number(weight),
            unit: weightUnit,
          },
        }),
      };

      // API integration will be added next.
      console.log("Registration data:", registrationData);

      // Temporary navigation for UI testing.
      navigate("/login");
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account."
      subtitle="Start tracking your workouts and progress."
    >
      <form onSubmit={handleSubmit} className="auth-form">
        {error && <div className="auth-error">{error}</div>}

        <div className="form-section-title">
          Personal Information
        </div>

        <FormInput
          label="Full Name"
          placeholder="John Doe"
          value={name}
          onChange={setName}
          required
          autoComplete="name"
        />

        <FormInput
          label="Username"
          placeholder="johndoe"
          value={username}
          onChange={setUsername}
          required
          autoComplete="username"
        />

        <FormInput
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={setEmail}
          required
          autoComplete="email"
        />

        <div className="form-row">
          <div className="form-field">
            <label>Date of Birth</label>

            <input
              className="standalone-input"
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label>Gender</label>

            <select
              className="standalone-input"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div className="form-section-title fitness-title">
          Fitness Information
        </div>

        <div className="form-row">
          <div className="form-field">
            <label>Height</label>

            <div className="input-with-unit">
              <input
                className="standalone-input"
                type="number"
                min="0"
                placeholder="175"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
              />

              <select
                value={heightUnit}
                onChange={(e) =>
                  setHeightUnit(e.target.value as "cm" | "in")
                }
              >
                <option value="cm">cm</option>
                <option value="in">in</option>
              </select>
            </div>
          </div>

          <div className="form-field">
            <label>Weight</label>

            <div className="input-with-unit">
              <input
                className="standalone-input"
                type="number"
                min="0"
                step="0.1"
                placeholder="70"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />

              <select
                value={weightUnit}
                onChange={(e) =>
                  setWeightUnit(e.target.value as "kg" | "lb")
                }
              >
                <option value="kg">kg</option>
                <option value="lb">lb</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-section-title fitness-title">
          Account Security
        </div>

        <FormInput
          label="Password"
          type="password"
          placeholder="Create a password"
          value={password}
          onChange={setPassword}
          required
          autoComplete="new-password"
        />

        <FormInput
          label="Confirm Password"
          type="password"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          required
          autoComplete="new-password"
        />

        <button
          type="submit"
          className="auth-submit"
          disabled={loading}
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>

        <div className="auth-switch">
          <span>Already have an account?</span>

          <Link to="/login">
            Sign in
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}