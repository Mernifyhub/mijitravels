import AgentListTable from "@/app/components/agent/AgentLishtTable";

export default function AllAgentPage({ defaultStatus = "" }) {
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <AgentListTable defaultStatus={defaultStatus} />
    </div>
  );
}