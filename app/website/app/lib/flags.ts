/** When true, the dashboard link is hidden from navigation. */
export const isDashboardOff = import.meta.env.VITE_DASHBOARD_OFF === "true";

/** URL of the separately-deployed dashboard app. */
export const dashboardUrl =
  import.meta.env.VITE_DASHBOARD_URL ?? "http://localhost:5174";
