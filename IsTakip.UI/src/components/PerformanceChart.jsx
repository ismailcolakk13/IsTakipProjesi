import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useTheme } from "../context/ThemeContext";

export default function PerformanceChart({ employees, workLogs, grandTotal }) {
  const { darkMode } = useTheme();

  const getEmployeeTotal = (empId) =>
    workLogs
      .filter((w) => w.employeeId === empId)
      .reduce((sum, c) => sum + c.hours, 0);

  const chartData = employees.map((emp) => ({
    name: `${emp.name} ${emp.surname}`,
    Saat: getEmployeeTotal(emp.id),
  }));

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 mb-6 transition-colors duration-300">
      <div className="flex flex-wrap justify-between items-center mb-6 pb-4 border-b border-gray-100 dark:border-slate-700">
        <h3 className="text-lg font-bold text-gray-700 dark:text-slate-200">
          📈 Performans Grafiği
        </h3>
        <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-1.5 rounded-lg font-bold text-sm border border-blue-100 dark:border-blue-800">
          Toplam Efor: {grandTotal} Saat
        </div>
      </div>

      <div className="w-full" style={{ height: 350 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke={darkMode ? "#334155" : "#f3f4f6"}
            />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: darkMode ? "#94a3b8" : "#6b7280" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: darkMode ? "#94a3b8" : "#6b7280" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: darkMode ? "#1e293b" : "#f9fafb" }}
              contentStyle={{
                borderRadius: "8px",
                border: "none",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                backgroundColor: darkMode ? "#1e293b" : "#ffffff",
                color: darkMode ? "#e2e8f0" : "#1f2937",
              }}
            />
            <Legend
              wrapperStyle={{
                color: darkMode ? "#cbd5e1" : "#374151",
              }}
            />
            <Bar
              dataKey="Saat"
              fill={darkMode ? "#60a5fa" : "#3b82f6"}
              radius={[6, 6, 0, 0]}
              barSize={50}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
