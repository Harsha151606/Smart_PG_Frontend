import React from "react";
import { useNavigate } from "react-router-dom";
import { SmartPgLogo, DashboardIcon } from "./Icons";

function NotFound() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #070F1B 0%, #0B192C 60%, #132A46 100%)",
        color: "#FFFFFF",
        padding: "24px"
      }}
    >
      <div
        style={{
          maxWidth: "520px",
          width: "100%",
          textAlign: "center",
          background: "rgba(19, 42, 70, 0.75)",
          padding: "48px 36px",
          borderRadius: "18px",
          border: "1.5px solid rgba(212, 175, 55, 0.35)",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.45)",
          backdropFilter: "blur(10px)"
        }}
      >
        <div
          style={{
            display: "inline-flex",
            padding: "16px",
            borderRadius: "50%",
            background: "rgba(212, 175, 55, 0.12)",
            border: "1.5px solid #D4AF37",
            marginBottom: "20px"
          }}
        >
          <SmartPgLogo size={48} />
        </div>

        <h1
          style={{
            fontSize: "48px",
            fontWeight: "900",
            color: "#FBBF24",
            fontFamily: "var(--font-heading)",
            letterSpacing: "-0.03em",
            marginBottom: "8px"
          }}
        >
          404
        </h1>
        <h2
          style={{
            fontSize: "22px",
            fontWeight: "700",
            color: "#FFFFFF",
            marginBottom: "12px"
          }}
        >
          Page Not Found
        </h2>
        <p
          style={{
            color: "rgba(241, 245, 249, 0.8)",
            fontSize: "15px",
            lineHeight: "1.6",
            marginBottom: "28px"
          }}
        >
          The page or destination URL you requested does not exist or has been relocated within the Smart PG portal.
        </p>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <button
            onClick={() => navigate(token ? "/dashboard" : "/login")}
            className="btn-grand btn-gold-grand"
            style={{ padding: "12px 28px", fontSize: "14px" }}
          >
            <DashboardIcon size={18} />
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
