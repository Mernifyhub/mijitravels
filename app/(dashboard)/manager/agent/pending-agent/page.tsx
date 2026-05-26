import AgentListTable from "@/app/components/agent/AgentLishtTable";

export default function PendingAgentPage( {defaultStatus = "pending"} ) {
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <AgentListTable defaultStatus={defaultStatus} />
    </div>
  );
}