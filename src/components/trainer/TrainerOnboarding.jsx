// src/components/trainer/TrainerOnboarding.jsx
import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { Dumbbell, CheckCircle2, ArrowRight, ArrowLeft, Search, X } from 'lucide-react';

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

export default function TrainerOnboarding({ onComplete }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    phone: '',
    instagram: '',
    experience_years: '',
    role_type: 'personal', // personal, group, both
    specializations: [],
    formats: ['offline'],
    gyms: [],
    custom_gym: '',
    products: '',
    certificate_url: '',
    agree_verification: false
  });

  // Поиск по залам
  const [gymSearchQuery, setGymSearchQuery] = useState('');
  const [isGymDropdownOpen, setIsGymDropdownOpen] = useState(false);

  const filteredGyms = ALMATY_GYMS.filter(gym => 
    gym.toLowerCase().includes(gymSearchQuery.toLowerCase())
  );

  const availableSpecializations = [
    'Тренажерный зал / База',
    'Набор массы и гипертрофия',
    'Похудение и сушка',
    'Рекомпозиция тела',
    'Функциональный тренинг',
    'Реабилитация / ОФП'
  ];

  const handleToggle = (field, item) => {
    setFormData(prev => {
      const exists = prev[field].includes(item);
      return {
        ...prev,
        [field]: exists ? prev[field].filter(i => i !== item) : [...prev[field], item]
      };
    });
  };

  // Валидация телефона (строго 10 цифр после +7)
  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setFormData({...formData, phone: val});
  };

  // Валидация Instagram (только английские буквы, цифры, точки и подчеркивания)
  const handleInstagramChange = (e) => {
    const val = e.target.value.replace(/[^a-zA-Z0-9._]/g, '');
    setFormData({...formData, instagram: val});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.agree_verification) {
      alert('Подтвердите согласие на верификацию квалификации.');
      return;
    }

    setLoading(true);
    try {
      const cleanGyms = [...formData.gyms];
      if (formData.custom_gym.trim()) {
        cleanGyms.push(formData.custom_gym.trim());
      }

      const payload = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        username: formData.username.startsWith('@') ? formData.username : `@${formData.username}`,
        phone: formData.phone,
        instagram: formData.instagram ? `@${formData.instagram.replace('@', '')}` : '',
        experience_years: Number(formData.experience_years) || 0,
        role_type: formData.role_type,
        specializations: formData.specializations,
        formats: formData.formats,
        gyms: cleanGyms,
        products: formData.products,
        certificate_url: formData.certificate_url,
        city: 'Алматы'
      };

      const { error } = await supabase.from('trainer_profiles').insert([payload]);
      if (error) throw error;

      localStorage.setItem('gymconnect_trainer_registered', 'true');
      localStorage.setItem('gymconnect_trainer_username', payload.username);
      if (onComplete) onComplete(payload.username);
    } catch (err) {
      alert('Ошибка регистрации: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 shadow-xl">
        
        <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold">
              GC
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900">Регистрация тренера</h1>
              <p className="text-xs text-slate-500">Шаг {step} из 3</p>
            </div>
          </div>
          <span className="text-xs font-mono text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
            Partner Portal
          </span>
        </div>

        {/* ШАГ 1: Контакты */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-800">1. Основная информация и контакты</h2>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Имя *</label>
                <input 
                  type="text"
                  required
                  value={formData.first_name}
                  onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                  placeholder="Аскар"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Фамилия *</label>
                <input 
                  type="text"
                  required
                  value={formData.last_name}
                  onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                  placeholder="Сериков"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            {/* Telegram Username со встроенной собачкой */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Telegram Username *</label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-slate-400 font-mono text-sm">@</span>
                <input 
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value.replace('@', '')})}
                  placeholder="askar_coach"
                  className="w-full pl-8 pr-3.5 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-600 font-mono"
                />
              </div>
            </div>

            {/* Телефон с маской +7 и ограничением */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Номер телефона WhatsApp *</label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-slate-500 font-mono text-sm font-semibold">+7</span>
                <input 
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  placeholder="7011234567"
                  maxLength={10}
                  className="w-full pl-12 pr-3.5 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-600 font-mono"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Введите 10 цифр без +7 (например: 7011234567)</span>
            </div>

            {/* Instagram (латиница) со встроенной собачкой */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Instagram профиль</label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-slate-400 font-mono text-sm">@</span>
                <input 
                  type="text"
                  value={formData.instagram}
                  onChange={handleInstagramChange}
                  placeholder="askar_fitness"
                  className="w-full pl-8 pr-3.5 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-600 font-mono"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Только английские буквы, цифры и символы . _</span>
            </div>

            {/* Опыт работы */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Опыт работы тренером (лет) *</label>
              <input 
                type="number"
                min="0"
                max="40"
                required
                value={formData.experience_years}
                onChange={(e) => setFormData({...formData, experience_years: e.target.value})}
                placeholder="5"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            <button 
              type="button"
              onClick={() => {
                if (!formData.first_name || !formData.last_name || !formData.username || formData.phone.length !== 10) {
                  alert('Заполните все обязательные поля корректно (номер телефона должен содержать ровно 10 цифр)');
                  return;
                }
                setStep(2);
              }}
              className="w-full mt-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
            >
              <span>Далее: Направления и клубы</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ШАГ 2: Специализация, Роль, Залы и Форматы */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-800">2. Кем работаете и где тренируете</h2>
            
            {/* Кем работает (Роль) */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Формат деятельности (Кем работаете): *</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'personal', label: 'Персональный тренер' },
                  { id: 'group', label: 'Групповой тренер' },
                  { id: 'both', label: 'Универсал (Оба)' }
                ].map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setFormData({...formData, role_type: role.id})}
                    className={`py-2 px-1 rounded-xl text-xs font-semibold border transition-all text-center ${
                      formData.role_type === role.id ? 'bg-blue-600 border-blue-600 text-white shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    {role.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Специализация / Цели */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Специализация (направления):</label>
              <div className="grid grid-cols-2 gap-2">
                {availableSpecializations.map((spec, index) => {
                  const isSelected = formData.specializations.includes(spec);
                  return (
                    <div 
                      key={index}
                      onClick={() => handleToggle('specializations', spec)}
                      className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                        isSelected ? 'bg-blue-50 border-blue-600 text-blue-700 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <span>{spec}</span>
                      <div className={`w-4 h-4 rounded-md border flex items-center justify-center ${isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300'}`}>
                        {isSelected && <CheckCircle2 className="w-3 h-3" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Поиск по фитнес-клубам */}
            <div className="relative">
              <label className="block text-xs font-medium text-slate-700 mb-1">Фитнес-клубы, где вы работаете:</label>
              <div className="relative flex items-center">
                <Search className="absolute left-3 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  value={gymSearchQuery}
                  onFocus={() => setIsGymDropdownOpen(true)}
                  onChange={(e) => {
                    setGymSearchQuery(e.target.value);
                    setIsGymDropdownOpen(true);
                  }}
                  placeholder="Поиск зала в Алматы..."
                  className="w-full pl-10 pr-10 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                />
                {gymSearchQuery && (
                  <button type="button" onClick={() => setGymSearchQuery('')} className="absolute right-3 text-slate-400">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {isGymDropdownOpen && filteredGyms.length > 0 && (
                <div className="absolute z-50 left-0 right-0 mt-1 max-h-36 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg">
                  {filteredGyms.map((gymName, index) => {
                    const isAlreadySelected = formData.gyms.includes(gymName);
                    return (
                      <div
                        key={index}
                        onClick={() => {
                          if (!isAlreadySelected) {
                            setFormData({...formData, gyms: [...formData.gyms, gymName]});
                          }
                          setGymSearchQuery('');
                          setIsGymDropdownOpen(false);
                        }}
                        className={`px-3 py-2 text-xs cursor-pointer border-b border-slate-50 flex items-center justify-between ${
                          isAlreadySelected ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>{gymName}</span>
                        {isAlreadySelected && <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded">Выбрано</span>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Выбранные клубы чипсы */}
            {formData.gyms.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {formData.gyms.map((g, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-[11px] px-2.5 py-1 rounded-lg border border-blue-200 font-medium">
                    {g}
                    <button type="button" onClick={() => setFormData({...formData, gyms: formData.gyms.filter(item => item !== g)})}>
                      <X className="w-3 h-3 hover:text-rose-600" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Свой зал / Свой формат */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Свой зал / Студия / Другое место</label>
              <input 
                type="text"
                value={formData.custom_gym}
                onChange={(e) => setFormData({...formData, custom_gym: e.target.value})}
                placeholder="Например: Частная студия на Достык или Свой зал"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            {/* Форматы работы */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Формат ведения клиентов:</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'offline', label: 'Персонально' },
                  { id: 'online', label: 'Онлайн' },
                  { id: 'group', label: 'Мини-группы' }
                ].map((fmt) => {
                  const isSelected = formData.formats.includes(fmt.id);
                  return (
                    <button
                      key={fmt.id}
                      type="button"
                      onClick={() => handleToggle('formats', fmt.id)}
                      className={`py-2 rounded-xl text-xs font-medium border transition-all ${
                        isSelected ? 'bg-blue-600 border-blue-600 text-white shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      {fmt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button 
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Назад</span>
              </button>
              <button 
                type="button"
                onClick={() => setStep(3)}
                className="w-2/3 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
              >
                <span>Далее: Продукты и верификация</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ШАГ 3: Продукты и верификация */}
        {step === 3 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-sm font-bold text-slate-800">3. Ваши продукты и верификация</h2>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Ваши продукты / челленджи / программы</label>
              <textarea 
                rows="2"
                value={formData.products}
                onChange={(e) => setFormData({...formData, products: e.target.value})}
                placeholder="Например: Онлайн ведение, авторский 30-дневный челлендж сушки, гайд по питанию..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              />
              <p className="text-[10px] text-slate-500 mt-1">Мы сможем платно продвигать ваши программы внутри приложения GymConnect.</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Ссылка на диплом / сертификат</label>
              <input 
                type="text"
                value={formData.certificate_url}
                onChange={(e) => setFormData({...formData, certificate_url: e.target.value})}
                placeholder="https://... (сертификат Invictus Academy или академии)"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-mono"
              />
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
              <label className="flex items-start gap-3 cursor-pointer">
                <input 
                  type="checkbox"
                  required
                  checked={formData.agree_verification}
                  onChange={(e) => setFormData({...formData, agree_verification: e.target.checked})}
                  className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-0"
                />
                <span className="text-[11px] text-slate-700 leading-relaxed">
                  Согласен на запрос администрации GymConnect в указанные клубы для верификации моей квалификации.
                </span>
              </label>
            </div>

            <div className="flex gap-2 pt-2">
              <button 
                type="button"
                onClick={() => setStep(2)}
                className="w-1/3 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Назад</span>
              </button>
              <button 
                type="submit"
                disabled={loading}
                className="w-2/3 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-emerald-600/20"
              >
                {loading ? 'Создание профиля...' : 'Завершить и открыть CRM'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
