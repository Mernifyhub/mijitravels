import AgentAllBooking  from "@/app/components/agent/bookings/AgnetAllBooking";

export default function OnHoldPage() {
  return (
    <div className="min-h-screen bg-[#F4F6F9]">
      {/* AllBooking component renders the cards */}
      <AgentAllBooking defaultStatus="ON_HOLD" />
    </div>
  );
}