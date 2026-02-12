
import React, { useState, useEffect } from 'react';
import { StudentProfile } from '../types';
import { X, User, Mail, GraduationCap, Lock, Building, Layers, Plus } from 'lucide-react';

interface Props {
  student?: StudentProfile | null;
  onSave: (student: StudentProfile) => void;
  onClose: () => void;
}

const StudentForm: React.FC<Props> = ({ student, onSave, onClose }) => {
  const [formData, setFormData] = useState<Partial<StudentProfile>>({
    name: '', email: '', cgpa: 0, skills: [], department: '', year: '', password: ''
  });
  const [skillInput, setSkillInput] = useState('');

  useEffect(() => {
    if (student) setFormData(student);
  }, [student]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: student?.id || Math.random().toString(36).substr(2, 9),
      userId: student?.userId || Math.random().toString(36).substr(2, 9),
      ...formData
    } as StudentProfile);
  };

  const addSkill = () => {
    if (skillInput && !formData.skills?.includes(skillInput)) {
      setFormData({ ...formData, skills: [...(formData.skills || []), skillInput] });
      setSkillInput('');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6 z-50">
      <div className="bg-white rounded-2xl w-full max-w-xl overflow-hidden flex flex-col shadow-2xl border border-slate-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{student ? 'Edit Student Record' : 'Register New Student'}</h2>
            <p className="text-xs font-medium text-slate-500 mt-0.5">Enter complete academic and profile details.</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"><X className="w-5 h-5"/></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto max-h-[70vh]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="sm:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-slate-300" />
                <input 
                  required className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none transition-all"
                  placeholder="Enter student's full name"
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-300" />
                <input 
                  required type="email" className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none transition-all"
                  placeholder="student@college.edu"
                  value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Current CGPA</label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-3 w-4 h-4 text-slate-300" />
                <input 
                  required type="number" step="0.01" className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none transition-all"
                  placeholder="0.00"
                  value={formData.cgpa} onChange={e => setFormData({...formData, cgpa: parseFloat(e.target.value)})}
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Portal Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-300" />
                <input 
                  required className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none transition-all"
                  placeholder="Create password"
                  value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Department</label>
              <div className="relative">
                <Building className="absolute left-3 top-3 w-4 h-4 text-slate-300" />
                <input 
                  required className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none transition-all"
                  placeholder="e.g. IT, CS"
                  value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Academic Year</label>
              <div className="relative">
                <Layers className="absolute left-3 top-3 w-4 h-4 text-slate-300" />
                <input 
                  required className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none transition-all"
                  placeholder="2024"
                  value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})}
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Domain Expertise (Skills)</label>
              <div className="flex gap-2">
                <input 
                  className="flex-grow px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all"
                  placeholder="Add skill (e.g. React, Java)"
                  value={skillInput} onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                />
                <button type="button" onClick={addSkill} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-sm shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 p-3 bg-slate-50 border border-slate-100 border-dashed rounded-xl min-h-[50px]">
                {formData.skills?.map(s => (
                  <span key={s} className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-[10px] font-bold text-slate-600 flex items-center gap-2 shadow-sm">
                    {s}
                    <button type="button" onClick={() => setFormData({...formData, skills: formData.skills?.filter(sk => sk !== s)})} className="text-slate-300 hover:text-red-500 transition-colors"><X className="w-3.5 h-3.5"/></button>
                  </span>
                ))}
                {(!formData.skills || formData.skills.length === 0) && <p className="text-[11px] text-slate-400 italic m-auto">No skills added yet.</p>}
              </div>
            </div>
          </div>
        </form>

        <div className="p-6 border-t border-slate-100 flex gap-4 bg-slate-50/30">
          <button type="button" onClick={onClose} className="flex-1 px-6 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-white hover:border-slate-300 transition-all">Discard</button>
          <button onClick={handleSubmit} className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100">
            {student ? 'Commit Changes' : 'Confirm Registration'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentForm;
