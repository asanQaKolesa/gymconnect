import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, User, FileText } from 'lucide-react';

export default function StudentSelectorHeader({
  students = [],
  selectedStudentId,
  onSelectStudent,
  onOpenProfile
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const activeStudents = useMemo(() => {
    return students.filter(s => {
      const st = (s.status || '').toLowerCase().trim();
      return st !== 'left' && st !== 'archived';
    });
  }, [students]);

  const filteredStudents = useMemo(() => {
    if (!searchQuery) return activeStudents;
    const q = searchQuery.toLowerCase();
    return activeStudents.filter(s => {
      const name = `${s.first_name || ''} ${s.last_name || ''}`.toLowerCase();
      const tg = (s.telegram_username || '').toLowerCase();
      return name.includes(q) || tg.includes(q);
    });
  }, [activeStudents, searchQuery]);

  const selectedStudent = activeStudents.find(s => s.id === selectedStudentId) || activeStudents[0];

  return (
    <div className="bg-neutral-900 border-b border-neutral-800 p-4 sticky top-0 z-20">
      <div className="flex items-center justify-between gap-3">

        {/* Dropdown Selector */}
        <div className="relative flex-1">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-between bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-xl px-3 py-2 transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-neutral-600 flex items-center justify-center shrink-0 overflow-hidden">
                {selectedStudent?.avatar_url ? (
                  <img src={selectedStudent.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-4 h-4 text-neutral-400" />
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white">
                  {selectedStudent?.first_name || ''} {selectedStudent?.last_name || 'Выберите ученика'}
                </span>
                {selectedStudent && (
                  <span className="text-[10px] text-neutral-400">
                    {selectedStudent.telegram_username ? `@${selectedStudent.telegram_username}` : 'Нет TG'}
                  </span>
                )}
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-neutral-400" />
          </button>

          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-neutral-800 border border-neutral-700 rounded-xl shadow-xl overflow-hidden z-30">
              <div className="p-2 border-b border-neutral-700">
                <div className="relative">
                  <Search className="w-4 h-4 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Поиск по имени..."
                    className="w-full pl-9 pr-3 py-1.5 bg-neutral-900 border border-neutral-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="max-h-60 overflow-y-auto p-1">
                {filteredStudents.map((s, idx) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      onSelectStudent(s.id);
                      setIsOpen(false);
                      setSearchQuery('');
                    }}
                    className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-left transition-colors ${
                      s.id === selectedStudent?.id ? 'bg-blue-600/20 text-blue-400' : 'hover:bg-neutral-700 text-neutral-200'
                    }`}
                  >
                    <span className="text-[10px] font-mono text-neutral-500 w-4">#{idx + 1}</span>
                    <div className="w-6 h-6 rounded-full bg-neutral-600 flex items-center justify-center shrink-0 overflow-hidden">
                       {s.avatar_url ? (
                        <img src={s.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-3 h-3 text-neutral-400" />
                      )}
                    </div>
                    <span className="text-sm font-medium truncate flex-1">
                      {s.first_name} {s.last_name}
                    </span>
                  </button>
                ))}
                {filteredStudents.length === 0 && (
                  <div className="p-3 text-center text-sm text-neutral-500">Не найдено</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Button */}
        {selectedStudent && (
          <button
            type="button"
            onClick={() => onOpenProfile(selectedStudent)}
            className="flex items-center gap-1.5 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-xl text-xs font-semibold text-neutral-300 transition-colors shrink-0"
          >
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Анкета</span>
          </button>
        )}
      </div>
    </div>
  );
}
