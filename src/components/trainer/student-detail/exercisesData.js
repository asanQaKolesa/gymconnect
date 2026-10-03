// src/components/trainer/student-detail/exercisesData.js

export const MUSCLE_GROUPS = [
  'Все группы',
  'Грудь',
  'Спина',
  'Квадрицепс',
  'Ягодицы и бицепс бедра',
  'Плечи (Дельты)',
  'Бицепс',
  'Трицепс',
  'Пресс и кор',
  'Кардио и функционал'
];

export const EXERCISES_DATABASE = [
  // ================= 1. ГРУДЬ =================
  { id: 'ch_1', nameRu: 'Жим штанги лежа', muscleGroup: 'chest', equipment: 'Штанга', type: 'compound' },
  { id: 'ch_2', nameRu: 'Жим гантелей лежа', muscleGroup: 'chest', equipment: 'Гантели', type: 'compound' },
  { id: 'ch_3', nameRu: 'Жим штанги на наклонной скамье', muscleGroup: 'chest', equipment: 'Штанга', type: 'compound' },
  { id: 'ch_4', nameRu: 'Жим гантелей на наклонной скамье', muscleGroup: 'chest', equipment: 'Гантели', type: 'compound' },
  { id: 'ch_5', nameRu: 'Сведение рук в кроссовере', muscleGroup: 'chest', equipment: 'Блок/Кроссовер', type: 'isolation' },
  { id: 'ch_6', nameRu: 'Сведение рук в тренажере "Бабочка"', muscleGroup: 'chest', equipment: 'Тренажер', type: 'isolation' },
  { id: 'ch_7', nameRu: 'Разведение гантелей лежа', muscleGroup: 'chest', equipment: 'Гантели', type: 'isolation' },
  { id: 'ch_8', nameRu: 'Отжимания на брусьях', muscleGroup: 'chest', equipment: 'Собственный вес', type: 'compound' },
  { id: 'ch_9', nameRu: 'Отжимания от пола', muscleGroup: 'chest', equipment: 'Собственный вес', type: 'compound' },
  { id: 'ch_10', nameRu: 'Пуловер с гантелью', muscleGroup: 'chest', equipment: 'Гантели', type: 'isolation' },
  { id: 'ch_11', nameRu: 'Жим в тренажере Хаммер', muscleGroup: 'chest', equipment: 'Тренажер', type: 'compound' },
  { id: 'ch_12', nameRu: 'Жим штанги в тренажере Смита', muscleGroup: 'chest', equipment: 'Тренажер', type: 'compound' },

  // ================= 2. СПИНА =================
  { id: 'bk_1', nameRu: 'Подтягивания', muscleGroup: 'back', equipment: 'Собственный вес', type: 'compound' },
  { id: 'bk_2', nameRu: 'Тяга штанги в наклоне', muscleGroup: 'back', equipment: 'Штанга', type: 'compound' },
  { id: 'bk_3', nameRu: 'Тяга верхнего блока', muscleGroup: 'back', equipment: 'Блок/Кроссовер', type: 'compound' },
  { id: 'bk_4', nameRu: 'Тяга горизонтального блока', muscleGroup: 'back', equipment: 'Блок/Кроссовер', type: 'compound' },
  { id: 'bk_5', nameRu: 'Тяга гантели в наклоне', muscleGroup: 'back', equipment: 'Гантели', type: 'compound' },
  { id: 'bk_6', nameRu: 'Тяга Т-грифа', muscleGroup: 'back', equipment: 'Тренажер', type: 'compound' },
  { id: 'bk_7', nameRu: 'Становая тяга', muscleGroup: 'back', equipment: 'Штанга', type: 'compound' },
  { id: 'bk_8', nameRu: 'Гиперэкстензия', muscleGroup: 'back', equipment: 'Собственный вес', type: 'isolation' },
  { id: 'bk_9', nameRu: 'Пуловер на прямых руках', muscleGroup: 'back', equipment: 'Блок/Кроссовер', type: 'isolation' },
  { id: 'bk_10', nameRu: 'Шраги со штангой', muscleGroup: 'back', equipment: 'Штанга', type: 'isolation' },
  { id: 'bk_11', nameRu: 'Подтягивания в гравитроне', muscleGroup: 'back', equipment: 'Тренажер', type: 'compound' },
  { id: 'bk_12', nameRu: 'Тяга верхнего блока за голову', muscleGroup: 'back', equipment: 'Блок/Кроссовер', type: 'compound' },

  // ================= 3. НОГИ =================
  { id: 'lg_1', nameRu: 'Приседания со штангой', muscleGroup: 'legs', equipment: 'Штанга', type: 'compound' },
  { id: 'lg_2', nameRu: 'Жим ногами', muscleGroup: 'legs', equipment: 'Тренажер', type: 'compound' },
  { id: 'lg_3', nameRu: 'Выпады с гантелями', muscleGroup: 'legs', equipment: 'Гантели', type: 'compound' },
  { id: 'lg_4', nameRu: 'Румынская тяга', muscleGroup: 'legs', equipment: 'Штанга', type: 'compound' },
  { id: 'lg_5', nameRu: 'Сгибания ног в тренажере', muscleGroup: 'legs', equipment: 'Тренажер', type: 'isolation' },
  { id: 'lg_6', nameRu: 'Разгибания ног в тренажере', muscleGroup: 'legs', equipment: 'Тренажер', type: 'isolation' },
  { id: 'lg_7', nameRu: 'Ягодичный мостик', muscleGroup: 'legs', equipment: 'Штанга', type: 'isolation' },
  { id: 'lg_8', nameRu: 'Болгарские сплит-приседания', muscleGroup: 'legs', equipment: 'Гантели', type: 'compound' },
  { id: 'lg_9', nameRu: 'Сведение ног в тренажере', muscleGroup: 'legs', equipment: 'Тренажер', type: 'isolation' },
  { id: 'lg_10', nameRu: 'Разведение ног в тренажере', muscleGroup: 'legs', equipment: 'Тренажер', type: 'isolation' },
  { id: 'lg_11', nameRu: 'Фронтальные приседания', muscleGroup: 'legs', equipment: 'Штанга', type: 'compound' },
  { id: 'lg_12', nameRu: 'Приседания в тренажере Смита', muscleGroup: 'legs', equipment: 'Тренажер', type: 'compound' },

  // ================= 4. ДЕЛЬТЫ =================
  { id: 'sh_1', nameRu: 'Армейский жим', muscleGroup: 'shoulders', equipment: 'Штанга', type: 'compound' },
  { id: 'sh_2', nameRu: 'Жим гантелей сидя', muscleGroup: 'shoulders', equipment: 'Гантели', type: 'compound' },
  { id: 'sh_3', nameRu: 'Махи гантелями в стороны', muscleGroup: 'shoulders', equipment: 'Гантели', type: 'isolation' },
  { id: 'sh_4', nameRu: 'Махи гантелями перед собой', muscleGroup: 'shoulders', equipment: 'Гантели', type: 'isolation' },
  { id: 'sh_5', nameRu: 'Махи гантелями в наклоне', muscleGroup: 'shoulders', equipment: 'Гантели', type: 'isolation' },
  { id: 'sh_6', nameRu: 'Протяжка со штангой к подбородку', muscleGroup: 'shoulders', equipment: 'Штанга', type: 'compound' },
  { id: 'sh_7', nameRu: 'Тяга на заднюю дельту в кроссовере', muscleGroup: 'shoulders', equipment: 'Блок/Кроссовер', type: 'isolation' },
  { id: 'sh_8', nameRu: 'Жим в тренажере Смита', muscleGroup: 'shoulders', equipment: 'Тренажер', type: 'compound' },
  { id: 'sh_9', nameRu: 'Разведения в тренажере "Обратная бабочка"', muscleGroup: 'shoulders', equipment: 'Тренажер', type: 'isolation' },
  { id: 'sh_10', nameRu: 'Махи в кроссовере одной рукой', muscleGroup: 'shoulders', equipment: 'Блок/Кроссовер', type: 'isolation' },

  // ================= 5. БИЦЕПС =================
  { id: 'bi_1', nameRu: 'Подъем штанги на бицепс', muscleGroup: 'biceps', equipment: 'Штанга', type: 'isolation' },
  { id: 'bi_2', nameRu: 'Подъем гантелей на бицепс', muscleGroup: 'biceps', equipment: 'Гантели', type: 'isolation' },
  { id: 'bi_3', nameRu: 'Молотковые сгибания', muscleGroup: 'biceps', equipment: 'Гантели', type: 'isolation' },
  { id: 'bi_4', nameRu: 'Подъем штанги на скамье Скотта', muscleGroup: 'biceps', equipment: 'Штанга', type: 'isolation' },
  { id: 'bi_5', nameRu: 'Концентрированные сгибания', muscleGroup: 'biceps', equipment: 'Гантели', type: 'isolation' },
  { id: 'bi_6', nameRu: 'Сгибания рук на нижнем блоке', muscleGroup: 'biceps', equipment: 'Блок/Кроссовер', type: 'isolation' },
  { id: 'bi_7', nameRu: 'Сгибания рук с EZ-штангой', muscleGroup: 'biceps', equipment: 'Штанга', type: 'isolation' },
  { id: 'bi_8', nameRu: 'Сгибания рук на верхних блоках', muscleGroup: 'biceps', equipment: 'Блок/Кроссовер', type: 'isolation' },
  { id: 'bi_9', nameRu: 'Паучьи сгибания с гантелями', muscleGroup: 'biceps', equipment: 'Гантели', type: 'isolation' },

  // ================= 6. ТРИЦЕПС =================
  { id: 'tr_1', nameRu: 'Французский жим', muscleGroup: 'triceps', equipment: 'Штанга', type: 'isolation' },
  { id: 'tr_2', nameRu: 'Разгибания на блоке', muscleGroup: 'triceps', equipment: 'Блок/Кроссовер', type: 'isolation' },
  { id: 'tr_3', nameRu: 'Отжимания узким хватом', muscleGroup: 'triceps', equipment: 'Собственный вес', type: 'compound' },
  { id: 'tr_4', nameRu: 'Обратные отжимания от скамьи', muscleGroup: 'triceps', equipment: 'Собственный вес', type: 'compound' },
  { id: 'tr_5', nameRu: 'Жим штанги узким хватом', muscleGroup: 'triceps', equipment: 'Штанга', type: 'compound' },
  { id: 'tr_6', nameRu: 'Разгибание гантели из-за головы', muscleGroup: 'triceps', equipment: 'Гантели', type: 'isolation' },
  { id: 'tr_7', nameRu: 'Разгибание руки назад с гантелью', muscleGroup: 'triceps', equipment: 'Гантели', type: 'isolation' },
  { id: 'tr_8', nameRu: 'Французский жим с гантелями', muscleGroup: 'triceps', equipment: 'Гантели', type: 'isolation' },
  { id: 'tr_9', nameRu: 'Разгибания на блоке с канатом', muscleGroup: 'triceps', equipment: 'Блок/Кроссовер', type: 'isolation' },
  { id: 'tr_10', nameRu: 'Отжимания на брусьях (трицепс)', muscleGroup: 'triceps', equipment: 'Собственный вес', type: 'compound' },

  // ================= 7. ПРЕСС И КОР =================
  { id: 'ab_1', nameRu: 'Скручивания', muscleGroup: 'abs', equipment: 'Собственный вес', type: 'isolation' },
  { id: 'ab_2', nameRu: 'Планка', muscleGroup: 'abs', equipment: 'Собственный вес', type: 'compound' },
  { id: 'ab_3', nameRu: 'Подъем ног в висе', muscleGroup: 'abs', equipment: 'Собственный вес', type: 'isolation' },
  { id: 'ab_4', nameRu: 'Русские скручивания', muscleGroup: 'abs', equipment: 'Гантели', type: 'isolation' },
  { id: 'ab_5', nameRu: 'Ролик для пресса', muscleGroup: 'abs', equipment: 'Собственный вес', type: 'compound' },
  { id: 'ab_6', nameRu: 'Скручивания на блоке "Молитва"', muscleGroup: 'abs', equipment: 'Блок/Кроссовер', type: 'isolation' },
  { id: 'ab_7', nameRu: 'Боковая планка', muscleGroup: 'abs', equipment: 'Собственный вес', type: 'isolation' },
  { id: 'ab_8', nameRu: 'Велосипед', muscleGroup: 'abs', equipment: 'Собственный вес', type: 'isolation' },
  { id: 'ab_9', nameRu: 'Вакуум', muscleGroup: 'abs', equipment: 'Собственный вес', type: 'isolation' },
  { id: 'ab_10', nameRu: 'Подъем коленей в упоре', muscleGroup: 'abs', equipment: 'Собственный вес', type: 'isolation' },

  // ================= 8. КАРДИО =================
  { id: 'cd_1', nameRu: 'Беговая дорожка', muscleGroup: 'cardio', equipment: 'Тренажер', type: 'compound' },
  { id: 'cd_2', nameRu: 'Эллиптический тренажер', muscleGroup: 'cardio', equipment: 'Тренажер', type: 'compound' },
  { id: 'cd_3', nameRu: 'Гребной тренажер', muscleGroup: 'cardio', equipment: 'Тренажер', type: 'compound' },
  { id: 'cd_4', nameRu: 'Велотренажер', muscleGroup: 'cardio', equipment: 'Тренажер', type: 'compound' },
  { id: 'cd_5', nameRu: 'Степпер', muscleGroup: 'cardio', equipment: 'Тренажер', type: 'compound' },
  { id: 'cd_6', nameRu: 'Прыжки на скакалке', muscleGroup: 'cardio', equipment: 'Собственный вес', type: 'compound' },
  { id: 'cd_7', nameRu: 'Бёрпи', muscleGroup: 'cardio', equipment: 'Собственный вес', type: 'compound' },
  { id: 'cd_8', nameRu: 'Аэрбайк', muscleGroup: 'cardio', equipment: 'Тренажер', type: 'compound' },
  { id: 'cd_9', nameRu: 'Ходьба в гору на дорожке', muscleGroup: 'cardio', equipment: 'Тренажер', type: 'compound' }
];

