"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  User, Mail, Phone, MapPin, Camera, Edit3, Save, X,
  Eye, EyeOff, Lock, Shield, CheckCircle, AlertCircle,
  Loader2, ArrowLeft, Building, FileText, Key, Trash2,
  Upload, Plane, CreditCard, Download, Calendar,
} from "lucide-react";
import { apiClient } from "@/lib/api";

// ✅ Component বাইরে
const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL.replace("/api/v1", "")
    : "http://localhost:3001";

const getSafePath = (filePath: string): string => {
  if (!filePath) return "";

  if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
    return filePath;
  }

  // Windows backslash → forward slash
  let normalized = filePath.replace(/\\/g, "/");

  // Windows drive letter remove
  normalized = normalized.replace(/^[A-Za-z]:\//, "");

  // "uploads/" থেকে শুরু কর
  const uploadsIndex = normalized.indexOf("uploads/");
  if (uploadsIndex !== -1) {
    return `${BACKEND_URL}/${normalized.slice(uploadsIndex)}`;
  }

  if (normalized.startsWith("/")) {
    return `${BACKEND_URL}${normalized}`;
  }

  return `${BACKEND_URL}/${normalized}`;
};

const getFileName = (filePath: string): string => {
  if (!filePath) return "";
  const normalized = filePath.replace(/\\/g, "/");
  return normalized.split("/").pop() || filePath;
};

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  agentName: string;
  agentAddress: string;
  aviationNumber: string;
  logo: string;
  nidCopy: string;
  tradeLicense: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function UserProfilePage() {
  const router = useRouter();
  const nidInputRef = useRef<HTMLInputElement>(null);
  const licenseInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "documents" | "security">("profile");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [uploadingFile, setUploadingFile] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // ===== FETCH USER =====
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await apiClient("/auth/profile");

        // ✅ { success: true, user: {...} } format
        const userData = data?.user || (data?.id ? data : null);

        if (!userData) {
          setErrorMessage("Failed to load profile");
          return;
        }

        const profile: UserProfile = {
          id: userData.id || "",
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          email: userData.email || "",
          phone: userData.phone || "",
          agentName: userData.agentName || "",
          agentAddress: userData.agentAddress || "",
          aviationNumber: userData.aviationNumber || "",
          nidCopy: userData.nidCopy || "",
          tradeLicense: userData.tradeLicense || "",
          logo: userData.logo || "",
          role: userData.role || "USER",
          createdAt: userData.createdAt || "",
          updatedAt: userData.updatedAt || userData.lastActive || "",
        };

        setUser(profile);
        setFormData(profile);
      } catch (error: any) {
        console.error("Fetch Error:", error);
        if (String(error?.message).includes("401")) {
          router.push("/login");
          return;
        }
        setErrorMessage("Failed to load profile data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setErrorMessage("");
    setTimeout(() => setSuccessMessage(""), 4000);
  };

  const showError = (msg: string) => {
    setErrorMessage(msg);
    setSuccessMessage("");
  };

  // ===== INPUT HANDLERS =====
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordFieldChange = (
    field: keyof PasswordData,
    value: string
  ) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }));
  };

  // ===== SAVE PROFILE =====
  const handleSaveProfile = async () => {
    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const data = await apiClient("/auth/profile", {
        method: "PUT",
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          agentName: formData.agentName,
          agentAddress: formData.agentAddress,
          aviationNumber: formData.aviationNumber,
        }),
      });

      const updatedData = data?.user || (data?.id ? data : null);

      if (!updatedData) {
        showError(data?.message || "Failed to update profile");
        return;
      }

      const updatedProfile: UserProfile = {
        id: updatedData.id || user?.id || "",
        firstName: updatedData.firstName || "",
        lastName: updatedData.lastName || "",
        email: updatedData.email || user?.email || "",
        phone: updatedData.phone || "",
        agentName: updatedData.agentName || "",
        agentAddress: updatedData.agentAddress || "",
        aviationNumber: updatedData.aviationNumber || "",
        nidCopy: updatedData.nidCopy || user?.nidCopy || "",
        tradeLicense: updatedData.tradeLicense || user?.tradeLicense || "",
        logo: updatedData.logo || user?.logo || "",
        role: updatedData.role || user?.role || "USER",
        createdAt: updatedData.createdAt || user?.createdAt || "",
        updatedAt: updatedData.updatedAt || updatedData.lastActive || "",
      };

      setUser(updatedProfile);
      setFormData(updatedProfile);
      setIsEditing(false);
      showSuccess("Profile updated successfully!");
    } catch (error: any) {
      console.error("Save Error:", error);
      if (String(error?.message).includes("401")) {
        router.push("/login");
        return;
      }
      showError("An error occurred. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // ===== CHANGE PASSWORD =====
  const handleChangePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordData;

    if (!currentPassword || !newPassword || !confirmPassword) {
      showError("All password fields are required");
      return;
    }
    if (newPassword.length < 8) {
      showError("New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      showError("New passwords do not match");
      return;
    }

    setIsSaving(true);
    setErrorMessage("");

    try {
      const data = await apiClient("/auth/profile/change-password", {
        method: "POST",
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (data?.success === false) {
        showError(data.message || "Failed to change password");
        return;
      }

      showSuccess("Password changed successfully!");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      console.error("Password Change Error:", error);
      if (String(error?.message).includes("401")) {
        router.push("/login");
        return;
      }
      showError(
        String(error?.message).toLowerCase().includes("incorrect")
          ? "Current password is incorrect"
          : "An error occurred. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  // ===== DOCUMENT UPLOAD =====
  const handleDocumentUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "nidCopy" | "tradeLicense" | "logo"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      "image/jpeg", "image/jpg", "image/png",
      "image/webp", "application/pdf",
    ];

    if (!allowedTypes.includes(file.type)) {
      showError("Invalid file type. Allowed: JPG, PNG, WEBP, PDF");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showError("File size too large. Maximum 5MB allowed");
      return;
    }

    setUploadingFile(type);
    setErrorMessage("");

    try {
      const uploadData = new FormData();
      uploadData.append("type", type);
      uploadData.append("file", file);
      

      const data = await apiClient(`/auth/profile/upload-document/${type}`, {
  method: "POST",
  body: uploadData,
});

      if (data?.success === false) {
        showError(data.message || "Failed to upload file");
        return;
      }

      const newPath = data?.path || "";
      setUser((prev) => (prev ? { ...prev, [type]: newPath } : null));
      setFormData((prev) => ({ ...prev, [type]: newPath }));
      showSuccess(data?.message || "Uploaded successfully!");
    } catch (error: any) {
      console.error("Upload Error:", error);
      if (String(error?.message).includes("401")) {
        router.push("/login");
        return;
      }
      showError("Failed to upload document");
    } finally {
      setUploadingFile(null);
      if (type === "nidCopy" && nidInputRef.current) nidInputRef.current.value = "";
      if (type === "tradeLicense" && licenseInputRef.current) licenseInputRef.current.value = "";
      if (type === "logo" && logoInputRef.current) logoInputRef.current.value = "";
    }
  };

  const handleCancelEdit = () => {
    setFormData(user || {});
    setIsEditing(false);
    setErrorMessage("");
  };

  const getInitials = () => {
    if (!user) return "U";
    return ((user.firstName?.[0] || "") + (user.lastName?.[0] || "")).toUpperCase() || "U";
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric", month: "long", day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const getRoleDisplay = () => {
    const role = user?.role?.toLowerCase() || "";
    if (role === "admin") return "Admin";
    if (role === "manager") return "Manager";
    if (role === "agent") return "Agent";
    return "User";
  };

  const getRoleColor = () => {
    const role = user?.role?.toLowerCase() || "";
    if (role === "admin") return "bg-red-100 text-red-700";
    if (role === "manager") return "bg-purple-100 text-purple-700";
    if (role === "agent") return "bg-blue-100 text-blue-700";
    return "bg-green-100 text-green-700";
  };

  // ===== LOADING =====
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // ===== NOT LOGGED IN =====
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Not Logged In</h2>
          <p className="text-gray-600 mb-4">
            {errorMessage || "Please login to view your profile"}
          </p>
          <button
            onClick={() => router.push("/login")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // ===== SAFE PATHS =====
  const safeNidCopy = getSafePath(user.nidCopy || "");
  const safeTradeLicense = getSafePath(user.tradeLicense || "");
  const safeLogo = getSafePath(user.logo || "");

  // ===== RENDER =====
  return (
    <div className="min-h-screen bg-gray-50">

      {/* HEADER */}
      <div className="bg-gradient-to-r from-[#021f3b] to-[#0a4d8c] text-white">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-6">
            <button onClick={() => router.back()} className="p-2 hover:bg-white/10 rounded-lg transition">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold">My Profile</h1>
              <p className="text-blue-200 text-sm">Manage your account settings</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-6 pb-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-28 h-28 rounded-2xl bg-white/20 flex items-center justify-center border-4 border-white/30 overflow-hidden">
                {safeLogo ? (
                  <img src={safeLogo} alt="Agency Logo" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold">{getInitials()}</span>
                )}
              </div>
              <button
                onClick={() => logoInputRef.current?.click()}
                disabled={uploadingFile === "logo"}
                className="absolute -bottom-2 -right-2 w-10 h-10 bg-white text-[#021f3b] rounded-xl flex items-center justify-center shadow-lg hover:bg-gray-100 transition disabled:opacity-50"
                title="Upload Logo"
              >
                {uploadingFile === "logo" ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
              </button>
              <input ref={logoInputRef} type="file" accept="image/*" onChange={(e) => handleDocumentUpload(e, "logo")} className="hidden" />
            </div>

            {/* Info */}
            <div className="text-center md:text-left flex-1">
              <h2 className="text-2xl font-bold">{user.firstName} {user.lastName}</h2>
              <p className="text-blue-200">{user.email}</p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor()}`}>{getRoleDisplay()}</span>
                {user.agentName && (
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm flex items-center gap-1">
                    <Building size={14} /> {user.agentName}
                  </span>
                )}
                {user.aviationNumber && (
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm flex items-center gap-1">
                    <Plane size={14} /> {user.aviationNumber}
                  </span>
                )}
              </div>
              <p className="text-sm text-blue-200 mt-2">
                <Calendar size={14} className="inline mr-1" />
                Member since {formatDate(user.createdAt)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            {[
              { id: "profile", label: "Profile", icon: User },
              { id: "documents", label: "Documents", icon: FileText },
              { id: "security", label: "Security", icon: Shield },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-4 font-medium transition border-b-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Messages */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
            <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
            <p className="text-green-800">{successMessage}</p>
            <button onClick={() => setSuccessMessage("")} className="ml-auto text-green-600 hover:text-green-800">
              <X size={18} />
            </button>
          </div>
        )}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
            <p className="text-red-800">{errorMessage}</p>
            <button onClick={() => setErrorMessage("")} className="ml-auto text-red-600 hover:text-red-800">
              <X size={18} />
            </button>
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === "profile" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">

              {/* Personal Information */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Personal Information</h3>
                    <p className="text-sm text-gray-500">Update your personal details</p>
                  </div>
                  {!isEditing ? (
                    <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition font-medium">
                      <Edit3 size={16} /> Edit
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={handleCancelEdit} className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition font-medium">
                        <X size={16} /> Cancel
                      </button>
                      <button onClick={handleSaveProfile} disabled={isSaving} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50">
                        {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save
                      </button>
                    </div>
                  )}
                </div>

                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <User size={14} className="inline mr-1" />First Name
                      </label>
                      {isEditing ? (
                        <input type="text" name="firstName" value={formData.firstName || ""} onChange={handleInputChange} className="w-full px-4 py-3 text-gray-900 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" placeholder="Enter first name" />
                      ) : (
                        <p className="px-4 py-3 bg-gray-50 rounded-xl text-gray-800">{user.firstName || "Not set"}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <User size={14} className="inline mr-1" />Last Name
                      </label>
                      {isEditing ? (
                        <input type="text" name="lastName" value={formData.lastName || ""} onChange={handleInputChange} className="w-full px-4 py-3 text-gray-900 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" placeholder="Enter last name" />
                      ) : (
                        <p className="px-4 py-3 bg-gray-50 rounded-xl text-gray-800">{user.lastName || "Not set"}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Mail size={14} className="inline mr-1" />Email Address
                      </label>
                      <p className="px-4 py-3 bg-gray-100 rounded-xl text-gray-600">
                        {user.email || "Not set"}
                        <span className="ml-2 text-xs text-gray-400">(Cannot change)</span>
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Phone size={14} className="inline mr-1" />Phone Number
                      </label>
                      {isEditing ? (
                        <input type="tel" name="phone" value={formData.phone || ""} onChange={handleInputChange} className="w-full px-4 py-3 text-gray-900 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" placeholder="+880 1XXX XXXXXX" />
                      ) : (
                        <p className="px-4 py-3 bg-gray-50 rounded-xl text-gray-800">{user.phone || "Not set"}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Agency Information */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg"><Building size={20} className="text-blue-600" /></div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">Agency Information</h3>
                      <p className="text-sm text-gray-500">Your agency/company details</p>
                    </div>
                  </div>
                </div>
                <div className="p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Building size={14} className="inline mr-1" />Agency Name
                    </label>
                    {isEditing ? (
                      <input type="text" name="agentName" value={formData.agentName || ""} onChange={handleInputChange} className="w-full px-4 py-3 border text-gray-900 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" placeholder="Enter agency name" />
                    ) : (
                      <p className="px-4 py-3 bg-gray-50 rounded-xl text-gray-800">{user.agentName || "Not set"}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin size={14} className="inline mr-1" />Agency Address
                    </label>
                    {isEditing ? (
                      <textarea name="agentAddress" value={formData.agentAddress || ""} onChange={handleInputChange} rows={3} className="w-full px-4 py-3 text-gray-900 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none" placeholder="Enter agency full address" />
                    ) : (
                      <p className="px-4 py-3 bg-gray-50 rounded-xl text-gray-800 min-h-[80px]">{user.agentAddress || "Not set"}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Plane size={14} className="inline mr-1" />Aviation Number / IATA Code
                    </label>
                    {isEditing ? (
                      <input type="text" name="aviationNumber" value={formData.aviationNumber || ""} onChange={handleInputChange} className="w-full px-4 py-3 text-gray-900 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" placeholder="Enter aviation number" />
                    ) : (
                      <p className="px-4 py-3 bg-gray-50 rounded-xl text-gray-800">{user.aviationNumber || "Not set"}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Status</h3>
                <div className="space-y-4">
                  {[
                    { label: "Status", value: <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">Active</span> },
                    { label: "Role", value: <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor()}`}>{getRoleDisplay()}</span> },
                    { label: "Member Since", value: <span className="text-gray-800 text-sm">{formatDate(user.createdAt)}</span> },
                    { label: "Last Updated", value: <span className="text-gray-800 text-sm">{formatDate(user.updatedAt)}</span> },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between">
                      <span className="text-gray-600">{row.label}</span>
                      {row.value}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  {[
                    { icon: FileText, label: "View Documents", action: () => setActiveTab("documents") },
                    { icon: Lock, label: "Change Password", action: () => setActiveTab("security") },
                    { icon: Edit3, label: "Edit Profile", action: () => setIsEditing(true) },
                  ].map((item) => (
                    <button key={item.label} onClick={item.action} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-xl transition text-left">
                      <item.icon size={18} className="text-gray-500" />
                      <span className="text-gray-700">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {user.agentName && (
                <div className="bg-gradient-to-br from-[#021f3b] to-[#0a4d8c] rounded-2xl p-6 text-white">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-white/20 rounded-lg"><Building size={20} /></div>
                    <span className="font-semibold">Agency Card</span>
                  </div>
                  <h4 className="text-xl font-bold mb-1">{user.agentName}</h4>
                  <p className="text-blue-200 text-sm mb-3">{user.agentAddress || "Address not set"}</p>
                  {user.aviationNumber && (
                    <div className="flex items-center gap-2 text-sm bg-white/10 rounded-lg px-3 py-2">
                      <Plane size={14} />
                      <span>Aviation: {user.aviationNumber}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* DOCUMENTS TAB */}
        {activeTab === "documents" && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-xl"><FileText size={24} className="text-blue-600" /></div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Uploaded Documents</h3>
                    <p className="text-sm text-gray-500">Your verification documents</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {[
                  {
                    type: "logo" as const,
                    label: "Agency Logo",
                    desc: "Your agency/company logo",
                    icon: <Camera size={20} className="text-blue-600" />,
                    iconBg: "bg-blue-100",
                    safePath: safeLogo,
                    accept: "image/*",
                    ref: logoInputRef,
                    isImage: true,
                  },
                  {
                    type: "nidCopy" as const,
                    label: "NID Copy",
                    desc: "National ID Card",
                    icon: <CreditCard size={20} className="text-green-600" />,
                    iconBg: "bg-green-100",
                    safePath: safeNidCopy,
                    accept: "image/*,.pdf",
                    ref: nidInputRef,
                    isImage: false,
                  },
                  {
                    type: "tradeLicense" as const,
                    label: "Trade License",
                    desc: "Business Registration",
                    icon: <FileText size={20} className="text-purple-600" />,
                    iconBg: "bg-purple-100",
                    safePath: safeTradeLicense,
                    accept: "image/*,.pdf",
                    ref: licenseInputRef,
                    isImage: false,
                  },
                ].map((doc) => (
                  <div key={doc.type} className="border border-gray-200 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 ${doc.iconBg} rounded-lg`}>{doc.icon}</div>
                        <div>
                          <h4 className="font-semibold text-gray-800">{doc.label}</h4>
                          <p className="text-sm text-gray-500">{doc.desc}</p>
                        </div>
                      </div>
                      {doc.safePath && (
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center gap-1">
                          <CheckCircle size={14} /> Uploaded
                        </span>
                      )}
                    </div>

                    {doc.safePath ? (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            {doc.isImage ? (
                              <div className="w-20 h-20 rounded-xl border border-gray-200 overflow-hidden bg-white flex items-center justify-center">
                                <img src={doc.safePath} alt={doc.label} className="w-full h-full object-contain" />
                              </div>
                            ) : (
                              <div className="w-12 h-12 rounded-xl bg-gray-200 flex items-center justify-center">
                                <FileText size={24} className="text-gray-500" />
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-gray-800 text-sm">{getFileName(doc.safePath)}</p>
                              <p className="text-xs text-gray-500">{doc.desc}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <a href={doc.safePath} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-gray-200 rounded-lg transition">
                              <Eye size={18} className="text-gray-600" />
                            </a>
                            <a href={doc.safePath} download className="p-2 hover:bg-gray-200 rounded-lg transition">
                              <Download size={18} className="text-gray-600" />
                            </a>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-xl p-6 text-center">
                        <div className="w-12 h-12 rounded-xl bg-gray-200 flex items-center justify-center mx-auto mb-2">
                          <FileText size={24} className="text-gray-400" />
                        </div>
                        <p className="text-gray-500 text-sm">No {doc.label.toLowerCase()} uploaded</p>
                      </div>
                    )}

                    <div className="mt-4">
                      <input
                        ref={doc.ref}
                        type="file"
                        accept={doc.accept}
                        onChange={(e) => handleDocumentUpload(e, doc.type)}
                        className="hidden"
                      />
                      <button
                        onClick={() => doc.ref.current?.click()}
                        disabled={uploadingFile === doc.type}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium text-gray-700 disabled:opacity-50"
                      >
                        {uploadingFile === doc.type ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Upload size={16} />
                        )}
                        {doc.safePath ? `Replace ${doc.label}` : `Upload ${doc.label}`}
                      </button>
                    </div>
                  </div>
                ))}

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex gap-3">
                    <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-800">Document Guidelines</p>
                      <ul className="text-sm text-blue-700 mt-1 space-y-1">
                        <li>• Upload clear, legible copies of your documents</li>
                        <li>• Accepted formats: JPG, PNG, WEBP, PDF</li>
                        <li>• Maximum file size: 5MB</li>
                        <li>• Documents will be verified by admin</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECURITY TAB */}
        {activeTab === "security" && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-xl"><Key size={24} className="text-blue-600" /></div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Change Password</h3>
                    <p className="text-sm text-gray-500">Update your password regularly for security</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) => handlePasswordFieldChange("currentPassword", e.target.value)}
                      className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      placeholder="Enter current password"
                    />
                    <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) => handlePasswordFieldChange("newPassword", e.target.value)}
                      className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      placeholder="Enter new password"
                    />
                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className={`h-1 w-8 rounded-full transition-colors ${
                          passwordData.newPassword.length >= i * 2
                            ? passwordData.newPassword.length >= 8 ? "bg-green-500" : "bg-amber-400"
                            : "bg-gray-200"
                        }`} />
                      ))}
                    </div>
                    <p className={`text-xs ${passwordData.newPassword.length >= 8 ? "text-green-600" : "text-gray-500"}`}>
                      {passwordData.newPassword.length === 0 ? "Min 8 characters"
                        : passwordData.newPassword.length < 8 ? `${8 - passwordData.newPassword.length} more needed`
                        : "Strong ✓"}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) => handlePasswordFieldChange("confirmPassword", e.target.value)}
                      className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      placeholder="Confirm new password"
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {passwordData.confirmPassword && (
                    <p className={`text-xs mt-1.5 ${passwordData.newPassword === passwordData.confirmPassword ? "text-green-600" : "text-red-500"}`}>
                      {passwordData.newPassword === passwordData.confirmPassword ? "✓ Passwords match" : "✗ Passwords do not match"}
                    </p>
                  )}
                </div>

                <button
                  onClick={handleChangePassword}
                  disabled={isSaving}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium disabled:opacity-50"
                >
                  {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Lock size={20} />}
                  Update Password
                </button>
              </div>
            </div>

            <div className="bg-red-50 rounded-2xl border border-red-200 p-6 mt-6">
              <h3 className="text-lg font-semibold text-red-800 mb-2">Danger Zone</h3>
              <p className="text-sm text-red-600 mb-4">Once you delete your account, there is no going back.</p>
              <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium">
                <Trash2 size={18} /> Delete My Account
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}