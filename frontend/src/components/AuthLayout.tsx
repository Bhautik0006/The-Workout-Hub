import { ArrowLeft, Dumbbell } from "lucide-react";
import { Link } from "react-router-dom";
import "./AuthLayout.css";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export default function AuthLayout({
  children,
  title,
  subtitle,
}: AuthLayoutProps) {
  return (
    <div className="auth-page">
      <div className="auth-background">
        <div className="auth-glow auth-glow-one"></div>
        <div className="auth-glow auth-glow-two"></div>
      </div>

      <header className="auth-header">
        <Link to="/" className="auth-logo">
          <div className="auth-logo-icon">
            <Dumbbell size={21} />
          </div>

          <span>
            WORKOUT<span>HUB</span>
          </span>
        </Link>

        <Link to="/" className="back-home">
          <ArrowLeft size={17} />
          Back to home
        </Link>
      </header>

      <main className="auth-content">
        <div className="auth-card">
          <div className="auth-heading">
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>

          {children}
        </div>
      </main>
    </div>
  );
}