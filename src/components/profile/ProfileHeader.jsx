import React, { useState } from 'react';
import { Edit3, Camera, X } from 'lucide-react';

export default function ProfileHeader() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Асанәли Құсайынов',
    age: 26,
    status: 'В зале (Invictus Go)',
    bio: 'Digital marketing freelancer. Качаю спину и ноги, слежу за питанием.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile({ ...profile, avatar: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-4">
      <div className="flex items-start gap-4">
        <div className="relative group">
          <img 
            src={profile.avatar} 
            alt="Profile" 
            className="w-20 h-20 rounded-full object-cover border-2 border-slate-100 shadow-inner"
          />
          <label className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
            <Camera className="w-5 h-5 text-white" />
            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          </label>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900 truncate">{profile.name}, {profile.age}</h2>
            <button 
              onClick={() => setIsEditing(true)}
              className="p-2 text-slate-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-slate-50"
            >
              <Edit3 className="w-4 h-4 stroke-[1.5]" />
            </button>
          </div>
          
          <div className="flex items-center gap-1.5 text-xs text-blue-600 font-medium mt-0.5 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            {profile.status}
          </div>

          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {profile.bio}
          </p>
        </div>
      </div>

      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-slate-900">Редактировать профиль</h3>
              <button onClick={() => setIsEditing(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5 stroke-[1.5]" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Имя</label>
                <input 
                  type="text" 
                  value={profile.name} 
                  onChange={(e) => setProfile({...profile, name: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Возраст</label>
                  <input 
                    type="number" 
                    value={profile.age} 
                    onChange={(e) => setProfile({...profile, age: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Статус</label>
                  <input 
                    type="text" 
                    value={profile.status} 
                    onChange={(e) => setProfile({...profile, status: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">О себе</label>
                <textarea 
                  rows="3"
                  value={profile.bio} 
                  onChange={(e) => setProfile({...profile, bio: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 resize-none"
                />
              </div>

              <button 
                onClick={() => setIsEditing(false)}
                className="w-full py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors mt-2"
              >
                Сохранить изменения
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
