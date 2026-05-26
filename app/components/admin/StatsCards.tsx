export default function StatsCards() {
  return (
    <div className="grid grid-cols-3 gap-6">

      <div className="bg-green-500 text-white p-6 rounded-xl shadow">
        <p>Ticketed Amount</p>
        <h2 className="text-xl font-bold">SAR 0</h2>
      </div>

      <div className="bg-slate-700 text-white p-6 rounded-xl shadow">
        <p>Loss / Profit</p>
        <h2 className="text-xl font-bold">SAR 0</h2>
      </div>

      <div className="bg-teal-500 text-white p-6 rounded-xl shadow">
        <p>Deposit Amount</p>
        <h2 className="text-xl font-bold">SAR 0</h2>
      </div>

      <div className="bg-yellow-500 text-white p-6 rounded-xl shadow">
        <p>Total Partial Due</p>
        <h2 className="text-xl font-bold">SAR 0</h2>
      </div>

      <div className="bg-gray-500 text-white p-6 rounded-xl shadow">
        <p>Refund Amount</p>
        <h2 className="text-xl font-bold">SAR 0</h2>
      </div>

      <div className="bg-red-600 text-white p-6 rounded-xl shadow">
        <p>Reissue Amount</p>
        <h2 className="text-xl font-bold">SAR 0</h2>
      </div>

      <div className="bg-blue-900 text-white p-6 rounded-xl shadow">
        <p>Void Amount</p>
        <h2 className="text-xl font-bold">SAR 0</h2>
      </div>

      <div className="bg-purple-600 text-white p-6 rounded-xl shadow">
        <p>Total Partial Paid</p>
        <h2 className="text-xl font-bold">SAR 0</h2>
      </div>
      <div className="bg-green-700 text-white p-6 rounded-xl shadow">
        <p>Total Active Agent</p>
        <h2 className="text-xl font-bold">SAR 0</h2>
      </div>

    </div>
  );
}