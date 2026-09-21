// src/components/profile/ProfileTab.jsx
import React, { useState, useEffect } from 'react';
import { translations } from '../../locales/translations';
import { User, Dumbbell, AtSign, CheckCircle2, ChevronDown, Camera, Calendar, Scale, Ruler, Heart, ShieldAlert } from 'lucide-react';

import ProfileHeader from './ProfileHeader';
import ProfileCard from './ProfileCard';
import ProfileMenu from './ProfileMenu';
import ProfileDocs from './ProfileDocs';
import ProfileDangerZone from './ProfileDangerZone';

// Полный перечень всех 230 фитнес-залов и объектов Алматы
const ALMATY_GYMS = [
  "БАНЗАЙ Fitness | Проспект Абая, 150, Алматы",
  "Adrenaline | Проспект Жибек Жолы, 66, Алматы",
  "K1 Fitness | ТРК ADK, улица Каныша Сатпаева, 90, Алматы",
  "YA. | Улица Навои, 200 блок 1, Алматы",
  "Underground Big | Проспект Абая, 150, Алматы",
  "Uniflex | Микрорайон Жетысу-2, 2а, Алматы",
  "Budokan Sports & Arts | Улица Сагадат Нурмагамбетов, 150, Алматы",
  "Forme | ЖК Metropole, проспект Аль-Фараби, 41/7 блок 8, Алматы",
  "Iron House | Улица Шевченко, 100, Алматы",
  "Q Fitness | Республики площадь, 15, Алматы",
  "Gym arena | Рынок Турксиб, проспект Суюнбая, 261а, Алматы",
  "Avantgarde | ЖК Науаи, улица Навои, 7, Алматы",
  "Grandpool | Ораза Жандосова улица, 55/9, Алматы",
  "THE SPA RIXOS ALMATY | Гостиница Rixos Almaty, проспект Сейфуллина, 506, Алматы",
  "Mind Of Body | Улица Наурызбай батыра, 10а, Алматы",
  "Hawaii Fitness | Молл Апорт, Ташкентский тракт, 17к, Алматы, Карасайский район",
  "Power Pilates | БЦ Алатау Гранд, улица Тимирязева, 28в, Алматы",
  "Boss Tangym | Улица Маметовой, 67, Алматы",
  "Zip Fit | ЖК Солнечный квартал, улица Бальзака, 8 лит В, Алматы",
  "KRIDA Premium Fitness Club | Улица Наурызбай батыра, 89, Алматы",
  "WORKOUT | ТД Дукат, 10-й микрорайон, ЗБ, Алматы",
  "Yfitness & Spa | Улица Герольда Бельгера, 50, Алматы",
  "Wellness Club LUXOR | Проспект Достык, 341, Алматы",
  "Formula fitness & sport studio | 1-й квартал, 12а, с. Жанатурмыс",
  "PULS studio | ЖК Алма-Ата, проспект Гагарина, 66Б, Алматы",
  "Kaktus Fit | Проспект Абылай хана, 167, Каскелен",
  "Tamos Family Club | Улица Какимбека Салыкова, 50/1, Алматы",
  "Dance Studio 29 | Улица Гоголя, 84а, Алматы",
  "S89 Fitness | Улица Радостовца, 69, Алматы",
  "Invictus Fitness Gagarin | Проспект Гагарина, 286, Алматы",
  "Invictus Girls | Проспект Абая, 160 к3/1, Алматы",
  "Rakhat Fitness | Проспект Абая, 48, Алматы",
  "Piramid Strong Pro | Микрорайон Мирас, 128/5, Алматы",
  "Champ1on | Улица Кожабекова, 6, Алматы",
  "D-fitness | 12-й микрорайон, 20а, Алматы",
  "Woom | ЖК Abai, проспект Сейфуллина, 597/7, Алматы",
  "Hero's Journey | МФК VILLA, проспект Аль-Фараби, 140а, Алматы",
  "Invictus Fitness Sadu | Проспект Аль-Фараби, 128/7, Алматы",
  "Invictus Go | Улица Аскарова, 4/3, Алматы",
  "Hero's Journey | Улица Ескараева, 3, Алматы",
  "Invictus Go | проспект Абая, 165 блок 9, Алматы",
  "Invictus Go | улица Ади Шарипова, 145 к2, Алматы",
  "Invictus Go | Улица Тимирязева, 42, Алматы",
  "Pyramid Gym | Микрорайон Аксай-5, 24, Алматы",
  "Invictus Go | Улица Навои, 97, Алматы",
  "YA.Gym Point | ТД Таугуль, улица Пятницкого, 15/16, Алматы",
  "Aqongym | Микрорайон Жетысу-2, 11/1, Алматы",
  "S89 Fitness Clubs | Проспект Гагарина, 244а, Алматы",
  "Velvet Sport Villa | Микрорайон Ерменсай 3, 23, Алматы",
  "Royal club | Ботанический Сад улица, 26, Алматы",
  "Aquastars | ЖК Шахристан, улица Навои, 208/6, Алматы",
  "Royal club | ЖК Бухар Жырау Тауэрс, Бухар жырау бульвар, 27/5, Алматы",
  "Technofit | ЖК Дом на Абая, проспект Гагарина, 124, Алматы",
  "Balance | Улица Навои, 280, Алматы",
  "Underground Fit | Улица Торайгырова, 21/1Б, Алматы",
  "Hero's Journey | TPU PROMENADE, проспект Абая, 44а, Алматы",
  "Adrenaline | Касымова улица, 32, Алматы",
  "Pyramid pride | проспект Жибек Жолы, 131, Алматы",
  "Invictus Go | ТРЦ Riviera Park, Алматы",
  "Esentai Fit+Spa | TU ESENTAI MALL, Алматы",
  "Invictus Go | Мамыр-1, 26/1, Алматы",
  "Invictus Go | Байтурсынова, 179, Алматы",
  "MegaGym | Улица Абиша Кекилбайулы, 38а/1, Алматы",
  "Royal club | Самал-3, 20, Алматы",
  "Invictus Go | Улица Саина, 16а, Алматы",
  "Balance | Ауэзова, 5, Алматы",
  "Cordial Fitness | Мамыр-7, 21, Алматы",
  "Prostretching | 5-й микрорайон, 30Б, Алматы",
  "Pyramid renessans | Проспект Назарбаева, 301, Алматы",
  "Prostretching | Курмангазы, 107, Алматы",
  "YA. | ТРЦ Riviera Park, Алматы",
  "100% Fitness Gym | БЦ Almaty Towers, Байзакова, 280, Алматы",
  "YA. | Минусинская, 13Б, Алматы",
  "Siam | Азербаева, 67, Алматы",
  "First fitness | Таугуль-1, 22/1, Алматы",
  "Balance | Толе би, 101, Алматы",
  "YA. | ТРЦ SPUTNIK mall, Алматы",
  "Adrenaline | Ауэзова, 163а, Алматы",
  "БАНЗАЙ Fitness | TPK Atakent Mall, Алматы",
  "БАНЗАЙ Fitness | Толе би, 187 к2, Алматы",
  "Hero's Journey | Уалиханова, 170/1, Алматы",
  "Invictus Fitness | Самал-1, 9а, Алматы",
  "Bubblzz | Минина, 24, Алматы",
  "Royal club | Нурлы-Тау, Алматы",
  "Materia | Розыбакиева, 159а, Алматы",
  "Winox Pro | Аль-Фараби, 5/2, Алматы",
  "Adrenaline | Жетысу-2, 69Б, Алматы",
  "777 Fight Club & Gym | Курмангазы, 97, Алматы",
  "Select dance & Fit | Абая, 130/3, Алматы",
  "Prostretching | Тимирязева, 42 к10а, Алматы",
  "Aquastars | Гоголя, 114 к8, Алматы",
  "БАНЗАЙ IMPULSE | Толе би, 187 к2, Алматы",
  "Aquastars | Яссауи, 15/2, Алматы",
  "100% Fitness Gym | Кожамкулова, 136, Алматы",
  "БАНЗАЙ Fitness | ТРЦ DOMILLION, Алматы",
  "WORKOUT | ТРК Forum, Алматы",
  "Urban Gym | Назарбаева, 223, Алматы",
  "Aquastars | Кабанбай батыра, 87, Алматы",
  "Invictus Go | Аксай-5, 25, Алматы",
  "Endurance Almaty | Байсеитовой, 49, Алматы",
  "35 Health Clubs Kazakhstan | Тургут Озала, 261, Алматы",
  "LegenDa | Торайгырова, 39, Алматы",
  "Gepard Sport Club | Утеген батыра, 11а, Алматы",
  "Profitnessamg | Каныша Сатпаева, 33, Алматы",
  "Invictus Go | Каракулова, 39, Алматы",
  "YA. | Проспект Достык, 116, Алматы",
  "Aqongym Air | Жетысу-1, 16/4, Алматы",
  "FitnessBlitz | Самал-1, 9а, Алматы",
  "19hills | Шевченко, 96, Алматы",
  "Argo fitness | Карасай батыра, 152/1, Алматы",
  "100% Fitness Gym | Кабанбай батыра, 147, Алматы",
  "Elastic studio | Астана, 1/18 к7, Алматы",
  "31 Pilates Studio | Гагарина, 310/1, Алматы",
  "Aru ana studio | Розыбакиева, 320, Алматы",
  "Invictus Go | Кажымукана, 49, Алматы",
  "35 Health Clubs Kazakhstan | Толе би, 285/8 к5, Алматы",
  "Nomad Gym | Жетысу-1, 47, Алматы",
  "FitnessBlitz | Аксай-5, 3, Алматы",
  "Best Gym Almaty | Байжанбаева, 5, Алматы",
  "Тастак | Толе би, 249-249а, Алматы",
  "Be Turbo | Тимирязева, 28в, Алматы",
  "Pulse | MOK Samal Mall, Алматы",
  "Invictus Go | Торекулова, 93, Алматы",
  "Brooklyn Fitness Gym | Керемет, 7 к42, Алматы",
  "Fightclub.kz | Достык, 105, Алматы",
  "Ya Kids | Жамбыла, 106, Алматы",
  "Asyl Gym | Туркебаева, 92, Алматы",
  "Uniflex Women | Жетысу-2, 2а, Алматы",
  "Adrenaline | Райымбека, 348/1, Алматы",
  "WORKOUT | Жарокова, 124, Алматы",
  "БАНЗАЙ Fitness-Premium Samal | Ритц-Палас, Алматы",
  "35 Health Clubs Kazakhstan | Мамыр-3, 23, Алматы",
  "35 Health Clubs Kazakhstan | Серкебаева, 99, Алматы",
  "SK boxing | Тимирязева, 111а, Алматы",
  "Aquastars | Жамакаева, 256а, Алматы",
  "ProGym Sky | Муратбаева, 180, Алматы",
  "Reboot Gym Studio | Сейфуллина, 574/3, Алматы",
  "Eyva Space | Серкебаева, 101, Алматы",
  "Almaty Resort Pool | Улица Альмерек, 1/1, Алматы",
  "Pyramid Hard | Абая, 202/1, Алматы",
  "Invictus Go | Маметовой, 54, Алматы",
  "YA. Pilates Room | Навои, 200, Алматы",
  "Bodyfitgym | 7-й микрорайон, За, Алматы",
  "ViVa Pilates | Ауэзова, 60, Алматы",
  "ViVa Pilates | Астана, 1/12, Алматы",
  "35 Health Clubs Kazakhstan | Ади Шарипова, 145, Алматы",
  "Bubblzz | Амангельды, 23/137, Алматы",
  "In Clover | Курмангазы, 95, Алматы",
  "35 Health Clubs Kazakhstan | Володарского, 40а, Алматы",
  "BeFitness | Рыскулбекова, 39а, Алматы",
  "Nautilus | Навои, 208/6, Алматы",
  "35 Health Clubs Kazakhstan | Навои, 208, Алматы",
  "WORKOUT | Аскарова, 10а, Алматы",
  "Legion Fitness | Проспект Турара Рыскулова, 103/3, Алматы",
  "Ankara | InterContinental Almaty, Алматы",
  "YA. Pilates Room | Аскарова, 12, Алматы",
  "Academy Woman Forum | ТРК Forum, Алматы",
  "Millennium | Брусиловского, 159, Алматы",
  "Progym | Карасай батыра, 88Б, Алматы",
  "Adrenaline | Назарбаева, 223, Алматы",
  "Ant Gym | Ходжанова, 81, Алматы",
  "TauFit | Тау Самалы, 98, Алматы",
  "Glide | Аль-Фараби, 120/53, Алматы",
  "БАНЗАЙ Fitness | Кунаева, 43, Алматы",
  "Sport Line Z | 3-й микрорайон, 7а, Алматы",
  "Esentai Fit+Spa | TU ESENTAI MALL, Алматы",
  "AMG | Аксай-4, 70Б, Алматы",
  "Vavilon Family Sport Club | Розыбакиева, 247, Алматы",
  "31 Pilates Studio | Достык, 128, Алматы",
  "Adrenaline | Кабанбай батыра, 49/1, Алматы",
  "Bubblzz | Достык, 210, Алматы",
  "YA. Pilates Room | Аль-Фараби, 116/20, Алматы",
  "Baqgym | Яссауи, 66а, Алматы",
  "Elastic Stretch Studio | Жетысу-2, 52/1, Алматы",
  "100% Fitness Gym | Макатаева, 45, Алматы",
  "Comfort Stretch | Торайгырова, 41, Алматы",
  "35 Health Clubs Kazakhstan | Толе би, 75, Алматы",
  "La Vida Pilates | Гагарина, 245 к5, Алматы",
  "Angel | Кажымукана, 49, Алматы",
  "Zhailjau | Мирас, 188/2, Алматы",
  "Versatile Fit-Boxing | Нурмакова, 4, Алматы",
  "PG Fitness terra | Тлендиева, 215, Алматы",
  "Amane | Аль-Фараби, 41/7, Алматы",
  "Kinesis Gym | Жетысу-3, 67, Алматы",
  "Projumping Fitness | Аксай-1, 10/3, Алматы",
  "Studio 191 | Кекилбайулы, 191, Алматы",
  "S89 Fitness Clubs | Суюнбая, 89Б, Алматы",
  "Olive Pilates | Сатпаева, 30/2, Алматы",
  "Uprime | Аксай-4, 119, Алматы",
  "S-Fitness | Богенбай батыра, 148, Алматы",
  "Ober Pilates Studio | Абая, 150/230, Алматы",
  "Prosto_fitspace | Желтоксан, 111а, Алматы",
  "Aquamarine SPA & Fitness | Ramada Almaty, Алматы",
  "Arlan Black Wolves | Наурызбай батыра, 91Б, Алматы",
  "Progym | Калдаякова, 17, Алматы",
  "Pyramid renesans | Абая, 202/1, Алматы",
  "Сфера | Самал-2, 66а, Алматы",
  "Пляж | Карасай батыра, 120а, Алматы",
  "Flower Dance | Жетысу-3, 65, Алматы",
  "Alta pole studio | Толе би, 189д, Алматы",
  "Wave | Наурызбай батыра, 127, Алматы",
  "Adrenaline | Достык, 250, Алматы",
  "L-fitness | Айманова, 155, Алматы",
  "Let's jump | Жетысу-2, 47а, Алматы",
  "Zeyin | 12-й микрорайон, 15а, Алматы",
  "Feel fit club | Катаева, 158а, Алматы",
  "FitnessBlitz | Сейфуллина, 533, Алматы",
  "Almaly Fitness | Керей-Жанибек хандар, 103Б, Алматы",
  "Power Pilates | Назарбаева, 301, Алматы",
  "Arena fitness hub | ALMATY ARENA, Нуркент, 7, Алматы",
  "PG Fitness | Серкебаева, 91, Алматы",
  "IronGym | Каныша Сатпаева, 30/2в, Алматы",
  "Medina Fitness Studio | Егизбаева, 13/3, Алматы",
  "Balance and Grace Pilates Studio | Кажымукана, 10а, Алматы",
  "Stretching Almaty | Панфилова, 92, Алматы",
  "Family Space | Самал-2, 91, Алматы",
  "First Pilates Studio | Абая, 150/230, Алматы",
  "King Fitness | Коктерек, 141, Алматы",
  "YA. Pilates Room | Globus, Абая, 109в, Алматы",
  "Lifetime | Розыбакиева, 273, Алматы",
  "La Vida Pilates | Казахфильм, 41а, Алматы",
  "35 Health Clubs Kazakhstan | Райымбека, 162а, Алматы",
  "Le Ciel | Тимирязева, 67а, Алматы",
  "MV movement studio | Тимирязева, 42, Алматы",
  "YA. Pilates Room | ТРЦ Riviera Park, Алматы",
  "Ocean Soul | Аль-Фараби, 41/6, Алматы",
  "Lifestyle | Исиналиева, 1/1, Алматы",
  "AF Sport | Навои, 300, Алматы",
  "Ems Fit x Body | Жубанова, За, Алматы",
  "Level fitness & Gym | Достык, 105, Алматы"
];

