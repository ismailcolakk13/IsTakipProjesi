import { useState } from "react";
import { createSprint } from "../services/api";

export default function SprintForm({ onSprintCreated }) {
  const [form, setForm] = useState({
    name: "",
    startDate: "",
    endDate: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      startDate: new Date(form.startDate),
      endDate: new Date(form.endDate),
    };

    const response = await createSprint(payload);

    if (!response.ok) {
      const errorText = await response.text();
      alert(errorText);
      return;
    }

    setForm({ name: "", startDate: "", endDate: "" });
    onSprintCreated();
    alert("Sprint başarıyla oluşturuldu! 🎉");
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 transition-colors duration-300">
      <h3 className="text-lg font-bold text-gray-700 dark:text-slate-200 border-b border-gray-100 dark:border-slate-700 pb-3 mb-4 flex items-center gap-2">
        📅 Yeni Sprint Planla
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">
            Sprint Adı
          </label>
          <input
            placeholder="Örn: Sprint 23"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200 placeholder:text-gray-400 dark:placeholder:text-slate-500"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">
              Başlangıç
            </label>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">
              Bitiş
            </label>
            <input
              type="date"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-200"
              required
            />
          </div>
        </div>
        <button className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 active:scale-95 shadow-sm">
          Sprinti Başlat
        </button>
      </form>
    </div>
  );
}
