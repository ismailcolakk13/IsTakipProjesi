import { useEffect, useState } from "react";
import "./App.css";
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
  // --- STATE'LER ---
  const [employees, setEmployees] = useState([]);
  const [activeSprint, setActiveSprint] = useState(null);
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

  const BASE_URL = "http://localhost:5090/api"; // Portunuzu kontrol edin!

  // --- VERİ ÇEKME ---
  const fetchData = () => {
    fetch(`${BASE_URL}/employees`)
      .then((res) => res.json())
      .then((data) => setEmployees(data));

    fetch(`${BASE_URL}/sprints/active`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((sprint) => {
        setActiveSprint(sprint);
        generateDays(sprint.startDate, sprint.endDate);
        fetchWorkLogs(sprint.startDate, sprint.endDate);
      })
      .catch(() => {
        setActiveSprint(null);
        setDays([]);
      });
  };

  const fetchWorkLogs = (start, end) => {
    fetch(`${BASE_URL}/worklogs?start=${start}&end=${end}`)
      .then((res) => res.json())
      .then((data) => setWorkLogs(data));
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- YARDIMCI FONKSİYONLAR ---
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

  // --- YENİ EKLENEN HESAPLAMA FONKSİYONLARI ---

  // 1. Bir çalışanın toplam saati
  const getEmployeeTotal = (empId) => {
    return workLogs
      .filter((w) => w.employeeId === empId)
      .reduce((sum, current) => sum + current.hours, 0);
  };

  // 2. Bir günün toplam saati
  const getDayTotal = (date) => {
    return workLogs
      .filter((w) => new Date(w.date).toDateString() === date.toDateString())
      .reduce((sum, current) => sum + current.hours, 0);
  };

  // 3. Genel Toplam
  const getGrandTotal = () => {
    return workLogs.reduce((sum, current) => sum + current.hours, 0);
  };

  // 4. Hücredeki saati bul
  const getHours = (empId, date) => {
    const log = workLogs.find(
      (w) =>
        w.employeeId === empId &&
        new Date(w.date).toDateString() === date.toDateString(),
    );
    return log ? log.hours : "";
  };

  // 5. Hafta sonu mu?
  const isWeekend = (date) => {
    const day = date.getDay();
    return day === 0 || day === 6; // 0: Pazar, 6: Cumartesi
  };

  const handleHoursChange = (empId, date, value) => {
    // Boşsa 0, değilse sayıya çevir
    const hours = value === "" ? 0 : parseFloat(value);

    // UI Güncelleme (Anlık hissetmek için)
    const newLogs = [...workLogs];
    const logDateStr = date.toDateString();

    // Varsa sil, yenisini ekle (basit state yönetimi)
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

    // API Kayıt
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

  // --- EXCEL/CSV İNDİRME FONKSİYONU ---
  const downloadReport = () => {
    // 1. CSV Başlıkları (Türkçe Excel için noktalı virgül ; kullanılır)
    let csvContent = "\uFEFF"; // Türkçe karakter sorunu olmasın diye BOM ekliyoruz
    csvContent += "Personel;Tarih;Saat;Açıklama\n";

    // 2. Verileri satır satır ekle
    workLogs.forEach((log) => {
      const emp = employees.find((e) => e.id === log.employeeId);
      const dateStr = new Date(log.date).toLocaleDateString("tr-TR");

      // Excel satırı: Ahmet Yılmaz;15.02.2025;8;Form Entry
      const row = `${emp?.name} ${emp?.surname};${dateStr};${log.hours.toString().replace(".", ",")};${log.description}`;
      csvContent += row + "\n";
    });

    // 3. Dosyayı oluştur ve indir
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `Efor_Raporu_${new Date().toLocaleDateString()}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- FORM SUBMITLERİ (Aynı) ---
  const handleEmployeeSubmit = (e) => {
    e.preventDefault();
    fetch(`${BASE_URL}/employees`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(employeeForm),
    }).then(() => {
      setEmployeeForm({ name: "", surname: "", email: "", phone: "" });
      fetchData();
    });
  };

  const handleSprintSubmit = (e) => {
    e.preventDefault();
    fetch(`${BASE_URL}/sprints`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...sprintForm,
        startDate: new Date(sprintForm.startDate),
        endDate: new Date(sprintForm.endDate),
      }),
    }).then(() => {
      setSprintForm({ name: "", startDate: "", endDate: "" });
      fetchData();
    });
  };

  return (
    <div className="container">
      {/* ÜST BİLGİ */}
      <div className={`status-card ${activeSprint ? "active" : "inactive"}`}>
        <h2>
          {activeSprint ? `🚀 ${activeSprint.name}` : "⏸️ Aktif Sprint Yok"}
        </h2>
      </div>

      {!activeSprint ? (
        <div className="grid-layout">
          <div className="card">
            <h3>📅 Yeni Sprint Planla</h3>
            <form onSubmit={handleSprintSubmit} className="form-group">
              <input
                placeholder="Sprint Adı"
                value={sprintForm.name}
                onChange={(e) =>
                  setSprintForm({ ...sprintForm, name: e.target.value })
                }
              />
              <input
                type="date"
                value={sprintForm.startDate}
                onChange={(e) =>
                  setSprintForm({ ...sprintForm, startDate: e.target.value })
                }
              />
              <input
                type="date"
                value={sprintForm.endDate}
                onChange={(e) =>
                  setSprintForm({ ...sprintForm, endDate: e.target.value })
                }
              />
              <button className="btn btn-primary">Başlat</button>
            </form>
          </div>
          <div className="card">
            <h3>👤 Personel Ekle</h3>
            <form onSubmit={handleEmployeeSubmit} className="form-group">
              <input
                placeholder="Ad"
                value={employeeForm.name}
                onChange={(e) =>
                  setEmployeeForm({ ...employeeForm, name: e.target.value })
                }
              />
              <input
                placeholder="Soyad"
                value={employeeForm.surname}
                onChange={(e) =>
                  setEmployeeForm({ ...employeeForm, surname: e.target.value })
                }
              />
              <button className="btn btn-success">Kaydet</button>
            </form>
          </div>
        </div>
      ) : (
        /* --- GELİŞMİŞ TABLO --- */
        <div className="card" style={{ overflowX: "auto" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "15px",
            }}
          >
            <h3>📝 Efor Takibi</h3>

            <button
              onClick={downloadReport}
              style={{
                background: "#10b981", // Excel Yeşili
                color: "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              📥 Excel'e İndir
            </button>

            <span
              style={{
                background: "#2563eb",
                color: "white",
                padding: "5px 10px",
                borderRadius: "15px",
                fontSize: "0.9rem",
              }}
            >
              Toplam Efor: <strong>{getGrandTotal()} Saat</strong>
            </span>
          </div>

          <div style={{ width: "100%", height: 300, marginBottom: "30px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={employees.map((emp) => ({
                  name: `${emp.name} ${emp.surname.substring(0, 1)}.`, // İsim + Soyadın baş harfi
                  Efor: getEmployeeTotal(emp.id), // Hesapladığımız toplam saat
                }))}
                margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip cursor={{ fill: "#f3f4f6" }} />
                <Legend />
                <Bar
                  dataKey="Efor"
                  fill="#2563eb"
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: "800px",
            }}
          >
            <thead>
              <tr
                style={{
                  background: "#f9fafb",
                  borderBottom: "2px solid #e5e7eb",
                }}
              >
                <th
                  style={{
                    textAlign: "left",
                    padding: "12px",
                    color: "#374151",
                  }}
                >
                  Çalışan
                </th>
                {days.map((day, i) => (
                  <th
                    key={i}
                    style={{
                      padding: "10px",
                      fontSize: "12px",
                      color: "#666",
                      textAlign: "center",
                      background: isWeekend(day) ? "#fee2e2" : "transparent", // Hafta sonu kırmızımsı başlık
                    }}
                  >
                    {day.toLocaleDateString("tr-TR", {
                      day: "numeric",
                      month: "short",
                    })}
                    <br />
                    {day.toLocaleDateString("tr-TR", { weekday: "short" })}
                  </th>
                ))}
                <th
                  style={{
                    padding: "10px",
                    background: "#eff6ff",
                    color: "#1e40af",
                  }}
                >
                  TOPLAM
                </th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <td
                    style={{
                      padding: "10px",
                      fontWeight: "600",
                      color: "#111827",
                    }}
                  >
                    {emp.name} {emp.surname}
                  </td>

                  {/* Günlük Girişler */}
                  {days.map((day, i) => (
                    <td
                      key={i}
                      style={{
                        padding: "4px",
                        textAlign: "center",
                        background: isWeekend(day) ? "#fef2f2" : "white",
                      }}
                    >
                      <input
                        type="number"
                        min="0"
                        max="24"
                        placeholder="-"
                        style={{
                          width: "45px",
                          textAlign: "center",
                          border: "1px solid #e5e7eb",
                          background: isWeekend(day) ? "#fff" : "#fff", // Input içi hep beyaz kalsın
                          fontWeight:
                            getHours(emp.id, day) > 0 ? "bold" : "normal",
                          color: getHours(emp.id, day) > 8 ? "red" : "black", // 8 saati geçerse kırmızı yazı
                        }}
                        value={getHours(emp.id, day)}
                        onChange={(e) =>
                          handleHoursChange(emp.id, day, e.target.value)
                        }
                      />
                    </td>
                  ))}

                  {/* Satır Toplamı (Kişisel Toplam) */}
                  <td
                    style={{
                      padding: "10px",
                      textAlign: "center",
                      fontWeight: "bold",
                      background: "#eff6ff",
                      color: "#1e3a8a",
                    }}
                  >
                    {getEmployeeTotal(emp.id)}
                  </td>
                </tr>
              ))}
            </tbody>
            {/* Dip Toplam (Footer) */}
            <tfoot>
              <tr
                style={{
                  background: "#f3f4f6",
                  borderTop: "2px solid #d1d5db",
                }}
              >
                <td style={{ padding: "10px", fontWeight: "bold" }}>
                  GÜNLÜK TOPLAM
                </td>
                {days.map((day, i) => (
                  <td
                    key={i}
                    style={{
                      padding: "10px",
                      textAlign: "center",
                      fontWeight: "bold",
                      color: "#4b5563",
                    }}
                  >
                    {getDayTotal(day) > 0 ? getDayTotal(day) : "-"}
                  </td>
                ))}
                <td
                  style={{
                    padding: "10px",
                    textAlign: "center",
                    fontWeight: "900",
                    color: "#2563eb",
                    fontSize: "1.1rem",
                  }}
                >
                  {getGrandTotal()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}

export default App;