export default function ProfileTab({ onComplete, isRegistration, currentLang = 'kk' }) {
  const t = translations[currentLang] || translations.kk;

  // Инициализация формы с автоподтяжкой из Telegram WebApp и localStorage
  const [formData, setFormData] = useState(() => {
    const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
    const savedProfile = JSON.parse(localStorage.getItem('gymconnect_user_data') || '{}');

    return {
      firstName: savedProfile.firstName || tgUser?.first_name || '',
      lastName: savedProfile.lastName || tgUser?.last_name || '',
      username: savedProfile.username || (tgUser?.username ? `@${tgUser.username}` : ''),
      avatar: savedProfile.avatar || tgUser?.photo_url || '',
      age: savedProfile.age || '',
      gender: savedProfile.gender || 'male',
      height: savedProfile.height || '',
      weight: savedProfile.weight || '',
      city: 'Алматы',
      district: savedProfile.district || 'Медеуский',
      gym: savedProfile.gym || '',
      goal: savedProfile.goal || 'mass',
      
      // Блок GymBro матчинга
      lookingFor: savedProfile.lookingFor || 'gymbro',
      workoutTime: savedProfile.workoutTime || 'evening',
      customTime: savedProfile.customTime || '',
      workoutDays: savedProfile.workoutDays || 'mon_wed_fri',
      bio: savedProfile.bio || '',

      // Юридические согласия
      agreeTerms: savedProfile.agreeTerms || false,
      agreePrivacy: savedProfile.agreePrivacy || false,
      agreeMarketing: savedProfile.agreeMarketing || false,
      agreeSafety: savedProfile.agreeSafety || false
    };
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Загрузка / изменение фото профиля
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange('avatar', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Проверка возраста (18 - 80)
    const ageNum = Number(formData.age);
    if (!ageNum || ageNum < 18 || ageNum > 80) {
      alert(currentLang === 'kk' ? 'Жасыңыз 18 бен 80 аралығында болуы тиіс!' : 'Возраст должен быть от 18 до 80 лет!');
      return;
    }

    // Проверка обязательных юридических чекбоксов
    if (!formData.agreeTerms || !formData.agreePrivacy || !formData.agreeSafety) {
      alert(currentLang === 'kk' ? 'Барлық міндетті келісімдерді белгілеңіз!' : 'Пожалуйста, примите обязательные соглашения и правила безопасности!');
      return;
    }

    // Сохранение в localStorage (CRM / база данных)
    localStorage.setItem('gymconnect_user_data', JSON.stringify(formData));
    if (onComplete) onComplete();
  };

  // ЕСЛИ РЕГИСТРАЦИЯ / ОНБОРДИНГ — ПОКАЗЫВАЕМ ПОЛНУЮ РЕГИСТРАЦИОННУЮ АНКЕТУ
  if (isRegistration) {
    return (
      <div className="w-full min-h-screen p-4 pb-36 flex flex-col items-center justify-start animate-in fade-in duration-200">
        <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-xl border border-slate-100 mt-2">
          
          <div className="text-center mb-6">
            <div className="inline-block bg-blue-50 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full mb-2">
              {currentLang === 'kk' ? 'Қош келдіңіз!' : 'Добро пожаловать!'}
            </div>
            <h1 className="text-xl font-bold text-slate-900 mb-1 tracking-tight">
              {currentLang === 'kk' ? 'Анкетаңызды толтырыңыз' : 'Заполните вашу анкету'}
            </h1>
            <p className="text-xs text-slate-500">
              {currentLang === 'kk' ? 'GymBro табу және КБЖУ есептеу үшін қажет' : 'Нужно для поиска GymBro и расчета КБЖУ'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Загрузка фото профиля */}
            <div className="flex flex-col items-center mb-4">
              <div className="relative w-20 h-20 bg-slate-100 rounded-full border-2 border-slate-200 overflow-hidden flex items-center justify-center shadow-inner">
                {formData.avatar ? (
                  <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-slate-400" />
                )}
                <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera className="w-6 h-6 text-white" />
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </label>
              </div>
              <span className="text-[11px] text-slate-500 mt-1.5 font-medium">
                {currentLang === 'kk' ? 'Суретті өзгерту' : 'Изменить фото профиля'}
              </span>
            </div>

            {/* Имя и Фамилия */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {currentLang === 'kk' ? 'Аты' : 'Имя'} *
                </label>
                <input 
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  placeholder={currentLang === 'kk' ? 'Атыңыз' : 'Имя'}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-600 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {currentLang === 'kk' ? 'Тегі' : 'Фамилия'} *
                </label>
                <input 
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  placeholder={currentLang === 'kk' ? 'Тегіңіз' : 'Фамилия'}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-600 transition-all"
                />
              </div>
            </div>

            {/* Telegram Username */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Telegram Username *</label>
              <div className="relative flex items-center">
                <AtSign className="absolute left-3 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => handleChange('username', e.target.value)}
                  placeholder="@username"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-600 transition-all"
                />
              </div>
            </div>

            {/* Возраст (18-80) и Пол */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {currentLang === 'kk' ? 'Жасы (18-80)' : 'Возраст (18-80)'} *
                </label>
                <div className="relative flex items-center">
                  <Calendar className="absolute left-3 w-4 h-4 text-slate-400" />
                  <input 
                    type="number"
                    min="18"
                    max="80"
                    required
                    value={formData.age}
                    onChange={(e) => handleChange('age', e.target.value)}
                    placeholder="25"
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-600 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {currentLang === 'kk' ? 'Жынысы' : 'Пол'} *
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleChange('gender', e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-600 transition-all cursor-pointer"
                >
                  <option value="male">{currentLang === 'kk' ? 'Ер адам (Мужской)' : 'Мужской'}</option>
                  <option value="female">{currentLang === 'kk' ? 'Әйел адам (Женский)' : 'Женский'}</option>
                </select>
              </div>
            </div>

            {/* Рост и Вес (для КБЖУ) */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {currentLang === 'kk' ? 'Бойы (см)' : 'Рост (см)'} *
                </label>
                <div className="relative flex items-center">
                  <Ruler className="absolute left-3 w-4 h-4 text-slate-400" />
                  <input 
                    type="number"
                    required
                    value={formData.height}
                    onChange={(e) => handleChange('height', e.target.value)}
                    placeholder="178"
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-600 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {currentLang === 'kk' ? 'Салмағы (кг)' : 'Вес (кг)'} *
                </label>
                <div className="relative flex items-center">
                  <Scale className="absolute left-3 w-4 h-4 text-slate-400" />
                  <input 
                    type="number"
                    required
                    value={formData.weight}
                    onChange={(e) => handleChange('weight', e.target.value)}
                    placeholder="75"
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-600 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Город (Алматы) и Район */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">{currentLang === 'kk' ? 'Қала' : 'Город'}</label>
                <input 
                  type="text"
                  disabled
                  value="Алматы"
                  className="w-full px-3 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">{currentLang === 'kk' ? 'Аудан' : 'Район'}</label>
                <select
                  value={formData.district}
                  onChange={(e) => handleChange('district', e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-600 transition-all cursor-pointer"
                >
                  <option value="Медеуский">Медеуский</option>
                  <option value="Бостандыкский">Бостандыкский</option>
                  <option value="Алмалинский">Алмалинский</option>
                  <option value="Ауэзовский">Ауэзовский</option>
                  <option value="Наурызбайский">Наурызбайский</option>
                  <option value="Жетысуский">Жетысуский</option>
                  <option value="Турксибский">Турксибский</option>
                  <option value="Алатауский">Алатауский</option>
                </select>
              </div>
            </div>

            {/* Выбор основного фитнес-зала (230 объектов Алматы) */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                {currentLang === 'kk' ? 'Негізгі фитнес-залыңыз' : 'Ваш основной фитнес-зал'} *
              </label>
              <div className="relative flex items-center">
                <Dumbbell className="absolute left-3 w-4 h-4 text-slate-400" />
                <select
                  required
                  value={formData.gym}
                  onChange={(e) => handleChange('gym', e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-600 transition-all appearance-none cursor-pointer"
                >
                  <option value="" disabled>{currentLang === 'kk' ? 'Залды таңдаңыз...' : 'Выберите клуб...'}</option>
                  {ALMATY_GYMS.map((gymName, index) => (
                    <option key={index} value={gymName}>{gymName}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Главная цель тренировок */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                {currentLang === 'kk' ? 'Негізгі мақсатыңыз' : 'Главная цель тренировок'} *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'mass', label: currentLang === 'kk' ? 'Бұлшықет жинау' : 'Набор массы' },
                  { id: 'cut', label: currentLang === 'kk' ? 'Арықтау / Сушка' : 'Сушка / Похудение' },
                  { id: 'strength', label: currentLang === 'kk' ? 'Күшті арттыру' : 'Развитие силы' },
                  { id: 'tone', label: currentLang === 'kk' ? 'Тонус және денсаулық' : 'Тонус и здоровье' }
                ].map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => handleChange('goal', item.id)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-medium border text-left transition-all ${
                      formData.goal === item.id 
                        ? 'bg-blue-50 border-blue-600 text-blue-700 font-semibold' 
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* БЛОК GYMBRO-МАТЧИНГА */}
            <div className="pt-2 border-t border-slate-100">
              <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3">
                {currentLang === 'kk' ? 'GymBro іздеу параметрлері' : 'Параметры поиска GymBro'}
              </h3>

              {/* Кого ищет */}
              <div className="mb-3">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {currentLang === 'kk' ? 'Кімді іздересіз?' : 'Кого вы ищете?'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'gymbro', label: 'GymBro' },
                    { id: 'gymgirl', label: 'GymGirl' },
                    { id: 'anyone', label: currentLang === 'kk' ? 'Бәрібир' : 'Любой' }
                  ].map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => handleChange('lookingFor', item.id)}
                      className={`py-2 px-2 rounded-xl text-xs font-medium border text-center transition-all ${
                        formData.lookingFor === item.id 
                          ? 'bg-blue-50 border-blue-600 text-blue-700 font-semibold' 
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Время тренировок */}
              <div className="mb-3">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {currentLang === 'kk' ? 'Ыңғайлы уақыт' : 'Удобное время суток'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'morning', label: currentLang === 'kk' ? 'Таңертең' : 'Утро' },
                    { id: 'afternoon', label: currentLang === 'kk' ? 'Күндіз' : 'День' },
                    { id: 'evening', label: currentLang === 'kk' ? 'Кешкілік' : 'Вечер' }
                  ].map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => handleChange('workoutTime', item.id)}
                      className={`py-2 px-2 rounded-xl text-xs font-medium border text-center transition-all ${
                        formData.workoutTime === item.id 
                          ? 'bg-blue-50 border-blue-600 text-blue-700 font-semibold' 
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Дни тренировок */}
              <div className="mb-3">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {currentLang === 'kk' ? 'Жаттығу күндері' : 'График тренировок'}
                </label>
                <select
                  value={formData.workoutDays}
                  onChange={(e) => handleChange('workoutDays', e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-600 transition-all cursor-pointer"
                >
                  <option value="mon_wed_fri">Понедельник — Среда — Пятница (ПН-СР-ПТ)</option>
                  <option value="tue_thu_sat">Вторник — Четверг — Суббота (ВТ-ЧТ-СБ)</option>
                  <option value="everyday">Каждый день / Плотный график</option>
                  <option value="flexible">Плавающий / Гибкий график</option>
                </select>
              </div>

              {/* О себе (Bio) */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {currentLang === 'kk' ? 'Өзіңіз туралы (Bio)' : 'О себе (для карточки Tinder)'}
                </label>
                <textarea
                  rows="2"
                  value={formData.bio}
                  onChange={(e) => handleChange('bio', e.target.value)}
                  placeholder={currentLang === 'kk' ? 'Мысалы: Базалық жаттығулар, серіктес іздеймін...' : 'Например: Качаю базу, ищу напарника на вечер...'}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600 transition-all resize-none"
                ></textarea>
              </div>
            </div>

            {/* ЮРИДИЧЕСКИЙ БЛОК И БЕЗОПАСНОСТЬ (ЧЕКБОКСЫ) */}
            <div className="pt-3 border-t border-slate-100 space-y-2.5">
              <div className="flex items-start gap-2">
                <input 
                  type="checkbox"
                  required
                  id="terms"
                  checked={formData.agreeTerms}
                  onChange={(e) => handleChange('agreeTerms', e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="terms" className="text-[11px] text-slate-600 leading-tight cursor-pointer">
                  {currentLang === 'kk' ? 'Жария оферта шарттарымен келісемін' : 'Я ознакомлен(а) и согласен(а) с Договором публичной оферты'}
                </label>
              </div>

              <div className="flex items-start gap-2">
                <input 
                  type="checkbox"
                  required
                  id="privacy"
                  checked={formData.agreePrivacy}
                  onChange={(e) => handleChange('agreePrivacy', e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="privacy" className="text-[11px] text-slate-600 leading-tight cursor-pointer">
                  {currentLang === 'kk' ? 'Деректерді өңдеуге келісім беремін' : 'Даю согласие на обработку персональных данных'}
                </label>
              </div>

              <div className="flex items-start gap-2">
                <input 
                  type="checkbox"
                  id="marketing"
                  checked={formData.agreeMarketing}
                  onChange={(e) => handleChange('agreeMarketing', e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="marketing" className="text-[11px] text-slate-600 leading-tight cursor-pointer">
                  {currentLang === 'kk' ? 'Telegram арқылы жарнама мен ақпарат алуға келісемін' : 'Согласен(а) на получение рассылок и персонализированной рекламы в Telegram'}
                </label>
              </div>

              <div className="flex items-start gap-2 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                <input 
                  type="checkbox"
                  required
                  id="safety"
                  checked={formData.agreeSafety}
                  onChange={(e) => handleChange('agreeSafety', e.target.checked)}
                  className="mt-0.5 rounded border-amber-300 text-amber-600 focus:ring-amber-500 cursor-pointer shrink-0"
                />
                <label htmlFor="safety" className="text-[10px] text-amber-900 leading-tight cursor-pointer">
                  <strong>{currentLang === 'kk' ? 'Қауіпсіздік ескертуі:' : 'Предупреждение о безопасности:'}</strong> {currentLang === 'kk' ? 'Платформа қауіпсіздік үшін жауап бермейді. Қыздарға тек қыздарды таңдау ұсынылады.' : 'Платформа не несет ответственности за безопасность при личных встречах. Девушкам рекомендуется выбирать в поиске девушек.'}
                </label>
              </div>
            </div>

            {/* Кнопка сохранения */}
            <button
              type="submit"
              className="w-full mt-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{currentLang === 'kk' ? 'Анкетаны сақтау және бастау' : 'Сохранить анкету и войти'}</span>
            </button>

          </form>
        </div>
      </div>
    );
  }

  // ОБЫЧНЫЙ ПРОФИЛЬ ПОСЛЕ РЕГИСТРАЦИИ (ЗДЕСЬ МОЖНО РЕДАКТИРОВАТЬ ДАННЫЕ)
  return (
    <div className="p-4 max-w-md mx-auto flex flex-col pb-24 animate-in fade-in duration-200">
      <ProfileHeader />
      <ProfileCard />
      <ProfileMenu />
      <ProfileDocs />
      <ProfileDangerZone />
    </div>
  );
}
