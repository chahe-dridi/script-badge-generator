import React from "react";
import { useBadgeContext } from "../context/BadgeContext";

export default function Toast() {
  const { toast } = useBadgeContext();
  
  if (!toast) return null;
  
  return <div className={`toast toast-${toast.type}`}>{toast.msg}</div>;
}