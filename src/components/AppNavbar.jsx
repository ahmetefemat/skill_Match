import React, { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/logo.svg";
import "./AppNavbar.css";

const NAV_ITEMS = [
  { label: "Lobby", to: "/lobby" },
  { label: "Dashboard", to: "/dashboard" },
  { label: "Profile", to: "/profile" },
];

const getInitial = (value) => {
  if (!value) return "U";
  return String(value).trim()?.[0]?.toUpperCase() || "U";
};

export default function AppNavbar({ balance, username, avatarUrl }) {
  const location = useLocation();

  const activePath = location?.pathname || "";

  const balanceText = useMemo(() => {
    // TODO: Integrate real-time balance from Firebase/wallet service via parent page state.
    if (typeof balance === "number" && Number.isFinite(balance)) {
      return `₺${balance.toLocaleString()}`;
    }
    return "₺250";
  }, [balance]);

  return (
    <header className="appNavbar" role="banner">
      <div className="landing-container appNavbar-inner">
        <div className="appNavbar-left">
          <div className="appNavbar-brand" aria-label="SkillMatch">
            <img
              className="appNavbar-logo"
              src={logo}
              alt="SkillMatch Logo"
              style={{ width: 44, height: "auto", maxHeight: 44, objectFit: "contain" }}
            />
            <span className="appNavbar-brandText">SkillMatch</span>
          </div>
        </div>

        <nav className="appNavbar-center" aria-label="Primary">
          {NAV_ITEMS.map((item) => {
            const isActive = activePath === item.to;

            if (isActive) {
              return (
                <span
                  key={item.to}
                  className="appNavbar-link isActive"
                  aria-current="page"
                >
                  {item.label}
                </span>
              );
            }

            return (
              <Link key={item.to} className="appNavbar-link" to={item.to}>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="appNavbar-right">
          <div className="appNavbar-balancePill" aria-label="Wallet balance">
            <span className="appNavbar-balanceLabel">Bakiye</span>
            <span className="appNavbar-balanceValue">{balanceText}</span>
          </div>

          {activePath === "/profile" ? (
            <div className="appNavbar-user isActive" aria-label="User profile">
              <div className="appNavbar-avatar" aria-hidden="true">
                {avatarUrl ? (
                  <img className="appNavbar-avatarImg" src={avatarUrl} alt="" />
                ) : (
                  <span className="appNavbar-avatarInitial">{getInitial(username)}</span>
                )}
              </div>
              <span className="appNavbar-username">{username || "Player"}</span>
            </div>
          ) : (
            <Link className="appNavbar-user" to="/profile" aria-label="Go to profile">
              <div className="appNavbar-avatar" aria-hidden="true">
                {avatarUrl ? (
                  <img className="appNavbar-avatarImg" src={avatarUrl} alt="" />
                ) : (
                  <span className="appNavbar-avatarInitial">{getInitial(username)}</span>
                )}
              </div>
              <span className="appNavbar-username">{username || "Player"}</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
