
import React, { useState, useEffect } from 'react';
import { User, StudentProfile, Group } from '../types';
import { api } from '../services/api';
import { Award, Briefcase, Users, Sparkles, Clock } from 'lucide-react';

interface Props {
  user: User;
}

const StudentDashboard: React.FC<Props> = ({ user }) => {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, g] = await Promise.all([api.getStudents(), api.getGroups()]);
        setStudents(s);
        setGroups(g);
      } catch (err) {
        console.error('Failed to load data:', err);
      }
    };
    load();
  }, []);

  const profile = students.find(s => s.email === user.email);
  const myGroup = profile ? groups.find(g => g.memberIds.includes(profile.id)) : null;
  const teammates = myGroup ? students.filter(s => myGroup.memberIds.includes(s.id) && s.id !== profile?.id) : [];

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center max-w-xs">
          <div className="bg-slate-50 p-4 rounded-full w-fit mx-auto mb-6">
            <Clock className="w-8 h-8 text-slate-300" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Registration Pending</h2>
          <p className="text-slate-500 text-sm leading-relaxed">Your student profile is not verified or created by admin</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="flex justify-between items-end border-b border-slate-100 pb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{profile.name}</h2>
          <p className="text-slate-500 font-medium mt-1">{profile.department} &bull; Class of {profile.year}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Enrollment Status</p>
          <span className="text-emerald-700 bg-emerald-50 px-4 py-1.5 rounded-full text-[11px] font-bold border border-emerald-100 shadow-sm shadow-emerald-100">Verified Student</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 space-y-8 h-fit">
          <div>
            <div className="flex items-center gap-2 mb-4 text-indigo-600">
              <Award className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Academic Merit</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-slate-900 tracking-tighter">{profile.cgpa.toFixed(2)}</span>
              <span className="text-sm font-bold text-slate-400 uppercase">CGPA</span>
            </div>
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-4 text-indigo-600">
              <Briefcase className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Skills</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map(s => (
                <span key={s} className="bg-indigo-50/50 text-indigo-700 border border-indigo-100/50 px-3 py-1.5 rounded-lg text-[11px] font-bold">
                  {s}
                </span>
              ))}
              {profile.skills.length === 0 && <p className="text-xs text-slate-400 italic">No skills specified.</p>}
            </div>
          </div>
        </div>

        <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col">
          <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
            <div className="flex items-center gap-4">
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm">
                <Users className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-xl">{myGroup ? myGroup.name : 'Team Allocation'}</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Assigned Academic Unit</p>
              </div>
            </div>
            {myGroup && (
              <span className="text-[10px] font-bold text-slate-400 border border-slate-200 rounded-full px-3 py-1 bg-white">
                {teammates.length + 1} Members
              </span>
            )}
          </div>

          <div className="p-8 flex-grow">
            {!myGroup ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16">
                <div className="bg-indigo-50 p-4 rounded-full mb-4">
                  <Sparkles className="w-8 h-8 text-indigo-300" />
                </div>
                <p className="font-bold text-slate-400 text-sm">Teams are currently being analyzed.</p>
                <p className="text-xs text-slate-400 mt-1">Check back once the instructor finalizes groupings.</p>
              </div>
            ) : (
              <div className="space-y-8">
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-5 ml-1">Team Mates</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {teammates.map(t => (
                      <div key={t.id} className="p-4 bg-slate-50/50 border border-slate-100 rounded-xl hover:bg-white hover:border-indigo-100 hover:shadow-sm transition-all group">
                        <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors mb-1">{t.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter truncate">
                          {t.skills.length > 0 ? t.skills.slice(0, 2).join(' • ') : 'Academic Student'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {myGroup.aiNotes && (
                  <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 relative overflow-hidden group">
                    <Sparkles className="absolute -right-4 -bottom-4 w-20 h-20 text-indigo-100 opacity-50 group-hover:scale-110 transition-transform" />
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">AI Summary</span>
                    </div>
                    <p className="text-sm text-indigo-900 leading-relaxed font-medium italic">
                      "{myGroup.aiNotes}"
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
