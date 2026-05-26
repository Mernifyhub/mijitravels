"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import {
  Search, RotateCcw, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  Plane, Calendar, Users, Download, Eye, MoreHorizontal, TrendingUp, TrendingDown,
  Clock, CheckCircle2, XCircle, AlertCircle, Loader2, ArrowUpDown, ArrowUp,
  ArrowDown, SlidersHorizontal, FileText, RefreshCw, ChevronDown, X, Check,
  Trash2, Mail, Printer, Copy, ExternalLink, Edit, Ban, CheckCheck, Grid3X3,
  LayoutList, Settings2, Columns3, Keyboard, Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ==================== TYPE DEFINITIONS ====================
// Define the structure for passenger information
interface Passenger {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
}

// Define the structure for agent information
interface Agent {
  agentName: string;
  agentId?: string;
}

// Define the main booking data structure
interface Booking {
  id: string;
  bookingId?: string;
  status: string;
  agent: Agent;
  tripType: string;
  pnr: string;
  carrier: string;
  route: string;
  departureDate: string;
  bookingDate: string;
  passengers: Passenger[];
  net: number;
  gross: number;
}

// Define component props
interface Props {
  defaultStatus?: string;
}

// Define toast notification structure
interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
}

// ==================== CUSTOM HOOKS ====================
/**
 * Custom hook for debouncing values (delays updates until user stops typing)
 * Useful for search inputs to avoid excessive API calls
 */
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set a timeout to update the debounced value after the delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup: clear timeout if value changes before delay completes
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

// ==================== TOAST COMPONENT ====================
/**
 * Toast notification component
 * Displays temporary messages at bottom-right of screen
 * Auto-dismisses after 4 seconds
 */
