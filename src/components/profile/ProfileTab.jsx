// src/components/profile/ProfileTab.jsx
import React, { useState } from 'react';
import { translations } from '../../locales/translations';
import { User, CheckCircle2, Camera, X, Calendar, Ruler, Scale, Search, MessageCircle } from 'lucide-react';
import { supabase } from '../../supabaseClient';

import ProfileHeader from './ProfileHeader';
import ProfileCard from './ProfileCard';
import ProfileMenu from './ProfileMenu';
import ProfileDocs from './ProfileDocs';
import ProfileDangerZone from './ProfileDangerZone';

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
  "Almaty Resort Pool | Санаторий Almaty Resort, улица Альмерек, 1/1, Алматы",
  "Pyramid Hard | Абая, 202/1, Алматы",
  "Invictus Go | Маметовой, 54, Алматы",
  "YA. Pilates Room | Навои, 200, Алматы",
  "Bodyfitgym | 7-й микрорайон, За, Алматы",
  "ViVa Pilates | Ауэзова, 60, Алматы",
  "ViVa Pilates | Микрорайон Астана, 1/12, Алматы",
  "35 Health Clubs Kazakhstan | ЖК LAMIYA, улица Ади Шарипова, 145 к2, Алматы",
  "Bubblzz | Улица Амангельды, 23/137, Алматы",
  "In Clover | Улица Курмангазы, 95, Алматы",
  "35 Health Clubs Kazakhstan | ЖК Forum Plus, улица Володарского, 40а, Алматы",
  "BeFitness | АФЭК, улица Рыскулбекова, 39а, Алматы",
  "Nautilus | ЖК Шахристан, улица Навои, 208/6, Алматы",
  "35 Health Clubs Kazakhstan | ЖК Шахристан, улица Навои, 208, Алматы",
  "WORKOUT | Улица Аскарова, 10а, Алматы",
  "Legion Fitness | ТЦ Алатау, проспект Турара Рыскулова, 103/3, Алматы",
  "Ankara | Гостиница InterContinental Almaty, улица Желтоксан, 181, Алматы",
  "YA. Pilates Room | ЖК Apple Residence, улица Аскарова, 12, Алматы",
  "Academy Woman Forum | ТРК Forum, проспект Сейфуллина, 617, Алматы",
  "Millennium | ЖК Алтын Булак-1, Е. Брусиловского улица, 159 блок 4, Алматы",
  "Progym | Улица Карасай батыра, 88Б, Алматы",
  "Adrenaline | Проспект Назарбаева, 223, Алматы",
  "Ant Gym | ЖК Алтын Орда, улица Ходжанова, 81 блок 3, Алматы",
  "TauFit | Жилой комплекс Тау Самалы, 98, Алматы",
  "Glide | Проспект Аль-Фараби, 120/53, Алматы",
  "БАНЗАЙ Fitness | Улица Кунаева, 43, Алматы",
  "Sport Line Z | 3-й микрорайон, 7а, Алматы",
  "Esentai Fit+Spa | TU ESENTAI MALL, проспект Аль-Фараби, 77/8, Алматы",
  "AMG | Микрорайон Аксай-4, 70Б, Алматы",
  "Vavilon Family Sport Club | ЖК Вавилон, улица Розыбакиева, 247 блок 5, Алматы",
  "31 Pilates Studio | ЖК Терренкур, проспект Достык, 128, Алматы",
  "Adrenaline | ЖК Maxima Residence, улица Кабанбай батыра, 49/1 блок D1, Алматы",
  "Bubblzz | БЦ Коктем Grand, проспект Достык, 210, Алматы",
  "YA. Pilates Room | ЖК Esentai City, проспект Аль-Фараби, 116/20, Алматы",
  "Baqgym | Улица Яссауи, 66а, Алматы",
  "Elastic Stretch Studio | Микрорайон Жетысу-2, 52/1, Алматы",
  "100% Fitness Gym | ТД на зеленом, улица Макатаева, 45, Алматы",
  "Comfort Stretch | Улица Торайгырова, 41, Алматы",
  "35 Health Clubs Kazakhstan | Улица Толе би, 75, Алматы",
  "La Vida Pilates | Проспект Гагарина, 245 к5, Алматы",
  "Angel | ЖК Royal, улица Кажымукана, 49, Алматы",
  "Zhailjau | ЖК Жайлау, микрорайон Мирас, 188/2, Алматы",
  "Versatile Fit-Boxing | Улица Нурмакова, 4, Алматы",
  "PG Fitness terra | Улица Тлендиева, 215, Алматы",
  "Amane | ЖК Metropole, проспект Аль-Фараби, 41/7 блок 7, Алматы",
  "Kinesis Gym | Микрорайон Жетысу-3, 67, Алматы",
  "Projumping Fitness | Микрорайон Аксай-1, 10/3, Алматы",
  "Studio 191 | Академия тенниса Максат, улица Абиша Кекилбайулы, 191, Алматы",
  "S89 Fitness Clubs | БЦ Green Hill, проспект Суюнбая, 89Б, Алматы",
  "Olive Pilates | ЖК Тенгиз Тауэрс, улица Каныша Сатпаева, 30/2, Алматы",
  "Uprime | ЖК Опера, микрорайон Аксай-4, 119, Алматы",
  "S-Fitness | Богенбай батыра улица, 148, Алматы",
  "Ober Pilates Studio | ЖК Гаухартас, проспект Абая, 150/230 блок 6, Алматы",
  "Prosto_fitspace | БЦ Желтоксан, улица Желтоксан, 111а, Алматы",
  "Aquamarine SPA & Fitness | Гостиница Ramada Almaty, улица Байтурсынова, 27/1, Алматы",
  "Arlan Black Wolves | Наурызбай батыра, 91Б, Алматы",
  "Progym | Улица Калдаякова, 17, Алматы",
  "Pyramid renesans | Проспект Абая, 202/1, Алматы",
  "Сфера | Микрорайон Самал-2, 66а, Алматы",
  "Пляж | Улица Карасай батыра, 120а, Алматы",
  "Flower Dance | Микрорайон Жетысу-3, 65, Алматы",
  "Alta pole studio | Толе би, 189д, Алматы",
  "Wave | Наурызбай батыра, 127 блок 1, Алматы",
  "Adrenaline | ЖК Этюд, проспект Достык, 250, Алматы",
  "L-fitness | ТЦ Дархан, улица Айманова, 155, Алматы",
  "Let's jump | Микрорайон Жетысу-2, 47а, Алматы",
  "Zeyin | 12-й микрорайон, 15а, Алматы",
  "Feel fit club | Улица Катаева, 158а, Алматы",
  "FitnessBlitz | ЖК Dial Residence, проспект Сейфуллина, 533, Алматы",
  "Almaly Fitness | Керей-Жанибек хандар улица, 103Б, Алматы",
  "Power Pilates | ЖК Ренессанс, проспект Назарбаева, 301, Алматы",
  "Arena fitness hub | ALMATY ARENA, микрорайон Нуркент, 7, Алматы",
  "PG Fitness | Тегга, проспект Серкебаева, 91 блок D, Алматы",
  "IronGym | Улица Каныша Сатпаева, 30/2в, Алматы",
  "Medina Fitness Studio | Улица Егизбаева, 13/3, Алматы",
  "Balance and Grace Pilates Studio | Улица Кажымукана, 10а, Алматы",
  "Stretching Almaty | Панфилова, 92, Алматы",
  "Family Space | Микрорайон Самал-2, 91, Алматы",
  "First Pilates Studio | ЖК Гаухартас, проспект Абая, 150/230 блок 4, Алматы",
  "King Fitness | Коктерек, 141, Алматы",
  "YA. Pilates Room | Globus, проспект Абая, 109в, Алматы",
  "Lifetime | Улица Розыбакиева, 273, Алматы",
  "La Vida Pilates | Микрорайон Казахфильм, 41а, Алматы",
  "35 Health Clubs Kazakhstan | Проспект Райымбека, 162а блок 9, Алматы",
  "Le Ciel | Улица Тимирязева, 67а, Алматы",
  "MV movement studio | Улица Тимирязева, 42 пав17, Алматы",
  "YA. Pilates Room | ТРЦ Riviera Park, улица Каныша Сатпаева, 90/21, Алматы",
  "Ocean Soul | ЖК Metropole, проспект Аль-Фараби, 41/6 блок 15, Алматы",
  "Lifestyle | Улица Исиналиева, 1/1, Алматы",
  "AF Sport | Навои, 300, Алматы",
  "Ems Fit x Body | Улица Жубанова, За, Алматы",
  "Level fitness & Gym | БЦ Премьер Алатау, проспект Достык, 105, Алматы"
];

