// app/components/flight/helpers.ts

export const formatTime = (dt: string) =>
  new Date(dt).toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit", hour12: false,
  });

export const formatDate = (dt: string) =>
  new Date(dt).toLocaleDateString("en-US", {
    day: "2-digit", month: "short", year: "numeric",
  });

export const formatDuration = (dur: string) => {
  const h = dur.match(/(\d+)H/)?.[1] || "0";
  const m = dur.match(/(\d+)M/)?.[1] || "0";
  return `${h}h ${m}m`;
};

export const fmtMoney = (amount: number, currency: string) =>
  `${currency} ${Math.round(amount).toLocaleString()}`;