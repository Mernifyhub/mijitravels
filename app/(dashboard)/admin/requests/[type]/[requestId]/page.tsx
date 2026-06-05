// app/admin/requests/[type]/[requestId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api";
import { extractFareFromBooking, calculateFare } from "@/lib/fare";

// Components
import { TYPE_MAP, COLOR_MAP } from "@/app/components/admin/request-process/configs";
import RequestHeader   from "@/app/components/admin/request-process/RequestHeader";
import LockedWarning   from "@/app/components/admin/request-process/LockedWarning";
import SuccessBanner   from "@/app/components/admin/request-process/SuccessBanner";
import BookingInfoCard from "@/app/components/admin/request-process/BookingInfoCard";
import TicketInfoForm  from "@/app/components/admin/request-process/TicketInfoForm";
import PassengerList   from "@/app/components/admin/request-process/PassengerList";
import AgentInfoCard   from "@/app/components/admin/request-process/AgentInfoCard";
import FareBreakdown   from "@/app/components/admin/request-process/FareBreakdown";
import AgentRemarksCard from "@/app/components/admin/request-process/AgentRemarksCard";
import ActionPanel     from "@/app/components/admin/request-process/ActionPanel";

export default function AdminRequestProcessPage() {
  const router    = useRouter();
  const params    = useParams();
  const type      = (params.type as string)?.toLowerCase();
  const requestId = params.requestId as string;

  // ── States ──
  const [request,    setRequest]    = useState<any>(null);
  const [loading,    setLoading]    = useState(true);
  const [adminNote,  setAdminNote]  = useState("");
  const [processing, setProcessing] = useState(false);
  const [done,       setDone]       = useState(false);
  const [actionDone, setActionDone] = useState<string | null>(null);

  const [gdsPnr,       setGdsPnr]       = useState("");
  const [ticketNumber, setTicketNumber] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [issueAmount,  setIssueAmount]  = useState("");

  const [assignLoading,   setAssignLoading]   = useState(false);
  const [currentUserId,   setCurrentUserId]   = useState("");
  const [currentUserName, setCurrentUserName] = useState("");

  const current = TYPE_MAP[type] || TYPE_MAP.issue;
  const colors  = COLOR_MAP[current.color] || COLOR_MAP.emerald;
  const isIssue = type === "issue";

  // ── Helpers ──
  const formatDate = (d: string) =>
    d ? new Date(d).toLocaleDateString("en-US", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    }) : "—";

  // ── Assign state derived ──
  const isAssigned        = !!request?.assignedToId;
  const isAssignedToMe    = request?.assignedToId === currentUserId;
  const isAssignedToOther = isAssigned && !isAssignedToMe;
  const assignedPersonName =
    request?.assignedTo?.agentName ||
    `${request?.assignedTo?.firstName || ""} ${request?.assignedTo?.lastName || ""}`.trim() ||
    "";

  // ── Fetch current user ──
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await apiClient("/auth/profile");
        setCurrentUserId(profile?.id || profile?.user?.id || "");
        setCurrentUserName(
          profile?.agentName ||
          `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim() ||
          profile?.email || ""
        );
      } catch (err: any) {
        if (String(err?.message).includes("401")) {
          window.location.href = "/login";
        }
      }
    };
    fetchProfile();
  }, []);

  // ── Fetch request ──
  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const data = await apiClient(`/admin/requests/${requestId}`);
        setRequest(data);
      } catch (e: any) {
        console.error("Request fetch error:", e?.message || e);
      } finally {
        setLoading(false);
      }
    };
    fetchRequest();
  }, [requestId]);

  // ── Auto-fill GDS PNR ──
  useEffect(() => {
    if (request?.gdsPnr) setGdsPnr(request.gdsPnr.toUpperCase());
    else if (request?.booking?.pnr) setGdsPnr(request.booking.pnr.toUpperCase());
  }, [request]);

  // ── Assign ──
  const handleAssign = async () => {
    setAssignLoading(true);
    try {
      const data = await apiClient(`/admin/requests/${requestId}/assign`, { method: "POST" });
      setRequest((prev: any) => ({
        ...prev,
        assignedToId: data.assignedToId || currentUserId,
        assignedTo: data.assignedTo || { agentName: currentUserName },
        assignedAt: data.assignedAt || new Date().toISOString(),
      }));
    } catch (err: any) {
      alert(err?.message || "Failed to assign");
    } finally {
      setAssignLoading(false);
    }
  };

  // ── Release ──
  const handleRelease = async () => {
    setAssignLoading(true);
    try {
      await apiClient(`/admin/requests/${requestId}/release`, { method: "DELETE" });
      setRequest((prev: any) => ({
        ...prev, assignedToId: null, assignedTo: null, assignedAt: null,
      }));
    } catch (err: any) {
      alert(err?.message || "Failed to release");
    } finally {
      setAssignLoading(false);
    }
  };

  // ── Process ──
  const handleProcess = async (action: "APPROVED" | "REJECTED" | "PROCESSING") => {
    if (isIssue && action === "APPROVED") {
      if (!gdsPnr.trim())       { alert("Please enter GDS PNR!");       return; }
      if (!ticketNumber.trim()) { alert("Please enter Ticket Number!"); return; }
      if (!supplierName.trim()) { alert("Please enter Supplier Name!"); return; }
    }
    setProcessing(true);
    try {
      await apiClient(`/admin/requests/${requestId}/process`, {
        method: "POST",
        body: JSON.stringify({
          action, adminNote,
          ...(isIssue && {
            gdsPnr:       gdsPnr.trim()       || null,
            ticketNumber: ticketNumber.trim() || null,
            supplierName: supplierName.trim() || null,
            issueAmount:  issueAmount ? parseFloat(issueAmount) : null,
          }),
        }),
      });
      setDone(true);
      setActionDone(action);
      setTimeout(() => router.push(`/admin/requests/${type}`), 2000);
    } catch (e: any) {
      alert(e?.message || "Failed to process request");
    } finally {
      setProcessing(false);
    }
  };

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#021f3b]" />
      </div>
    );
  }

  const booking    = request?.booking;
  const agent      = request?.agent;
  const passengers = booking?.passengers || [];

  // ── Fare data ──
  const sourceCurrency = booking?.currency || "SAR";
  const fareInput      = extractFareFromBooking(booking);
  const fareCalc       = fareInput
    ? calculateFare({ ...fareInput, currency: sourceCurrency })
    : null;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <RequestHeader
          current={current}
          colors={colors}
          booking={booking}
          request={request}
          isAssigned={isAssigned}
          isAssignedToMe={isAssignedToMe}
          assignedPersonName={assignedPersonName}
        />

        {/* Locked Warning */}
        {isAssignedToOther && (
          <LockedWarning assignedPersonName={assignedPersonName} />
        )}

        {/* Success Banner */}
        {done && <SuccessBanner actionDone={actionDone} />}

        <div className="grid lg:grid-cols-3 gap-6">

          {/* ── Left ── */}
          <div className="lg:col-span-2 space-y-4">
            <BookingInfoCard booking={booking} formatDate={formatDate} />

            {isIssue && (
              <TicketInfoForm
                booking={booking}
                gdsPnr={gdsPnr}
                ticketNumber={ticketNumber}
                supplierName={supplierName}
                issueAmount={issueAmount}
                done={done}
                isAssignedToOther={isAssignedToOther}
                setGdsPnr={setGdsPnr}
                setTicketNumber={setTicketNumber}
                setSupplierName={setSupplierName}
                setIssueAmount={setIssueAmount}
              />
            )}

            <PassengerList passengers={passengers} />
          </div>

          {/* ── Right ── */}
          <div className="space-y-4">
            <AgentInfoCard agent={agent} />

            <FareBreakdown
              booking={booking}
              fareCalc={fareCalc}
              sourceCurrency={sourceCurrency}
            />

            <AgentRemarksCard
              remarks={request?.remarks}
              createdAt={request?.createdAt}
              formatDate={formatDate}
            />

            <ActionPanel
              current={current}
              colors={colors}
              done={done}
              actionDone={actionDone}
              processing={processing}
              assignLoading={assignLoading}
              isAssigned={isAssigned}
              isAssignedToMe={isAssignedToMe}
              isAssignedToOther={isAssignedToOther}
              assignedPersonName={assignedPersonName}
              adminNote={adminNote}
              setAdminNote={setAdminNote}
              onApprove={() => handleProcess("APPROVED")}
              onReject={() => handleProcess("REJECTED")}
              onProcessing={() => handleProcess("PROCESSING")}
              onAssign={handleAssign}
              onRelease={handleRelease}
            />
          </div>
        </div>
      </div>
    </div>
  );
}