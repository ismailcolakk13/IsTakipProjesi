import { useState } from "react";
import { createEmployee } from "../services/api";

export default function EmployeeForm({ onEmployeeCreated }) {
  const [form, setForm] = useState({
    name: "",
    surname: "",
    email: "",
    phone: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createEmployee(form).then(() => {
      setForm({ name: "", surname: "", email: "", phone: "" });
      onEmployeeCreated();
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-700 border-b border-gray-100 pb-3 mb-4 flex items-center gap-2">
        👤 Personel Ekle
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <input
            placeholder="Ad"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm"
            required
          />
          <input
            placeholder="Soyad"
            value={form.surname}
            onChange={(e) => setForm({ ...form, surname: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <input
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
          />
          <input
            placeholder="Tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
          />
        </div>
        <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 active:scale-95 shadow-sm">
          Personeli Kaydet
        </button>
      </form>
    </div>
  );
}
