import React from "react";
import logo from "../assets/logo.svg";

export default function BrandLogo({
  variant = "navbar",
  className = "",
  showText = true,
  iconClassName = "",
  textClassName = "",
  ...rest
}) {
  return (
    <div
      className={`sm-brand sm-brand--${variant} ${className}`}
      aria-label="SkillMatch"
      {...rest}
    >
      <img
        className={`sm-brand-icon ${iconClassName}`}
        src={logo}
        alt="SkillMatch Logo"
        draggable="false"
      />

      {showText ? (
        <span className={`sm-brand-text ${textClassName}`}
          aria-label="SkillMatch"
        >
          <span className="sm-brand-skill">Skill</span>
          <span className="sm-brand-match">Match</span>
        </span>
      ) : null}
    </div>
  );
}
