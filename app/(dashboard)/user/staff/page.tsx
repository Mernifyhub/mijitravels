"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  Users, UserPlus, Edit, Trash2, Eye, EyeOff, Shield,
  CheckCircle, XCircle, Search, RefreshCw, X, ChevronDown,
  Clock, Activity, Key, Mail, Phone, AlertTriangle, Info,
  Loader2, Lock, Unlock, MoreVertical, UserCheck, UserX,
  CreditCard, BarChart3, ChevronRight, CheckCircle2, AlertCircle,
  LayoutDashboard, TicketsPlane, UserCircle,
} from "lucide-react";
import AgentTopBar from "@/app/components/agent/AgentTopBar";
import { apiClient } from "@/lib/api";

// ==================== TYPES ====================
interface SubUser {
  id: string;
  username: string;
  email?: string;
  phone?: string;
  fullName?: string;
  role: "USER" | "OPERATOR" | "VIEWER";
  isActive: boolean;
  createdAt: string;
  lastLogin: string | null;
  depositsCreated: number;
  withdrawalsCreated: number;
  permissions: Permission[];
}

interface Permission {
  key: string;
  label: string;
  description: string;
  category: string;
  enabled: boolean;
}

interface Stats {
  total: number;
  active: number;
  inactive: number;
}

interface ToastItem {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
}

// ==================== CONSTANTS ====================
const ALL_PERMISSIONS: Permission[] = [
  // Dashboard
  { key: "dashboard.view", label: "View Dashboard", description: "Can access the main dashboard", category: "Dashboard", enabled: false },
  // Search Flights
  { key: "search.flights", label: "Search Flights", description: "Can search and view flight results", category: "Search Flights", enabled: false },
  // Bookings
  { key: "bookings.view", label: "View Bookings", description: "Can view all booking lists", category: "My Booking", enabled: false },
  { key: "bookings.create", label: "Create Bookings", description: "Can create new flight bookings", category: "My Booking", enabled: false },
  { key: "bookings.cancel", label: "Cancel Bookings", description: "Can cancel existing bookings", category: "My Booking", enabled: false },
  { key: "bookings.void", label: "Void Bookings", description: "Can void ticketed bookings", category: "My Booking", enabled: false },
  { key: "bookings.refund", label: "Refund Bookings", description: "Can request booking refunds", category: "My Booking", enabled: false },
  // Deposits
  { key: "deposits.view", label: "View Deposits", description: "Can view deposit list and history", category: "My Deposit", enabled: false },
  { key: "deposits.create", label: "Create Deposits", description: "Can create new deposit requests", category: "My Deposit", enabled: false },
  // Staff
  { key: "staff.view", label: "View Staff", description: "Can view staff/sub-user list", category: "My Staff", enabled: false },
  { key: "staff.manage", label: "Manage Staff", description: "Can create, edit, delete sub-users", category: "My Staff", enabled: false },
  // Profile
  { key: "profile.view", label: "View Profile", description: "Can view account profile info", category: "My Account", enabled: false },
  { key: "profile.edit", label: "Edit Profile", description: "Can edit profile & change password", category: "My Account", enabled: false },
  // Reports
  { key: "reports.sales", label: "Sales Report", description: "Can view sales report", category: "Sale Report", enabled: false },
  { key: "reports.ledger", label: "Account Ledger", description: "Can view account ledger", category: "Sale Report", enabled: false },
  { key: "reports.all", label: "All Reports", description: "Can view all reports", category: "Sale Report", enabled: false },
];

const ROLE_PRESETS: Record<string, string[]> = {
  USER: ALL_PERMISSIONS.map((p) => p.key),
  OPERATOR: [
    "dashboard.view", "search.flights",
    "bookings.view", "bookings.create", "bookings.cancel",
    "deposits.view", "deposits.create",
    "profile.view",
    "reports.sales", "reports.ledger",
  ],
  VIEWER: [
    "dashboard.view",
    "bookings.view",
    "deposits.view",
    "profile.view",
    "reports.sales",
  ],
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Dashboard: <LayoutDashboard size={16} className="text-blue-600" />,
  "Search Flights": <Search size={16} className="text-indigo-600" />,
  "My Booking": <TicketsPlane size={16} className="text-purple-600" />,
  "My Deposit": <CreditCard size={16} className="text-green-600" />,
  "My Staff": <Users size={16} className="text-orange-600" />,
  "My Account": <UserCircle size={16} className="text-cyan-600" />,
  "Sale Report": <BarChart3 size={16} className="text-rose-600" />,
};

