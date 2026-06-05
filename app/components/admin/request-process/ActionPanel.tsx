// app/components/admin/request-process/ActionPanel.tsx
"use client";

import {
  Loader2, CheckCircle2, XCircle, Clock,
  UserCheck, Lock, Unlock,
} from "lucide-react";
import { ColorMapEntry, TypeMapEntry } from "./types";

interface ActionPanelProps {
  current: TypeMapEntry;
  colors: ColorMapEntry;
  done: boolean;
  actionDone: string | null;
  processing: boolean;
  assignLoading: boolean;
  isAssigned: boolean;
  isAssignedToMe: boolean;
  isAssignedToOther: boolean;
  assignedPersonName: string;
  adminNote: string;
  setAdminNote: (v: string) => void;
  onApprove: () => void;
  onReject: () => void;
  onProcessing: () => void;
  onAssign: () => void;
  onRelease: () => void;
}

export default function ActionPanel({
  current, colors, done, actionDone,
  processing, assignLoading,
  isAssigned, isAssignedToMe, isAssignedToOther,
  assignedPersonName, adminNote, setAdminNote,
  onApprove, onReject, onProcessing, onAssign, onRelease,
}: ActionPanelProps) {
  return (
    <div className={`bg-white rounded-2xl border shadow-sm p-5
      ${isAssignedToOther ? "border-orange-200 opacity-60" : "border-gray-100"}`}
    >
      <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
        Admin Action
      </h3>

      {done ? (
        <div className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-black text-sm border-2
          ${actionDone === "APPROVED"   ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
            actionDone === "REJECTED"   ? "bg-red-50    text-red-700    border-red-200"       :
            "bg-blue-50 text-blue-700 border-blue-200"}`}
        >
          {actionDone === "APPROVED"   && <><CheckCircle2 size={18} /> Approved!</>}
          {actionDone === "REJECTED"   && <><XCircle      size={18} /> Rejected!</>}
          {actionDone === "PROCESSING" && <><Clock        size={18} /> Marked Processing!</>}
        </div>
      ) : (
        <>
          {/* Note */}
          <textarea
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
            rows={3}
            placeholder="Add admin note (optional)..."
            disabled={isAssignedToOther}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#021f3b] resize-none placeholder:text-gray-300 mb-3 transition disabled:bg-gray-50 disabled:opacity-60"
          />

          <div className="space-y-2">
            {/* Approve */}
            <button
              onClick={onApprove}
              disabled={processing || isAssignedToOther}
              className={`w-full py-3 rounded-xl text-white font-black text-sm uppercase tracking-widest transition active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2 ${colors.btn}`}
            >
              {processing        ? <Loader2      size={16} className="animate-spin" /> :
               isAssignedToOther ? <Lock         size={16} />                          :
                                   <CheckCircle2 size={16} />}
              {current.title}
            </button>

            {/* Assign / Release */}
            {!isAssigned ? (
              <button
                onClick={onAssign}
                disabled={assignLoading}
                className="w-full py-2.5 rounded-xl bg-[#021f3b] hover:bg-[#0a3a6b] text-white font-black text-sm uppercase tracking-widest transition active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {assignLoading ? <Loader2 size={14} className="animate-spin" /> : <UserCheck size={14} />}
                Assign to Me
              </button>
            ) : isAssignedToMe ? (
              <button
                onClick={onRelease}
                disabled={assignLoading}
                className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-sm uppercase tracking-widest transition active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {assignLoading ? <Loader2 size={14} className="animate-spin" /> : <Unlock size={14} />}
                Release
              </button>
            ) : (
              <div className="w-full py-2.5 rounded-xl bg-orange-50 border border-orange-200 text-orange-700 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                <Lock size={14} />
                Locked by {assignedPersonName}
              </div>
            )}

            {/* Mark Processing */}
            <button
              onClick={onProcessing}
              disabled={processing || isAssignedToOther}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm uppercase tracking-widest transition active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {processing        ? <Loader2 size={14} className="animate-spin" /> :
               isAssignedToOther ? <Lock    size={14} />                          :
                                   <Clock   size={14} />}
              Mark Processing
            </button>

            {/* Reject */}
            <button
              onClick={onReject}
              disabled={processing || isAssignedToOther}
              className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-sm uppercase tracking-widest transition active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {processing        ? <Loader2 size={14} className="animate-spin" /> :
               isAssignedToOther ? <Lock    size={14} />                          :
                                   <XCircle size={14} />}
              Reject
            </button>
          </div>

          {isAssignedToOther && (
            <p className="text-[9px] text-orange-600 text-center mt-2 flex items-center justify-center gap-1">
              <Lock size={9} /> Locked by {assignedPersonName}
            </p>
          )}
        </>
      )}
    </div>
  );
}