export default function RecordCards(){

const records = [

{title:"Total Booking",value:10,color:"bg-purple-400"},
{title:"Total Flown Segment",value:0,color:"bg-slate-700"},
{title:"Total Ticketed",value:0,color:"bg-cyan-700"},
{title:"Total Loss",value:0,color:"bg-blue-900"},
{title:"Total Voided Segment",value:0,color:"bg-slate-600"},
{title:"Total Profit",value:0,color:"bg-blue-800"},
{title:"Total Agent",value:23,color:"bg-slate-500"},
{title:"Total Cancelled",value:0,color:"bg-green-500"},
{title:"Total Deposit",value:20,color:"bg-yellow-900"},
{title:"Total Deposit Pending",value:0,color:"bg-teal-400"},
{title:"Total Deposit Approved",value:18,color:"bg-purple-700"},
{title:"Total Deposit Rejected",value:2,color:"bg-green-700"}

]

return(

<div>

<h2 className="text-xl font-semibold text-black mb-4">
All Record
</h2>

<div className="grid grid-cols-6 gap-4">

{records.map((r,i)=>(

<div
key={i}
className={`${r.color} text-white p-4 rounded-lg shadow`}
>

<p className="text-xs opacity-80">
{r.title}
</p>

<p className="text-xl font-semibold">
{r.value}
</p>

</div>

))}

</div>

</div>

)

}