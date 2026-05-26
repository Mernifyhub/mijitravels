import AdminSideBar from '@/app/components/admin/AdminSidebar';

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <AdminSideBar />
      <div className="flex-1 bg-gray-100">
        <div className="pl-6 pr-8">
          {children}
        </div>
      </div>
    </div>
  );
}