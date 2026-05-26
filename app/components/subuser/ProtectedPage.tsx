// app/components/ProtectedPage.tsx
"use client";

import React from "react"; // ← add করো
import { usePermission } from "@/app/hooks/usePermission";
import AccessDenied from "@/app/components/subuser/AccessDenied";
import AgentTopBar from "@/app/components/agent/AgentTopBar";

interface ProtectedPageProps {
  children:       React.ReactNode;
  permission?:    string;
  allowedRoles?:  string[];
  title?:         string;
}

export default function ProtectedPage({
  children,
  permission,
  allowedRoles,
  title,
}: ProtectedPageProps) {
  const { userInfo, isLoading, hasPermission, hasRole, isMainAgent } =
    usePermission();

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AgentTopBar />
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded-lg w-48" />
            <div className="h-64 bg-gray-200 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  // Main agent always has access
  if (isMainAgent) {
    return <>{children}</>;
  }

  // Permission check
  if (permission && !hasPermission(permission)) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AgentTopBar />
        <AccessDenied
          title={`Cannot Access ${title || "This Page"}`}
          message={`You need the "${permission}" permission to access this page. Contact your agency admin.`}
          currentRole={userInfo?.role}
          requiredRole={permission}
        />
      </div>
    );
  }

  // Role check
  if (allowedRoles && !hasRole(allowedRoles)) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AgentTopBar />
        <AccessDenied
          title="Role Access Required"
          message={`This page requires ${allowedRoles.join(" or ")} role.`}
          currentRole={userInfo?.role}
          requiredRole={allowedRoles.join(", ")}
        />
      </div>
    );
  }

  return <>{children}</>;
}