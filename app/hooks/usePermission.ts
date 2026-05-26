"use client";

import { useState, useEffect } from "react";

interface UserInfo {
  id: string;
  role: string;
  type: string;
  permissions: string[];
  agentId?: string;
}

export function usePermission() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          const user = data.user;

          if (user) {
            setUserInfo({
              id: user.id || "",
              role: user.role || "USER",
              // ✅ type না থাকলে default "agent"
              type: user.type || "agent",
              // ✅ permissions না থাকলে empty array
              permissions: user.permissions || [],
              agentId: user.agentId || undefined,
            });
          }
        }
      } catch (error) {
        console.error("Failed to fetch user info:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  // ✅ Permission check
  const hasPermission = (permission: string): boolean => {
    if (!userInfo) return false;

    // ADMIN সব access পায়
    if (userInfo.role === "ADMIN") return true;

    // Main agent সব access পায়
    if (userInfo.role === "USER" && userInfo.type === "agent") return true;

    // SubUser - specific permission check
    if (userInfo.type === "subuser") {
      return userInfo.permissions.includes(permission);
    }

    return false;
  };

  // ✅ Role check
  const hasRole = (roles: string[]): boolean => {
    if (!userInfo) return false;
    return roles.includes(userInfo.role);
  };

  const isSubUser = userInfo?.type === "subuser";
  const isMainAgent = userInfo?.type === "agent";
  const isAdmin = userInfo?.role === "ADMIN";
  const isManager = userInfo?.role === "MANAGER";

  return {
    userInfo,
    isLoading,
    hasPermission,
    hasRole,
    isSubUser,
    isMainAgent,
    isAdmin,
    isManager,
  };
}