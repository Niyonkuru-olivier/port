"use client";

import React from "react";
import { useRouter } from "next/navigation";
import "./welcome.css";

export default function WelcomePage() {
  const router = useRouter();

  const navigateToLogin = () => {
    router.push("/login");
  };

  const navigateToCreateAccount = () => {
    alert("Redirecting to Create Account page...");
    router.push("/create-account");
  };

  return (
    <div className="host">
      <div className="container">
        <h1>Welcome to Stock Management System</h1>
        <p>Manage your stock efficiently with our powerful tools.</p>
        <div className="buttons">
          <button id="loginBtn" onClick={navigateToLogin}>Login</button>
          {/* Uncomment below if you want the Create Account button */}
          {/* <button id="createAccountBtn" onClick={navigateToCreateAccount}>Create Account</button> */}
        </div>
      </div>
    </div>
  );
}
