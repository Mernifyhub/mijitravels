import AdminAllBooking from "@/app/components/admin/admin-bookings/AdminAllBooking";

export default function OnHoldPage() {
  return (
    <div className="min-h-screen bg-[#F4F6F9]">
      {/* AdminAllBooking component renders the cards */}
      <AdminAllBooking defaultStatus="ON_HOLD" />
    </div>
  );
}