const ROLE_OPTIONS = [
  { id: "USER" as const, label: "User", desc: "Full access", cls: "border-emerald-300 bg-emerald-50", activeCls: "border-emerald-500 bg-emerald-100 ring-2 ring-emerald-200" },
  { id: "OPERATOR" as const, label: "Operator", desc: "Create & manage", cls: "border-blue-300 bg-blue-50", activeCls: "border-blue-500 bg-blue-100 ring-2 ring-blue-200" },
  { id: "VIEWER" as const, label: "Viewer", desc: "View only", cls: "border-gray-300 bg-gray-50", activeCls: "border-gray-500 bg-gray-100 ring-2 ring-gray-200" },
];

const groupedPermissions = ALL_PERMISSIONS.reduce((acc, p) => {
  if (!acc[p.category]) acc[p.category] = [];
  acc[p.category].push(p);
  return acc;
}, {} as Record<string, Permission[]>);

// ==================== HELPERS ====================
const fmtDateTime = (s: string) =>
  new Date(s).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

const timeAgo = (s: string) => {
  const diff = Date.now() - new Date(s).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return fmtDateTime(s);
};

const buildPermissionsFromPreset = (role: string): Record<string, boolean> => {
  const preset = ROLE_PRESETS[role] || [];
  const perms: Record<string, boolean> = {};
  ALL_PERMISSIONS.forEach((p) => {
    perms[p.key] = preset.includes(p.key);
  });
  return perms;
};

