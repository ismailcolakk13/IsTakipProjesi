import { useEffect, useState } from 'react'
import './App.css'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';

function App() {
  // --- STATE'LER ---
  const [employees, setEmployees] = useState([]);
  
  const [sprintList, setSprintList] = useState([]); // Tüm sprintlerin listesi
  const [selectedSprint, setSelectedSprint] = useState(null); // Şu an ekranda görünen sprint
  
  const [workLogs, setWorkLogs] = useState([]); 
  const [days, setDays] = useState([]); 

  const [employeeForm, setEmployeeForm] = useState({ name: "", surname: "", email: "", phone: "" });
  const [sprintForm, setSprintForm] = useState({ name: "", startDate: "", endDate: "" });

  const BASE_URL = "http://localhost:5090/api"; // Portunuzu kontrol edin!

  // --- SAYFA YÜKLENİNCE ---
  useEffect(() => {
    fetchEmployees();
    fetchAllSprints(); // Artık sadece aktifi değil, hepsini çekiyoruz
  }, []);

  // --- VERİ ÇEKME ---
  const fetchEmployees = () => {
    fetch(`${BASE_URL}/employees`).then(res => res.json()).then(data => setEmployees(data));
  }

  const fetchAllSprints = () => {
    fetch(`${BASE_URL}/sprints`)
      .then(res => res.json())
      .then(data => {
        setSprintList(data);
        
        // Listeyi çektik, peki hangisini seçili yapalım?
        // 1. Varsa AKTİF olanı bul
        const today = new Date();
        const active = data.find(s => new Date(s.startDate) <= today && new Date(s.endDate) >= today);
        
        if (active) {
          loadSprintData(active); // Aktif varsa onu yükle
        } else if (data.length > 0) {
          loadSprintData(data[0]); // Aktif yoksa listenin ilkini yükle
        }
      })
      .catch(err => console.error(err));
  }

  // Bir sprint seçildiğinde (veya otomatik atandığında) çalışacak ana fonksiyon
  const loadSprintData = (sprint) => {
    setSelectedSprint(sprint);
    generateDays(sprint.startDate, sprint.endDate);
    
    // O sprintin eforlarını çek
    fetch(`${BASE_URL}/worklogs?start=${sprint.startDate}&end=${sprint.endDate}`)
      .then(res => res.json())
      .then(data => setWorkLogs(data));
  }

  // Dropdown'dan seçim yapılınca
  const handleSprintChange = (e) => {
    const sprintId = parseInt(e.target.value);
    const sprint = sprintList.find(s => s.id === sprintId);
    if (sprint) {
      loadSprintData(sprint);
    }
  }

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
  }

  // Tarih formatlayıcı (dd.mm.yyyy)
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('tr-TR');
  }

  // --- HESAPLAMA FONKSİYONLARI ---
  const getEmployeeTotal = (empId) => workLogs.filter(w => w.employeeId === empId).reduce((sum, c) => sum + c.hours, 0);
  const getDayTotal = (date) => workLogs.filter(w => new Date(w.date).toDateString() === date.toDateString()).reduce((sum, c) => sum + c.hours, 0);
  const getGrandTotal = () => workLogs.reduce((sum, c) => sum + c.hours, 0);
  const getHours = (empId, date) => {
    const log = workLogs.find(w => w.employeeId === empId && new Date(w.date).toDateString() === date.toDateString());
    return log ? log.hours : "";
  }
  const isWeekend = (date) => { const day = date.getDay(); return day === 0 || day === 6; }

  const handleHoursChange = (empId, date, value) => {
    const hours = value === "" ? 0 : parseFloat(value);
    const newLogs = [...workLogs];
    const logDateStr = date.toDateString();
    const filteredLogs = newLogs.filter(w => !(w.employeeId === empId && new Date(w.date).toDateString() === logDateStr));
    
    if (hours > 0) {
      filteredLogs.push({ employeeId: empId, date: date.toISOString(), hours: hours, description: "Form Entry" });
    }
    setWorkLogs(filteredLogs);

    fetch(`${BASE_URL}/worklogs`, {
      method: "POST", headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeId: empId, date: date.toISOString(), hours: hours, description: "Auto Save" })
    });
  }

  const downloadReport = () => {
    let csvContent = "\uFEFFPersonel;Tarih;Saat;Açıklama\n"; 
    workLogs.forEach(log => {
      const emp = employees.find(e => e.id === log.employeeId);
      const dateStr = new Date(log.date).toLocaleDateString('tr-TR');
      csvContent += `${emp?.name} ${emp?.surname};${dateStr};${log.hours.toString().replace('.', ',')};${log.description}\n`;
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }));
    link.setAttribute("download", `Efor_Raporu.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // --- FORM SUBMITLERİ ---
  const handleEmployeeSubmit = (e) => {
    e.preventDefault();
    fetch(`${BASE_URL}/employees`, {
      method: "POST", headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(employeeForm)
    }).then(() => { setEmployeeForm({ name: "", surname: "", email: "", phone: "" }); fetchEmployees(); });
  }

  const handleSprintSubmit = (e) => {
    e.preventDefault();
    fetch(`${BASE_URL}/sprints`, {
      method: "POST", headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...sprintForm, startDate: new Date(sprintForm.startDate), endDate: new Date(sprintForm.endDate) })
    }).then(() => { 
      setSprintForm({ name: "", startDate: "", endDate: "" }); 
      fetchAllSprints(); // Yeni sprint eklenince listeyi güncelle
    });
  }

  return (
    <div className="container">
      
      {/* --- SPRINT SEÇİM ÇUBUĞU (YENİLENDİ) --- */}
      <div className="card" style={{ padding: '15px', marginBottom: '20px', background: '#fff', borderLeft: '5px solid #2563eb', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'10px' }}>
        
        <div style={{ display:'flex', alignItems:'center', gap:'15px' }}>
          <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#1e3a8a' }}>🚀 Sprint Seçimi:</h2>
          
          <select 
            value={selectedSprint?.id || ""} 
            onChange={handleSprintChange}
            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem', minWidth: '250px', cursor:'pointer' }}
          >
            {sprintList.length === 0 && <option>Yükleniyor veya Sprint Yok...</option>}
            
            {sprintList.map(sprint => (
              <option key={sprint.id} value={sprint.id}>
                {sprint.name} ({formatDate(sprint.startDate)} - {formatDate(sprint.endDate)})
              </option>
            ))}
          </select>
        </div>

        {selectedSprint && (
           <span style={{ color: '#666', fontSize:'0.9rem', fontWeight:'500' }}>
             Durum: {new Date(selectedSprint.endDate) >= new Date() ? 
               <span style={{color:'green'}}>● Aktif</span> : 
               <span style={{color:'gray'}}>● Tamamlandı</span>}
           </span>
        )}
      </div>

      {/* SPRINT YOKSA OLUŞTURMA ALANI */}
      {!selectedSprint && (
        <div className="grid-layout">
          <div className="card">
            <h3>📅 İlk Sprinti Planla</h3>
            <form onSubmit={handleSprintSubmit} className="form-group">
              <input placeholder="Sprint Adı" value={sprintForm.name} onChange={e => setSprintForm({...sprintForm, name: e.target.value})} />
              <input type="date" value={sprintForm.startDate} onChange={e => setSprintForm({...sprintForm, startDate: e.target.value})} />
              <input type="date" value={sprintForm.endDate} onChange={e => setSprintForm({...sprintForm, endDate: e.target.value})} />
              <button className="btn btn-primary">Başlat</button>
            </form>
          </div>
        </div>
      )}

      {/* --- TABLO VE GRAFİKLER --- */}
      {selectedSprint && (
        <>
          {/* SPRINT OLUŞTURMA & PERSONEL EKLEME BUTONLARI */}
          <div className="grid-layout" style={{marginBottom:'20px'}}>
             {/* Yeni sprint ekleme artık her zaman görünebilir olsun ki yeni planlama yapabilelim */}
             <div className="card" style={{padding:'15px'}}> 
                <h4 style={{marginTop:0, marginBottom:'10px'}}>➕ Yeni Sprint Planla</h4>
                <form onSubmit={handleSprintSubmit} style={{display:'flex', gap:'10px'}}>
                  <input placeholder="Adı" value={sprintForm.name} onChange={e => setSprintForm({...sprintForm, name: e.target.value})} required style={{flex:1}} />
                  <input type="date" value={sprintForm.startDate} onChange={e => setSprintForm({...sprintForm, startDate: e.target.value})} required />
                  <input type="date" value={sprintForm.endDate} onChange={e => setSprintForm({...sprintForm, endDate: e.target.value})} required />
                  <button className="btn btn-primary" style={{padding:'5px 15px'}}>Ekle</button>
                </form>
             </div>
             
             <div className="card" style={{padding:'15px'}}>
                <h4 style={{marginTop:0, marginBottom:'10px'}}>👤 Hızlı Personel Ekle</h4>
                <form onSubmit={handleEmployeeSubmit} style={{display:'flex', gap:'10px'}}>
                  <input placeholder="Ad" value={employeeForm.name} onChange={e => setEmployeeForm({...employeeForm, name: e.target.value})} required style={{flex:1}} />
                  <input placeholder="Soyad" value={employeeForm.surname} onChange={e => setEmployeeForm({...employeeForm, surname: e.target.value})} required style={{flex:1}} />
                  <button className="btn btn-success" style={{padding:'5px 15px'}}>Kaydet</button>
                </form>
             </div>
          </div>

          {/* GRAFİK VE TABLO */}
          <div className="card" style={{ overflowX: 'auto' }}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'15px'}}>
              <h3>📝 {selectedSprint.name} Raporu</h3>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={downloadReport} style={{ background: '#10b981', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                  📥 Excel
                </button>
                <span style={{background:'#2563eb', color:'white', padding:'8px 16px', borderRadius:'8px', fontWeight: 'bold'}}>
                  Toplam: {getGrandTotal()} Saat
                </span>
              </div>
            </div>

            <div style={{ width: '100%', height: 300, marginBottom: '30px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={employees.map(emp => ({ name: `${emp.name} ${emp.surname.substring(0, 1)}.`, Efor: getEmployeeTotal(emp.id) }))} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{fontSize: 12}} />
                  <YAxis />
                  <Tooltip cursor={{fill: '#f3f4f6'}} />
                  <Legend />
                  <Bar dataKey="Efor" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
              <thead>
                <tr style={{background: '#f9fafb', borderBottom: '2px solid #e5e7eb'}}>
                  <th style={{ textAlign: 'left', padding: '12px', color:'#374151' }}>Çalışan</th>
                  {days.map((day, i) => (
                    <th key={i} style={{ padding: '10px', fontSize: '12px', color: '#666', textAlign: 'center', background: isWeekend(day) ? '#fee2e2' : 'transparent' }}>
                      {day.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}<br/>
                      {day.toLocaleDateString('tr-TR', { weekday: 'short' })}
                    </th>
                  ))}
                  <th style={{ padding: '10px', background:'#eff6ff', color:'#1e40af' }}>TOPLAM</th>
                </tr>
              </thead>
              <tbody>
                {employees.map(emp => (
                  <tr key={emp.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '10px', fontWeight: '600', color: '#111827' }}>{emp.name} {emp.surname}</td>
                    {days.map((day, i) => (
                      <td key={i} style={{ padding: '4px', textAlign: 'center', background: isWeekend(day) ? '#fef2f2' : 'white' }}>
                        <input type="number" min="0" max="24" placeholder="-"
                          style={{ width: '45px', textAlign: 'center', border: '1px solid #e5e7eb', fontWeight: getHours(emp.id, day) > 0 ? 'bold' : 'normal', color: getHours(emp.id, day) > 8 ? 'red' : 'black' }}
                          value={getHours(emp.id, day)}
                          onChange={(e) => handleHoursChange(emp.id, day, e.target.value)}
                        />
                      </td>
                    ))}
                    <td style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold', background:'#eff6ff', color:'#1e3a8a' }}>{getEmployeeTotal(emp.id)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: '#f3f4f6', borderTop: '2px solid #d1d5db' }}>
                  <td style={{ padding: '10px', fontWeight: 'bold' }}>GÜNLÜK TOPLAM</td>
                  {days.map((day, i) => (
                    <td key={i} style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold', color: '#4b5563' }}>{getDayTotal(day) > 0 ? getDayTotal(day) : '-'}</td>
                  ))}
                  <td style={{ padding: '10px', textAlign: 'center', fontWeight: '900', color: '#2563eb', fontSize:'1.1rem' }}>{getGrandTotal()}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

export default App