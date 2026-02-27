import { useEffect, useState } from "react";
import { fetchEmployees, fetchSprints, fetchWorkLogs } from "./services/api";
import { generateDays } from "./utils/helpers";

import Header from "./components/Header";
import SprintForm from "./components/SprintForm";
import EmployeeForm from "./components/EmployeeForm";
import PerformanceChart from "./components/PerformanceChart";
import WorkLogTable from "./components/WorkLogTable";

function App() {
  // --- STATE'LER ---
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [sprintList, setSprintList] = useState([]);
  const [selectedSprint, setSelectedSprint] = useState(null);
  const [workLogs, setWorkLogs] = useState([]);
  const [days, setDays] = useState([]);

  // --- VERİ YÜKLEME ---
  useEffect(() => {
    loadEmployees();
    loadAllSprints();
  }, []);

  const loadEmployees = () => {
    fetchEmployees()
      .then((data) => setEmployees(data))
      .catch((err) => console.error("Çalışanlar yüklenemedi:", err));
  };

  const loadAllSprints = () => {
    fetchSprints()
      .then((data) => {
        setSprintList(data);
        const today = new Date();
        const active = data.find(
          (s) => new Date(s.startDate) <= today && new Date(s.endDate) >= today,
        );
        if (active) loadSprintData(active);
        else if (data.length > 0) loadSprintData(data[0]);
      })
      .catch((err) => console.error("Sprintler yüklenemedi:", err));
  };

  const loadSprintData = (sprint) => {
    setLoading(true);
    setWorkLogs([]);
    setSelectedSprint(sprint);
    setDays(generateDays(sprint.startDate, sprint.endDate));

    fetchWorkLogs(sprint.startDate, sprint.endDate)
      .then((data) => setWorkLogs(data))
      .catch((err) => console.error("WorkLog yüklenemedi:", err))
      .finally(() => setTimeout(() => setLoading(false), 500));
  };

  const handleSprintChange = (e) => {
    const sprintId = parseInt(e.target.value);
    const sprint = sprintList.find((s) => s.id === sprintId);
    if (sprint) loadSprintData(sprint);
  };

  const grandTotal = workLogs.reduce((sum, c) => sum + c.hours, 0);

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans py-10 px-4 md:px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-6">
        <Header
          sprintList={sprintList}
          selectedSprint={selectedSprint}
          onSprintChange={handleSprintChange}
        />

        {/* Form Alanları */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SprintForm onSprintCreated={loadAllSprints} />
          <EmployeeForm onEmployeeCreated={loadEmployees} />
        </div>

        {/* Sprint İçeriği */}
        {selectedSprint && (
          <>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 dark:border-blue-400 mb-4"></div>
                <h3 className="text-lg font-semibold text-gray-600 dark:text-slate-300 animate-pulse">
                  Veriler Getiriliyor...
                </h3>
                <p className="text-sm text-gray-400 dark:text-slate-500">
                  Lütfen bekleyiniz
                </p>
              </div>
            ) : (
              <>
                <PerformanceChart
                  employees={employees}
                  workLogs={workLogs}
                  grandTotal={grandTotal}
                />
                <WorkLogTable
                  employees={employees}
                  workLogs={workLogs}
                  setWorkLogs={setWorkLogs}
                  days={days}
                  selectedSprint={selectedSprint}
                />
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;