// ==================== TOAST ====================
function ToastContainer({ toasts, onRemove }: { toasts: ToastItem[]; onRemove: (id: string) => void }) {
  const configs = {
    success: { cls: "bg-emerald-500", icon: <CheckCircle2 size={17} /> },
    error: { cls: "bg-red-500", icon: <XCircle size={17} /> },
    info: { cls: "bg-blue-500", icon: <Info size={17} /> },
    warning: { cls: "bg-amber-500", icon: <AlertCircle size={17} /> },
  };
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
      {toasts.map((t) => {
        const cfg = configs[t.type];
        return (
          <div key={t.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-white min-w-72 animate-slide-up ${cfg.cls}`}>
            {cfg.icon}
            <span className="text-sm font-medium flex-1">{t.message}</span>
            <button onClick={() => onRemove(t.id)} className="hover:opacity-75"><X size={15} /></button>
          </div>
        );
      })}
    </div>
  );
}

// ==================== ROLE BADGE ====================
function RoleBadge({ role }: { role: string }) {
  const cfg: Record<string, { cls: string; icon: React.ReactNode }> = {
    USER: { cls: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: <Shield size={12} /> },
    OPERATOR: { cls: "bg-blue-100 text-blue-700 border-blue-200", icon: <Activity size={12} /> },
    VIEWER: { cls: "bg-gray-100 text-gray-600 border-gray-200", icon: <Eye size={12} /> },
  };
  const c = cfg[role] || cfg.VIEWER;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${c.cls}`}>
      {c.icon} {role}
    </span>
  );
}

// ==================== PORTAL DROPDOWN ====================
function ActionDropdown({
  user,
  buttonRef,
  onClose,
  onView,
  onEdit,
  onToggle,
  onDelete,
  togglingId,
}: {
  user: SubUser;
  buttonRef: HTMLButtonElement | null;
  onClose: () => void;
  onView: (u: SubUser) => void;
  onEdit: (u: SubUser) => void;
  onToggle: (u: SubUser) => void;
  onDelete: (u: SubUser) => void;
  togglingId: string | null;
}) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!buttonRef) return;
    const updatePos = () => {
      const rect = buttonRef.getBoundingClientRect();
      const dropdownW = 208;
      const dropdownH = 220;
      const vH = window.innerHeight;
      const vW = window.innerWidth;

      let top = rect.bottom + 8;
      let left = rect.right - dropdownW;

      if (top + dropdownH > vH) top = rect.top - dropdownH - 8;
      if (left < 8) left = 8;
      if (left + dropdownW > vW - 8) left = vW - dropdownW - 8;

      setPos({ top, left });
    };
    updatePos();
    window.addEventListener("scroll", onClose, true);
    window.addEventListener("resize", onClose);
    return () => {
      window.removeEventListener("scroll", onClose, true);
      window.removeEventListener("resize", onClose);
    };
  }, [buttonRef, onClose]);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (dropdownRef.current && !dropdownRef.current.contains(target) && buttonRef && !buttonRef.contains(target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [onClose, buttonRef]);

  if (!pos) return null;

  return createPortal(
    <div ref={dropdownRef} className="fixed w-52 bg-white rounded-xl shadow-2xl border border-gray-100 py-1.5 z-[9999] animate-dropdown" style={{ top: pos.top, left: pos.left }}>
      <button type="button" onClick={() => { onClose(); setTimeout(() => onView(user), 0); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-gray-50 text-sm text-gray-700 transition text-left">
        <Eye size={15} className="text-gray-400" /> View Details
      </button>
      <button type="button" onClick={() => { onClose(); setTimeout(() => onEdit(user), 0); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-gray-50 text-sm text-gray-700 transition text-left">
        <Edit size={15} className="text-blue-500" /> Edit User
      </button>
      <button type="button" disabled={togglingId === user.id} onClick={() => { onClose(); onToggle(user); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-gray-50 text-sm text-gray-700 transition text-left disabled:opacity-50">
        {togglingId === user.id ? (
          <><Loader2 size={15} className="text-gray-400 animate-spin" /> Updating...</>
        ) : user.isActive ? (
          <><Lock size={15} className="text-amber-500" /> Deactivate</>
        ) : (
          <><Unlock size={15} className="text-green-500" /> Activate</>
        )}
      </button>
      <div className="h-px bg-gray-100 my-1" />
      <button type="button" onClick={() => { onClose(); setTimeout(() => onDelete(user), 0); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-red-50 text-sm text-red-600 transition text-left">
        <Trash2 size={15} /> Delete User
      </button>
    </div>,
    document.body
  );
}

// ==================== MAIN PAGE ====================
export default function StaffPage() {
  const router = useRouter();

  const [subUsers, setSubUsers] = useState<SubUser[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, inactive: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<SubUser | null>(null);
  const [modalStep, setModalStep] = useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [detailUser, setDetailUser] = useState<SubUser | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<SubUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    username: "", password: "", confirmPassword: "",
    email: "", phone: "", fullName: "", role: "",
  });
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [actionMenu, setActionMenu] = useState<{ user: SubUser; buttonEl: HTMLButtonElement } | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // ===== TOAST =====
  const addToast = useCallback((message: string, type: ToastItem["type"] = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
  }, []);
  const removeToast = (id: string) => setToasts((p) => p.filter((t) => t.id !== id));

  // ===== FETCH =====
  const fetchSubUsers = useCallback(async () => {
  try {
    const data = await apiClient("/staff");
    setSubUsers(data.subUsers || []);
    setStats(data.stats || { total: 0, active: 0, inactive: 0 });
  } catch (error: any) {
    if (String(error?.message).includes("401")) {
      router.push("/login");
      return;
    }
    addToast("Failed to load staff members", "error");
  } finally {
    setIsLoading(false);
    setRefreshing(false);
  }
}, [router, addToast]);

  useEffect(() => {
    fetchSubUsers();
  }, [fetchSubUsers]);

  // ===== FORM HELPERS =====
  const resetForm = () => {
    setFormData({ username: "", password: "", confirmPassword: "", email: "", phone: "", fullName: "", role: "" });
    setPermissions({});
    setEditingUser(null);
    setErrors({});
    setShowPassword(false);
    setModalStep(1);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (user: SubUser) => {
    setEditingUser(user);
    setFormData({
      username: user.username, password: "", confirmPassword: "",
      email: user.email || "", phone: user.phone || "",
      fullName: user.fullName || "", role: user.role,
    });
    const perms: Record<string, boolean> = {};
    ALL_PERMISSIONS.forEach((p) => {
      const userPerm = user.permissions?.find((up) => up.key === p.key);
      perms[p.key] = userPerm ? userPerm.enabled : (ROLE_PRESETS[user.role]?.includes(p.key) || false);
    });
    setPermissions(perms);
    setModalStep(1);
    setShowModal(true);
  };

  const handleRoleSelect = (roleId: string) => {
    setFormData((prev) => ({ ...prev, role: roleId }));
    setPermissions(buildPermissionsFromPreset(roleId));
  };

  const togglePermission = (key: string) => {
    setPermissions((p) => ({ ...p, [key]: !p[key] }));
  };

  const toggleCategory = (category: string) => {
    const categoryPerms = ALL_PERMISSIONS.filter((p) => p.category === category);
    const allEnabled = categoryPerms.every((p) => permissions[p.key]);
    const newPerms = { ...permissions };
    categoryPerms.forEach((p) => {
      newPerms[p.key] = !allEnabled;
    });
    setPermissions(newPerms);
  };

  const setAllPermissions = (value: boolean) => {
    const newPerms: Record<string, boolean> = {};
    ALL_PERMISSIONS.forEach((p) => {
      newPerms[p.key] = value;
    });
    setPermissions(newPerms);
  };

  const enabledPermissionsCount = Object.values(permissions).filter(Boolean).length;

  // ===== VALIDATION =====
  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) newErrors.username = "Username is required";
    else if (formData.username.length < 3) newErrors.username = "Username must be at least 3 characters";
    else if (!/^[a-zA-Z0-9._-]+$/.test(formData.username)) newErrors.username = "Only letters, numbers, dots, hyphens allowed";

    if (!editingUser) {
      if (!formData.password) newErrors.password = "Password is required";
      else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    } else if (formData.password) {
      if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Invalid email address";
    if (!formData.role) newErrors.role = "Please select a role";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep1()) setModalStep(2);
  };

  // ===== SUBMIT =====
  const handleSubmit = async () => {
  if (enabledPermissionsCount === 0) {
    addToast("Please select at least one permission", "warning");
    return;
  }
  setIsSubmitting(true);
  try {
    const payload: Record<string, unknown> = {
      username: formData.username,
      role: formData.role,
      permissions: Object.entries(permissions)
        .filter(([, e]) => e)
        .map(([k]) => k),
    };
    if (formData.password) payload.password = formData.password;
    if (formData.email) payload.email = formData.email;
    if (formData.phone) payload.phone = formData.phone;
    if (formData.fullName) payload.fullName = formData.fullName;

    const endpoint = editingUser ? `/staff/${editingUser.id}` : "/staff";
    const method = editingUser ? "PUT" : "POST";

    await apiClient(endpoint, {
      method,
      body: JSON.stringify(payload),
    });

    addToast(
      editingUser
        ? `${formData.username} updated successfully`
        : `${formData.username} created!`,
      "success"
    );
    setShowModal(false);
    resetForm();
    fetchSubUsers();
  } catch (error: any) {
    if (String(error?.message).includes("401")) {
      router.push("/login");
      return;
    }
    addToast(
      String(error?.message || "Operation failed")
        .replace(/API Error \d+ on \/staff[^:]*: /, "")
        .replace(/^{.*"error":"([^"]+)".*}$/, "$1"),
      "error"
    );
  } finally {
    setIsSubmitting(false);
  }
};

 // ── Toggle active ──
const toggleActive = async (user: SubUser) => {
  if (togglingId) return;
  setTogglingId(user.id);
  try {
    await apiClient(`/staff/${user.id}`, {
      method: "PUT",
      body: JSON.stringify({ isActive: !user.isActive }),
    });

    addToast(
      `${user.username} ${!user.isActive ? "activated" : "deactivated"}`,
      "success"
    );
    setSubUsers((prev) =>
      prev.map((u) =>
        u.id === user.id ? { ...u, isActive: !u.isActive } : u
      )
    );
    setStats((prev) => ({
      ...prev,
      active: prev.active + (user.isActive ? -1 : 1),
      inactive: prev.inactive + (user.isActive ? 1 : -1),
    }));
  } catch (error: any) {
    addToast(
      String(error?.message || "Failed to update").replace(
        /API Error \d+ on \/staff[^:]*: /,
        ""
      ),
      "error"
    );
  } finally {
    setTogglingId(null);
  }
};

// ── Delete staff ──
const handleDelete = async (user: SubUser) => {
  setIsDeleting(true);
  try {
    await apiClient(`/staff/${user.id}`, { method: "DELETE" });

    addToast(`${user.username} deleted`, "success");
    setDeleteConfirm(null);
    setSubUsers((prev) => prev.filter((u) => u.id !== user.id));
    setStats((prev) => ({
      total: prev.total - 1,
      active: prev.active - (user.isActive ? 1 : 0),
      inactive: prev.inactive - (!user.isActive ? 1 : 0),
    }));
  } catch (error: any) {
    addToast(
      String(error?.message || "Failed to delete").replace(
        /API Error \d+ on \/staff[^:]*: /,
        ""
      ),
      "error"
    );
  } finally {
    setIsDeleting(false);
  }
};

  // ===== FILTERED LIST =====
  const filteredUsers = subUsers.filter((u) => {
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || u.username.toLowerCase().includes(q) || u.fullName?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
    const matchRole = !roleFilter || u.role === roleFilter;
    const matchStatus = !statusFilter || (statusFilter === "active" && u.isActive) || (statusFilter === "inactive" && !u.isActive);
    return matchSearch && matchRole && matchStatus;
  });

  // ===== LOADING =====
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AgentTopBar />
        <div className="p-6 space-y-5 animate-pulse">
          <div className="h-9 bg-gray-200 rounded-lg w-48" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-28 bg-gray-200 rounded-2xl" />)}
          </div>
          <div className="h-80 bg-gray-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  // ==================== RENDER ====================
  return (
    <div className="min-h-screen bg-gray-50">
      <AgentTopBar />

      <div className="p-4 md:p-6 space-y-5">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Users size={24} className="text-[#021f3b]" /> Staff Management
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">Create sub-users who can login and work on your behalf</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={async () => { setRefreshing(true); await fetchSubUsers(); addToast("Refreshed", "success"); }}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition text-sm font-medium shadow-sm disabled:opacity-50"
            >
              <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} /> Refresh
            </button>
            <button onClick={openCreateModal} className="flex items-center gap-2 px-5 py-2.5 bg-[#021f3b] text-white rounded-xl font-semibold hover:bg-[#0a3a6b] transition shadow-md text-sm">
              <UserPlus size={17} /> Add Staff
            </button>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-[#021f3b] to-[#0a4d8c] rounded-2xl p-5 text-white">
            <div className="flex items-center justify-between mb-3">
              <p className="text-blue-200 text-sm">Total Staff</p>
              <div className="p-2 bg-white/15 rounded-xl"><Users size={20} className="text-white" /></div>
            </div>
            <p className="text-3xl font-bold">{stats.total}</p>
            <p className="text-blue-300 text-xs mt-2">Sub-user accounts</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-emerald-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-gray-500 text-sm">Active</p>
              <div className="p-2 bg-emerald-100 rounded-xl"><UserCheck size={18} className="text-emerald-600" /></div>
            </div>
            <p className="text-3xl font-bold text-emerald-600">{stats.active}</p>
            <p className="text-gray-400 text-xs mt-2">Can login & work</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-red-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-gray-500 text-sm">Inactive</p>
              <div className="p-2 bg-red-100 rounded-xl"><UserX size={18} className="text-red-600" /></div>
            </div>
            <p className="text-3xl font-bold text-red-600">{stats.inactive}</p>
            <p className="text-gray-400 text-xs mt-2">Login disabled</p>
          </div>
        </div>

        {/* INFO BANNER */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
          <Info size={18} className="text-blue-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-800">How Sub-Users Work</p>
            <p className="text-xs text-blue-600 mt-1">Sub-users login with their own credentials. You control access using granular permissions. All actions are tracked under your agency.</p>
          </div>
        </div>

        {/* FILTER BAR */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by name, username, email..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#021f3b]/10 focus:border-[#021f3b]/30 transition" />
          </div>
          <div className="relative">
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="appearance-none pl-4 pr-9 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none bg-white cursor-pointer min-w-32">
              <option value="">All Roles</option>
              <option value="USER">User</option>
              <option value="OPERATOR">Operator</option>
              <option value="VIEWER">Viewer</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="appearance-none pl-4 pr-9 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none bg-white cursor-pointer min-w-32">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-800">Staff Members</h2>
            <p className="text-xs text-gray-400 mt-0.5">{filteredUsers.length} member{filteredUsers.length !== 1 ? "s" : ""}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {["User", "Role", "Status", "Permissions", "Activity", "Last Login", ""].map((h, i) => (
                    <th key={i} className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => {
                    const userPermCount = user.permissions?.filter((p) => p.enabled).length || ROLE_PRESETS[user.role]?.length || 0;
                    return (
                      <tr key={user.id} className="hover:bg-gray-50/70 transition">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 ${user.isActive ? "bg-gradient-to-br from-[#021f3b] to-[#0a4d8c]" : "bg-gray-400"}`}>
                              {user.username.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-gray-800 text-sm truncate">{user.fullName || user.username}</p>
                              <p className="text-xs text-gray-400 truncate">
                                @{user.username}
                                {user.email && <><span className="text-gray-300 mx-1">·</span>{user.email}</>}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4"><RoleBadge role={user.role} /></td>
                        <td className="px-5 py-4">
                          <button onClick={() => toggleActive(user)} disabled={togglingId === user.id} className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border cursor-pointer transition hover:shadow-sm disabled:opacity-50 ${user.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"}`}>
                            {togglingId === user.id ? <Loader2 size={12} className="animate-spin" /> : user.isActive ? <Unlock size={12} /> : <Lock size={12} />}
                            {user.isActive ? "Active" : "Inactive"}
                          </button>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-semibold text-gray-700">{userPermCount}</span>
                            <span className="text-xs text-gray-400">/ {ALL_PERMISSIONS.length}</span>
                            <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden ml-1">
                              <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${(userPermCount / ALL_PERMISSIONS.length) * 100}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="text-xs space-y-0.5">
                            <p className="text-gray-600"><span className="font-semibold text-blue-600">{user.depositsCreated}</span> deposits</p>
                            <p className="text-gray-600"><span className="font-semibold text-purple-600">{user.withdrawalsCreated}</span> withdrawals</p>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          {user.lastLogin ? (
                            <div className="flex items-center gap-1.5 text-sm text-gray-500"><Clock size={13} />{timeAgo(user.lastLogin)}</div>
                          ) : (
                            <span className="text-xs text-gray-300">Never logged in</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setActionMenu((prev) => prev?.user.id === user.id ? null : { user, buttonEl: e.currentTarget });
                            }}
                            className="p-2 hover:bg-gray-100 rounded-lg transition"
                          >
                            <MoreVertical size={17} className="text-gray-400" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center"><Users size={24} className="text-gray-300" /></div>
                        <p className="text-gray-500 font-medium">No staff members found</p>
                        <button onClick={openCreateModal} className="px-5 py-2 bg-[#021f3b] text-white rounded-xl text-sm font-semibold hover:bg-[#0a3a6b] transition">Add First Staff Member</button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* PORTAL ACTION DROPDOWN */}
      {actionMenu && (
        <ActionDropdown
          user={actionMenu.user}
          buttonRef={actionMenu.buttonEl}
          onClose={() => setActionMenu(null)}
          onView={(u) => setDetailUser(u)}
          onEdit={(u) => openEditModal(u)}
          onToggle={(u) => toggleActive(u)}
          onDelete={(u) => setDeleteConfirm(u)}
          togglingId={togglingId}
        />
      )}

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onMouseDown={() => { setShowModal(false); resetForm(); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden" onMouseDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-[#021f3b] to-[#0a4d8c] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/15 rounded-xl"><UserPlus size={20} /></div>
                <div>
                  <h2 className="font-bold">{editingUser ? "Edit Staff Member" : "Add New Staff Member"}</h2>
                  <p className="text-blue-200 text-xs">Step {modalStep} of 2 — {modalStep === 1 ? "Basic Info" : "Permissions"}</p>
                </div>
              </div>
              <button onClick={() => { setShowModal(false); resetForm(); }} className="p-2 hover:bg-white/10 rounded-xl transition"><X size={20} /></button>
            </div>

            {/* Steps */}
            <div className="px-6 py-3 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold ${modalStep === 1 ? "bg-[#021f3b] text-white" : "bg-gray-200 text-gray-500"}`}>
                <span className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-[10px]">1</span> Basic Info
              </div>
              <ChevronRight size={14} className="text-gray-400" />
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold ${modalStep === 2 ? "bg-[#021f3b] text-white" : "bg-gray-200 text-gray-500"}`}>
                <span className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-[10px]">2</span> Permissions ({enabledPermissionsCount})
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {modalStep === 1 ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name <span className="text-gray-400 font-normal">(optional)</span></label>
                    <input type="text" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} placeholder="e.g. Ahmed Khan" className="w-full px-4 py-2.5 text-black border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#021f3b]/20 focus:border-[#021f3b] transition" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Username <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">@</span>
                      <input type="text" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/\s/g, "") })} placeholder="username" disabled={!!editingUser} className="w-full pl-8 pr-4 py-2.5 text-black border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#021f3b]/20 focus:border-[#021f3b] transition disabled:bg-gray-100 disabled:cursor-not-allowed font-mono" />
                    </div>
                    {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
                    {!editingUser && <p className="text-xs text-gray-400 mt-1">Used for login. Cannot be changed later.</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Email <span className="text-gray-400 font-normal">(optional)</span></label>
                      <div className="relative">
                        <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="email@example.com" className="w-full pl-10 pr-4 py-2.5 text-black border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#021f3b]/20 transition" />
                      </div>
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone <span className="text-gray-400 font-normal">(optional)</span></label>
                      <div className="relative">
                        <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+966 ..." className="w-full pl-10 pr-4 py-2.5 text-black border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#021f3b]/20 transition" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Password {editingUser ? <span className="text-gray-400 font-normal">(leave blank to keep current)</span> : <span className="text-red-500">*</span>}
                    </label>
                    <div className="relative">
                      <Key size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type={showPassword ? "text" : "password"} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="Min 6 characters" className="w-full pl-10 pr-12 py-2.5 text-black border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#021f3b]/20 transition" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                  </div>

                  {(formData.password || !editingUser) && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password {!editingUser && <span className="text-red-500">*</span>}</label>
                      <div className="relative">
                        <Key size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type={showPassword ? "text" : "password"} value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} placeholder="Re-enter password" className="w-full pl-10 pr-4 py-2.5 text-black border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#021f3b]/20 transition" />
                      </div>
                      {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Role <span className="text-red-500">*</span></label>
                    <div className="grid grid-cols-3 gap-2">
                      {ROLE_OPTIONS.map((r) => (
                        <button key={r.id} type="button" onClick={() => handleRoleSelect(r.id)} className={`p-3 rounded-xl border-2 text-center transition-all ${formData.role === r.id ? r.activeCls : r.cls}`}>
                          <p className="font-semibold text-gray-800 text-sm">{r.label}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{r.desc}</p>
                        </button>
                      ))}
                    </div>
                    {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
                    <p className="text-xs text-gray-400 mt-1.5">Customize individual permissions in the next step.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-700">{enabledPermissionsCount} of {ALL_PERMISSIONS.length} permissions enabled</p>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => setAllPermissions(true)} className="text-xs text-blue-600 hover:underline font-medium">Select All</button>
                      <span className="text-gray-300">|</span>
                      <button type="button" onClick={() => setAllPermissions(false)} className="text-xs text-gray-500 hover:underline font-medium">Deselect All</button>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all" style={{ width: `${(enabledPermissionsCount / ALL_PERMISSIONS.length) * 100}%` }} />
                  </div>
                  {Object.entries(groupedPermissions).map(([category, perms]) => {
                    const categoryEnabled = perms.filter((p) => permissions[p.key]).length;
                    const allEnabled = categoryEnabled === perms.length;
                    return (
                      <div key={category} className="border border-gray-200 rounded-xl overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
                          <div className="flex items-center gap-2">
                            {CATEGORY_ICONS[category]}
                            <span className="text-sm font-bold text-gray-700">{category}</span>
                            <span className="text-xs text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full">{categoryEnabled}/{perms.length}</span>
                          </div>
                          <button type="button" onClick={() => toggleCategory(category)} className={`text-xs font-medium px-2.5 py-1 rounded-lg transition ${allEnabled ? "bg-red-100 text-red-600 hover:bg-red-200" : "bg-blue-100 text-blue-600 hover:bg-blue-200"}`}>
                            {allEnabled ? "Disable All" : "Enable All"}
                          </button>
                        </div>
                        <div className="divide-y divide-gray-100">
                          {perms.map((perm) => (
                            <label key={perm.key} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition">
                              <input type="checkbox" checked={permissions[perm.key] || false} onChange={() => togglePermission(perm.key)} className="w-4 h-4 rounded border-gray-300 text-[#021f3b] focus:ring-[#021f3b]" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-800">{perm.label}</p>
                                <p className="text-xs text-gray-400">{perm.description}</p>
                              </div>
                              {permissions[perm.key] && <CheckCircle size={16} className="text-emerald-500 shrink-0" />}
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex gap-3 shrink-0">
              {modalStep === 1 ? (
                <>
                  <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-100 transition font-medium text-sm">Cancel</button>
                  <button type="button" onClick={handleNextStep} className="flex-1 py-2.5 bg-[#021f3b] text-white rounded-xl font-bold hover:bg-[#0a3a6b] transition flex items-center justify-center gap-2 text-sm shadow-md">
                    Next: Permissions <ChevronRight size={16} />
                  </button>
                </>
              ) : (
                <>
                  <button type="button" onClick={() => setModalStep(1)} className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-100 transition font-medium text-sm">← Back</button>
                  <button type="button" onClick={handleSubmit} disabled={isSubmitting || enabledPermissionsCount === 0} className="flex-1 py-2.5 bg-[#021f3b] text-white rounded-xl font-bold hover:bg-[#0a3a6b] transition disabled:opacity-50 flex items-center justify-center gap-2 text-sm shadow-md">
                    {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> {editingUser ? "Updating..." : "Creating..."}</> : <><CheckCircle size={16} /> {editingUser ? "Update Staff" : "Create Staff"}</>}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {detailUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onMouseDown={() => setDetailUser(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden" onMouseDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
            <div className="px-5 py-4 bg-gradient-to-r from-[#021f3b] to-[#0a4d8c] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center font-bold text-lg">{detailUser.username.charAt(0).toUpperCase()}</div>
                <div>
                  <p className="font-bold">{detailUser.fullName || detailUser.username}</p>
                  <p className="text-blue-200 text-xs font-mono">@{detailUser.username}</p>
                </div>
              </div>
              <button onClick={() => setDetailUser(null)} className="p-2 hover:bg-white/10 rounded-xl transition"><X size={20} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <RoleBadge role={detailUser.role} />
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${detailUser.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                  {detailUser.isActive ? <CheckCircle size={12} /> : <XCircle size={12} />}
                  {detailUser.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="space-y-2 divide-y divide-gray-50">
                {[
                  { label: "Email", value: detailUser.email || "—", icon: <Mail size={14} className="text-gray-400" /> },
                  { label: "Phone", value: detailUser.phone || "—", icon: <Phone size={14} className="text-gray-400" /> },
                  { label: "Created", value: fmtDateTime(detailUser.createdAt), icon: <Clock size={14} className="text-gray-400" /> },
                  { label: "Last Login", value: detailUser.lastLogin ? fmtDateTime(detailUser.lastLogin) : "Never", icon: <Activity size={14} className="text-gray-400" /> },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between py-2.5">
                    <span className="text-sm text-gray-500 flex items-center gap-2">{row.icon} {row.label}</span>
                    <span className="text-sm font-semibold text-gray-800">{row.value}</span>
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <h4 className="text-xs font-bold text-blue-600 uppercase mb-3">Activity Summary</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-lg p-3 text-center border border-blue-100">
                    <p className="text-2xl font-bold text-blue-600">{detailUser.depositsCreated}</p>
                    <p className="text-xs text-gray-500">Deposits</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center border border-blue-100">
                    <p className="text-2xl font-bold text-purple-600">{detailUser.withdrawalsCreated}</p>
                    <p className="text-xs text-gray-500">Withdrawals</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Permissions</h4>
                <div className="space-y-1">
                  {ALL_PERMISSIONS.map((perm) => {
                    const enabled = detailUser.permissions?.find((p) => p.key === perm.key)?.enabled || false;
                    return (
                      <div key={perm.key} className="flex items-center gap-2 py-1">
                        {enabled ? <CheckCircle size={14} className="text-emerald-500" /> : <XCircle size={14} className="text-gray-300" />}
                        <span className={`text-xs ${enabled ? "text-gray-700 font-medium" : "text-gray-400"}`}>{perm.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="px-5 py-4 border-t border-gray-100 bg-gray-50 flex gap-3 shrink-0">
              <button onClick={() => { const u = detailUser; setDetailUser(null); setTimeout(() => openEditModal(u), 0); }} className="flex-1 py-2.5 bg-[#021f3b] text-white rounded-xl font-semibold hover:bg-[#0a3a6b] transition text-sm flex items-center justify-center gap-2">
                <Edit size={14} /> Edit
              </button>
              <button onClick={() => setDetailUser(null)} className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-100 transition font-medium text-sm">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onMouseDown={() => !isDeleting && setDeleteConfirm(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6" onMouseDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-5">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} className="text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">Delete Staff?</h3>
              <p className="text-sm text-gray-500 mt-2">
                Are you sure you want to delete <span className="font-bold text-gray-800">{deleteConfirm.username}</span>? This cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} disabled={isDeleting} className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-100 transition font-medium text-sm disabled:opacity-50">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} disabled={isDeleting} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition flex items-center justify-center gap-2 text-sm disabled:opacity-50">
                {isDeleting ? <><Loader2 size={14} className="animate-spin" /> Deleting...</> : <><Trash2 size={14} /> Delete</>}
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <style jsx>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
        @keyframes dropdown-in {
          from { opacity: 0; transform: translateY(-4px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-dropdown { animation: dropdown-in 0.15s ease-out; }
      `}</style>
    </div>
  );
}