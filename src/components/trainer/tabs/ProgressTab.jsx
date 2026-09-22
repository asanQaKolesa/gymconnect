// src/components/trainer/tabs/ProgressTab.jsx
import React, { useState } from 'react';
import { TrendingUp, Scale, Plus } from 'lucide-react';

export default function ProgressTab({ students }) {
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || '');
  const [currentWeight, setCurrentWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [notes, setNotes] = useState('');
  const [progressLogs, setProgressLogs] = useState([]);

  const handleAddLog = (e) => {
    e.preventDefault();
    if (!currentWeight) return;

    const newLog = {
      id: Date.now(),
      studentId: selectedStudentId,
      weight: currentWeight,
      fat: bodyFat || '—',
      notes: notes || 'Без комментариев',
      date: new Date().toLocaleDateString()
    };

    setProgressLogs([newLog, ...progressLogs]);
    setCurrentWeight('');
    setBodyFat('');
    setNotes('');
    alert('Замеры ученика успешно сохранены в дневник прогресса!');
  };

  const targetStudent = students.find(s => s.id === selectedStudentId);

  return (
    <div className="space-y-4">
      {/* Форма фиксации замеров */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
          <TrendingUp className="w-5 h-5 text-emerald-600" />
          <h3 className="font-bold text-sm text-slate-900">Дневник прогресса и замеров тела</h3>
        </div>

        <form onSubmit={handleAddLog} className="space-y-3 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Выберите ученика *</label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
            >
              {students.length > 0 ? (
                students.map(s => (
                  <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>
                ))
              ) : (
                <option value="">Нет учеников в базе</option>
              )}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Текущий вес (кг) *</label>
              <input 
                type="text"
                required
                value={currentWeight}
                onChange={(e) => setCurrentWeight(e.target.value)}
                placeholder="78.5"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">% жира (опционально)</label>
              <input 
                type="text"
                value={bodyFat}
                onChange={(e) => setBodyFat(e.target.value)}
                placeholder="15%"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Заметки / Рабочие веса</label>
            <input 
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Прибавил в жиме лежа +2.5 кг"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
            />
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-sm transition-all"
          >
            Зафиксировать замер
          </button>
        </form>
      </div>

      {/* История замеров */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <h3 className="font-bold text-sm text-slate-900 mb-3">История измерений и динамика</h3>
        <div className="space-y-2">
          {progressLogs.length > 0 ? (
            progressLogs.map(log => {
              const studentObj = students.find(s => s.id === log.studentId);
              return (
                <div key={log.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">
                      {studentObj ? `${studentObj.first_name} ${studentObj.last_name}` : 'Ученик'} — <span className="text-emerald-600 font-mono">{log.weight} кг</span>
                    </h4>
                    <p className="text-[10px] text-slate-500">Жир: {log.fat} | Заметки: {log.notes}</p>
                  </div>
                  <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-1 rounded-lg font-mono">
                    {log.date}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="p-6 text-center text-slate-400 text-xs">
              История замеров пока пуста.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
