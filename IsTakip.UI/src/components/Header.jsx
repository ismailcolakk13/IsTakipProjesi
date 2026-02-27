import { formatDate } from "../utils/helpers";
import DarkModeToggle from "./DarkModeToggle";

export default function Header({ sprintList, selectedSprint, onSprintChange }) {
  return (
    <>
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-l-4 border-blue-600 dark:border-blue-400 transition-colors duration-300">
        {/* Sol Taraf: Başlık ve Seçim */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto">
          <h1 className="text-2xl font-bold text-blue-900 dark:text-blue-300 tracking-tight">
            📊 Efor Takip Sistemi
          </h1>

          {/* Dikey Çizgi */}
          <div className="hidden md:block h-8 w-px bg-gray-200 dark:bg-slate-600"></div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <label className="font-semibold text-gray-600 dark:text-slate-400 text-sm whitespace-nowrap">
              Dönem:
            </label>
            <div className="relative w-full md:w-64">
              <select
                value={selectedSprint?.id || ""}
                onChange={onSprintChange}
                className="w-full appearance-none bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-200 py-2 px-3 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition cursor-pointer font-medium"
              >
                {sprintList.length === 0 && <option>Sprint Yok...</option>}
                {sprintList.map((sprint) => (
                  <option key={sprint.id} value={sprint.id}>
                    {sprint.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 dark:text-slate-400">
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

        {/* Sağ Taraf: Tarih, Durum ve Dark Mode Toggle */}
        <div className="flex items-center gap-4">
          {selectedSprint && (
            <div className="flex flex-col items-end gap-1">
              <div className="text-sm font-bold text-gray-700 dark:text-slate-300 flex items-center gap-2">
                <span className="bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded">
                  🗓️ {formatDate(selectedSprint.startDate)}
                </span>
                <span className="text-gray-400 dark:text-slate-500">➜</span>
                <span className="bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded">
                  {formatDate(selectedSprint.endDate)}
                </span>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                  new Date(selectedSprint.endDate) >= new Date()
                    ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800"
                    : "bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 border border-gray-200 dark:border-slate-600"
                }`}
              >
                {new Date(selectedSprint.endDate) >= new Date()
                  ? "🟢 Şu an Aktif"
                  : "⚫ Tamamlandı"}
              </span>
            </div>
          )}

          <DarkModeToggle />
        </div>
      </div>

      {/* Sprint yoksa uyarı */}
      {!selectedSprint && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-10 text-center">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-slate-200 mb-2">
            Henüz bir sprint seçilmedi.
          </h3>
          <p className="text-gray-500 dark:text-slate-400">
            Lütfen aşağıdan yeni bir sprint planlayın.
          </p>
        </div>
      )}
    </>
  );
}
