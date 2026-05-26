"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const data = [
  { name: "Search", value: 1579 },
  { name: "Agent", value: 23 },
  { name: "Booking", value: 10 },
  { name: "Cancelled", value: 2 },
  { name: "Deposit", value: 1 },
];

const COLORS = ["#4F46E5","#22C55E","#06B6D4","#EF4444","#F59E0B"];

export default function AgentChart(){

return(

<ResponsiveContainer width="100%" height={260}>

<PieChart>

<Pie
data={data}
innerRadius={70}
outerRadius={100}
paddingAngle={3}
dataKey="value"
>

{data.map((entry,index)=>(

<Cell key={index} fill={COLORS[index % COLORS.length]}/>

))}

</Pie>

<Tooltip/>
<Legend/>

</PieChart>

</ResponsiveContainer>

);

}