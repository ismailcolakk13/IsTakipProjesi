import { useEffect, useState } from "react";
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

function App() {
  // --- STATE'LER
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [sprintList, setSprintList] = useState([]);
  const [selectedSprint, setSelectedSprint] = useState(null);
  const [workLogs, setWorkLogs] = useState([]);
  const [days, setDays] = useState([]);

  const [employeeForm, setEmployeeForm] = useState({
    name: "",
    surname: "",
    email: "",
    phone: "",
  });
  const [sprintForm, setSprintForm] = useState({
    name: "",
    startDate: "",
    endDate: "",
  });

  const BASE_URL = "http://localhost:5090/api";

  // --- LOGIC (Aynı Kalıyor) ---
  useEffect(() => {
    fetchEmployees();
    fetchAllSprints();
  }, []);

  const fetchEmployees = () => {
    fetch(`${BASE_URL}/employees`)
      .then((res) => res.json())
      .then((data) => setEmployees(data));
  };

  const fetchAllSprints = () => {
    fetch(`${BASE_URL}/sprints`)
      .then((res) => res.json())
      .then((data) => {
        setSprintList(data);
        const today = new Date();
        const active = data.find(
          (s) => new Date(s.startDate) <= today && new Date(s.endDate) >= today,
        );
        if (active) loadSprintData(active);
        else if (data.length > 0) loadSprintData(data[0]);
      })
      .catch((err) => console.error(err));
  };

  const loadSprintData = (sprint) => {
    setLoading(true); // Yüklenme başladı (Spinner dönsün)
    setWorkLogs([]); // Eski verileri temizle
    setSelectedSprint(sprint);
    generateDays(sprint.startDate, sprint.endDate);

    fetch(
      `${BASE_URL}/worklogs?start=${sprint.startDate}&end=${sprint.endDate}`,
    )
      .then((res) => res.json())
      .then((data) => {
        setWorkLogs(data);
      })
      .catch((err) => console.error(err))
      .finally(() => {
        // Hata olsa da olmasa da işlem bitince loading'i kapat
        // Kullanıcı o geçişi hissetsin diye yarım saniye gecikme koyuyoruz (İsteğe bağlı)
        setTimeout(() => setLoading(false), 500);
      });
  };

  const handleSprintChange = (e) => {
    const sprintId = parseInt(e.target.value);
    const sprint = sprintList.find((s) => s.id === sprintId);
    if (sprint) loadSprintData(sprint);
  };

  const generateDays = (startStr, endStr) => {
    const start = new Date(startStr);
    const end = new Date(endStr);
    const dateArray = [];
    while (start <= end) {
      dateArray.push(new Date(start));
      start.setDate(start.getDate() + 1);
    }
    setDays(dateArray);
  };

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString("tr-TR");
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
  const isWeekend = (date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  const handleHoursChange = (empId, date, value) => {
    const hours = value === "" ? 0 : parseFloat(value);
    const newLogs = [...workLogs];
    const logDateStr = date.toDateString();
    const filteredLogs = newLogs.filter(
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

    fetch(`${BASE_URL}/worklogs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employeeId: empId,
        date: date.toISOString(),
        hours: hours,
        description: "Auto Save",
      }),
    });
  };

  const downloadReport = () => {
    // Eğer sprint seçili değilse hata vermesin
    if (!selectedSprint) return;

    // Excel'in Türkçe karakterleri (ş, ı, ğ) tanıması için BOM (Byte Order Mark) ekliyoruz
    let csvContent = "\uFEFF";

    // --- 1. ÜST BİLGİLER (HEADER) ---
    // Buraya istediğin kadar detay ekleyebilirsin
    csvContent += `Rapor Başlığı;${selectedSprint.name} Performans Raporu\n`;
    csvContent += `Dönem;${formatDate(selectedSprint.startDate)} - ${formatDate(selectedSprint.endDate)}\n`;
    csvContent += `Oluşturulma Tarihi;${new Date().toLocaleDateString("tr-TR")} ${new Date().toLocaleTimeString("tr-TR")}\n`;
    csvContent += `Genel Toplam Efor;${getGrandTotal()} Saat\n`;
    csvContent += "\n"; // Tablo ile başlık arasına boş bir satır koyalım

    // --- 2. TABLO SÜTUN BAŞLIKLARI ---
    csvContent += "Personel;Tarih;Saat;Açıklama\n";

    // --- 3. VERİ SATIRLARI ---
    // Verileri tarihe göre sıralayalım ki Excel'de karışık durmasın
    const sortedLogs = [...workLogs].sort(
      (a, b) => new Date(a.date) - new Date(b.date),
    );

    sortedLogs.forEach((log) => {
      const emp = employees.find((e) => e.id === log.employeeId);
      const dateStr = new Date(log.date).toLocaleDateString("tr-TR");

      // Excel TR versiyonlarında ondalık ayracı virgül olduğu için replace yapıyoruz
      const hoursFormatted = log.hours.toString().replace(".", ",");

      csvContent += `${emp?.name} ${emp?.surname};${dateStr};${hoursFormatted};${log.description || "-"}\n`;
    });

    // --- 4. DOSYA OLUŞTURMA VE İNDİRME ---
    const link = document.createElement("a");
    link.href = URL.createObjectURL(
      new Blob([csvContent], { type: "text/csv;charset=utf-8;" }),
    );

    // Dosya ismini dinamik yapalım: "Sprint_1_Efor_Raporu.csv" gibi
    const fileName = `${selectedSprint.name.replace(/\s+/g, "_")}_Efor_Raporu.csv`;

    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEmployeeSubmit = (e) => {
    e.preventDefault();
    fetch(`${BASE_URL}/employees`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(employeeForm),
    }).then(() => {
      setEmployeeForm({ name: "", surname: "", email: "", phone: "" });
      fetchEmployees();
    });
  };

  const handleSprintSubmit = async (e) => {
    e.preventDefault();

    // Tarihleri Date objesine çeviriyoruz
    const payload = {
      ...sprintForm,
      startDate: new Date(sprintForm.startDate),
      endDate: new Date(sprintForm.endDate),
    };

    try {
      const response = await fetch(`${BASE_URL}/sprints`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // Eğer Backend hata döndürdüyse (400 Bad Request)
      if (!response.ok) {
        const errorText = await response.text(); // Backend'den gelen "Çakışıyor" mesajını oku
        alert(errorText); // Ekrana bas
        return; // İşlemi durdur
      }

      // Başarılıysa devam et
      setSprintForm({ name: "", startDate: "", endDate: "" });
      fetchAllSprints();
      alert("Sprint başarıyla oluşturuldu! 🎉");
    } catch (error) {
      console.error("Bir hata oluştu:", error);
      alert("Sunucuyla bağlantı kurulamadı.");
    }
  };

  // --- COMPONENT RENDER (Tailwind Classes) ---
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans py-10 px-4 md:px-8">
      {/* Container: Max width 7xl (~1280px), ortalanmış */}
      <div className="max-w-7xl mx-auto space-y-6">
        {/* --- HEADER --- */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-l-4 border-blue-600">
          {/* Sol Taraf: Başlık ve Seçim */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto">
            <h1 className="text-2xl font-bold text-blue-900 tracking-tight">
              📊 Efor Takip Sistemi
            </h1>

            {/* Dikey Çizgi */}
            <div className="hidden md:block h-8 w-px bg-gray-200"></div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <label className="font-semibold text-gray-600 text-sm whitespace-nowrap">
                Dönem:
              </label>
              <div className="relative w-full md:w-64">
                <select
                  value={selectedSprint?.id || ""}
                  onChange={handleSprintChange}
                  className="w-full appearance-none bg-gray-50 border border-gray-300 text-gray-700 py-2 px-3 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition cursor-pointer font-medium"
                >
                  {sprintList.length === 0 && <option>Sprint Yok...</option>}
                  {sprintList.map((sprint) => (
                    <option key={sprint.id} value={sprint.id}>
                      {sprint.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                  <svg
                    className="fill-current h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Sağ Taraf: Tarih ve Durum */}
          {selectedSprint && (
            <div className="flex flex-col items-end gap-1">
              <div className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <span className="bg-gray-100 px-2 py-1 rounded">
                  🗓️ {formatDate(selectedSprint.startDate)}
                </span>
                <span className="text-gray-400">➜</span>
                <span className="bg-gray-100 px-2 py-1 rounded">
                  {formatDate(selectedSprint.endDate)}
                </span>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                  new Date(selectedSprint.endDate) >= new Date()
                    ? "bg-green-100 text-green-700 border border-green-200"
                    : "bg-gray-100 text-gray-500 border border-gray-200"
                }`}
              >
                {new Date(selectedSprint.endDate) >= new Date()
                  ? "🟢 Şu an Aktif"
                  : "⚫ Tamamlandı"}
              </span>
            </div>
          )}
        </div>

        {/* --- SPRINT YOKSA UYARI --- */}
        {!selectedSprint && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 text-center">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Henüz bir sprint seçilmedi.
            </h3>
            <p className="text-gray-500">
              Lütfen aşağıdan yeni bir sprint planlayın.
            </p>
          </div>
        )}

        {/* --- FORM ALANLARI (GRID) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sprint Ekleme Kartı */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-700 border-b border-gray-100 pb-3 mb-4 flex items-center gap-2">
              📅 Yeni Sprint Planla
            </h3>
            <form onSubmit={handleSprintSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Sprint Adı
                </label>
                <input
                  placeholder="Örn: Sprint 23"
                  value={sprintForm.name}
                  onChange={(e) =>
                    setSprintForm({ ...sprintForm, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Başlangıç
                  </label>
                  <input
                    type="date"
                    value={sprintForm.startDate}
                    onChange={(e) =>
                      setSprintForm({
                        ...sprintForm,
                        startDate: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Bitiş
                  </label>
                  <input
                    type="date"
                    value={sprintForm.endDate}
                    onChange={(e) =>
                      setSprintForm({ ...sprintForm, endDate: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    required
                  />
                </div>
              </div>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 active:scale-95 shadow-sm">
                Sprinti Başlat
              </button>
            </form>
          </div>

          {/* Personel Ekleme Kartı */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-700 border-b border-gray-100 pb-3 mb-4 flex items-center gap-2">
              👤 Personel Ekle
            </h3>
            <form onSubmit={handleEmployeeSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  placeholder="Ad"
                  value={employeeForm.name}
                  onChange={(e) =>
                    setEmployeeForm({ ...employeeForm, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm"
                  required
                />
                <input
                  placeholder="Soyad"
                  value={employeeForm.surname}
                  onChange={(e) =>
                    setEmployeeForm({
                      ...employeeForm,
                      surname: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input
                  placeholder="Email"
                  value={employeeForm.email}
                  onChange={(e) =>
                    setEmployeeForm({ ...employeeForm, email: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                />
                <input
                  placeholder="Tel"
                  value={employeeForm.phone}
                  onChange={(e) =>
                    setEmployeeForm({ ...employeeForm, phone: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                />
              </div>
              <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 active:scale-95 shadow-sm">
                Personeli Kaydet
              </button>
            </form>
          </div>
        </div>

        {selectedSprint && (
          <>
            {/* --- LOADING EKRANI --- */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-sm border border-gray-200">
                {/* Tailwind Spinner */}
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mb-4"></div>
                <h3 className="text-lg font-semibold text-gray-600 animate-pulse">
                  Veriler Getiriliyor...
                </h3>
                <p className="text-sm text-gray-400">Lütfen bekleyiniz</p>
              </div>
            ) : (
              // LOADING DEĞİLSE İÇERİĞİ GÖSTER
              <>
                {/* --- GRAFİK KARTI --- */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                  <div className="flex flex-wrap justify-between items-center mb-6 pb-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-700">
                      📈 Performans Grafiği
                    </h3>
                    <div className="bg-blue-50 text-blue-700 px-4 py-1.5 rounded-lg font-bold text-sm border border-blue-100">
                      Toplam Efor: {getGrandTotal()} Saat
                    </div>
                  </div>

                  <div className="w-full h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={employees.map((emp) => ({
                          name: `${emp.name} ${emp.surname}`,
                          Saat: getEmployeeTotal(emp.id),
                        }))}
                        margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#f3f4f6"
                        />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 12, fill: "#6b7280" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 12, fill: "#6b7280" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          cursor={{ fill: "#f9fafb" }}
                          contentStyle={{
                            borderRadius: "8px",
                            border: "none",
                            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                          }}
                        />
                        <Legend />
                        <Bar
                          dataKey="Saat"
                          fill="#3b82f6"
                          radius={[6, 6, 0, 0]}
                          barSize={50}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* --- TABLO KARTI --- */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-gray-700">
                      📋 Efor Giriş Çizelgesi
                    </h3>
                    <button
                      onClick={downloadReport}
                      className="flex items-center gap-2 bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-semibold transition shadow-sm"
                    >
                      <span>📥</span> Excel İndir
                    </button>
                  </div>

                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-4 font-bold text-gray-600 min-w-[150px]">
                            Çalışan Adı
                          </th>
                          {days.map((day, i) => (
                            <th
                              key={day.toISOString()}
                              className={`px-2 py-3 text-center border-l border-gray-100 min-w-[60px] ${isWeekend(day) ? "bg-red-50 text-red-800" : ""}`}
                            >
                              <div className="font-bold text-sm">
                                {day.toLocaleDateString("tr-TR", {
                                  day: "numeric",
                                })}
                              </div>
                              <div className="font-normal text-[10px]">
                                {day.toLocaleDateString("tr-TR", {
                                  weekday: "short",
                                })}
                              </div>
                            </th>
                          ))}
                          <th className="px-4 py-4 text-center bg-blue-50 text-blue-700 border-l border-blue-100 min-w-[80px]">
                            TOPLAM
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {employees.map((emp) => (
                          <tr
                            key={emp.id}
                            className="bg-white border-b border-gray-50 hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-4 py-3 font-medium text-gray-900 flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold uppercase">
                                {emp.name.charAt(0)}
                                {emp.surname.charAt(0)}
                              </div>
                              {emp.name} {emp.surname}
                            </td>
                            {days.map((day, i) => {
                              const val = getHours(emp.id, day);
                              const isWknd = isWeekend(day);
                              return (
                                <td
                                  key={day.toISOString()}
                                  className={`p-1 text-center border-l border-gray-50 ${isWknd ? "bg-red-50/30" : ""}`}
                                >
                                  <input
                                    type="number"
                                    min="0"
                                    max="24"
                                    placeholder="-"
                                    className={`w-10 text-center rounded py-1 outline-none transition-all text-sm
                                          ${val > 0 ? "bg-blue-50 border border-blue-200 font-bold" : "bg-transparent border border-transparent hover:border-gray-200"}
                                          ${val > 8 ? "text-red-600" : "text-gray-700"}
                                          focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500
                                        `}
                                    value={val}
                                    onChange={(e) =>
                                      handleHoursChange(
                                        emp.id,
                                        day,
                                        e.target.value,
                                      )
                                    }
                                  />
                                </td>
                              );
                            })}
                            <td className="px-4 py-3 text-center font-bold text-blue-700 bg-blue-50/50 border-l border-blue-50">
                              {getEmployeeTotal(emp.id)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50 border-t border-gray-200">
                        <tr>
                          <td className="px-4 py-3 font-bold text-gray-600">
                            GÜNLÜK TOPLAM
                          </td>
                          {days.map((day, i) => (
                            <td
                              key={i}
                              className="px-2 py-3 text-center font-bold text-gray-500 border-l border-gray-200"
                            >
                              {getDayTotal(day) > 0 ? getDayTotal(day) : "-"}
                            </td>
                          ))}
                          <td className="px-4 py-3 text-center font-black text-blue-600 text-base border-l border-blue-100">
                            {getGrandTotal()}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;