const ToastContainer = ({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: string) => void }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }} // Animation: start state
            animate={{ opacity: 1, y: 0, scale: 1 }}      // Animation: visible state
            exit={{ opacity: 0, y: -20, scale: 0.95 }}     // Animation: exit state
            className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg backdrop-blur-sm ${
              // Dynamic background color based on toast type
              toast.type === "success"
                ? "bg-emerald-500 text-white"
                : toast.type === "error"
                ? "bg-rose-500 text-white"
                : toast.type === "warning"
                ? "bg-amber-500 text-white"
                : "bg-slate-800 text-white"
            }`}
          >
            {/* Display appropriate icon based on toast type */}
            {toast.type === "success" && <CheckCircle2 size={18} />}
            {toast.type === "error" && <XCircle size={18} />}
            {toast.type === "warning" && <AlertCircle size={18} />}
            {toast.type === "info" && <Info size={18} />}
            
            <span className="text-sm font-medium">{toast.message}</span>
            
            {/* Close button */}
            <button onClick={() => removeToast(toast.id)} className="ml-2 hover:opacity-70">
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// ==================== SKELETON LOADER ====================
/**
 * Loading skeleton component
 * Shows placeholder content while data is being fetched
 * Provides visual feedback to users
 */
const TableSkeleton = () => (
  <div className="animate-pulse">
    {/* Create 5 skeleton rows */}
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-slate-100">
        {/* Skeleton elements mimicking actual table row structure */}
        <div className="w-5 h-5 bg-slate-200 rounded" />
        <div className="w-24 h-8 bg-slate-200 rounded-lg" />
        <div className="w-20 h-6 bg-slate-200 rounded-full" />
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-slate-200 rounded-full" />
          <div className="space-y-1">
            <div className="w-28 h-4 bg-slate-200 rounded" />
            <div className="w-16 h-3 bg-slate-200 rounded" />
          </div>
        </div>
        <div className="w-32 h-4 bg-slate-200 rounded" />
        <div className="w-24 h-4 bg-slate-200 rounded" />
        <div className="w-16 h-6 bg-slate-200 rounded" />
        <div className="w-16 h-8 bg-slate-200 rounded-lg" />
        <div className="w-24 h-4 bg-slate-200 rounded" />
        <div className="w-20 h-4 bg-slate-200 rounded ml-auto" />
        <div className="w-16 h-8 bg-slate-200 rounded" />
      </div>
    ))}
  </div>
);

// ==================== BOOKING DETAIL MODAL ====================
/**
 * Modal component for displaying detailed booking information
 * Shows passenger details, flight info, pricing, etc.
 * Includes action buttons for print, email, copy, edit
 */
const BookingDetailModal = ({
  booking,
  onClose,
}: {
  booking: Booking | null;
  onClose: () => void;
}) => {
  // Don't render if no booking is selected
  if (!booking) return null;

  // Helper function to format currency in BDT (Bangladeshi Taka)
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "SAR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Helper function to format dates with time
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Status badge color configuration
  const statusConfig: Record<string, { bg: string; text: string }> = {
    Confirmed: { bg: "bg-emerald-100", text: "text-emerald-700" },
    Pending: { bg: "bg-amber-100", text: "text-amber-700" },
    Cancelled: { bg: "bg-rose-100", text: "text-rose-700" },
    Processing: { bg: "bg-blue-100", text: "text-blue-700" },
  };

  const config = statusConfig[booking.status] || { bg: "bg-gray-100", text: "text-gray-700" };

  return (
    <AnimatePresence>
      {/* Backdrop overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose} // Close modal when clicking outside
      >
        {/* Modal content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
          className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
        >
          {/* MODAL HEADER */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
            <div className="flex items-center gap-4">
              {/* Booking icon */}
              <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center">
                <FileText size={24} className="text-white" />
              </div>
              <div>
                {/* Booking ID */}
                <h2 className="text-lg font-bold text-slate-800">
                  {booking.bookingId || booking.id}
                </h2>
                {/* Status badge */}
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}
                >
                  {booking.status}
                </span>
              </div>
            </div>
            {/* Close button */}
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-xl transition"
            >
              <X size={20} className="text-slate-500" />
            </button>
          </div>

          {/* MODAL CONTENT */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            {/* FLIGHT ROUTE VISUALIZATION */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-5 text-white mb-6">
              <div className="flex items-center justify-between">
                {/* Departure city */}
                <div className="text-center">
                  <p className="text-3xl font-bold">{booking.route?.split("-")[0]}</p>
                  <p className="text-slate-400 text-sm mt-1">Departure</p>
                </div>
                
                {/* Flight path animation */}
                <div className="flex-1 flex items-center justify-center px-4">
                  <div className="flex items-center w-full">
                    <div className="w-2 h-2 rounded-full bg-white" />
                    <div className="flex-1 h-px bg-gradient-to-r from-white via-slate-500 to-white mx-2 relative">
                      <Plane
                        size={20}
                        className="text-white absolute left-1/2 -translate-x-1/2 -top-2.5 rotate-90"
                      />
                    </div>
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                </div>
                
                {/* Arrival city */}
                <div className="text-center">
                  <p className="text-3xl font-bold">{booking.route?.split("-")[1]}</p>
                  <p className="text-slate-400 text-sm mt-1">Arrival</p>
                </div>
              </div>
              
              {/* Departure date and PNR */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-slate-400" />
                  <span className="text-sm">{formatDate(booking.departureDate)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-400">PNR:</span>
                  <span className="font-mono font-semibold">{booking.pnr}</span>
                </div>
              </div>
            </div>

            {/* BOOKING DETAILS GRID */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* Trip Type */}
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs font-medium text-slate-500 mb-1">Trip Type</p>
                <p className="font-semibold text-slate-800">{booking.tripType}</p>
              </div>
              {/* Carrier */}
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs font-medium text-slate-500 mb-1">Carrier</p>
                <p className="font-semibold text-slate-800">{booking.carrier}</p>
              </div>
              {/* Booking Date */}
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs font-medium text-slate-500 mb-1">Booking Date</p>
                <p className="font-semibold text-slate-800">{formatDate(booking.bookingDate)}</p>
              </div>
              {/* Agent */}
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs font-medium text-slate-500 mb-1">Agent</p>
                <p className="font-semibold text-slate-800">{booking.agent?.agentName || "-"}</p>
              </div>
            </div>

            {/* PASSENGER LIST */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-800 mb-3">
                Passengers ({booking.passengers?.length || 0})
              </h3>
              <div className="space-y-2">
                {booking.passengers?.map((p, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl"
                  >
                    {/* Passenger avatar */}
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                      <Users size={18} className="text-slate-600" />
                    </div>
                    <div>
                      {/* Passenger name */}
                      <p className="font-medium text-slate-800">
                        {p.firstName} {p.lastName}
                      </p>
                      {/* Passenger email (if available) */}
                      {p.email && <p className="text-xs text-slate-500">{p.email}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* PRICING SECTION */}
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4">
              {/* Net Amount */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-emerald-700">Net Amount</span>
                <span className="font-semibold text-emerald-800">
                  {formatCurrency(booking.net)}
                </span>
              </div>
              {/* Gross Amount (Total) */}
              <div className="flex items-center justify-between pt-2 border-t border-emerald-200">
                <span className="text-sm font-medium text-emerald-800">Gross Amount</span>
                <span className="text-xl font-bold text-emerald-800">
                  {formatCurrency(booking.gross)}
                </span>
              </div>
            </div>
          </div>

          {/* MODAL FOOTER */}
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
            {/* Action buttons (Print, Email, Copy) */}
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-white rounded-lg transition" title="Print">
                <Printer size={18} className="text-slate-600" />
              </button>
              <button className="p-2 hover:bg-white rounded-lg transition" title="Email">
                <Mail size={18} className="text-slate-600" />
              </button>
              <button className="p-2 hover:bg-white rounded-lg transition" title="Copy">
                <Copy size={18} className="text-slate-600" />
              </button>
            </div>
            {/* Primary actions (Close, Edit) */}
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-slate-600 hover:bg-white rounded-lg transition text-sm font-medium"
              >
                Close
              </button>
              <button className="px-4 py-2 bg-slate-800 text-white rounded-lg transition text-sm font-medium hover:bg-slate-700 flex items-center gap-2">
                <Edit size={16} />
                Edit Booking
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ==================== COLUMN SETTINGS MODAL ====================
/**
 * Modal for toggling column visibility
 * Allows users to show/hide specific table columns
 * Saves user preferences for better UX
 */
const ColumnSettingsModal = ({
  columns,
  visibleColumns,
  onToggle,
  onClose,
}: {
  columns: { key: string; label: string }[];
  visibleColumns: string[];
  onToggle: (key: string) => void;
  onClose: () => void;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden"
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Columns3 size={18} className="text-slate-600" />
            <h3 className="font-semibold text-slate-800">Column Visibility</h3>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg">
            <X size={18} className="text-slate-500" />
          </button>
        </div>
        
        {/* Column checkboxes */}
        <div className="p-4 space-y-2 max-h-80 overflow-y-auto">
          {columns.map((col) => (
            <label
              key={col.key}
              className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer"
            >
              {/* Checkbox for toggling column visibility */}
              <input
                type="checkbox"
                checked={visibleColumns.includes(col.key)}
                onChange={() => onToggle(col.key)}
                className="w-4 h-4 rounded border-slate-300 text-slate-800 focus:ring-slate-500"
              />
              <span className="text-sm text-slate-700">{col.label}</span>
            </label>
          ))}
        </div>
        
        {/* Apply button */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50">
          <button
            onClick={onClose}
            className="w-full py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition"
          >
            Apply Changes
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ==================== KEYBOARD SHORTCUTS MODAL ====================
/**
 * Modal displaying available keyboard shortcuts
 * Helps users discover productivity features
 * Improves accessibility and power-user experience
 */
const KeyboardShortcutsModal = ({ onClose }: { onClose: () => void }) => {
  // Define all available keyboard shortcuts
  const shortcuts = [
    { keys: ["Ctrl", "K"], action: "Focus search" },
    { keys: ["Ctrl", "R"], action: "Refresh data" },
    { keys: ["Esc"], action: "Close modals" },
    { keys: ["←", "→"], action: "Navigate pages" },
    { keys: ["Ctrl", "A"], action: "Select all visible" },
    { keys: ["Ctrl", "E"], action: "Export data" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Keyboard size={18} className="text-slate-600" />
            <h3 className="font-semibold text-slate-800">Keyboard Shortcuts</h3>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg">
            <X size={18} className="text-slate-500" />
          </button>
        </div>
        
        {/* Shortcuts list */}
        <div className="p-4 space-y-3">
          {shortcuts.map((s, idx) => (
            <div key={idx} className="flex items-center justify-between">
              {/* Shortcut description */}
              <span className="text-sm text-slate-600">{s.action}</span>
              {/* Key combination display */}
              <div className="flex items-center gap-1">
                {s.keys.map((key, i) => (
                  <span key={i}>
                    <kbd className="px-2 py-1 bg-slate-100 border border-slate-200 rounded text-xs font-mono text-slate-700">
                      {key}
                    </kbd>
                    {/* Show '+' between keys */}
                    {i < s.keys.length - 1 && <span className="text-slate-400 mx-0.5">+</span>}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

// ==================== MAIN COMPONENT ====================
/**
 * Main booking management component
 * Features:
 * - Advanced search and filtering
 * - Table and grid view modes
 * - Bulk actions (confirm, cancel, delete, export)
 * - Pagination with customizable page size
 * - Column visibility controls
 * - Keyboard shortcuts
 * - Real-time statistics
 * - Responsive design
 */
export default function AllBookingPro({ defaultStatus = "" }: Props) {
  // ==================== STATE MANAGEMENT ====================
  
  // Core data state
  const [bookings, setBookings] = useState<Booking[]>([]); // All bookings data
  const [loading, setLoading] = useState(true);            // Initial loading state
  const [refreshing, setRefreshing] = useState(false);     // Manual refresh state
  const [error, setError] = useState<string | null>(null); // Error message state

  // Search and filter state
  const [searchInput, setSearchInput] = useState("");      // Search query
  const [status, setStatus] = useState(defaultStatus);     // Status filter
  const [dateFrom, setDateFrom] = useState("");            // Date range start
  const [dateTo, setDateTo] = useState("");                // Date range end
  const [tripType, setTripType] = useState("");            // Trip type filter
  const [carrier, setCarrier] = useState("");              // Carrier/airline filter

  // Pagination state
  const [page, setPage] = useState(1);                     // Current page number
  const [pageSize, setPageSize] = useState(10);            // Items per page

  // UI state
  const [showFilters, setShowFilters] = useState(false);   // Toggle advanced filters
  const [viewMode, setViewMode] = useState<"table" | "grid">("table"); // View mode
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null); // Selected booking for detail view
  const [showColumnSettings, setShowColumnSettings] = useState(false); // Column settings modal
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false); // Shortcuts modal

  // Sorting state
  const [sortBy, setSortBy] = useState<string>("");        // Column to sort by
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc"); // Sort direction

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set()); // Selected booking IDs

  // Toast notification state
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Column visibility state
  const allColumns = [
    { key: "bookingId", label: "Booking ID" },
    { key: "status", label: "Status" },
    { key: "passenger", label: "Passenger" },
    { key: "route", label: "Route" },
    { key: "departure", label: "Departure" },
    { key: "pnr", label: "PNR" },
    { key: "carrier", label: "Carrier" },
    { key: "agent", label: "Agent" },
    { key: "amount", label: "Amount" },
  ];
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    allColumns.map((c) => c.key) // All columns visible by default
  );

  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null); // Reference to search input for keyboard shortcuts

  // ==================== DEBOUNCED SEARCH ====================
  // Delay search to avoid excessive filtering/API calls
  const debouncedSearch = useDebounce(searchInput, 300);

  // ==================== TOAST HELPER ====================
  /**
   * Add a toast notification
   * Auto-removes after 4 seconds
   */
  const addToast = useCallback((message: string, type: Toast["type"] = "info") => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto-remove toast after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  /**
   * Manually remove a toast
   */
  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // ==================== DATA FETCHING ====================
  /**
   * Fetch bookings data from API
   * @param showRefresh - If true, shows refresh animation instead of full loading
   */
  const fetchData = useCallback(async (showRefresh = false) => {
    // Set appropriate loading state
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/bookings");
      if (!res.ok) throw new Error("Failed to fetch bookings");
      const data = await res.json();
      setBookings(data);
      
      // Show success message if manually refreshing
      if (showRefresh) addToast("Data refreshed successfully!", "success");
    } catch (err: any) {
      setError(err.message);
      addToast("Failed to load bookings", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [addToast]);

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ==================== KEYBOARD SHORTCUTS ====================
  /**
   * Global keyboard shortcut handler
   * Enables power-user features
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + K: Focus search input
      if (e.ctrlKey && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      
      // Ctrl + R: Refresh data
      if (e.ctrlKey && e.key === "r") {
        e.preventDefault();
        fetchData(true);
      }
      
      // Escape: Close all modals
      if (e.key === "Escape") {
        setSelectedBooking(null);
        setShowColumnSettings(false);
        setShowKeyboardShortcuts(false);
      }
      
      // Arrow Left: Previous page
      if (e.key === "ArrowLeft" && page > 1) {
        setPage((p) => p - 1);
      }
      
      // Arrow Right: Next page
      if (e.key === "ArrowRight" && page < totalPages) {
        setPage((p) => p + 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [page, fetchData]); // Re-attach listener when page changes

  // ==================== STATISTICS CALCULATION ====================
  /**
   * Calculate dashboard statistics
   * Memoized to avoid recalculation on every render
   */
  const stats = useMemo(() => {
    const total = bookings.length;
    const confirmed = bookings.filter((b) => b.status === "Confirmed").length;
    const pending = bookings.filter((b) => b.status === "Pending").length;
    const cancelled = bookings.filter((b) => b.status === "Cancelled").length;
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.gross || 0), 0);

    // Mock trend data (in production, compare with previous period)
    const confirmedTrend = 12.5;
    const pendingTrend = -5.2;
    const cancelledTrend = -8.3;
    const revenueTrend = 15.7;

    return {
      total,
      confirmed,
      confirmedTrend,
      pending,
      pendingTrend,
      cancelled,
      cancelledTrend,
      totalRevenue,
      revenueTrend,
    };
  }, [bookings]);

  // ==================== FILTERING AND SORTING ====================
  /**
   * Apply all filters and sorting to bookings data
   * Memoized to avoid recalculation unless dependencies change
   */
  const filteredData = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();

    // STEP 1: Filter bookings
    let result = bookings.filter((item) => {
      // Search filter: check multiple fields
      const matchSearch =
        query === ""
          ? true
          : item.id?.toLowerCase().includes(query) ||
            item.bookingId?.toLowerCase().includes(query) ||
            item.pnr?.toLowerCase().includes(query) ||
            item.carrier?.toLowerCase().includes(query) ||
            item.route?.toLowerCase().includes(query) ||
            item.passengers?.some(
              (p) =>
                p.firstName?.toLowerCase().includes(query) ||
                p.lastName?.toLowerCase().includes(query)
            );

      // Status filter
      const matchStatus = status ? item.status === status : true;
      
      // Trip type filter
      const matchTripType = tripType ? item.tripType === tripType : true;
      
      // Carrier filter
      const matchCarrier = carrier
        ? item.carrier?.toLowerCase().includes(carrier.toLowerCase())
        : true;

      // Date range filters
      let matchDateFrom = true;
      let matchDateTo = true;
      if (dateFrom) {
        matchDateFrom = new Date(item.departureDate) >= new Date(dateFrom);
      }
      if (dateTo) {
        matchDateTo = new Date(item.departureDate) <= new Date(dateTo);
      }

      // All filters must pass
      return matchSearch && matchStatus && matchTripType && matchCarrier && matchDateFrom && matchDateTo;
    });

    // STEP 2: Sort results
    if (sortBy) {
      result = [...result].sort((a: any, b: any) => {
        let valA = a[sortBy];
        let valB = b[sortBy];

        // Special handling for date fields
        if (sortBy === "departureDate" || sortBy === "bookingDate") {
          valA = new Date(valA).getTime();
          valB = new Date(valB).getTime();
        } 
        // Case-insensitive string comparison
        else if (typeof valA === "string") {
          valA = valA.toLowerCase();
          valB = valB?.toLowerCase() || "";
        }

        // Apply sort order
        if (sortOrder === "asc") {
          return valA > valB ? 1 : -1;
        } else {
          return valA < valB ? 1 : -1;
        }
      });
    }

    return result;
  }, [debouncedSearch, status, bookings, sortBy, sortOrder, tripType, carrier, dateFrom, dateTo]);

  // Calculate total pages for pagination
  const totalPages = Math.ceil(filteredData.length / pageSize);

  // ==================== PAGINATION ====================
  /**
   * Get current page data
   * Memoized to avoid recalculation
   */
  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, page, pageSize]);

  // ==================== SELECTION HANDLERS ====================
  /**
   * Toggle select all bookings on current page
   */
  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedData.length) {
      setSelectedIds(new Set()); // Deselect all
    } else {
      setSelectedIds(new Set(paginatedData.map((b) => b.id))); // Select all
    }
  };

  /**
   * Toggle selection for a single booking
   */
  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  // ==================== BULK ACTIONS ====================
  /**
   * Handle bulk actions on selected bookings
   * @param action - Action type (delete, export, confirm, cancel)
   */
  const handleBulkAction = (action: string) => {
    const count = selectedIds.size;
    
    switch (action) {
      case "delete":
        addToast(`${count} booking(s) deleted`, "success");
        break;
      case "export":
        addToast(`Exporting ${count} booking(s)...`, "info");
        break;
      case "confirm":
        addToast(`${count} booking(s) confirmed`, "success");
        break;
      case "cancel":
        addToast(`${count} booking(s) cancelled`, "warning");
        break;
    }
    
    // Clear selection after action
    setSelectedIds(new Set());
  };

  // ==================== STATUS CONFIGURATION ====================
  /**
   * Get color scheme and icon for booking status
   */
  const getStatusConfig = (status: string) => {
    const configs: Record<string, { bg: string; text: string; icon: JSX.Element; glow: string }> = {
      Confirmed: {
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        icon: <CheckCircle2 size={14} />,
        glow: "shadow-emerald-100",
      },
      Pending: {
        bg: "bg-amber-50",
        text: "text-amber-700",
        icon: <Clock size={14} />,
        glow: "shadow-amber-100",
      },
      Cancelled: {
        bg: "bg-rose-50",
        text: "text-rose-700",
        icon: <XCircle size={14} />,
        glow: "shadow-rose-100",
      },
      Processing: {
        bg: "bg-blue-50",
        text: "text-blue-700",
        icon: <Loader2 size={14} className="animate-spin" />,
        glow: "shadow-blue-100",
      },
    };
    
    // Return default config if status not found
    return configs[status] || {
      bg: "bg-gray-50",
      text: "text-gray-700",
      icon: <AlertCircle size={14} />,
      glow: "shadow-gray-100",
    };
  };

  // ==================== SORTING HANDLER ====================
  /**
   * Handle column header click for sorting
   * Toggle between asc/desc, or set new sort column
   */
  const handleSort = (column: string) => {
    if (sortBy === column) {
      // Toggle sort order if same column
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // Set new column and default to ascending
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  // ==================== RESET FILTERS ====================
  /**
   * Clear all filters and reset to default state
   */
  const handleReset = () => {
    setSearchInput("");
    setStatus("");
    setPage(1);
    setSortBy("");
    setSortOrder("desc");
    setDateFrom("");
    setDateTo("");
    setTripType("");
    setCarrier("");
    setSelectedIds(new Set());
    addToast("Filters cleared", "info");
  };

  // ==================== COLUMN VISIBILITY ====================
  /**
   * Toggle visibility of a table column
   */
  const toggleColumnVisibility = (key: string) => {
    setVisibleColumns((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  // ==================== FORMATTING UTILITIES ====================
  /**
   * Format number as currency (BDT)
   */
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "SAR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  /**
   * Format date string to readable format
   */
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ==================== EXPORT HANDLER ====================
  /**
   * Handle export action (simulated)
   */
  const handleExport = () => {
    addToast("Export started...", "info");
    // Simulate export delay
    setTimeout(() => {
      addToast("Export completed successfully!", "success");
    }, 1500);
  };

  // ==================== ACTIVE FILTER COUNT ====================
  // Count how many filters are currently active
  const activeFilterCount = [status, tripType, carrier, dateFrom, dateTo].filter(Boolean).length;

  // ==================== RENDER ====================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 p-4 md:p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* 
          ==================== HEADER SECTION ====================
          Page title, description, and action buttons
        */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            {/* Page title with animation */}
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl md:text-3xl font-bold text-slate-800"
            >
              {defaultStatus ? `${defaultStatus} Bookings` : "All Bookings"}
            </motion.h1>
            {/* Subtitle with animation */}
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-slate-500 mt-1"
            >
              Manage and track all flight bookings in one place
            </motion.p>
          </div>

          {/* Action buttons */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 md:gap-3 flex-wrap"
          >
            {/* Keyboard shortcuts button */}
            <button
              onClick={() => setShowKeyboardShortcuts(true)}
              className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition shadow-sm"
              title="Keyboard shortcuts"
            >
              <Keyboard size={18} />
            </button>

            {/* Column settings button */}
            <button
              onClick={() => setShowColumnSettings(true)}
              className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition shadow-sm"
              title="Column settings"
            >
              <Settings2 size={18} />
            </button>

            {/* View mode toggle (Table/Grid) */}
            <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
              <button
                onClick={() => setViewMode("table")}
                className={`p-2 rounded-lg transition ${
                  viewMode === "table" ? "bg-slate-800 text-white" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <LayoutList size={18} />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition ${
                  viewMode === "grid" ? "bg-slate-800 text-white" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Grid3X3 size={18} />
              </button>
            </div>

            {/* Export button */}
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition shadow-sm"
            >
              <Download size={16} />
              <span className="hidden sm:inline">Export</span>
            </button>

            {/* Refresh button */}
            <button
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition shadow-sm disabled:opacity-70"
            >
              <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </motion.div>
        </div>

        {/* 
          ==================== STATISTICS CARDS ====================
          Display key metrics and trends
        */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4"
        >
          {/* Total Bookings Card */}
          <div className="bg-white rounded-2xl p-4 md:p-5 border border-slate-100 shadow-sm hover:shadow-md transition group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-slate-500 font-medium">Total Bookings</p>
                <p className="text-xl md:text-2xl font-bold text-slate-800 mt-1">{stats.total}</p>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                <FileText size={20} className="text-slate-600" />
              </div>
            </div>
          </div>

          {/* Confirmed Bookings Card with trend */}
          <div className="bg-white rounded-2xl p-4 md:p-5 border border-emerald-100 shadow-sm hover:shadow-md transition group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-slate-500 font-medium">Confirmed</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-xl md:text-2xl font-bold text-emerald-600 mt-1">{stats.confirmed}</p>
                  <span className="flex items-center text-xs font-medium text-emerald-600">
                    <TrendingUp size={12} />
                    {stats.confirmedTrend}%
                  </span>
                </div>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                <CheckCircle2 size={20} className="text-emerald-600" />
              </div>
            </div>
          </div>

          {/* Pending Bookings Card with trend */}
          <div className="bg-white rounded-2xl p-4 md:p-5 border border-amber-100 shadow-sm hover:shadow-md transition group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-slate-500 font-medium">Pending</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-xl md:text-2xl font-bold text-amber-600 mt-1">{stats.pending}</p>
                  <span className="flex items-center text-xs font-medium text-rose-500">
                    <TrendingDown size={12} />
                    {Math.abs(stats.pendingTrend)}%
                  </span>
                </div>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                <Clock size={20} className="text-amber-600" />
              </div>
            </div>
          </div>

          {/* Cancelled Bookings Card with trend */}
          <div className="bg-white rounded-2xl p-4 md:p-5 border border-rose-100 shadow-sm hover:shadow-md transition group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-slate-500 font-medium">Cancelled</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-xl md:text-2xl font-bold text-rose-600 mt-1">{stats.cancelled}</p>
                  <span className="flex items-center text-xs font-medium text-emerald-500">
                    <TrendingDown size={12} />
                    {Math.abs(stats.cancelledTrend)}%
                  </span>
                </div>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-rose-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                <XCircle size={20} className="text-rose-600" />
              </div>
            </div>
          </div>

          {/* Revenue Card (spans 2 columns on mobile) */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 md:p-5 shadow-sm hover:shadow-lg transition col-span-2 md:col-span-1 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-slate-400 font-medium">Total Revenue</p>
                <p className="text-lg md:text-xl font-bold text-white mt-1">{formatCurrency(stats.totalRevenue)}</p>
                <span className="flex items-center text-xs font-medium text-emerald-400 mt-1">
                  <TrendingUp size={12} className="mr-0.5" />
                  {stats.revenueTrend}% from last month
                </span>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-white/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                <TrendingUp size={20} className="text-emerald-400" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* 
          ==================== SEARCH & FILTERS SECTION ====================
          Search bar, status filter, and advanced filters
        */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 md:p-5"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search bar and reset button */}
            <div className="flex flex-1 gap-2 md:gap-3 flex-wrap md:flex-nowrap">
              {/* Search input with icon */}
              <div className="relative flex-1 min-w-[200px]">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  ref={searchInputRef}
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search by ID, PNR, Passenger, Route..."
                  className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-800/10 focus:border-slate-400 transition"
                />
                {/* Clear search button */}
                {searchInput && (
                  <button
                    onClick={() => setSearchInput("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full"
                  >
                    <X size={14} className="text-slate-400" />
                  </button>
                )}
              </div>

              {/* Reset filters button */}
              <button
                onClick={handleReset}
                className="px-4 py-3 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200 transition flex items-center gap-2 shrink-0"
              >
                <RotateCcw size={16} />
                <span className="hidden sm:inline">Reset</span>
              </button>
            </div>

            {/* Status filter and advanced filters toggle */}
            <div className="flex items-center gap-2 md:gap-3 flex-wrap">
              {/* Status dropdown */}
              <div className="relative">
                <select
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value);
                    setPage(1); // Reset to first page when filter changes
                  }}
                  className="appearance-none pl-4 pr-10 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-800/10 focus:border-slate-400 bg-white cursor-pointer min-w-[140px]"
                >
                  <option value="">All Status</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Pending">Pending</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Processing">Processing</option>
                </select>
                <ChevronDown
                  size={16}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
              </div>

              {/* Advanced filters toggle button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 transition relative ${
                  showFilters
                    ? "bg-slate-800 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <SlidersHorizontal size={16} />
                <span className="hidden sm:inline">Filters</span>
                {/* Active filter count badge */}
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-xs rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* 
            Advanced Filters Panel
            Expands/collapses with animation
          */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                  {/* Date From filter */}
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">
                      Date From
                    </label>
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => {
                        setDateFrom(e.target.value);
                        setPage(1); // Reset to first page
                      }}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-800/10"
                    />
                  </div>
                  
                  {/* Date To filter */}
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">
                      Date To
                    </label>
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => {
                        setDateTo(e.target.value);
                        setPage(1);
                      }}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-800/10"
                    />
                  </div>
                  
                  {/* Trip Type filter */}
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">
                      Trip Type
                    </label>
                    <div className="relative">
                      <select
                        value={tripType}
                        onChange={(e) => {
                          setTripType(e.target.value);
                          setPage(1);
                        }}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-800/10 bg-white appearance-none pr-10"
                      >
                        <option value="">All Types</option>
                        <option value="OneWay">One Way</option>
                        <option value="RoundTrip">Round Trip</option>
                        <option value="MultiCity">Multi City</option>
                      </select>
                      <ChevronDown
                        size={14}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                      />
                    </div>
                  </div>
                  
                  {/* Carrier filter */}
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">
                      Carrier
                    </label>
                    <input
                      type="text"
                      value={carrier}
                      onChange={(e) => {
                        setCarrier(e.target.value);
                        setPage(1);
                      }}
                      placeholder="Airline code..."
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-800/10"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* 
          ==================== BULK ACTIONS BAR ====================
          Shows when items are selected
          Provides bulk operations: confirm, cancel, export, delete
        */}
        <AnimatePresence>
          {selectedIds.size > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-slate-800 rounded-2xl p-4 flex items-center justify-between"
            >
              {/* Selection info */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <CheckCheck size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold">
                    {selectedIds.size} booking{selectedIds.size > 1 ? "s" : ""} selected
                  </p>
                  <p className="text-slate-400 text-sm">Select action to perform</p>
                </div>
              </div>
              
              {/* Bulk action buttons */}
              <div className="flex items-center gap-2">
                {/* Confirm selected */}
                <button
                  onClick={() => handleBulkAction("confirm")}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 transition"
                >
                  <Check size={16} />
                  Confirm
                </button>
                
                {/* Cancel selected */}
                <button
                  onClick={() => handleBulkAction("cancel")}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-xl text-sm font-medium hover:bg-amber-600 transition"
                >
                  <Ban size={16} />
                  Cancel
                </button>
                
                {/* Export selected */}
                <button
                  onClick={() => handleBulkAction("export")}
                  className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-xl text-sm font-medium hover:bg-white/30 transition"
                >
                  <Download size={16} />
                  Export
                </button>
                
                {/* Delete selected */}
                <button
                  onClick={() => handleBulkAction("delete")}
                  className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-xl text-sm font-medium hover:bg-rose-600 transition"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
                
                {/* Clear selection */}
                <button
                  onClick={() => setSelectedIds(new Set())}
                  className="p-2 bg-white/10 text-white rounded-xl hover:bg-white/20 transition ml-2"
                >
                  <X size={18} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 
          ==================== RESULTS INFO & PAGE SIZE ====================
          Shows result count and page size selector
        */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Results count with search query display */}
          <p className="text-sm text-slate-500">
            Showing <span className="font-semibold text-slate-700">{paginatedData.length}</span> of{" "}
            <span className="font-semibold text-slate-700">{filteredData.length}</span> results
            {debouncedSearch && (
              <span className="ml-2 text-slate-400">
                for "<span className="text-slate-600">{debouncedSearch}</span>"
              </span>
            )}
          </p>
          
          {/* Page size selector */}
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>Rows per page:</span>
            <div className="relative">
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1); // Reset to first page
                }}
                className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm bg-white appearance-none pr-8 cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <ChevronDown
                size={14}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>
          </div>
        </div>

        {/* 
          ==================== ERROR STATE ====================
          Displays when data fetch fails
        */}
        {error && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center"
          >
            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={28} className="text-rose-500" />
            </div>
            <p className="text-rose-700 font-medium mb-2">Failed to load bookings</p>
            <p className="text-rose-600 text-sm mb-4">{error}</p>
            <button
              onClick={() => fetchData()}
              className="px-4 py-2 bg-rose-500 text-white rounded-lg text-sm font-medium hover:bg-rose-600 transition"
            >
              Try Again
            </button>
          </motion.div>
        )}

        {/* 
          ==================== DATA DISPLAY (TABLE/GRID) ====================
          Main content area - switches between table and grid views
        */}
        {!error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
          >
            {/* Show skeleton loader while loading */}
            {loading ? (
              <TableSkeleton />
            ) : viewMode === "table" ? (
              /* TABLE VIEW - Full data table with sortable columns */
              <div className="overflow-x-auto">
                <table className="w-full">
                  {/* Table header */}
                  <thead>
                    <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-100">
                      {/* Select all checkbox */}
                      <th className="px-5 py-4 text-left">
                        <input
                          type="checkbox"
                          checked={
                            paginatedData.length > 0 &&
                            selectedIds.size === paginatedData.length
                          }
                          onChange={toggleSelectAll}
                          className="w-4 h-4 rounded border-slate-300 text-slate-800 focus:ring-slate-500"
                        />
                      </th>
                      
                      {/* Dynamic columns based on visibility settings */}
                      {visibleColumns.includes("bookingId") && (
                        <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          <button
                            onClick={() => handleSort("bookingId")}
                            className="flex items-center gap-1 hover:text-slate-800 transition"
                          >
                            Booking ID
                            {/* Sort indicator */}
                            {sortBy === "bookingId" ? (
                              sortOrder === "asc" ? (
                                <ArrowUp size={14} />
                              ) : (
                                <ArrowDown size={14} />
                              )
                            ) : (
                              <ArrowUpDown size={14} className="opacity-40" />
                            )}
                          </button>
                        </th>
                      )}
                      
                      {/* Additional column headers (similar pattern) */}
                      {visibleColumns.includes("status") && (
                        <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Status
                        </th>
                      )}
                      {visibleColumns.includes("passenger") && (
                        <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Passenger
                        </th>
                      )}
                      {visibleColumns.includes("route") && (
                        <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Route
                        </th>
                      )}
                      {visibleColumns.includes("departure") && (
                        <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          <button
                            onClick={() => handleSort("departureDate")}
                            className="flex items-center gap-1 hover:text-slate-800 transition"
                          >
                            Departure
                            {sortBy === "departureDate" ? (
                              sortOrder === "asc" ? (
                                <ArrowUp size={14} />
                              ) : (
                                <ArrowDown size={14} />
                              )
                            ) : (
                              <ArrowUpDown size={14} className="opacity-40" />
                            )}
                          </button>
                        </th>
                      )}
                      {visibleColumns.includes("pnr") && (
                        <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          PNR
                        </th>
                      )}
                      {visibleColumns.includes("carrier") && (
                        <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Carrier
                        </th>
                      )}
                      {visibleColumns.includes("agent") && (
                        <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Agent
                        </th>
                      )}
                      {visibleColumns.includes("amount") && (
                        <th className="text-right px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          <button
                            onClick={() => handleSort("gross")}
                            className="flex items-center gap-1 hover:text-slate-800 transition ml-auto"
                          >
                            Amount
                            {sortBy === "gross" ? (
                              sortOrder === "asc" ? (
                                <ArrowUp size={14} />
                              ) : (
                                <ArrowDown size={14} />
                              )
                            ) : (
                              <ArrowUpDown size={14} className="opacity-40" />
                            )}
                          </button>
                        </th>
                      )}
                      
                      {/* Actions column (always visible) */}
                      <th className="px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  {/* Table body */}
                  <tbody className="divide-y divide-slate-100">
                    {paginatedData.length > 0 ? (
                      paginatedData.map((b) => {
                        const statusConfig = getStatusConfig(b.status);
                        const isSelected = selectedIds.has(b.id);
                        return (
                          <motion.tr
                            key={b.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className={`hover:bg-slate-50/80 transition group ${
                              isSelected ? "bg-slate-50" : ""
                            }`}
                          >
                            {/* Row checkbox */}
                            <td className="px-5 py-4">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleSelect(b.id)}
                                className="w-4 h-4 rounded border-slate-300 text-slate-800 focus:ring-slate-500"
                              />
                            </td>

                            {/* Booking ID cell (clickable to view details) */}
                            {visibleColumns.includes("bookingId") && (
                              <td className="px-5 py-4">
                                <button
                                  onClick={() => setSelectedBooking(b)}
                                  className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                                >
                                  <FileText size={12} />
                                  {b.bookingId || b.id}
                                </button>
                              </td>
                            )}

                            {/* Status badge */}
                            {visibleColumns.includes("status") && (
                              <td className="px-5 py-4">
                                <span
                                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${statusConfig.bg} ${statusConfig.text} ${statusConfig.glow}`}
                                >
                                  {statusConfig.icon}
                                  {b.status}
                                </span>
                              </td>
                            )}

                            {/* Passenger info with avatar */}
                            {visibleColumns.includes("passenger") && (
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center shrink-0">
                                    <Users size={16} className="text-slate-600" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-slate-800 text-sm">
                                      {b.passengers?.[0]
                                        ? `${b.passengers[0].firstName} ${b.passengers[0].lastName}`
                                        : "-"}
                                    </p>
                                    {/* Show additional passenger count */}
                                    {b.passengers?.length > 1 && (
                                      <p className="text-xs text-slate-400">
                                        +{b.passengers.length - 1} more
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </td>
                            )}

                            {/* Route visualization */}
                            {visibleColumns.includes("route") && (
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-slate-800 text-sm">
                                    {b.route?.split("-")[0] || "-"}
                                  </span>
                                  {/* Flight path indicator */}
                                  <div className="flex items-center">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                    <div className="w-6 h-px bg-slate-300 mx-0.5" />
                                    <Plane size={12} className="text-slate-400 rotate-90" />
                                    <div className="w-6 h-px bg-slate-300 mx-0.5" />
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                  </div>
                                  <span className="font-semibold text-slate-800 text-sm">
                                    {b.route?.split("-")[1] || "-"}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-400 mt-0.5">{b.tripType}</p>
                              </td>
                            )}

                            {/* Departure date */}
                            {visibleColumns.includes("departure") && (
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-2">
                                  <Calendar size={14} className="text-slate-400" />
                                  <span className="text-sm text-slate-700">
                                    {formatDate(b.departureDate)}
                                  </span>
                                </div>
                              </td>
                            )}

                            {/* PNR code */}
                            {visibleColumns.includes("pnr") && (
                              <td className="px-5 py-4">
                                <span className="font-mono text-sm font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded">
                                  {b.pnr || "-"}
                                </span>
                              </td>
                            )}

                            {/* Carrier/Airline */}
                            {visibleColumns.includes("carrier") && (
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 bg-sky-100 rounded-lg flex items-center justify-center">
                                    <Plane size={14} className="text-sky-600" />
                                  </div>
                                  <span className="text-sm font-medium text-slate-700">
                                    {b.carrier || "-"}
                                  </span>
                                </div>
                              </td>
                            )}

                            {/* Agent name */}
                            {visibleColumns.includes("agent") && (
                              <td className="px-5 py-4">
                                <p className="text-sm text-slate-700 font-medium">
                                  {b.agent?.agentName || "-"}
                                </p>
                              </td>
                            )}

                            {/* Pricing (Net & Gross) */}
                            {visibleColumns.includes("amount") && (
                              <td className="px-5 py-4 text-right">
                                <p className="text-sm font-bold text-slate-800">
                                  {formatCurrency(b.gross)}
                                </p>
                                <p className="text-xs text-slate-400">
                                  Net: {formatCurrency(b.net)}
                                </p>
                              </td>
                            )}

                            {/* Action buttons */}
                            <td className="px-5 py-4">
                              <div className="flex items-center justify-center gap-1">
                                {/* View details button */}
                                <button
                                  onClick={() => setSelectedBooking(b)}
                                  className="p-2 hover:bg-slate-100 rounded-lg transition"
                                  title="View details"
                                >
                                  <Eye size={16} className="text-slate-500" />
                                </button>
                                
                                {/* More actions dropdown menu */}
                                <div className="relative group/menu">
                                  <button className="p-2 hover:bg-slate-100 rounded-lg transition">
                                    <MoreHorizontal size={16} className="text-slate-500" />
                                  </button>
                                  {/* Dropdown menu (appears on hover) */}
                                  <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 hidden group-hover/menu:block z-10">
                                    <button className="w-full px-4 py-2 text-sm text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                      <Eye size={14} />
                                      View Details
                                    </button>
                                    <button className="w-full px-4 py-2 text-sm text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                      <Edit size={14} />
                                      Edit Booking
                                    </button>
                                    <button className="w-full px-4 py-2 text-sm text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                      <Printer size={14} />
                                      Print Ticket
                                    </button>
                                    <button className="w-full px-4 py-2 text-sm text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                      <Mail size={14} />
                                      Send Email
                                    </button>
                                    <hr className="my-1.5 border-slate-100" />
                                    <button className="w-full px-4 py-2 text-sm text-left text-rose-600 hover:bg-rose-50 flex items-center gap-2">
                                      <Trash2 size={14} />
                                      Cancel Booking
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })
                    ) : (
                      /* Empty state when no results */
                      <tr>
                        <td colSpan={11} className="px-5 py-16 text-center">
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center"
                          >
                            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                              <FileText size={36} className="text-slate-400" />
                            </div>
                            <p className="text-slate-600 font-semibold text-lg">No bookings found</p>
                            <p className="text-slate-400 text-sm mt-1 max-w-sm">
                              Try adjusting your search or filters to find what you're looking for
                            </p>
                            <button
                              onClick={handleReset}
                              className="mt-4 px-5 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition flex items-center gap-2"
                            >
                              <RotateCcw size={16} />
                              Reset Filters
                            </button>
                          </motion.div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              /* 
                GRID VIEW - Card-based layout
                More visual, better for mobile
              */
              <div className="p-4 md:p-6">
                {paginatedData.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {paginatedData.map((b) => {
                      const statusConfig = getStatusConfig(b.status);
                      const isSelected = selectedIds.has(b.id);
                      return (
                        <motion.div
                          key={b.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          whileHover={{ y: -2 }} // Lift effect on hover
                          className={`bg-white border rounded-2xl p-4 hover:shadow-lg transition cursor-pointer ${
                            isSelected ? "border-slate-400 ring-2 ring-slate-200" : "border-slate-200"
                          }`}
                          onClick={() => setSelectedBooking(b)} // Click card to view details
                        >
                          {/* Card header with ID and status */}
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="text-xs text-slate-400 font-medium">Booking ID</p>
                              <p className="font-semibold text-slate-800">{b.bookingId || b.id}</p>
                            </div>
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${statusConfig.bg} ${statusConfig.text}`}
                            >
                              {statusConfig.icon}
                              {b.status}
                            </span>
                          </div>

                          {/* Route visualization */}
                          <div className="bg-slate-50 rounded-xl p-3 mb-3">
                            <div className="flex items-center justify-between">
                              <div className="text-center">
                                <p className="text-lg font-bold text-slate-800">
                                  {b.route?.split("-")[0]}
                                </p>
                              </div>
                              <div className="flex items-center">
                                <div className="w-1 h-1 rounded-full bg-slate-300" />
                                <div className="w-8 h-px bg-slate-300" />
                                <Plane size={14} className="text-slate-400 mx-1 rotate-90" />
                                <div className="w-8 h-px bg-slate-300" />
                                <div className="w-1 h-1 rounded-full bg-emerald-400" />
                              </div>
                              <div className="text-center">
                                <p className="text-lg font-bold text-slate-800">
                                  {b.route?.split("-")[1]}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Booking details */}
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500">Passenger</span>
                              <span className="font-medium text-slate-700">
                                {b.passengers?.[0]
                                  ? `${b.passengers[0].firstName} ${b.passengers[0].lastName}`
                                  : "-"}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500">Departure</span>
                              <span className="font-medium text-slate-700">
                                {formatDate(b.departureDate)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500">PNR</span>
                              <span className="font-mono font-semibold text-slate-700">{b.pnr}</span>
                            </div>
                          </div>

                          {/* Card footer with price and select button */}
                          <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                            <p className="text-lg font-bold text-slate-800">
                              {formatCurrency(b.gross)}
                            </p>
                            {/* Select/deselect button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent card click event
                                toggleSelect(b.id);
                              }}
                              className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${
                                isSelected
                                  ? "bg-slate-800 text-white"
                                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                              }`}
                            >
                              <Check size={16} />
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  /* Empty state for grid view */
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText size={36} className="text-slate-400" />
                    </div>
                    <p className="text-slate-600 font-semibold text-lg">No bookings found</p>
                    <p className="text-slate-400 text-sm mt-1">
                      Try adjusting your search or filters
                    </p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* 
          ==================== PAGINATION CONTROLS ====================
          Navigate between pages, shows current page info
        */}
        {!loading && !error && filteredData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-between gap-4"
          >
            {/* Current page info */}
            <p className="text-sm text-slate-500 order-2 sm:order-1">
              Page <span className="font-semibold text-slate-700">{page}</span> of{" "}
              <span className="font-semibold text-slate-700">{totalPages}</span>
            </p>

            {/* Pagination buttons */}
            <div className="flex items-center gap-1 order-1 sm:order-2">
              {/* First page button */}
              <button
                disabled={page === 1}
                onClick={() => setPage(1)}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                title="First page"
              >
                <ChevronsLeft size={18} className="text-slate-600" />
              </button>
              
              {/* Previous page button */}
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                title="Previous page"
              >
                <ChevronLeft size={18} className="text-slate-600" />
              </button>

              {/* Page number buttons (max 5 visible) */}
              <div className="flex items-center gap-1 mx-1 md:mx-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Calculate which page number to show
                  let pageNum;
                  if (totalPages <= 5) {
                    // Show all pages if 5 or fewer
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    // Show first 5 pages
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    // Show last 5 pages
                    pageNum = totalPages - 4 + i;
                  } else {
                    // Show current page in middle
                    pageNum = page - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-9 h-9 md:w-10 md:h-10 rounded-lg text-sm font-medium transition ${
                        page === pageNum
                          ? "bg-slate-800 text-white shadow-lg"
                          : "hover:bg-slate-100 text-slate-600 border border-slate-200"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              {/* Next page button */}
              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                title="Next page"
              >
                <ChevronRight size={18} className="text-slate-600" />
              </button>
              
              {/* Last page button */}
              <button
                disabled={page === totalPages}
                onClick={() => setPage(totalPages)}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                title="Last page"
              >
                <ChevronsRight size={18} className="text-slate-600" />
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* 
        ==================== MODALS ====================
        All modal components controlled by AnimatePresence for smooth animations
      */}
      
      {/* Booking Detail Modal */}
      <AnimatePresence>
        {selectedBooking && (
          <BookingDetailModal
            booking={selectedBooking}
            onClose={() => setSelectedBooking(null)}
          />
        )}
      </AnimatePresence>

      {/* Column Settings Modal */}
      <AnimatePresence>
        {showColumnSettings && (
          <ColumnSettingsModal
            columns={allColumns}
            visibleColumns={visibleColumns}
            onToggle={toggleColumnVisibility}
            onClose={() => setShowColumnSettings(false)}
          />
        )}
      </AnimatePresence>

      {/* Keyboard Shortcuts Modal */}
      <AnimatePresence>
        {showKeyboardShortcuts && (
          <KeyboardShortcutsModal onClose={() => setShowKeyboardShortcuts(false)} />
        )}
      </AnimatePresence>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}