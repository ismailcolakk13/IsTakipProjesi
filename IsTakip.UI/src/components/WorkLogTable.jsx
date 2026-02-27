import { isWeekend, formatDate } from "../utils/helpers";
import { saveWorkLog } from "../services/api";

export default function WorkLogTable({
  employees,
  workLogs,
  setWorkLogs,
  days,
  selectedSprint,
}) {
  const getEmployeeTotal = (empId) =>
    workLogs
      .filter((w) => w.employeeId === empId)
      .reduce((sum, c) => sum + c.hours, 0);

  const getDayTotal = (date) =>
    workLogs
      .filter((w) => new Date(w.date).toDateString() === date.toDateString())
      .reduce((sum, c) => sum + c.hours, 0);

  const getGrandTotal = () => workLogs.reduce((sum, c) => sum + c.hours, 0);

  const getHours = (empId, date) => {
    const log = workLogs.find(
      (w) =>
        w.employeeId === empId &&
        new Date(w.date).toDateString() === date.toDateString(),
    );
    return log ? log.hours : "";
  };

  const handleHoursChange = (empId, date, value) => {
    const hours = value === "" ? 0 : parseFloat(value);
    const logDateStr = date.toDateString();
    const filteredLogs = workLogs.filter(
      (w) =>
        !(
          w.employeeId === empId &&
          new Date(w.date).toDateString() === logDateStr
        ),
    );

    if (hours > 0) {
      filteredLogs.push({
        employeeId: empId,
        date: date.toISOString(),
        hours: hours,
        description: "Form Entry",
      });
    }
    setWorkLogs(filteredLogs);

    saveWorkLog({
      employeeId: empId,
      date: date.toISOString(),
      hours: hours,
      description: "Auto Save",
    });
  };

  const downloadReport = () => {
    if (!selectedSprint) return;

    let csvContent = "\uFEFF";
    csvContent += `Rapor Başlığı;${selectedSprint.name} Performans Raporu\n`;
    csvContent += `Dönem;${formatDate(selectedSprint.startDate)} - ${formatDate(selectedSprint.endDate)}\n`;
    csvContent += `Oluşturulma Tarihi;${new Date().toLocaleDateString("tr-TR")} ${new Date().toLocaleTimeString("tr-TR")}\n`;
    csvContent += `Genel Toplam Efor;${getGrandTotal()} Saat\n`;
    csvContent += "\n";
    csvContent += "Personel;Tarih;Saat;Açıklama\n";

    const sortedLogs = [...workLogs].sort(
      (a, b) => new Date(a.date) - new Date(b.date),
    );

    sortedLogs.forEach((log) => {
      const emp = employees.find((e) => e.id === log.employeeId);
      const dateStr = new Date(log.date).toLocaleDateString("tr-TR");
      const hoursFormatted = log.hours.toString().replace(".", ",");
      csvContent += `${emp?.name} ${emp?.surname};${dateStr};${hoursFormatted};${log.description || "-"}\n`;
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(
      new Blob([csvContent], { type: "text/csv;charset=utf-8;" }),
    );
    const fileName = `${selectedSprint.name.replace(/\s+/g, "_")}_Efor_Raporu.csv`;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 transition-colors duration-300">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-700 dark:text-slate-200">
          📋 Efor Giriş Çizelgesi
        </h3>
        <button
          onClick={downloadReport}
          className="flex items-center gap-2 bg-gray-700 hover:bg-gray-800 dark:bg-slate-600 dark:hover:bg-slate-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition shadow-sm"
        >
          <span>📥</span> Excel İndir
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-slate-700">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 dark:text-slate-400 uppercase bg-gray-50 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700">
            <tr>
              <th className="px-4 py-4 font-bold text-gray-600 dark:text-slate-300">
                Çalışan Adı
              </th>
              {days.map((day) => (
                <th
                  key={day.toISOString()}
                  className={`px-2 py-3 text-center border-l border-gray-100 dark:border-slate-700 ${isWeekend(day) ? "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400" : ""}`}
                >
                  <div className="font-bold text-sm">
                    {day.toLocaleDateString("tr-TR", { day: "numeric" })}
                  </div>
                  <div className="font-normal text-[10px]">
                    {day.toLocaleDateString("tr-TR", { weekday: "short" })}
                  </div>
                </th>
              ))}
              <th className="px-4 py-4 text-center bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-l border-blue-100 dark:border-blue-800">
                TOPLAM
              </th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr
                key={emp.id}
                className="bg-white dark:bg-slate-800 border-b border-gray-50 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-slate-200 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold uppercase">
                    {emp.name.charAt(0)}
                    {emp.surname.charAt(0)}
                  </div>
                  {emp.name} {emp.surname}
                </td>
                {days.map((day) => {
                  const val = getHours(emp.id, day);
                  const isWknd = isWeekend(day);
                  return (
                    <td
                      key={day.toISOString()}
                      className={`p-1 text-center border-l border-gray-50 dark:border-slate-700 ${isWknd ? "bg-red-50/30 dark:bg-red-900/10" : ""}`}
                    >
                      <input
                        type="number"
                        min="0"
                        max="24"
                        placeholder="-"
                        className={`w-10 text-center rounded py-1 outline-none transition-all text-sm
                          ${val > 0 ? "bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 font-bold" : "bg-transparent border border-transparent hover:border-gray-200 dark:hover:border-slate-600"}
                          ${val > 8 ? "text-red-600 dark:text-red-400" : "text-gray-700 dark:text-slate-300"}
                          focus:bg-white dark:focus:bg-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500
                        `}
                        value={val}
                        onChange={(e) =>
                          handleHoursChange(emp.id, day, e.target.value)
                        }
                      />
                    </td>
                  );
                })}
                <td className="px-4 py-3 text-center font-bold text-blue-700 dark:text-blue-300 bg-blue-50/50 dark:bg-blue-900/20 border-l border-blue-50 dark:border-blue-900">
                  {getEmployeeTotal(emp.id)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50 dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700">
            <tr>
              <td className="px-4 py-3 font-bold text-gray-600 dark:text-slate-300">
                GÜNLÜK TOPLAM
              </td>
              {days.map((day, i) => (
                <td
                  key={i}
                  className="px-2 py-3 text-center font-bold text-gray-500 dark:text-slate-400 border-l border-gray-200 dark:border-slate-700"
                >
                  {getDayTotal(day) > 0 ? getDayTotal(day) : "-"}
                </td>
              ))}
              <td className="px-4 py-3 text-center font-black text-blue-600 dark:text-blue-400 text-base border-l border-blue-100 dark:border-blue-800">
                {getGrandTotal()}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
