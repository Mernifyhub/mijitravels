"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Search, Bell, Settings, LogOut, User, ChevronDown,
  Moon, Sun, HelpCircle, Shield, Clock, AlertTriangle,
  DollarSign, Users, Ticket, Home, ChevronRight, Loader2,
  Maximize2, Minimize2, Command, Zap, X, CheckCircle2,
  XCircle, RefreshCw, Download, UserCheck, CreditCard,
  FileText, Trash2, CheckCheck,
} from "lucide-react";
import { apiClient } from "@/lib/api";

// ==================== TYPES ====================
interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  action?: string;
  createdAt?: string;
}

interface QuickAction {
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
  route: string;
}

interface UserData {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  agentName?: string;
  agentId?: string;
}

// ==================== HELPERS ====================
const getNotificationIcon = (type: string): React.ReactNode => {
  const icons: Record<string, React.ReactNode> = {
    deposit:           <DollarSign size={15} className="text-green-500" />,
    deposit_approved:  <CheckCircle2 size={15} className="text-green-500" />,
    deposit_rejected:  <XCircle size={15} className="text-red-500" />,
    booking:           <Ticket size={15} className="text-purple-500" />,
    booking_confirmed: <CheckCircle2 size={15} className="text-emerald-500" />,
    booking_cancelled: <XCircle size={15} className="text-rose-500" />,
    booking_refunded:  <DollarSign size={15} className="text-blue-500" />,
    booking_import:    <Download size={15} className="text-indigo-500" />,
    agent_registered:  <Users size={15} className="text-blue-500" />,
    agent_approved:    <UserCheck size={15} className="text-green-500" />,
    agent_suspended:   <AlertTriangle size={15} className="text-orange-500" />,
    issue_request:     <Ticket size={15} className="text-blue-500" />,
    reissue_request:   <RefreshCw size={15} className="text-purple-500" />,
    cancel_request:    <XCircle size={15} className="text-rose-500" />,
    void_request:      <AlertTriangle size={15} className="text-orange-500" />,
    refund_request:    <DollarSign size={15} className="text-teal-500" />,
    balance_alert:     <AlertTriangle size={15} className="text-amber-500" />,
    credit_limit:      <CreditCard size={15} className="text-indigo-500" />,
    manual_operation:  <FileText size={15} className="text-slate-500" />,
    system:            <Settings size={15} className="text-gray-500" />,
    alert:             <AlertTriangle size={15} className="text-orange-500" />,
    approval:          <CheckCircle2 size={15} className="text-green-500" />,
  };
  return icons[type] ?? <Bell size={15} className="text-gray-400" />;
};

const getNotificationBg = (type: string): string => {
  const map: Record<string, string> = {
    deposit:           "bg-green-100",
    deposit_approved:  "bg-green-100",
    deposit_rejected:  "bg-red-100",
    booking:           "bg-purple-100",
    booking_confirmed: "bg-emerald-100",
    booking_cancelled: "bg-rose-100",
    booking_refunded:  "bg-blue-100",
    booking_import:    "bg-indigo-100",
    agent_registered:  "bg-blue-100",
    agent_approved:    "bg-green-100",
    agent_suspended:   "bg-orange-100",
    issue_request:     "bg-blue-100",
    reissue_request:   "bg-purple-100",
    cancel_request:    "bg-rose-100",
    void_request:      "bg-orange-100",
    refund_request:    "bg-teal-100",
    balance_alert:     "bg-amber-100",
    credit_limit:      "bg-indigo-100",
    manual_operation:  "bg-slate-100",
    system:            "bg-gray-100",
    alert:             "bg-orange-100",
    approval:          "bg-green-100",
  };
  return map[type] ?? "bg-gray-100";
};

