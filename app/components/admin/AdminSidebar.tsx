"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Plane,
  LayoutDashboard,
  Bell,
  Percent,
  CreditCard,
  BarChart3,
  History,
  UserPlus,
  LogOut,
  ChevronDown,
  ChevronRight,
  ClipboardPen,
  FileInput,
  TicketsPlane,
  CircleDollarSign,
  Users,
  Landmark,
  Search,
  UserCircle,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  Cog,
} from "lucide-react";

type Role = "ADMIN" | "MANAGER" | "USER" | "OPERATOR" | "VIEWER";

interface SubMenuItem {
  name: string;
  route: string;
}

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  roles: Role[];
  route?: string;
  children?: SubMenuItem[];
}

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const sidebarRef = useRef<HTMLDivElement>(null);

  const [role, setRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  // Expanded mode: accordion
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null);

  // Collapsed mode: hover popup
  const [hoverMenu, setHoverMenu] = useState<string | null>(null);
  const [hoverPosition, setHoverPosition] = useState(0);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const baseRoute = useMemo(() => {
    if (!role) return "";
    if (role === "ADMIN") return "/admin";
    if (role === "MANAGER") return "/manager";
    return "/user";
  }, [role]);

  // ━━━━ MENU CONFIG ━━━━
  const menus: MenuItem[] = useMemo(
    () => [
      { icon: <LayoutDashboard size={20} />, label: "Dashboard", route: `${baseRoute}/dashboard`, roles: ["ADMIN", "MANAGER"] },
      { icon: <Bell size={20} />, label: "CMS", roles: ["ADMIN"], children: [
        { name: "Notice", route: `${baseRoute}/notice` },
        { name: "Offer", route: `${baseRoute}/offer` },
        { name: "Add Group Fare", route: `${baseRoute}/group-fare` },
      ]},
      { icon: <Percent size={20} />, label: "Markup", roles: ["ADMIN"], children: [
        { name: "Flight Markup", route: `${baseRoute}/markup` },
        { name: "Discounts", route: `${baseRoute}/discounts` },
      ]},
      { icon: <Cog size={20} />, label: "API Management", roles: ["ADMIN"], children: [
        { name: "Providers", route: `${baseRoute}/api-management` },
        { name: "Endpoints", route: `#` },
      ]},
      { icon: <TicketsPlane size={20} />, label: "All Booking", roles: ["ADMIN", "MANAGER"], children: [
        { name: "All Booking", route: `${baseRoute}/bookings/all-bookings` },
        { name: "On Hold", route: `${baseRoute}/bookings/on-hold` },
        { name: "In Process", route: `${baseRoute}/bookings/in-process` },
        { name: "Ticketed", route: `${baseRoute}/bookings/ticketed` },
        { name: "Cancelled", route: `${baseRoute}/bookings/cancelled` },
        { name: "Voided", route: `${baseRoute}/bookings/voided` },
        { name: "Refunded", route: `${baseRoute}/bookings/refunded` },
      ]},
      { icon: <FileInput size={20} />, label: "Import Bookings", roles: ["ADMIN", "MANAGER"], children: [
        { name: "UAE Import", route: `${baseRoute}/import-booking/uae` },
        { name: "KSA Import", route: `${baseRoute}/import-booking/ksa` },
        { name: "BGD Import", route: `${baseRoute}/import-booking/bgd` },
        { name: "PAK Import", route: `${baseRoute}/import-booking/pak` },
      ]},
      { icon: <Users size={20} />, label: "Agent", roles: ["ADMIN", "MANAGER"], children: [
        { name: "All Agents", route: `${baseRoute}/agent/all-agent` },
        { name: "Active Agents", route: `${baseRoute}/agent/active-agent` },
        { name: "Pending Agents", route: `${baseRoute}/agent/pending-agent` },
      ]},
      { icon: <Landmark size={20} />, label: "Account", roles: ["ADMIN"], children: [
         { name: "Currency Conversion", route: `${baseRoute}/currency`},
        { name: "Bank Account", route: `${baseRoute}/accounts/account-management` },
      ]},
      { icon: <BarChart3 size={20} />, label: "Sales", roles: ["ADMIN"], children: [
        { name: "Sales Report", route: `${baseRoute}/sales/sales-report` },
        { name: "Account Ledger", route: `${baseRoute}/sales/account-ledger` },
        { name: "All Reports", route: `${baseRoute}/sales/all-report` },
      ]},
      { icon: <ClipboardPen size={20} />, label: "Manual Operations", roles: ["ADMIN", "MANAGER"], route: `${baseRoute}/manual-operations` },
      { icon: <CircleDollarSign size={20} />, label: "Agent Deposits", roles: ["ADMIN"], route: `${baseRoute}/deposits` },
      { icon: <CreditCard size={20} />, label: "Partial Payment", roles: ["ADMIN"], route: `${baseRoute}/partial-payments` },
      { icon: <History size={20} />, label: "Search History", roles: ["ADMIN", "MANAGER"], route: `${baseRoute}/search-history` },
      { icon: <UserPlus size={20} />, label: "Agent Registration", roles: ["ADMIN", "MANAGER"], route: `${baseRoute}/agent/agent-registration` },

      // USER / OPERATOR / VIEWER
      { icon: <LayoutDashboard size={20} />, label: "Dashboard", route: `${baseRoute}/dashboard`, roles: ["USER", "OPERATOR", "VIEWER"] },
      { icon: <Search size={20} />, label: "Search Flights", route: `${baseRoute}/search`, roles: ["USER", "OPERATOR"] },
      { icon: <TicketsPlane size={20} />, label: "My Booking", roles: ["USER", "OPERATOR", "VIEWER"], children: [
        { name: "All Booking", route: `${baseRoute}/bookings/all-bookings` },
        { name: "On Hold", route: `${baseRoute}/bookings/on-hold` },
        { name: "Ticketed", route: `${baseRoute}/bookings/ticketed` },
        { name: "Cancelled", route: `${baseRoute}/bookings/cancelled` },
        { name: "Voided", route: `${baseRoute}/bookings/voided` },
        { name: "Refunded", route: `${baseRoute}/bookings/refunded` },
      ]},
      { icon: <Users size={20} />, label: "My Staff", route: `${baseRoute}/staff`, roles: ["USER"] },
      { icon: <CreditCard size={20} />, label: "My Deposit", route: `${baseRoute}/deposits`, roles: ["USER", "OPERATOR", "VIEWER"] },
      { icon: <UserCircle size={20} />, label: "My Account", route: `${baseRoute}/profile`, roles: ["USER", "OPERATOR", "VIEWER"] },
      { icon: <BarChart3 size={20} />, label: "Sale Report", roles: ["USER", "OPERATOR", "VIEWER"], children: [
        { name: "Sales Report", route: `${baseRoute}/sales/sales-report` },
        { name: "Account Ledger", route: `${baseRoute}/sales/account-ledger` },
        { name: "All Reports", route: `${baseRoute}/sales/all-report` },
      ]},
    ],
    [baseRoute]
  );

  const filteredMenu = useMemo(
    () => menus.filter((item) => role && item.roles.includes(role)),
    [menus, role]
  );

  useEffect(() => {
    const storedRole = localStorage.getItem("role") as Role | null;
    setRole(storedRole);
    setIsLoading(false);
  }, []);

  // Close on route change
  useEffect(() => {
    setActiveAccordion(null);
    setHoverMenu(null);
  }, [pathname]);

  // Close popup on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        setHoverMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isMenuActive = useCallback(
    (menu: MenuItem): boolean => {
      if (menu.route && pathname === menu.route) return true;
      if (menu.children) return menu.children.some((c) => pathname === c.route);
      return false;
    },
    [pathname]
  );

  // ✅ Expanded mode: click to accordion
  const handleExpandedClick = useCallback(
    (menu: MenuItem) => {
      if (menu.children) {
        setActiveAccordion((prev) => (prev === menu.label ? null : menu.label));
      } else if (menu.route) {
        router.push(menu.route);
        setActiveAccordion(null);
      }
    },
    [router]
  );

  // ✅ Collapsed mode: click on simple menu
  const handleCollapsedClick = useCallback(
    (menu: MenuItem) => {
      if (!menu.children && menu.route) {
        router.push(menu.route);
        setHoverMenu(null);
      }
    },
    [router]
  );

  // ✅ Collapsed mode: hover to show popup
  const handleMouseEnter = useCallback(
    (menu: MenuItem, e: React.MouseEvent) => {
      if (isExpanded) return;
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);

      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      setHoverPosition(rect.top);
      setHoverMenu(menu.label);
    },
    [isExpanded]
  );

  const handleMouseLeaveIcon = useCallback(() => {
    if (isExpanded) return;
    hoverTimeoutRef.current = setTimeout(() => {
      setHoverMenu(null);
    }, 300);
  }, [isExpanded]);

  const handleMouseEnterPopup = useCallback(() => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
  }, []);

  const handleMouseLeavePopup = useCallback(() => {
    hoverTimeoutRef.current = setTimeout(() => {
      setHoverMenu(null);
    }, 200);
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await fetch("http://localhost:3001/api/v1/logout", { method: "POST" });
      localStorage.removeItem("role");
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }, [router]);

  if (isLoading) {
    return (
      <div className="w-64 h-screen bg-[#021f3b] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white" />
      </div>
    );
  }

  if (!role) return null;

  const sidebarWidth = isExpanded ? "w-64" : "w-[72px]";

  return (
    <div ref={sidebarRef} className="relative z-50">
      <aside
        className={`
          h-screen bg-gradient-to-b from-[#021f3b] to-[#032a4d]
          text-white transition-all duration-300 ease-in-out
          shadow-2xl flex flex-col sticky top-0 left-0
          border-r border-blue-900/30
          ${sidebarWidth}
        `}
      >
        {/* ━━━━ HEADER: Plane Icon ━━━━ */}
        <header className="flex items-center justify-between px-4 py-4 border-b border-blue-900/30">
          <button
            onClick={() => {
              setIsExpanded((prev) => !prev);
              setActiveAccordion(null);
              setHoverMenu(null);
            }}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-700 flex items-center justify-center shadow-lg shadow-indigo-900/50 hover:shadow-indigo-700/60 transition-all active:scale-95 group"
            aria-label="Toggle Sidebar"
          >
            <Plane
              size={18}
              className="text-white rotate-0 group-hover:rotate-45 transition-transform duration-300"
            />
          </button>

          {isExpanded && (
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end">
                <span className="text-[13px] font-black text-white tracking-tight leading-none">
                  MIJI Portal
                </span>
                <span className="text-[9px] font-medium text-blue-300 uppercase tracking-widest mt-0.5">
                  {role}
                </span>
              </div>
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            </div>
          )}
        </header>

        {/* ━━━━ MENU ━━━━ */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-3 space-y-0.5 custom-scrollbar">
          {filteredMenu.map((menu, index) => {
            const isActive = isMenuActive(menu);
            const hasChildren = Boolean(menu.children);
            const isAccordionOpen = activeAccordion === menu.label;
            const isHovered = hoverMenu === menu.label;

            return (
              <div key={index} className="relative">

                {/* ━━━━ MENU BUTTON ━━━━ */}
                <button
                  onClick={() => {
                    if (isExpanded) {
                      handleExpandedClick(menu);
                    } else {
                      handleCollapsedClick(menu);
                    }
                  }}
                  onMouseEnter={(e) => handleMouseEnter(menu, e)}
                  onMouseLeave={handleMouseLeaveIcon}
                  className={`
                    w-full flex items-center
                    ${isExpanded ? "justify-between px-4" : "justify-center px-2"}
                    py-2.5 rounded-lg transition-all duration-200
                    group relative overflow-hidden
                    ${
                      isActive
                        ? "bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg shadow-blue-900/50"
                        : isHovered && !isExpanded
                        ? "bg-blue-800/40"
                        : "hover:bg-blue-800/30"
                    }
                  `}
                >
                  {/* Active bar */}
                  {isActive && (
                    <div className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-blue-300 rounded-r-full" />
                  )}

                  <div className={`flex items-center ${isExpanded ? "gap-3 flex-1" : ""}`}>
                    <span
                      className={`transition-transform duration-200 flex-shrink-0
                        ${isActive ? "text-white scale-110" : "text-blue-200 group-hover:text-white group-hover:scale-105"}`}
                    >
                      {menu.icon}
                    </span>

                    {isExpanded && (
                      <span
                        className={`text-[13px] font-medium transition-colors truncate
                          ${isActive ? "text-white" : "text-blue-100"}`}
                      >
                        {menu.label}
                      </span>
                    )}
                  </div>

                  {/* Chevron (expanded + has children) */}
                  {hasChildren && isExpanded && (
                    <ChevronDown
                      size={16}
                      className={`text-blue-200 transition-transform duration-300 flex-shrink-0
                        ${isAccordionOpen ? "rotate-180" : ""}`}
                    />
                  )}

                  {/* Tooltip (collapsed + no children) */}
                  {!isExpanded && !hasChildren && (
                    <div className="absolute left-full ml-3 px-3 py-2 bg-[#0A1128] text-white text-[12px] font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-[200] shadow-xl border border-white/10">
                      {menu.label}
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-[#0A1128] rotate-45 border-l border-b border-white/10" />
                    </div>
                  )}
                </button>

                {/* ━━━━ EXPANDED: Accordion Sub-menu ━━━━ */}
                {hasChildren && isExpanded && isAccordionOpen && (
                  <div className="mt-1 ml-4 space-y-0.5 pl-6 border-l-2 border-blue-800/30 pb-1">
                    {menu.children!.map((subItem, subIndex) => {
                      const isSubActive = pathname === subItem.route;

                      return (
                        <button
                          key={subIndex}
                          onClick={() => {
                            router.push(subItem.route);
                            setActiveAccordion(null);
                          }}
                          className={`
                            w-full text-left px-4 py-2 rounded-md
                            text-[13px] transition-all duration-200 relative
                            ${
                              isSubActive
                                ? "bg-blue-600 text-white font-semibold shadow-md"
                                : "text-blue-200 hover:bg-blue-800/30 hover:text-white"
                            }
                          `}
                        >
                          {isSubActive && (
                            <span className="absolute left-0 top-1 bottom-1 w-[3px] bg-blue-300 rounded-r-full" />
                          )}
                          <span className="relative z-10">{subItem.name}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* ━━━━ COLLAPSED: Hover Popup Sub-menu ━━━━ */}
                {hasChildren && !isExpanded && isHovered && (
                  <div
                    className="fixed z-[200]"
                    style={{
                      left: "72px",
                      top: `${Math.min(hoverPosition, window.innerHeight - 320)}px`,
                    }}
                    onMouseEnter={handleMouseEnterPopup}
                    onMouseLeave={handleMouseLeavePopup}
                  >
                    <div className="bg-[#0A1128] border border-white/10 rounded-2xl shadow-2xl shadow-black/50 min-w-[220px] overflow-hidden ml-2">

                      {/* Popup Header */}
                      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/5">
                        <span className="text-indigo-400">{menu.icon}</span>
                        <span className="text-sm font-bold text-white">{menu.label}</span>
                      </div>

                      {/* Popup Items */}
                      <div className="py-1.5 px-2 space-y-0.5 max-h-[280px] overflow-y-auto custom-scrollbar">
                        {menu.children!.map((subItem, subIndex) => {
                          const isSubActive = pathname === subItem.route;

                          return (
                            <button
                              key={subIndex}
                              onClick={() => {
                                router.push(subItem.route);
                                setHoverMenu(null);
                              }}
                              className={`
                                w-full text-left px-3 py-2.5 rounded-xl text-[13px]
                                transition-all duration-200 flex items-center gap-2 group/sub
                                ${
                                  isSubActive
                                    ? "bg-indigo-600 text-white font-bold shadow-md"
                                    : "text-blue-200 hover:bg-white/10 hover:text-white"
                                }
                              `}
                            >
                              {isSubActive && (
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-300 flex-shrink-0" />
                              )}
                              <span>{subItem.name}</span>
                              <ChevronRight
                                size={12}
                                className="ml-auto opacity-0 group-hover/sub:opacity-100 transition-opacity text-white/30"
                              />
                            </button>
                          );
                        })}
                      </div>

                      {/* Arrow */}
                      <div className="absolute left-0 top-5 -translate-x-[5px] w-2.5 h-2.5 bg-[#0A1128] rotate-45 border-l border-b border-white/10" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* ━━━━ FOOTER ━━━━ */}
        <footer className="px-3 py-3 border-t border-blue-900/30 space-y-2">

          {/* Collapse toggle hint */}
          {isExpanded && (
            <button
              onClick={() => {
                setIsExpanded(false);
                setActiveAccordion(null);
              }}
              className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-blue-300 hover:bg-blue-800/30 hover:text-white transition-all group"
            >
              <PanelLeftClose size={18} className="group-hover:scale-110 transition-transform" />
              <span className="text-[12px] font-medium">Collapse</span>
            </button>
          )}

          {!isExpanded && (
            <button
              onClick={() => setIsExpanded(true)}
              className="w-full flex items-center justify-center py-2 rounded-lg text-blue-300 hover:bg-blue-800/30 hover:text-white transition-all group"
            >
              <PanelLeftOpen size={18} className="group-hover:scale-110 transition-transform" />
            </button>
          )}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className={`w-full flex items-center ${isExpanded ? "gap-3 px-4" : "justify-center"} py-2.5 rounded-lg transition-all duration-200 hover:bg-red-900/20 group`}
          >
            <LogOut size={18} className="text-red-400 group-hover:scale-110 transition-transform" />
            {isExpanded && (
              <span className="text-[13px] font-medium text-red-400 group-hover:text-red-300">Log Out</span>
            )}
          </button>
        </footer>
      </aside>
    </div>
  );
}