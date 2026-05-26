
import AdminSideBar from '@/app/components/admin/AdminSidebar';

export default function ManagerLayout({children}:{children:React.ReactNode}){

return(

<div className="flex min-h-screen">

{/* sidebar */}
<AdminSideBar/>

<div className="flex-1 bg-gray-100">



<div className="pt-5 p-6">
{children}
</div>

</div>

</div>

)

}