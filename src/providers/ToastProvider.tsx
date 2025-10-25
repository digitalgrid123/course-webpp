"use client";

import { Toaster } from "react-hot-toast";

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3500,
        style: {
          background: "#fff",
          color: "#1A1A1A",
          fontWeight: 500,
          borderRadius: "12px",
          boxShadow: "0px 4px 12px rgba(0,0,0,0.08)",
          border: "1px solid #E5E5E5",
          padding: "14px 18px",
          fontSize: "15px",
        },
        success: {
          iconTheme: {
            primary: "#D68128",
            secondary: "#fff",
          },
        },
        error: {
          iconTheme: {
            primary: "#EF4444",
            secondary: "#fff",
          },
        },
      }}
    />
  );
}
