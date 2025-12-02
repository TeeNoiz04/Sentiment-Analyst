import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const sample = [
  { name: "Jan", value: 20 },
  { name: "Feb", value: 45 },
  { name: "Mar", value: 32 },
];

export default function Dashboard() {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Dashboard</h2>

      <LineChart width={500} height={300} data={sample}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="value" stroke="#3b82f6" />
      </LineChart>
    </div>
  );
}