// ==================== MAIN ====================
export default function AdminTopBar() {
  const router   = useRouter();
  const pathname = usePathname();
  const searchRef = useRef<HTMLInputElement>(null);

  // ── User ──
  const [user, setUser]         = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ── UI toggles ──
  const [searchQuery, setSearchQuery]         = useState("");
  const [showSearch, setShowSearch]           = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile]         = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [isDarkMode, setIsDarkMode]           = useState(false);
  const [isFullscreen, setIsFullscreen]       = useState(false);
  const [currentTime, setCurrentTime]         = useState("");

  // ── Notifications ──
  const [notifications, setNotifications]   = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount]       = useState(0);
  const [notifLoading, setNotifLoading]     = useState(false);

  // ══════════════════════════════════
  // FETCH USER
  // ══════════════════════════════════
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await apiClient("/auth/profile");
        const u = data?.user ?? (data?.id ? data : null);
        if (u) {
          setUser({
            id:        u.id,
            firstName: u.firstName  || "",
            lastName:  u.lastName   || "",
            email:     u.email      || "",
            role:      u.role       || "USER",
            agentName: u.agentName  || "",
            agentId:   u.agentId    || "",
          });
        }
      } catch (err: any) {
        if (String(err?.message).includes("401")) router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [router]);

  // ══════════════════════════════════
  // FETCH NOTIFICATIONS — API
  // ══════════════════════════════════
  const fetchNotifications = useCallback(async () => {
    setNotifLoading(true);
    try {
      const result = await apiClient("/admin/notifications/recent");
      if (result?.data) {
        setNotifications(result.data);
        setUnreadCount(result.unreadCount ?? 0);
      }
    } catch (err) {
      console.error("Notification fetch error:", err);
    } finally {
      setNotifLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    // ✅ 30s auto-refresh
    const interval = setInterval(fetchNotifications, 30_000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // ══════════════════════════════════
  // MARK AS READ — API
  // ══════════════════════════════════
  const markAsRead = async (id: string) => {
    try {
      await apiClient(`/admin/notifications/${id}/read`, {
        method: "PATCH",
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("markAsRead error:", err);
    }
  };

  // ══════════════════════════════════
  // MARK ALL AS READ — API
  // ══════════════════════════════════
  const markAllAsRead = async () => {
    try {
      await apiClient("/admin/notifications/read-all", {
        method: "PATCH",
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("markAllAsRead error:", err);
    }
  };

  // ══════════════════════════════════
  // DELETE NOTIFICATION — API
  // ══════════════════════════════════
  const deleteNotification = async (
    e: React.MouseEvent,
    id: string,
  ) => {
    e.stopPropagation();
    try {
      await apiClient(`/admin/notifications/${id}`, {
        method: "DELETE",
      });
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setUnreadCount((prev) => {
        const wasUnread = notifications.find(
          (n) => n.id === id && !n.read
        );
        return wasUnread ? Math.max(0, prev - 1) : prev;
      });
    } catch (err) {
      console.error("deleteNotification error:", err);
    }
  };

  // ══════════════════════════════════
  // CLOCK
  // ══════════════════════════════════
  useEffect(() => {
    const tick = () =>
      setCurrentTime(
        new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // ══════════════════════════════════
  // KEYBOARD SHORTCUTS
  // ══════════════════════════════════
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setShowSearch(true);
        setTimeout(() => searchRef.current?.focus(), 100);
      }
      if (e.key === "Escape") {
        setShowSearch(false);
        setShowNotifications(false);
        setShowProfile(false);
        setShowQuickActions(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // ══════════════════════════════════
  // OUTSIDE CLICK
  // ══════════════════════════════════
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(".dropdown-container")) {
        setShowNotifications(false);
        setShowProfile(false);
        setShowQuickActions(false);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  // ══════════════════════════════════
  // FULLSCREEN
  // ══════════════════════════════════
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // ══════════════════════════════════
  // LOGOUT
  // ══════════════════════════════════
  const handleLogout = async () => {
    try {
      await apiClient("/auth/logout", { method: "POST" });
    } catch {}
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "role=;  path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/login");
  };

  // ══════════════════════════════════
  // BREADCRUMBS
  // ══════════════════════════════════
  const getBreadcrumbs = () =>
    pathname
      .split("/")
      .filter(Boolean)
      .map((path, index, arr) => ({
        label: path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, " "),
        href:  "/" + arr.slice(0, index + 1).join("/"),
        isLast: index === arr.length - 1,
      }));

  // ══════════════════════════════════
  // QUICK ACTIONS
  // ══════════════════════════════════
  const quickActions: QuickAction[] = [
    { icon: <Users size={18} />,    label: "All Agents", shortcut: "⌘A", route: "/admin/agent/all-agent" },
    { icon: <DollarSign size={18} />, label: "Deposits",  shortcut: "⌘D", route: "/admin/agent/agent-deposit-list" },
    { icon: <Ticket size={18} />,   label: "Bookings",  shortcut: "⌘B", route: "/admin/bookings" },
    { icon: <Settings size={18} />, label: "Settings",  shortcut: "⌘S", route: "/admin/settings" },
  ];

  // ══════════════════════════════════
  // USER HELPERS
  // ══════════════════════════════════
  const getUserInitials = () => {
    if (isLoading) return "..";
    if (!user) return "??";
    if (user.firstName && user.lastName)
      return (user.firstName[0] + user.lastName[0]).toUpperCase();
    if (user.firstName) return user.firstName.substring(0, 2).toUpperCase();
    if (user.email)     return user.email.substring(0, 2).toUpperCase();
    return "AD";
  };

  const getUserDisplayName = () => {
    if (isLoading) return "Loading...";
    if (!user) return "Admin";
    if (user.firstName) return `${user.firstName} ${user.lastName || ""}`.trim();
    if (user.agentName) return user.agentName;
    if (user.email)     return user.email.split("@")[0];
    return "Admin";
  };

  const getRoleDisplay = () => {
    if (isLoading || !user?.role) return "Admin";
    switch (user.role.toLowerCase()) {
      case "admin":       return "Admin";
      case "super_admin": return "Super Admin";
      case "manager":     return "Manager";
      case "user":        return "Agent";
      default:            return user.role;
    }
  };

  const getPanelName = () => {
    switch ((user?.role || "").toLowerCase()) {
      case "admin":       return "Admin Panel";
      case "super_admin": return "Super Admin Panel";
      case "manager":     return "Manager Panel";
      default:            return "Admin Panel";
    }
  };

  // ══════════════════════════════════
  // RENDER
  // ══════════════════════════════════
  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 lg:px-6 h-16">

          {/* ── Left ── */}
          <div className="flex items-center gap-4">
            {/* Logo */}
            <div
              onClick={() => router.push("/admin/dashboard")}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-[#021f3b] to-[#0a4d8c] rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all group-hover:scale-105">
                <Zap size={20} className="text-white" />
              </div>
              <div className="hidden md:block">
                <h1 className="text-lg font-bold text-[#021f3b] leading-none">
                  MIJI Portal
                </h1>
                <p className="text-[10px] text-gray-500 font-medium">
                  {getPanelName()}
                </p>
              </div>
            </div>

            <div className="hidden lg:block h-8 w-px bg-gray-200" />

            {/* Breadcrumb */}
            <nav className="hidden lg:flex items-center gap-1 text-sm">
              <button
                onClick={() => router.push("/admin/dashboard")}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition text-gray-500"
              >
                <Home size={16} />
              </button>
              {getBreadcrumbs().map((crumb, i) => (
                <div key={i} className="flex items-center gap-1">
                  <ChevronRight size={14} className="text-gray-400" />
                  {crumb.isLast ? (
                    <span className="font-medium text-gray-800 px-2 py-1 bg-gray-100 rounded-lg">
                      {crumb.label}
                    </span>
                  ) : (
                    <button
                      onClick={() => router.push(crumb.href)}
                      className="text-gray-500 hover:text-gray-700 px-2 py-1 hover:bg-gray-100 rounded-lg transition"
                    >
                      {crumb.label}
                    </button>
                  )}
                </div>
              ))}
            </nav>
          </div>

          {/* ── Right ── */}
          <div className="flex items-center gap-2">

            {/* Clock */}
            <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
              <Clock size={14} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-700 font-mono">
                {currentTime}
              </span>
            </div>

            {/* Search */}
            <button
              onClick={() => setShowSearch(true)}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition group"
            >
              <Search size={18} className="text-gray-500 group-hover:text-gray-700" />
              <span className="hidden md:inline text-sm text-gray-500">Search...</span>
              <kbd className="hidden lg:inline px-1.5 py-0.5 text-[10px] bg-white border border-gray-200 rounded text-gray-400 font-mono">
                ⌘K
              </kbd>
            </button>

            {/* Quick Actions */}
            <div className="relative dropdown-container">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowQuickActions(!showQuickActions);
                }}
                className="p-2.5 hover:bg-gray-100 rounded-xl transition hidden md:flex"
              >
                <Command size={18} className="text-gray-600" />
              </button>

              {showQuickActions && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50">
                  <div className="px-3 py-2 border-b border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 uppercase">
                      Quick Actions
                    </p>
                  </div>
                  {quickActions.map((action, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        router.push(action.route);
                        setShowQuickActions(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 transition"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500">{action.icon}</span>
                        <span className="text-sm font-medium text-gray-700">
                          {action.label}
                        </span>
                      </div>
                      {action.shortcut && (
                        <kbd className="text-[10px] px-1.5 py-0.5 bg-gray-100 rounded text-gray-400 font-mono">
                          {action.shortcut}
                        </kbd>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-2.5 hover:bg-gray-100 rounded-xl transition hidden lg:block"
            >
              {isFullscreen
                ? <Minimize2 size={18} className="text-gray-600" />
                : <Maximize2 size={18} className="text-gray-600" />}
            </button>

            {/* Dark Mode */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2.5 hover:bg-gray-100 rounded-xl transition hidden lg:block"
            >
              {isDarkMode
                ? <Sun size={18} className="text-orange-500" />
                : <Moon size={18} className="text-gray-600" />}
            </button>

            {/* ── Notifications ── */}
            <div className="relative dropdown-container">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowNotifications(!showNotifications);
                  if (!showNotifications) fetchNotifications();
                }}
                className="relative p-2.5 hover:bg-gray-100 rounded-xl transition"
              >
                <Bell size={20} className="text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">

                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#021f3b] to-[#0a4d8c] text-white">
                    <div className="flex items-center gap-2">
                      <Bell size={18} />
                      <span className="font-semibold">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Refresh */}
                      <button
                        onClick={fetchNotifications}
                        className="p-1 hover:bg-white/20 rounded-lg transition"
                        title="Refresh"
                      >
                        <RefreshCw
                          size={14}
                          className={notifLoading ? "animate-spin" : ""}
                        />
                      </button>
                      {/* Mark all read */}
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="flex items-center gap-1 text-xs text-blue-200 hover:text-white transition"
                          title="Mark all read"
                        >
                          <CheckCheck size={14} /> All read
                        </button>
                      )}
                    </div>
                  </div>

                  {/* List */}
                  <div className="max-h-[360px] overflow-y-auto divide-y divide-gray-100">
                    {notifLoading && notifications.length === 0 ? (
                      <div className="flex items-center justify-center py-10 gap-2 text-gray-400">
                        <Loader2 size={20} className="animate-spin" />
                        <span className="text-sm">Loading...</span>
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 gap-2 text-gray-400">
                        <Bell size={32} className="text-gray-300" />
                        <p className="text-sm">No notifications</p>
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            markAsRead(n.id);
                            if (n.action) router.push(n.action);
                            setShowNotifications(false);
                          }}
                          className={`group flex items-start gap-3 px-4 py-3.5 hover:bg-gray-50 cursor-pointer transition ${
                            !n.read ? "bg-blue-50/40" : ""
                          }`}
                        >
                          {/* Icon */}
                          <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${getNotificationBg(n.type)}`}>
                            {getNotificationIcon(n.type)}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className="font-semibold text-gray-800 text-sm leading-tight">
                                {n.title}
                              </p>
                              <div className="flex items-center gap-1 shrink-0">
                                {!n.read && (
                                  <span className="w-2 h-2 bg-blue-500 rounded-full" />
                                )}
                                {/* Delete button */}
                                <button
                                  onClick={(e) => deleteNotification(e, n.id)}
                                  className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-gray-200 rounded transition"
                                >
                                  <Trash2 size={12} className="text-gray-400" />
                                </button>
                              </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                              {n.message}
                            </p>
                            <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                              <Clock size={10} /> {n.time}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Footer */}
                  <div className="p-3 border-t border-gray-100 bg-gray-50 flex items-center gap-2">
                    <button
                      onClick={() => {
                        router.push("/admin/notifications");
                        setShowNotifications(false);
                      }}
                      className="flex-1 py-2 text-center text-sm font-medium text-[#021f3b] hover:bg-gray-100 rounded-lg transition"
                    >
                      View All Notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ── Profile ── */}
            <div className="relative dropdown-container">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowProfile(!showProfile);
                }}
                className="flex items-center gap-2 p-1.5 pr-3 hover:bg-gray-100 rounded-xl transition"
              >
                <div className="w-9 h-9 bg-gradient-to-br from-[#021f3b] to-[#0a4d8c] rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg">
                  {isLoading
                    ? <Loader2 size={16} className="animate-spin" />
                    : getUserInitials()}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold text-gray-800 leading-none">
                    {getUserDisplayName()}
                  </p>
                  <p className="text-[10px] text-gray-500 flex items-center gap-1">
                    <Shield size={10} /> {getRoleDisplay()}
                  </p>
                </div>
                <ChevronDown size={16} className="text-gray-400 hidden md:block" />
              </button>

              {showProfile && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                  <div className="p-4 bg-gradient-to-r from-[#021f3b] to-[#0a4d8c] text-white">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center font-bold text-lg">
                        {getUserInitials()}
                      </div>
                      <div>
                        <p className="font-semibold">{getUserDisplayName()}</p>
                        <p className="text-xs text-blue-200">{user?.email || "N/A"}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-white/20 rounded-full text-[10px]">
                          {getRoleDisplay()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="py-2">
                    {[
                      { icon: <User size={18} />,      label: "My Profile", route: "/admin/profile" },
                      { icon: <Settings size={18} />,  label: "Settings",   route: "/admin/settings" },
                      { icon: <HelpCircle size={18} />, label: "Help Center", route: "#" },
                    ].map((item) => (
                      <button
                        key={item.label}
                        onClick={() => {
                          router.push(item.route);
                          setShowProfile(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition"
                      >
                        <span className="text-gray-500">{item.icon}</span>
                        <span className="text-sm text-gray-700">{item.label}</span>
                      </button>
                    ))}
                  </div>

                  <div className="p-2 border-t border-gray-100">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition font-medium"
                    >
                      <LogOut size={18} /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── Search Modal ── */}
      {showSearch && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center gap-3 p-4 border-b border-gray-100">
              <Search size={22} className="text-gray-400" />
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search agents, bookings, deposits..."
                className="flex-1 text-lg outline-none placeholder:text-gray-400"
                autoFocus
              />
              <kbd className="px-2 py-1 text-xs bg-gray-100 rounded text-gray-500 font-mono">
                ESC
              </kbd>
              <button
                onClick={() => setShowSearch(false)}
                className="p-1.5 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-3">
                Quick Links
              </p>
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      router.push(action.route);
                      setShowSearch(false);
                    }}
                    className="flex items-center gap-3 p-3 hover:bg-gray-100 rounded-xl transition text-left"
                  >
                    <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                      {action.icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {action.label}
                      </p>
                      <p className="text-xs text-gray-500">
                        Go to {action.label.toLowerCase()}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50">
              <p className="text-xs text-gray-500">
                Press{" "}
                <kbd className="px-1.5 py-0.5 bg-white border rounded text-[10px]">ESC</kbd>
                {" "}to close
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}