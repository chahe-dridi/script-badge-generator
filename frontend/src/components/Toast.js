import React from "react";
import { useBadgeContext } from "../context/BadgeContext";

export default function Toast() {
  const { toast } = useBadgeContext();
  
  if (!toast) return null;

  // Announce to assistive tech (A5): errors are assertive, the rest polite.
  const isError = toast.type === "error";

  return (
    <div
      className={`toast toast-${toast.type}`}
      role={isError ? "alert" : "status"}
      aria-live={isError ? "assertive" : "polite"}
      aria-atomic="true"
    >
      {toast.msg}
    </div>
  );
}