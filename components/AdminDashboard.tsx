
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { StudentProfile, Group } from '../types';
import { Plus, Users, LayoutGrid, Trash2, Edit2, Sparkles, RefreshCcw, Search } from 'lucide-react';
import StudentForm from './StudentForm';

const AdminDashboard: React.FC = () => {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentProfile | null>(null);
  const [groupSize, setGroupSize] = useState(3);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'students' | 'groups'>('students');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    try {
      const [s, g] = await Promise.all([api.getStudents(), api.getGroups()]);
      setStudents(s);
      setGroups(g);
    } catch (err) {
      console.error('Failed to load data:', err);
    }
  };

  const handleSaveStudent = async (student: StudentProfile) => {
    try {
      if (student.id && students.some(s => s.id === student.id)) {
        await api.updateStudent(student.id, student);
      } else {
        await api.createStudent(student);
      }
      setIsAdding(false);
      setEditingStudent(null);
      await refreshData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save student');
    }
  };

  const handleDeleteStudent = async (id: string) => {
    if (confirm('Permanently delete student record?')) {
      try {
        await api.deleteStudent(id);
        await refreshData();
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to delete student');
      }
    }
  };

  const generateGroups = async () => {
    if (students.length < groupSize) {
      alert("Insufficient students to form groups.");
      return;
    }
    setIsGenerating(true);
    const sorted = [...students].sort((a, b) => b.cgpa - a.cgpa);
    const numGroups = Math.ceil(sorted.length / groupSize);
    const formedGroups = Array.from({ length: numGroups }, (_, i) => ({
      name: `Team ${i + 1}`,
      memberIds: [] as string[]
    }));
    sorted.forEach((student, index) => {
      formedGroups[index % numGroups].memberIds.push(student.id);
    });
    let aiAnalysis: Record<string, string> | null = null;
    try {
      aiAnalysis = await api.refineGroupsWithAI(students, formedGroups);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.warn('AI analysis failed:', msg);
      if (msg.includes('GEMINI_API_KEY')) {
        alert('AI insights disabled: Add GEMINI_API_KEY to server/.env\nGet a free key at https://aistudio.google.com/apikey');
      }
    }
    const finalGroups: Group[] = formedGroups.map(g => ({
      id: Math.random().toString(36).substr(2, 9),
      name: g.name,
      memberIds: g.memberIds,
      aiNotes: aiAnalysis?.[g.name] ?? 'Balanced by academic performance.'
    }));
    await api.saveGroups(finalGroups);
    refreshData();
    setIsGenerating(false);
    setActiveTab('groups');
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Group Management</h2>
          <p className="text-slate-500 text-sm font-medium">Create groups and oversee student academic Details.</p>
        </div>
        
        <div className="flex p-1 bg-slate-50 border border-slate-100 rounded-xl">
          <button 
            onClick={() => setActiveTab('students')}
            className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'students' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/50' : 'text-slate-400 hover:text-slate-600'}`}
          >
            StudentDetails
          </button>
          <button 
            onClick={() => setActiveTab('groups')}
            className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'groups' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/50' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Team View
          </button>
        </div>
      </div>

      {activeTab === 'students' ? (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3.5 top-3 w-4.5 h-4.5 text-slate-300" />
              <input 
                type="text"
                placeholder="Search by name or email address..."
                className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none transition-all placeholder:text-slate-300"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={() => setIsAdding(true)}
              className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 transition shadow-sm shadow-indigo-100"
            >
              <Plus className="w-4 h-4"/> New Student
            </button>
          </div>

          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                    <th className="px-8 py-4">Student Identity</th>
                    <th className="px-8 py-4 text-center">GPA</th>
                    <th className="px-8 py-4">Core Skills</th>
                    <th className="px-8 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredStudents.map(s => (
                    <tr key={s.id} className="text-sm group hover:bg-slate-50/30 transition-colors">
                      <td className="px-8 py-5">
                        <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{s.name}</p>
                        <p className="text-[11px] text-slate-400 font-medium">{s.email}</p>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <span className="font-mono font-bold text-slate-700 bg-slate-50 px-2 py-1 rounded border border-slate-100">{s.cgpa.toFixed(2)}</span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-wrap gap-1.5 max-w-xs">
                          {s.skills.map(sk => (
                            <span key={sk} className="bg-white text-slate-500 px-2.5 py-1 rounded-lg text-[10px] font-bold border border-slate-200">{sk}</span>
                          ))}
                          {s.skills.length === 0 && <span className="text-slate-300 text-[10px] italic">Not listed</span>}
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => setEditingStudent(s)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"><Edit2 className="w-4 h-4"/></button>
                          <button onClick={() => handleDeleteStudent(s.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 className="w-4 h-4"/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredStudents.length === 0 && (
              <div className="p-16 text-center text-slate-300 font-medium">
                <Users className="w-10 h-10 mx-auto mb-4 opacity-20" />
                No student records found.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="flex items-center gap-6">
              <div className="bg-slate-50 p-3 rounded-xl">
                <Users className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Target Team Size</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="number" min="2" max="10" 
                    value={groupSize} 
                    onChange={e => setGroupSize(parseInt(e.target.value) || 2)}
                    className="w-16 p-2 bg-slate-50 border border-slate-200 rounded-lg text-center font-bold text-slate-900 focus:ring-2 focus:ring-indigo-600/10 outline-none transition-all"
                  />
                  <span className="text-xs font-bold text-slate-400 uppercase">Per Unit</span>
                </div>
              </div>
            </div>
            <button 
              disabled={isGenerating || students.length === 0}
              onClick={generateGroups}
              className="flex items-center gap-2.5 bg-indigo-600 text-white px-8 py-3.5 rounded-xl text-sm font-bold hover:bg-indigo-700 transition shadow-md shadow-indigo-100 disabled:opacity-50"
            >
              {isGenerating ? <RefreshCcw className="w-5 h-5 animate-spin"/> : <Sparkles className="w-5 h-5"/>}
              <span>{groups.length > 0 ? 'Regenerate Analysis' : 'Analyze & Group'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {groups.map(g => (
              <div key={g.id} className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col shadow-sm hover:border-indigo-100 transition-all">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-slate-900 text-lg">{g.name}</h3>
                  <span className="text-[10px] font-black text-slate-400 border border-slate-200 rounded-full px-3 py-1 uppercase tracking-widest">{g.memberIds.length} Members</span>
                </div>
                <div className="space-y-3 mb-8 flex-grow">
                  {g.memberIds.map(mId => {
                    const student = students.find(s => s.id === mId);
                    return (
                      <div key={mId} className="flex justify-between items-center p-3 bg-slate-50/50 border border-slate-100 rounded-xl text-xs">
                        <span className="font-bold text-slate-700">{student?.name}</span>
                        <span className="text-[10px] font-black text-indigo-500 uppercase">CGPA {student?.cgpa.toFixed(1)}</span>
                      </div>
                    );
                  })}
                </div>
                {g.aiNotes && (
                  <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100/50">
                    <div className="flex items-center gap-2 mb-2 text-indigo-600">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Smart Insight</span>
                    </div>
                    <p className="text-[11px] text-indigo-800 italic font-medium leading-relaxed">"{g.aiNotes}"</p>
                  </div>
                )}
              </div>
            ))}
            {groups.length === 0 && (
              <div className="col-span-full py-24 text-center text-slate-300 font-medium border-2 border-dashed border-slate-100 rounded-3xl">
                <LayoutGrid className="w-12 h-12 mx-auto mb-4 opacity-10" />
                No groups have been allocated 
              </div>
            )}
          </div>
        </div>
      )}

      {(isAdding || editingStudent) && (
        <StudentForm 
          student={editingStudent} 
          onSave={handleSaveStudent} 
          onClose={() => { setIsAdding(false); setEditingStudent(null); }}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