// ================= ПОПУЛЯРНЫЕ ГОТОВЫЕ СХЕМЫ СПЛИТОВ =================
export const SPLIT_ARCHITECTURES = [
  {
    id: 'full_body_3',
    name: 'Full Body (3 дня: День А / Б / В)',
    desc: 'Проработка всех мышечных групп за тренировку под разными углами',
    daysCount: 3,
    days: {
      1: {
        title: 'День 1: Full Body (Сила А)',
        exercises: [
          { name: 'Приседания со штангой на плечах (классические)', muscleGroup: 'Квадрицепс', isBodyweight: false, sets: 4, reps: 8, weight: 70, notes: 'Контроль коленей' },
          { name: 'Жим штанги лежа на горизонтальной скамье', muscleGroup: 'Грудь', isBodyweight: false, sets: 4, reps: 8, weight: 60, notes: 'Пауза внизу 1 сек' },
          { name: 'Тяга верхнего блока к груди широким хватом', muscleGroup: 'Спина', isBodyweight: false, sets: 4, reps: 10, weight: 55, notes: 'Сведение лопаток' },
          { name: 'Жим гантелей сидя на скамье с упором спины', muscleGroup: 'Плечи (Дельты)', isBodyweight: false, sets: 3, reps: 10, weight: 18, notes: 'Без прогиба' },
          { name: 'Классическая планка на предплечьях на время', muscleGroup: 'Пресс и кор', isBodyweight: true, sets: 3, reps: 45, weight: 0, notes: 'Свой вес' }
        ]
      },
      2: {
        title: 'День 2: Full Body (Гипертрофия Б)',
        exercises: [
          { name: 'Румынская становая тяга со штангой', muscleGroup: 'Ягодицы и бицепс бедра', isBodyweight: false, sets: 4, reps: 10, weight: 60, notes: 'Растяжка бедра' },
          { name: 'Жим гантелей на наклонной скамье (30-45°)', muscleGroup: 'Грудь', isBodyweight: false, sets: 4, reps: 10, weight: 22, notes: 'Верхняя часть груди' },
          { name: 'Тяга штанги в наклоне прямым хватом', muscleGroup: 'Спина', isBodyweight: false, sets: 4, reps: 10, weight: 55, notes: 'Тяга к поясу' },
          { name: 'Махи гантелями через стороны стоя (средняя дельта)', muscleGroup: 'Плечи (Дельты)', isBodyweight: false, sets: 3, reps: 12, weight: 10, notes: 'Четкий контроль' },
          { name: 'Подъем прямых ног в висе на перекладине', muscleGroup: 'Пресс и кор', isBodyweight: true, sets: 3, reps: 12, weight: 0, notes: 'Свой вес' }
        ]
      },
      3: {
        title: 'День 3: Full Body (Объем В)',
        exercises: [
          { name: 'Жим ногами в наклонной платформе (45°)', muscleGroup: 'Квадрицепс', isBodyweight: false, sets: 4, reps: 12, weight: 140, notes: 'Глубокий жим' },
          { name: 'Подтягивания на перекладине широким хватом к груди', muscleGroup: 'Спина', isBodyweight: true, sets: 3, reps: 8, weight: 0, notes: 'Свой вес' },
          { name: 'Отжимания на брусьях с акцентом на грудь', muscleGroup: 'Грудь', isBodyweight: true, sets: 3, reps: 10, weight: 0, notes: 'Свой вес' },
          { name: 'Подъем штанги на бицепс стоя (прямой / EZ-гриф)', muscleGroup: 'Бицепс', isBodyweight: false, sets: 3, reps: 10, weight: 25, notes: 'Без раскачки' },
          { name: 'Разгибания на трицепс на блоке с канатной рукоятью', muscleGroup: 'Трицепс', isBodyweight: false, sets: 3, reps: 12, weight: 25, notes: 'Разведение внизу' }
        ]
      }
    }
  },
  {
    id: 'ppl_3',
    name: 'Push / Pull / Legs — PPL (3 дня)',
    desc: 'Толкай (Грудь/Плечи/Трицепс), Тяни (Спина/Бицепс), Ноги',
    daysCount: 3,
    days: {
      1: {
        title: 'День 1: Push (Толкай — Грудь + Дельты + Трицепс)',
        exercises: [
          { name: 'Жим штанги лежа на горизонтальной скамье', muscleGroup: 'Грудь', isBodyweight: false, sets: 4, reps: 8, weight: 70, notes: 'Базовый жим' },
          { name: 'Жим гантелей на наклонной скамье (30-45°)', muscleGroup: 'Грудь', isBodyweight: false, sets: 4, reps: 10, weight: 24, notes: 'Верх груди' },
          { name: 'Армейский жим штанги стоя над головой (базовый)', muscleGroup: 'Плечи (Дельты)', isBodyweight: false, sets: 4, reps: 8, weight: 40, notes: 'Плечи' },
          { name: 'Махи гантелями через стороны стоя (средняя дельта)', muscleGroup: 'Плечи (Дельты)', isBodyweight: false, sets: 3, reps: 12, weight: 12, notes: 'Локти вверх' },
          { name: 'Французский жим с EZ-штангой лежа на горизонтальной скамье', muscleGroup: 'Трицепс', isBodyweight: false, sets: 3, reps: 10, weight: 28, notes: 'Трицепс' }
        ]
      },
      2: {
        title: 'День 2: Pull (Тяни — Спина + Задняя дельта + Бицепс)',
        exercises: [
          { name: 'Подтягивания на перекладине широким хватом к груди', muscleGroup: 'Спина', isBodyweight: true, sets: 4, reps: 8, weight: 0, notes: 'Свой вес' },
          { name: 'Тяга штанги в наклоне прямым хватом', muscleGroup: 'Спина', isBodyweight: false, sets: 4, reps: 8, weight: 65, notes: 'Тяга к поясу' },
          { name: 'Тяга горизонтального блока к поясу сидя', muscleGroup: 'Спина', isBodyweight: false, sets: 3, reps: 12, weight: 55, notes: 'Сведение лопаток' },
          { name: 'Face Pull (тяга каната к лицу на верхнем блоке)', muscleGroup: 'Плечи (Дельты)', isBodyweight: false, sets: 4, reps: 12, weight: 25, notes: 'Задняя дельта' },
          { name: 'Подъем штанги на бицепс стоя (прямой / EZ-гриф)', muscleGroup: 'Бицепс', isBodyweight: false, sets: 3, reps: 10, weight: 30, notes: 'Бицепс' }
        ]
      },
      3: {
        title: 'День 3: Legs (Ноги — Квадрицепс + Бицепс бедра + Кор)',
        exercises: [
          { name: 'Приседания со штангой на плечах (классические)', muscleGroup: 'Квадрицепс', isBodyweight: false, sets: 4, reps: 8, weight: 80, notes: 'Тяжелый присед' },
          { name: 'Жим ногами в наклонной платформе (45°)', muscleGroup: 'Квадрицепс', isBodyweight: false, sets: 4, reps: 12, weight: 150, notes: 'Глубокий жим' },
          { name: 'Румынская становая тяга со штангой', muscleGroup: 'Ягодицы и бицепс бедра', isBodyweight: false, sets: 4, reps: 10, weight: 70, notes: 'Растяжение бедра' },
          { name: 'Сгибания ног в тренажере лежа на животе', muscleGroup: 'Ягодицы и бицепс бедра', isBodyweight: false, sets: 3, reps: 12, weight: 40, notes: 'Пиковое сжатие' },
          { name: 'Подъем прямых ног в висе на перекладине', muscleGroup: 'Пресс и кор', isBodyweight: true, sets: 3, reps: 12, weight: 0, notes: 'Свой вес' }
        ]
      }
    }
  },
  {
    id: 'upper_lower_4',
    name: 'Upper / Lower — Верх / Низ (4 дня)',
    desc: '2 дня верха и 2 дня низа (чередование силы и объема)',
    daysCount: 4,
    days: {
      1: { title: 'День 1: Верх тела (Силовой А)', exercises: [] },
      2: { title: 'День 2: Низ тела (Силовой А)', exercises: [] },
      3: { title: 'День 3: Верх тела (Гипертрофия Б)', exercises: [] },
      4: { title: 'День 4: Низ тела (Объем Б)', exercises: [] }
    }
  },
  {
    id: 'glute_and_tone_3',
    name: 'Женский сплит (Ягодицы + Осанка + Тонус)',
    desc: 'Акцент на форму ягодиц, подтянутую спину, талию и руки',
    daysCount: 3,
    days: {
      1: {
        title: 'День 1: Ягодицы и бицепс бедра',
        exercises: [
          { name: 'Ягодичный мост со штангой на скамье (Hip Thrust)', muscleGroup: 'Ягодицы и бицепс бедра', isBodyweight: false, sets: 4, reps: 12, weight: 50, notes: 'Пауза вверху 1 сек' },
          { name: 'Румынская тяга с гантелями стоя', muscleGroup: 'Ягодицы и бицепс бедра', isBodyweight: false, sets: 4, reps: 12, weight: 14, notes: 'Прямая спина' },
          { name: 'Болгарские сплит-приседания с гантелями', muscleGroup: 'Ягодицы и бицепс бедра', isBodyweight: false, sets: 3, reps: 10, weight: 8, notes: 'Упор на пятку' },
          { name: 'Разведение ног в тренажере сидя с наклоном корпуса', muscleGroup: 'Ягодицы и бицепс бедра', isBodyweight: false, sets: 3, reps: 15, weight: 45, notes: 'Дропсет в конце' }
        ]
      },
      2: {
        title: 'День 2: Спина, осанка и плечи',
        exercises: [
          { name: 'Тяга верхнего блока к груди широким хватом', muscleGroup: 'Спина', isBodyweight: false, sets: 4, reps: 12, weight: 35, notes: 'Спиной тянем' },
          { name: 'Тяга горизонтального блока к поясу сидя', muscleGroup: 'Спина', isBodyweight: false, sets: 3, reps: 12, weight: 30, notes: 'Сведение лопаток' },
          { name: 'Махи гантелями через стороны стоя (средняя дельта)', muscleGroup: 'Плечи (Дельты)', isBodyweight: false, sets: 3, reps: 12, weight: 6, notes: 'Без рывков' },
          { name: 'Разгибания на трицепс на блоке с канатной рукоятью', muscleGroup: 'Трицепс', isBodyweight: false, sets: 3, reps: 12, weight: 15, notes: 'Форма рук' },
          { name: 'Классическая планка на предплечьях на время', muscleGroup: 'Пресс и кор', isBodyweight: true, sets: 3, reps: 40, weight: 0, notes: 'Свой вес' }
        ]
      },
      3: {
        title: 'День 3: Ягодицы + Квадрицепс + Кор',
        exercises: [
          { name: 'Кубковые приседания с гантелью / гирей (Goblet)', muscleGroup: 'Квадрицепс', isBodyweight: false, sets: 4, reps: 12, weight: 16, notes: 'Глубокий присед' },
          { name: 'Жим ногами в наклонной платформе (45°)', muscleGroup: 'Квадрицепс', isBodyweight: false, sets: 4, reps: 12, weight: 80, notes: 'Широкая постановка' },
          { name: 'Отведение ноги назад в кроссовере с манжетой', muscleGroup: 'Ягодицы и бицепс бедра', isBodyweight: false, sets: 3, reps: 15, weight: 10, notes: 'Ягодицы' },
          { name: 'Скручивания на полу с согнутыми коленями', muscleGroup: 'Пресс и кор', isBodyweight: true, sets: 3, reps: 20, weight: 0, notes: 'Свой вес' }
        ]
      }
    }
  }
];

export const POPULAR_DAY_TITLES = [
  'Full Body (Силовой)',
  'Full Body (Объемный)',
  'Грудь + Трицепс',
  'Спина + Бицепс',
  'Ноги + Икры + Пресс',
  'Ягодицы + Бицепс бедра',
  'Плечи + Трапеции + Кор',
  'Push (Грудь + Дельты + Трицепс)',
  'Pull (Спина + Задняя дельта + Бицепс)',
  'Верх тела (Upper Body)',
  'Низ тела (Lower Body)',
  'Кардио + Функциональный WOD'
];
