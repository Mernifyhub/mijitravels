"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Search, Bell, Settings, LogOut, User, ChevronDown, Moon, Sun,
  HelpCircle, Clock, AlertTriangle, DollarSign, Ticket, Home,
  ChevronRight, Loader2, Maximize2, Minimize2, Command, Zap, X,
  Wallet, PlaneTakeoff, FileText, CheckCircle, Shield, Trash2,
} from "lucide-react";
import { apiClient } from "@/lib/api";

interface Notification {
  id: string;
  type: "deposit" | "booking" | "alert" | "system" | "approval";
  title: string;
  message: string;
  time: string;
  read: boolean;
  action?: string;
}

interface NotificationMeta {
  total: number;
  unreadCount: number;
  page: number;
  totalPages: number;
}

interface QuickAction {
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
  route: string;
}

interface UserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  name?: string;
  agentId?: string;
  agentName?: string;
  companyName?: string;
  logo?: string;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL
  ? process.env.NEXT_PUBLIC_API_URL.replace("/api/v1", "")
  : "http://localhost:3001";

const getSafeLogo = (logo: string): string => {
  if (!logo) return "";
  if (logo.startsWith("http")) return logo;
  const normalized = logo.replace(/\\/g, "/");
  if (/^[A-Z]:\//.test(normalized)) return "";
  if (normalized.startsWith("/")) return `${BACKEND_URL}${normalized}`;
  return `${BACKEND_URL}/${normalized}`;
};

export default function AgentTopBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifMeta, setNotifMeta] = useState<NotificationMeta | null>(null);
  const [notifLoading, setNotifLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // ── Fetch User ──
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await apiClient("/auth/profile");
        const userData = data?.user || (data?.id ? data : null);
        if (userData) {
          setUser({
            firstName: userData.firstName || "",
            lastName: userData.lastName || "",
            email: userData.email || "",
            role: userData.role || "USER",
            agentId: userData.agentId || "",
            agentName: userData.agentName || "",
            logo: userData.logo || "",
          });
        }
      } catch (error: any) {
        if (String(error?.message).includes("401")) router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [router]);

  // ── Fetch Notifications ──
  const fetchNotifications = useCallback(async (silent = false) => {
    if (!silent) setNotifLoading(true);
    try {
      const res = await apiClient("/agent/notifications?page=1&limit=10");
      if (res?.success) {
        setNotifications(res.data);
        setNotifMeta(res.meta);
        setUnreadCount(res.meta?.unreadCount || 0);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setNotifLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    pollRef.current = setInterval(() => fetchNotifications(true), 30000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchNotifications]);

  // ── Clock ──
  useEffect(() => {
    const tick = () => {
      setCurrentTime(
        new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // ── Keyboard ──
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
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
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // ── Outside click ──
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(".dropdown-container")) {
        setShowNotifications(false);
        setShowProfile(false);
        setShowQuickActions(false);
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleLogout = async () => {
    try {
      await apiClient("/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      document.cookie =
        "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie =
        "role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("userId");
      localStorage.removeItem("userName");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userType");
      router.push("/login");
    }
  };

  // ── Notification Actions ──
  const markAsRead = async (id: string) => {
    try {
      await apiClient(`/agent/notifications/${id}/read`, { method: "PATCH" });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Mark as read failed:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiClient("/agent/notifications/mark-all-read", {
        method: "PATCH",
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Mark all read failed:", err);
    }
  };

  const deleteNotification = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await apiClient(`/agent/notifications/${id}`, { method: "DELETE" });
      const deleted = notifications.find((n) => n.id === id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (deleted && !deleted.read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      setNotifMeta((prev) =>
        prev ? { ...prev, total: prev.total - 1 } : prev
      );
    } catch (err) {
      console.error("Delete notification failed:", err);
    }
  };

  const clearAll = async () => {
    try {
      await apiClient("/agent/notifications/clear-all", {
        method: "DELETE",
      });
      setNotifications([]);
      setUnreadCount(0);
      setNotifMeta(null);
    } catch (err) {
      console.error("Clear all failed:", err);
    }
  };

  // ── Helpers ──
  const getNotificationIcon = (type: string) => {
    const map: Record<string, React.ReactNode> = {
      deposit: <DollarSign size={16} className="text-green-500" />,
      approval: <CheckCircle size={16} className="text-emerald-500" />,
      booking: <Ticket size={16} className="text-purple-500" />,
      alert: <AlertTriangle size={16} className="text-orange-500" />,
      system: <Settings size={16} className="text-gray-500" />,
    };
    return map[type] || <Bell size={16} />;
  };

  const getNotificationBg = (type: string) => {
    const map: Record<string, string> = {
      approval: "bg-emerald-100",
      deposit: "bg-green-100",
      booking: "bg-purple-100",
      alert: "bg-orange-100",
      system: "bg-gray-100",
    };
    return map[type] || "bg-gray-100";
  };

  const getBreadcrumbs = () => {
    const paths = pathname.split("/").filter(Boolean);
    return paths.map((path, index) => ({
      label:
        path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, " "),
      href: "/" + paths.slice(0, index + 1).join("/"),
      isLast: index === paths.length - 1,
    }));
  };

  const getUserInitials = () => {
    if (isLoading) return "..";
    if (!user) return "??";
    if (user.firstName && user.lastName)
      return (user.firstName[0] + user.lastName[0]).toUpperCase();
    if (user.firstName)
      return user.firstName.substring(0, 2).toUpperCase();
    if (user.name) {
      const parts = user.name.split(" ");
      return parts.length >= 2
        ? (parts[0][0] + parts[1][0]).toUpperCase()
        : user.name.substring(0, 2).toUpperCase();
    }
    if (user.email) return user.email.substring(0, 2).toUpperCase();
    return "AG";
  };

  const getUserDisplayName = () => {
    if (isLoading) return "Loading...";
    if (!user) return "Guest";
    if (user.firstName)
      return `${user.firstName} ${user.lastName || ""}`.trim();
    if (user.name) return user.name;
    if (user.agentName) return user.agentName;
    if (user.email) return user.email.split("@")[0];
    return "Agent";
  };

  const getRoleDisplayName = () => {
    if (!user?.role) return "Agent";
    const r = user.role.toLowerCase().trim();
    if (r === "agent") return "Agent";
    if (r === "admin") return "Admin";
    if (r === "superadmin" || r === "super_admin") return "Super Admin";
    return r.charAt(0).toUpperCase() + r.slice(1);
  };

  const quickActions: QuickAction[] = [
    {
      icon: <Wallet size={18} />,
      label: "My Deposits",
      shortcut: "⌘D",
      route: "/user/deposits",
    },
    {
      icon: <PlaneTakeoff size={18} />,
      label: "New Booking",
      shortcut: "⌘B",
      route: "/user/search",
    },
    {
      icon: <FileText size={18} />,
      label: "My Bookings",
      shortcut: "⌘M",
      route: "/user/bookings/all-bookings",
    },
    {
      icon: <Settings size={18} />,
      label: "Settings",
      shortcut: "⌘S",
      route: "/user/profile",
    },
  ];

  const safeLogo = getSafeLogo(user?.logo || "");

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 lg:px-6 h-16">
          {/* ── Left ── */}
          <div className="flex items-center gap-4">
            <div
              onClick={() => router.push("/user/dashboard")}
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
                  Agent Panel
                </p>
              </div>
            </div>

            <div className="hidden lg:block h-8 w-px bg-gray-200" />

            <nav className="hidden lg:flex items-center gap-1 text-sm">
              <button
                onClick={() => router.push("/user/dashboard")}
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
              <Search size={18} className="text-gray-500" />
              <span className="hidden md:inline text-sm text-gray-500">
                Search...
              </span>
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
                        <div className="text-gray-500">{action.icon}</div>
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
              {isFullscreen ? (
                <Minimize2 size={18} className="text-gray-600" />
              ) : (
                <Maximize2 size={18} className="text-gray-600" />
              )}
            </button>

            {/* Dark Mode */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2.5 hover:bg-gray-100 rounded-xl transition hidden lg:block"
            >
              {isDarkMode ? (
                <Sun size={18} className="text-orange-500" />
              ) : (
                <Moon size={18} className="text-gray-600" />
              )}
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
                    <div className="flex items-center gap-3">
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-blue-200 hover:text-white transition"
                        >
                          Mark all read
                        </button>
                      )}
                      {notifications.length > 0 && (
                        <button
                          onClick={clearAll}
                          className="text-xs text-red-300 hover:text-red-100 transition"
                        >
                          Clear all
                        </button>
                      )}
                    </div>
                  </div>

                  {/* ✅ FIXED Notification List */}
                  <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                    {notifLoading ? (
                      <div className="flex items-center justify-center p-8">
                        <Loader2
                          size={24}
                          className="animate-spin text-gray-400"
                        />
                      </div>
                    ) : notifications.length > 0 ? (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            if (!n.read) markAsRead(n.id);
                            if (n.action) router.push(n.action);
                            setShowNotifications(false);
                          }}
                          className={`flex items-start gap-3 p-4 hover:bg-gray-50 cursor-pointer transition group ${
                            !n.read ? "bg-blue-50/50" : ""
                          }`}
                        >
                          {/* Icon */}
                          <div
                            className={`p-2 rounded-xl flex-shrink-0 ${getNotificationBg(
                              n.type
                            )}`}
                          >
                            {getNotificationIcon(n.type)}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-gray-800 text-sm truncate flex-1">
                                {n.title}
                              </p>

                              {/* ✅ Unread dot + Delete in same row */}
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                {!n.read && (
                                  <span className="w-2 h-2 bg-blue-500 rounded-full" />
                                )}
                                <button
                                  onClick={(e) => deleteNotification(e, n.id)}
                                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded-lg transition"
                                  title="Delete"
                                >
                                  <Trash2
                                    size={13}
                                    className="text-red-400"
                                  />
                                </button>
                              </div>
                            </div>

                            <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                              {n.message}
                            </p>
                            <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                              <Clock size={10} /> {n.time}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Bell size={28} className="text-gray-300" />
                        </div>
                        <p className="text-gray-500 text-sm font-medium">
                          No notifications
                        </p>
                        <p className="text-gray-400 text-xs mt-1">
                          You&apos;re all caught up!
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  {notifications.length > 0 && (
                    <div className="p-3 border-t border-gray-100 bg-gray-50">
                      <button
                        onClick={() => {
                          router.push("#");
                          setShowNotifications(false);
                        }}
                        className="w-full py-2 text-center text-sm font-medium text-[#021f3b] hover:bg-gray-100 rounded-lg transition"
                      >
                        View All Notifications
                        {notifMeta && notifMeta.total > 10 && (
                          <span className="text-gray-400 ml-1">
                            ({notifMeta.total})
                          </span>
                        )}
                      </button>
                    </div>
                  )}
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
                <div className="w-9 h-9 bg-gradient-to-br from-[#021f3b] to-[#0a4d8c] rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg overflow-hidden">
                  {isLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : safeLogo ? (
                    <img
                      src={safeLogo}
                      alt="Logo"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    getUserInitials()
                  )}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold text-gray-800 leading-none">
                    {user?.agentName || getUserDisplayName()}
                  </p>
                  <p className="text-[10px] text-gray-500 flex items-center gap-1">
                    <Shield size={10} /> {getRoleDisplayName()}
                  </p>
                </div>
                <ChevronDown
                  size={16}
                  className="text-gray-400 hidden md:block"
                />
              </button>

              {showProfile && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                  <div className="p-4 bg-gradient-to-r from-[#021f3b] to-[#0a4d8c] text-white">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center font-bold text-lg overflow-hidden">
                        {safeLogo ? (
                          <img
                            src={safeLogo}
                            alt="Logo"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          getUserInitials()
                        )}
                      </div>
                      <div>
                        <p className="font-semibold">
                          {getUserDisplayName()}
                        </p>
                        <p className="text-xs text-blue-200">
                          {user?.email || "N/A"}
                        </p>
                        {user?.agentId && (
                          <p className="text-xs text-blue-300 font-mono mt-0.5">
                            ID: {user.agentId}
                          </p>
                        )}
                        <span className="inline-block mt-1 px-2 py-0.5 bg-white/20 rounded-full text-[10px]">
                          {getRoleDisplayName()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="py-2">
                    {[
                      {
                        icon: <User size={18} />,
                        label: "My Profile",
                        route: "/user/profile",
                      },
                      {
                        icon: <Wallet size={18} />,
                        label: "My Deposits",
                        route: "/user/deposits",
                      },
                      {
                        icon: <Settings size={18} />,
                        label: "Settings",
                        route: "/user/profile",
                      },
                      {
                        icon: <HelpCircle size={18} />,
                        label: "Help Center",
                        route: "#",
                      },
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
                        <span className="text-sm text-gray-700">
                          {item.label}
                        </span>
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
                placeholder="Search bookings, deposits..."
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
                <kbd className="px-1.5 py-0.5 bg-white border rounded text-[10px]">
                  ↵
                </kbd>{" "}
                to search or{" "}
                <kbd className="px-1.5 py-0.5 bg-white border rounded text-[10px]">
                  ESC
                </kbd>{" "}
                to close
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}