const DAYS_OF_WEEK = [
  { id: 'Понедельник', label: 'Пн' },
  { id: 'Вторник', label: 'Вт' },
  { id: 'Среда', label: 'Ср' },
  { id: 'Четверг', label: 'Чт' },
  { id: 'Пятница', label: 'Пт' },
  { id: 'Суббота', label: 'Сб' },
  { id: 'Воскресенье', label: 'Вс' }
];

export default function ProfileTab({ userProfile, onComplete, isRegistration, currentLang = 'kk' }) {
  const t = translations[currentLang] || translations.kk;

  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState(() => {
    const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
    const savedProfile = JSON.parse(localStorage.getItem('gymconnect_user_data') || '{}');

    return {
      firstName: userProfile?.first_name || savedProfile.firstName || tgUser?.first_name || '',
      lastName: userProfile?.last_name || savedProfile.lastName || tgUser?.last_name || '',
      username: userProfile?.username ? userProfile.username.replace(/^@+/, '') : (savedProfile.username ? savedProfile.username.replace(/^@+/, '') : (tgUser?.username ? tgUser.username.replace(/^@+/, '') : '')),
      whatsapp: userProfile?.whatsapp || savedProfile.whatsapp || '',
      instagram: userProfile?.instagram ? userProfile.instagram.replace(/^@+/, '') : (savedProfile.instagram ? savedProfile.instagram.replace(/^@+/, '') : ''),
      avatar: userProfile?.avatar_url || savedProfile.avatar || tgUser?.photo_url || '',
      age: userProfile?.age || savedProfile.age || '',
      birthDate: userProfile?.birth_date || savedProfile.birthDate || '',
      gender: userProfile?.gender || savedProfile.gender || 'male',
      height: userProfile?.height || savedProfile.height || '',
      weight: userProfile?.weight || savedProfile.weight || '',
      city: userProfile?.city || savedProfile.city || 'Алматы',
      district: userProfile?.district || savedProfile.district || 'Медеуский',
      gym: userProfile?.gym || savedProfile.gym || '',
      
      experienceLevel: userProfile?.experience_level || savedProfile.experienceLevel || 'independent',
      trainerNeed: userProfile?.trainer_need || savedProfile.trainerNeed || 'self',
      trainerUsername: userProfile?.trainer_username ? userProfile.trainer_username.replace(/^@+/, '') : (savedProfile.trainerUsername ? savedProfile.trainerUsername.replace(/^@+/, '') : ''),
      membershipTerm: userProfile?.membership_term || savedProfile.membershipTerm || '6_months',

      specialization: userProfile?.specialization || savedProfile.specialization || 'athlete',
      goal: userProfile?.goal || savedProfile.goal || 'mass',
      
      lookingFor: userProfile?.looking_for || savedProfile.lookingFor || 'gymbro',
      workoutTime: userProfile?.workout_time || savedProfile.workoutTime || 'evening',
      customTime: userProfile?.custom_time || savedProfile.customTime || '',
      workoutDays: userProfile?.workout_days || savedProfile.workoutDays || ['Понедельник', 'Среда', 'Пятница'],
      bio: userProfile?.bio || savedProfile.bio || '',

      agreeTerms: userProfile?.agree_terms || savedProfile.agreeTerms || false,
      agreePrivacy: userProfile?.agree_privacy || savedProfile.agreePrivacy || false,
      agreeMarketing: userProfile?.agree_marketing || savedProfile.agreeMarketing || false,
      agreeTrainers: userProfile?.agree_trainers || savedProfile.agreeTrainers || false,
      agreeSafety: userProfile?.agree_safety || savedProfile.agreeSafety || false
    };
  });

  const [gymSearchQuery, setGymSearchQuery] = useState(formData.gym || '');
  const [isGymDropdownOpen, setIsGymDropdownOpen] = useState(false);

  const filteredGyms = ALMATY_GYMS.filter(gym => 
    gym.toLowerCase().includes(gymSearchQuery.toLowerCase())
  );

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleWhatsAppChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    handleChange('whatsapp', val);
  };

  const handleInstagramChange = (e) => {
    const val = e.target.value.replace(/[@\s]/g, '').replace(/[^a-zA-Z0-9._]/g, '');
    handleChange('instagram', val);
  };

  const handleUsernameChange = (e) => {
    const val = e.target.value.replace(/[@\s]/g, '');
    handleChange('username', val);
  };

  const toggleWorkoutDay = (dayId) => {
    setFormData(prev => {
      const currentDays = prev.workoutDays || [];
      if (currentDays.includes(dayId)) {
        return { ...prev, workoutDays: currentDays.filter(d => d !== dayId) };
      } else {
        return { ...prev, workoutDays: [...currentDays, dayId] };
      }
    });
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const ageNum = Number(formData.age);
    if (!ageNum || ageNum < 18 || ageNum > 80) {
      alert(currentLang === 'kk' ? 'Жасыңыз 18 бен 80 аралығында болуы тиіс!' : 'Возраст должен быть от 18 до 80 лет!');
      return;
    }

    if (!formData.birthDate) {
      alert(currentLang === 'kk' ? 'Туған күніңізді көрсетіңіз!' : 'Укажите дату рождения!');
      return;
    }

    if (!formData.gym) {
      alert(currentLang === 'kk' ? 'Негізгі фитнес-залыңызды таңдаңыз!' : 'Выберите ваш основной фитнес-зал!');
      return;
    }

    if (formData.workoutDays.length === 0) {
      alert(currentLang === 'kk' ? 'Кем дегенде бір жаттығу күнін таңдаңыз!' : 'Выберите хотя бы один день тренировок!');
      return;
    }

    const cleanTg = formData.username.trim().replace(/^@+/, '');
    const formattedUsername = cleanTg ? `@${cleanTg}` : '';

    const cleanInst = formData.instagram.trim().replace(/^@+/, '');
    const formattedInstagram = cleanInst ? `@${cleanInst}` : '';

    const cleanTrainerTg = formData.trainerUsername.trim().replace(/^@+/, '');
    const formattedTrainerUsername = cleanTrainerTg ? `@${cleanTrainerTg}` : null;

    const profilePayload = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      username: formattedUsername,
      whatsapp: formData.whatsapp || null,
      instagram: formattedInstagram,
      age: Number(formData.age),
      birth_date: formData.birthDate || null,
      gender: formData.gender,
      height: Number(formData.height),
      weight: Number(formData.weight),
      city: formData.city,
      district: formData.district,
      gym: formData.gym,
      membership_term: formData.membershipTerm,
      experience_level: formData.experienceLevel,
      trainer_need: formData.trainerNeed,
      trainer_username: formattedTrainerUsername,
      specialization: formData.specialization,
      goal: formData.goal,
      looking_for: formData.lookingFor,
      workout_time: formData.workoutTime,
      custom_time: formData.customTime || null,
      workout_days: formData.workoutDays,
      bio: formData.bio || null,
      avatar_url: formData.avatar || null,
      agree_terms: formData.agreeTerms,
      agree_privacy: formData.agreePrivacy,
      agree_marketing: formData.agreeMarketing,
      agree_trainers: formData.agreeTrainers,
      agree_safety: formData.agreeSafety
    };

    const { error } = await supabase
      .from('profiles')
      .upsert([profilePayload], { onConflict: 'username' });

    if (error) {
      console.error('Ошибка сохранения в Supabase:', error.message);
      alert('Ошибка сохранения базы данных: ' + error.message);
      return;
    }

    localStorage.setItem('gymconnect_user_data', JSON.stringify(formData));
    localStorage.setItem('gymconnect_profile_filled', 'true');
    setIsEditing(false);
    if (onComplete) onComplete(profilePayload);
  };

  // Экран регистрации или полного редактирования анкеты (со всеми полями)
  if (isRegistration || isEditing) {
    return (
      <div className="w-full min-h-screen p-4 pb-36 flex flex-col items-center justify-start animate-in fade-in duration-200">
        <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-xl border border-slate-100 mt-2">
          
          <div className="flex justify-between items-center mb-6">
            <div>
              <span className="inline-block bg-blue-50 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full mb-1">
                {isEditing ? 'Редактирование' : 'Добро пожаловать!'}
              </span>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Ваша анкета профиля</h1>
            </div>
            {isEditing && (
              <button onClick={() => setIsEditing(false)} className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="flex flex-col items-center mb-4">
              <div className="relative w-20 h-20 bg-slate-100 rounded-full border-2 border-slate-200 overflow-hidden flex items-center justify-center shadow-inner">
                {formData.avatar ? <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" /> : <User className="w-8 h-8 text-slate-400" />}
                <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera className="w-6 h-6 text-white" />
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </label>
              </div>
              <span className="text-[11px] text-slate-500 mt-1.5 font-medium">Изменить фото профиля</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Имя *</label>
                <input type="text" required value={formData.firstName} onChange={(e) => handleChange('firstName', e.target.value)} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-600" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Фамилия *</label>
                <input type="text" required value={formData.lastName} onChange={(e) => handleChange('lastName', e.target.value)} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-600" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Telegram Username *</label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-slate-400 font-mono text-sm">@</span>
                <input type="text" required value={formData.username} onChange={handleUsernameChange} className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-600 font-mono" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Номер WhatsApp</label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-slate-600 font-mono text-xs font-bold">+7</span>
                <MessageCircle className="absolute right-3.5 w-4 h-4 text-emerald-600 pointer-events-none" />
                <input type="tel" value={formData.whatsapp} onChange={handleWhatsAppChange} placeholder="7011234567" maxLength={10} className="w-full pl-11 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-mono focus:outline-none focus:border-blue-600" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Возраст *</label>
                <input type="number" min="18" max="80" required value={formData.age} onChange={(e) => handleChange('age', e.target.value)} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-600" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Пол *</label>
                <select value={formData.gender} onChange={(e) => handleChange('gender', e.target.value)} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-600 cursor-pointer">
                  <option value="male">Мужской</option>
                  <option value="female">Женский</option>
                </select>
              </div>
            </div>

            {/* Дата рождения (теперь отображается корректно и при редактировании) */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Дата рождения *</label>
              <div className="relative flex items-center">
                <Calendar className="absolute left-3 w-4 h-4 text-slate-400" />
                <input type="date" required value={formData.birthDate} onChange={(e) => handleChange('birthDate', e.target.value)} className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-600" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Рост (см) *</label>
                <div className="relative flex items-center">
                  <Ruler className="absolute left-3 w-4 h-4 text-slate-400" />
                  <input type="number" required value={formData.height} onChange={(e) => handleChange('height', e.target.value)} placeholder="178" className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-600" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Вес (кг) *</label>
                <div className="relative flex items-center">
                  <Scale className="absolute left-3 w-4 h-4 text-slate-400" />
                  <input type="number" required value={formData.weight} onChange={(e) => handleChange('weight', e.target.value)} placeholder="75" className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-600" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Город *</label>
                <select value={formData.city} onChange={(e) => handleChange('city', e.target.value)} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-600 cursor-pointer">
                  <option value="Алматы">Алматы</option>
                  <option value="Астана" disabled>Астана (скоро)</option>
                  <option value="Шымкент" disabled>Шымкент (скоро)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Район *</label>
                <select value={formData.district} onChange={(e) => handleChange('district', e.target.value)} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-600 cursor-pointer">
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

            <div className="relative">
              <label className="block text-xs font-medium text-slate-700 mb-1">Фитнес-зал *</label>
              <div className="relative flex items-center">
                <Search className="absolute left-3 w-4 h-4 text-slate-400" />
                <input type="text" required value={gymSearchQuery} onFocus={() => setIsGymDropdownOpen(true)} onChange={(e) => { setGymSearchQuery(e.target.value); handleChange('gym', e.target.value); setIsGymDropdownOpen(true); }} placeholder="Поиск зала..." className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-600" />
                {gymSearchQuery && (
                  <button type="button" onClick={() => { setGymSearchQuery(''); handleChange('gym', ''); }} className="absolute right-3 text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              {isGymDropdownOpen && filteredGyms.length > 0 && (
                <div className="absolute z-50 left-0 right-0 mt-1 max-h-40 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg">
                  {filteredGyms.map((gymName, index) => (
                    <div key={index} onClick={() => { setGymSearchQuery(gymName); handleChange('gym', gymName); setIsGymDropdownOpen(false); }} className="px-3 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-600 cursor-pointer border-b border-slate-50">
                      {gymName}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Выбор дней тренировок */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Дни тренировок *</label>
              <div className="grid grid-cols-7 gap-1">
                {DAYS_OF_WEEK.map((day) => {
                  const isSelected = formData.workoutDays?.includes(day.id);
                  return (
                    <button
                      type="button"
                      key={day.id}
                      onClick={() => toggleWorkoutDay(day.id)}
                      className={`py-2 rounded-xl text-xs font-semibold border transition-all flex flex-col items-center justify-center ${
                        isSelected ? 'bg-blue-600 border-blue-600 text-white shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Цель</label>
                <select value={formData.goal} onChange={(e) => handleChange('goal', e.target.value)} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-600 cursor-pointer">
                  <option value="mass">Набор массы</option>
                  <option value="cut">Сушка</option>
                  <option value="tonus">Тонус</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Ищу (GymBro)</label>
                <select value={formData.lookingFor} onChange={(e) => handleChange('lookingFor', e.target.value)} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-600 cursor-pointer">
                  <option value="gymbro">GymBro</option>
                  <option value="partner">Напарника</option>
                  <option value="group">Группу</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Instagram (без @)</label>
              <input type="text" value={formData.instagram} onChange={handleInstagramChange} placeholder="username" className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-600" />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">О себе / Био</label>
              <textarea rows={2} value={formData.bio} onChange={(e) => handleChange('bio', e.target.value)} placeholder="Пару слов о ваших тренировках..." className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-600 resize-none" />
            </div>

            <button type="submit" className="w-full mt-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{isEditing ? 'Сохранить изменения' : 'Сохранить анкету и войти'}</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Основной экран профиля (компактные отступы, чистая иерархия)
  return (
    <div className="p-4 pt-2 max-w-md mx-auto flex flex-col pb-24 space-y-3 animate-in fade-in duration-200">
      <ProfileHeader />
      <ProfileCard userProfile={userProfile} onEditClick={() => setIsEditing(true)} />
      <ProfileMenu />
      <ProfileDocs />
      <ProfileDangerZone />
    </div>
  );
}
