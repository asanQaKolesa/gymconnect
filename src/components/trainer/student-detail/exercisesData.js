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
  // ================= 1. ГРУДНЫЕ МЫШЦЫ =================
  { id: 'ch_1', name: 'Жим штанги лежа на горизонтальной скамье', muscle: 'Грудь', isBodyweight: false, defaultSets: 4, defaultReps: 8, defaultWeight: 60, equipment: 'Штанга' },
  { id: 'ch_2', name: 'Жим гантелей на наклонной скамье (30-45°)', muscle: 'Грудь', isBodyweight: false, defaultSets: 4, defaultReps: 10, defaultWeight: 22, equipment: 'Гантели' },
  { id: 'ch_3', name: 'Жим штанги на наклонной скамье', muscle: 'Грудь', isBodyweight: false, defaultSets: 4, defaultReps: 8, defaultWeight: 50, equipment: 'Штанга' },
  { id: 'ch_4', name: 'Жим гантелей на горизонтальной скамье', muscle: 'Грудь', isBodyweight: false, defaultSets: 4, defaultReps: 10, defaultWeight: 24, equipment: 'Гантели' },
  { id: 'ch_5', name: 'Жим в тренажере Хаммер (Hammer Strength)', muscle: 'Грудь', isBodyweight: false, defaultSets: 3, defaultReps: 12, defaultWeight: 40, equipment: 'Тренажер' },
  { id: 'ch_6', name: 'Сведение рук в кроссовере на верхнем блоке', muscle: 'Грудь', isBodyweight: false, defaultSets: 3, defaultReps: 12, defaultWeight: 15, equipment: 'Блок' },
  { id: 'ch_7', name: 'Сведение рук в кроссовере на нижнем блоке', muscle: 'Грудь', isBodyweight: false, defaultSets: 3, defaultReps: 12, defaultWeight: 10, equipment: 'Блок' },
  { id: 'ch_8', name: 'Сведение рук в тренажере «Бабочка» (Pec-Deck)', muscle: 'Грудь', isBodyweight: false, defaultSets: 3, defaultReps: 12, defaultWeight: 45, equipment: 'Тренажер' },
  { id: 'ch_9', name: 'Отжимания на брусьях (акцент на грудь)', muscle: 'Грудь', isBodyweight: true, defaultSets: 3, defaultReps: 10, defaultWeight: 0, equipment: 'Брусья' },
  { id: 'ch_10', name: 'Отжимания от пола широким хватом', muscle: 'Грудь', isBodyweight: true, defaultSets: 3, defaultReps: 15, defaultWeight: 0, equipment: 'Свой вес' },
  { id: 'ch_11', name: 'Пуловер с гантелью поперек скамьи', muscle: 'Грудь', isBodyweight: false, defaultSets: 3, defaultReps: 12, defaultWeight: 20, equipment: 'Гантели' },
  { id: 'ch_12', name: 'Жим штанги в тренажере Смита под углом', muscle: 'Грудь', isBodyweight: false, defaultSets: 4, defaultReps: 10, defaultWeight: 45, equipment: 'Тренажер' },

  // ================= 2. СПИНА =================
  { id: 'bk_1', name: 'Подтягивания на перекладине широким хватом', muscle: 'Спина', isBodyweight: true, defaultSets: 4, defaultReps: 8, defaultWeight: 0, equipment: 'Турник' },
  { id: 'bk_2', name: 'Подтягивания параллельным узким хватом', muscle: 'Спина', isBodyweight: true, defaultSets: 3, defaultReps: 8, defaultWeight: 0, equipment: 'Турник' },
  { id: 'bk_3', name: 'Подтягивания в гравитроне с компенсацией', muscle: 'Спина', isBodyweight: false, defaultSets: 3, defaultReps: 10, defaultWeight: 30, equipment: 'Тренажер' },
  { id: 'bk_4', name: 'Тяга верхнего блока к груди широким хватом', muscle: 'Спина', isBodyweight: false, defaultSets: 4, defaultReps: 10, defaultWeight: 55, equipment: 'Блок' },
  { id: 'bk_5', name: 'Тяга верхнего блока узким нейтральным хватом', muscle: 'Спина', isBodyweight: false, defaultSets: 4, defaultReps: 10, defaultWeight: 50, equipment: 'Блок' },
  { id: 'bk_6', name: 'Тяга горизонтального блока к поясу (сидя)', muscle: 'Спина', isBodyweight: false, defaultSets: 4, defaultReps: 12, defaultWeight: 50, equipment: 'Блок' },
  { id: 'bk_7', name: 'Тяга штанги в наклоне прямым хватом', muscle: 'Спина', isBodyweight: false, defaultSets: 4, defaultReps: 8, defaultWeight: 60, equipment: 'Штанга' },
  { id: 'bk_8', name: 'Тяга штанги в наклоне обратным хватом', muscle: 'Спина', isBodyweight: false, defaultSets: 4, defaultReps: 10, defaultWeight: 55, equipment: 'Штанга' },
  { id: 'bk_9', name: 'Тяга Т-грифа с упором грудью в тренажере', muscle: 'Спина', isBodyweight: false, defaultSets: 4, defaultReps: 10, defaultWeight: 45, equipment: 'Тренажер' },
  { id: 'bk_10', name: 'Тяга гантели одной рукой в упоре на скамью', muscle: 'Спина', isBodyweight: false, defaultSets: 3, defaultReps: 10, defaultWeight: 26, equipment: 'Гантели' },
  { id: 'bk_11', name: 'Классическая становая тяга со штангой', muscle: 'Спина', isBodyweight: false, defaultSets: 4, defaultReps: 6, defaultWeight: 90, equipment: 'Штанга' },
  { id: 'bk_12', name: 'Тяга штанги сумо', muscle: 'Спина', isBodyweight: false, defaultSets: 4, defaultReps: 6, defaultWeight: 95, equipment: 'Штанга' },
  { id: 'bk_13', name: 'Гиперэкстензия на наклонной скамье', muscle: 'Спина', isBodyweight: true, defaultSets: 3, defaultReps: 15, defaultWeight: 0, equipment: 'Свой вес' },
  { id: 'bk_14', name: 'Пуловер на верхнем блоке стоя (прямые руки)', muscle: 'Спина', isBodyweight: false, defaultSets: 3, defaultReps: 12, defaultWeight: 25, equipment: 'Блок' },
  { id: 'bk_15', name: 'Шраги со штангой стоя (трапеция)', muscle: 'Спина', isBodyweight: false, defaultSets: 3, defaultReps: 12, defaultWeight: 70, equipment: 'Штанга' },
  { id: 'bk_16', name: 'Шраги с гантелями стоя', muscle: 'Спина', isBodyweight: false, defaultSets: 3, defaultReps: 12, defaultWeight: 28, equipment: 'Гантели' },

  // ================= 3. НОГИ / КВАДРИЦЕПС =================
  { id: 'lg_1', name: 'Приседания со штангой на плечах (классика)', muscle: 'Квадрицепс', isBodyweight: false, defaultSets: 4, defaultReps: 8, defaultWeight: 70, equipment: 'Штанга' },
  { id: 'lg_2', name: 'Фронтальные приседания со штангой на груди', muscle: 'Квадрицепс', isBodyweight: false, defaultSets: 4, defaultReps: 8, defaultWeight: 50, equipment: 'Штанга' },
  { id: 'lg_3', name: 'Приседания в тренажере Смита', muscle: 'Квадрицепс', isBodyweight: false, defaultSets: 4, defaultReps: 10, defaultWeight: 60, equipment: 'Тренажер' },
  { id: 'lg_4', name: 'Жим ногами в платформе 45°', muscle: 'Квадрицепс', isBodyweight: false, defaultSets: 4, defaultReps: 12, defaultWeight: 140, equipment: 'Тренажер' },
  { id: 'lg_5', name: 'Гакк-приседания в тренажере', muscle: 'Квадрицепс', isBodyweight: false, defaultSets: 3, defaultReps: 10, defaultWeight: 60, equipment: 'Тренажер' },
  { id: 'lg_6', name: 'Разгибания голени в тренажере сидя', muscle: 'Квадрицепс', isBodyweight: false, defaultSets: 3, defaultReps: 12, defaultWeight: 45, equipment: 'Тренажер' },
  { id: 'lg_7', name: 'Кубковые приседания с гантелью (Goblet Squat)', muscle: 'Квадрицепс', isBodyweight: false, defaultSets: 3, defaultReps: 12, defaultWeight: 20, equipment: 'Гантели' },
  { id: 'lg_8', name: 'Выпады в шаге с гантелями в руках', muscle: 'Квадрицепс', isBodyweight: false, defaultSets: 3, defaultReps: 12, defaultWeight: 12, equipment: 'Гантели' },
  { id: 'lg_9', name: 'Зашагивания на тумбу с гантелями', muscle: 'Квадрицепс', isBodyweight: false, defaultSets: 3, defaultReps: 12, defaultWeight: 10, equipment: 'Гантели' },
  { id: 'lg_10', name: 'Воздушные приседания (свой вес)', muscle: 'Квадрицепс', isBodyweight: true, defaultSets: 3, defaultReps: 20, defaultWeight: 0, equipment: 'Свой вес' },

  // ================= 4. ЯГОДИЦЫ И БИЦЕПС БЕДРА =================
  { id: 'gl_1', name: 'Ягодичный мост со штангой на скамье (Hip Thrust)', muscle: 'Ягодицы и бицепс бедра', isBodyweight: false, defaultSets: 4, defaultReps: 10, defaultWeight: 70, equipment: 'Штанга' },
  { id: 'gl_2', name: 'Ягодичный мост в специализированном тренажере', muscle: 'Ягодицы и бицепс бедра', isBodyweight: false, defaultSets: 4, defaultReps: 12, defaultWeight: 60, equipment: 'Тренажер' },
  { id: 'gl_3', name: 'Болгарские сплит-приседания с гантелями', muscle: 'Ягодицы и бицепс бедра', isBodyweight: false, defaultSets: 3, defaultReps: 10, defaultWeight: 12, equipment: 'Гантели' },
  { id: 'gl_4', name: 'Румынская становая тяга со штангой', muscle: 'Ягодицы и бицепс бедра', isBodyweight: false, defaultSets: 4, defaultReps: 10, defaultWeight: 60, equipment: 'Штанга' },
  { id: 'gl_5', name: 'Румынская тяга с гантелями стоя', muscle: 'Ягодицы и бицепс бедра', isBodyweight: false, defaultSets: 4, defaultReps: 10, defaultWeight: 18, equipment: 'Гантели' },
  { id: 'gl_6', name: 'Сгибания ног в тренажере лежа', muscle: 'Ягодицы и бицепс бедра', isBodyweight: false, defaultSets: 4, defaultReps: 12, defaultWeight: 35, equipment: 'Тренажер' },
  { id: 'gl_7', name: 'Сгибания ног в тренажере сидя', muscle: 'Ягодицы и бицепс бедра', isBodyweight: false, defaultSets: 3, defaultReps: 12, defaultWeight: 40, equipment: 'Тренажер' },
  { id: 'gl_8', name: 'Отведение ноги назад в кроссовере с манжетой', muscle: 'Ягодицы и бицепс бедра', isBodyweight: false, defaultSets: 3, defaultReps: 15, defaultWeight: 12, equipment: 'Блок' },
  { id: 'gl_9', name: 'Разведение ног в тренажере сидя (ягодицы)', muscle: 'Ягодицы и бицепс бедра', isBodyweight: false, defaultSets: 3, defaultReps: 15, defaultWeight: 50, equipment: 'Тренажер' },
  { id: 'gl_10', name: 'Сведение ног в тренажере сидя (приводящие)', muscle: 'Ягодицы и бицепс бедра', isBodyweight: false, defaultSets: 3, defaultReps: 15, defaultWeight: 45, equipment: 'Тренажер' },
  { id: 'gl_11', name: 'Подъем на носки стоя в тренажере (икры)', muscle: 'Ягодицы и бицепс бедра', isBodyweight: false, defaultSets: 4, defaultReps: 15, defaultWeight: 60, equipment: 'Тренажер' },
  { id: 'gl_12', name: 'Подъем на носки сидя в тренажере', muscle: 'Ягодицы и бицепс бедра', isBodyweight: false, defaultSets: 4, defaultReps: 15, defaultWeight: 35, equipment: 'Тренажер' },

  // ================= 5. ПЛЕЧИ (ДЕЛЬТЫ) =================
  { id: 'sh_1', name: 'Армейский жим штанги стоя над головой', muscle: 'Плечи (Дельты)', isBodyweight: false, defaultSets: 4, defaultReps: 8, defaultWeight: 40, equipment: 'Штанга' },
  { id: 'sh_2', name: 'Жим гантелей сидя на скамье с упором спины', muscle: 'Плечи (Дельты)', isBodyweight: false, defaultSets: 4, defaultReps: 10, defaultWeight: 18, equipment: 'Гантели' },
  { id: 'sh_3', name: 'Жим Арнольда с гантелями сидя', muscle: 'Плечи (Дельты)', isBodyweight: false, defaultSets: 3, defaultReps: 10, defaultWeight: 16, equipment: 'Гантели' },
  { id: 'sh_4', name: 'Махи гантелями через стороны стоя (средняя дельта)', muscle: 'Плечи (Дельты)', isBodyweight: false, defaultSets: 4, defaultReps: 12, defaultWeight: 10, equipment: 'Гантели' },
  { id: 'sh_5', name: 'Махи в кроссовере с нижнего блока в стороны', muscle: 'Плечи (Дельты)', isBodyweight: false, defaultSets: 3, defaultReps: 12, defaultWeight: 7.5, equipment: 'Блок' },
  { id: 'sh_6', name: 'Подъем гантелей перед собой стоя (передняя дельта)', muscle: 'Плечи (Дельты)', isBodyweight: false, defaultSets: 3, defaultReps: 12, defaultWeight: 10, equipment: 'Гантели' },
  { id: 'sh_7', name: 'Тяга штанги к подбородку широким хватом', muscle: 'Плечи (Дельты)', isBodyweight: false, defaultSets: 3, defaultReps: 10, defaultWeight: 35, equipment: 'Штанга' },
  { id: 'sh_8', name: 'Махи гантелями в наклоне (задняя дельта)', muscle: 'Плечи (Дельты)', isBodyweight: false, defaultSets: 4, defaultReps: 12, defaultWeight: 10, equipment: 'Гантели' },
  { id: 'sh_9', name: 'Разведения рук в тренажере обратная бабочка', muscle: 'Плечи (Дельты)', isBodyweight: false, defaultSets: 4, defaultReps: 12, defaultWeight: 35, equipment: 'Тренажер' },
  { id: 'sh_10', name: 'Face Pull (тяга каната к лицу на верхнем блоке)', muscle: 'Плечи (Дельты)', isBodyweight: false, defaultSets: 3, defaultReps: 15, defaultWeight: 25, equipment: 'Блок' },
  { id: 'sh_11', name: 'Жим на плечи в блочном тренажере сидя', muscle: 'Плечи (Дельты)', isBodyweight: false, defaultSets: 3, defaultReps: 12, defaultWeight: 45, equipment: 'Тренажер' },

  // ================= 6. БИЦЕПС =================
  { id: 'bi_1', name: 'Подъем штанги на бицепс стоя (прямой/EZ-гриф)', muscle: 'Бицепс', isBodyweight: false, defaultSets: 3, defaultReps: 10, defaultWeight: 30, equipment: 'Штанга' },
  { id: 'bi_2', name: 'Подъем гантелей на бицепс стоя с супинацией', muscle: 'Бицепс', isBodyweight: false, defaultSets: 3, defaultReps: 10, defaultWeight: 14, equipment: 'Гантели' },
  { id: 'bi_3', name: 'Молотковые сгибания с гантелями (Hammer Curls)', muscle: 'Бицепс', isBodyweight: false, defaultSets: 3, defaultReps: 10, defaultWeight: 14, equipment: 'Гантели' },
  { id: 'bi_4', name: 'Сгибания рук на скамье Скотта с EZ-грифом', muscle: 'Бицепс', isBodyweight: false, defaultSets: 3, defaultReps: 10, defaultWeight: 25, equipment: 'Штанга' },
  { id: 'bi_5', name: 'Сгибания на бицепс сидя на наклонной скамье', muscle: 'Бицепс', isBodyweight: false, defaultSets: 3, defaultReps: 12, defaultWeight: 12, equipment: 'Гантели' },
  { id: 'bi_6', name: 'Концентрированные сгибания на бицепс сидя', muscle: 'Бицепс', isBodyweight: false, defaultSets: 3, defaultReps: 12, defaultWeight: 12, equipment: 'Гантели' },
  { id: 'bi_7', name: 'Сгибания рук на нижнем блоке кроссовера', muscle: 'Бицепс', isBodyweight: false, defaultSets: 3, defaultReps: 12, defaultWeight: 25, equipment: 'Блок' },
  { id: 'bi_8', name: 'Сгибания рук на верхних блоках (двойной бицепс)', muscle: 'Бицепс', isBodyweight: false, defaultSets: 3, defaultReps: 15, defaultWeight: 12, equipment: 'Блок' },

  // ================= 7. ТРИЦЕПС =================
  { id: 'tri_1', name: 'Французский жим с EZ-штангой лежа на скамье', muscle: 'Трицепс', isBodyweight: false, defaultSets: 3, defaultReps: 10, defaultWeight: 28, equipment: 'Штанга' },
  { id: 'tri_2', name: 'Разгибания на трицепс на блоке с канатной рукоятью', muscle: 'Трицепс', isBodyweight: false, defaultSets: 4, defaultReps: 12, defaultWeight: 25, equipment: 'Блок' },
  { id: 'tri_3', name: 'Разгибания на трицепс на блоке с прямой рукоятью', muscle: 'Трицепс', isBodyweight: false, defaultSets: 3, defaultReps: 12, defaultWeight: 30, equipment: 'Блок' },
  { id: 'tri_4', name: 'Отжимания на брусьях узким хватом (на трицепс)', muscle: 'Трицепс', isBodyweight: true, defaultSets: 3, defaultReps: 10, defaultWeight: 0, equipment: 'Брусья' },
  { id: 'tri_5', name: 'Разгибание гантели из-за головы двумя руками сидя', muscle: 'Трицепс', isBodyweight: false, defaultSets: 3, defaultReps: 12, defaultWeight: 20, equipment: 'Гантели' },
  { id: 'tri_6', name: 'Жим штанги узким хватом лежа', muscle: 'Трицепс', isBodyweight: false, defaultSets: 3, defaultReps: 8, defaultWeight: 55, equipment: 'Штанга' },
  { id: 'tri_7', name: 'Французский жим из-за головы на нижнем блоке', muscle: 'Трицепс', isBodyweight: false, defaultSets: 3, defaultReps: 12, defaultWeight: 20, equipment: 'Блок' },
  { id: 'tri_8', name: 'Обратные отжимания от скамьи сзади', muscle: 'Трицепс', isBodyweight: true, defaultSets: 3, defaultReps: 15, defaultWeight: 0, equipment: 'Свой вес' },

  // ================= 8. ПРЕСС И КОР =================
  { id: 'ab_1', name: 'Классическая планка на предплечьях', muscle: 'Пресс и кор', isBodyweight: true, defaultSets: 3, defaultReps: 45, defaultWeight: 0, equipment: 'Свой вес' },
  { id: 'ab_2', name: 'Боковая планка на предплечье', muscle: 'Пресс и кор', isBodyweight: true, defaultSets: 3, defaultReps: 30, defaultWeight: 0, equipment: 'Свой вес' },
  { id: 'ab_3', name: 'Скручивания на наклонной римской скамье', muscle: 'Пресс и кор', isBodyweight: true, defaultSets: 3, defaultReps: 15, defaultWeight: 0, equipment: 'Свой вес' },
  { id: 'ab_4', name: 'Подъем ног в висе на перекладине / брусьях', muscle: 'Пресс и кор', isBodyweight: true, defaultSets: 3, defaultReps: 12, defaultWeight: 0, equipment: 'Турник' },
  { id: 'ab_5', name: 'Скручивания на полу с согнутыми коленями', muscle: 'Пресс и кор', isBodyweight: true, defaultSets: 3, defaultReps: 20, defaultWeight: 0, equipment: 'Свой вес' },
  { id: 'ab_6', name: 'Скручивания на верхнем блоке («Молитва»)', muscle: 'Пресс и кор', isBodyweight: false, defaultSets: 3, defaultReps: 15, defaultWeight: 35, equipment: 'Блок' },
  { id: 'ab_7', name: 'Русские скручивания с диском / медболом', muscle: 'Пресс и кор', isBodyweight: false, defaultSets: 3, defaultReps: 20, defaultWeight: 5, equipment: 'Гантели' },
  { id: 'ab_8', name: 'Ролик для пресса с колен (Ab Wheel)', muscle: 'Пресс и кор', isBodyweight: true, defaultSets: 3, defaultReps: 10, defaultWeight: 0, equipment: 'Свой вес' },
  { id: 'ab_9', name: 'Вакуум живота стоя натощак', muscle: 'Пресс и кор', isBodyweight: true, defaultSets: 4, defaultReps: 20, defaultWeight: 0, equipment: 'Свой вес' },
  { id: 'ab_10', name: 'Упражнение «Книжка» (складка) на полу', muscle: 'Пресс и кор', isBodyweight: true, defaultSets: 3, defaultReps: 15, defaultWeight: 0, equipment: 'Свой вес' },

  // ================= 9. КАРДИО И ФУНКЦИОНАЛ =================
  { id: 'fn_1', name: 'Бёрпи (Burpee) со взрывным прыжком', muscle: 'Кардио и функционал', isBodyweight: true, defaultSets: 4, defaultReps: 12, defaultWeight: 0, equipment: 'Свой вес' },
  { id: 'fn_2', name: 'Махи гирей двумя руками (Kettlebell Swing)', muscle: 'Кардио и функционал', isBodyweight: false, defaultSets: 4, defaultReps: 15, defaultWeight: 16, equipment: 'Гиря' },
  { id: 'fn_3', name: 'Гребной тренажер (Concept2 Rowing)', muscle: 'Кардио и функционал', isBodyweight: false, defaultSets: 5, defaultReps: 500, defaultWeight: 0, equipment: 'Тренажер' },
  { id: 'fn_4', name: 'Аэрбайк (Assault AirBike) интервалы 20/10', muscle: 'Кардио и функционал', isBodyweight: false, defaultSets: 6, defaultReps: 30, defaultWeight: 0, equipment: 'Тренажер' },
  { id: 'fn_5', name: 'Беговая дорожка (ходьба в горку под углом 12%)', muscle: 'Кардио и функционал', isBodyweight: false, defaultSets: 1, defaultReps: 20, defaultWeight: 0, equipment: 'Тренажер' },
  { id: 'fn_6', name: 'Скакалка (одинарные / двойные прыжки)', muscle: 'Кардио и функционал', isBodyweight: true, defaultSets: 4, defaultReps: 100, defaultWeight: 0, equipment: 'Свой вес' },
  { id: 'fn_7', name: 'Боевые канаты (Battle Ropes) попеременная волна', muscle: 'Кардио и функционал', isBodyweight: true, defaultSets: 4, defaultReps: 30, defaultWeight: 0, equipment: 'Свой вес' },
  { id: 'fn_8', name: 'Рывок гири одной рукой (Kettlebell Snatch)', muscle: 'Кардио и функционал', isBodyweight: false, defaultSets: 3, defaultReps: 10, defaultWeight: 16, equipment: 'Гиря' },
  { id: 'fn_9', name: 'Запрыгивания на тумбу (Box Jumps 60см)', muscle: 'Кардио и функционал', isBodyweight: true, defaultSets: 3, defaultReps: 12, defaultWeight: 0, equipment: 'Свой вес' },
  { id: 'fn_10', name: 'Фермерская прогулка с тяжелыми гантелями', muscle: 'Кардио и функционал', isBodyweight: false, defaultSets: 3, defaultReps: 40, defaultWeight: 32, equipment: 'Гантели' }
];

// ================= ПОПУЛЯРНЫЕ ГОТОВЫЕ СХЕМЫ СПЛИТОВ =================
export const SPLIT_ARCHITECTURES = [
  {
    id: 'full_body_3',
    name: 'Full Body (3 дня: А / Б / В)',
    desc: 'Проработка всех мышечных групп за тренировку под разным углом',
    daysCount: 3,
    days: {
      1: {
        title: 'День 1: Full Body (Сила А)',
        exercises: [
          { name: 'Приседания со штангой на плечах (классика)', muscleGroup: 'Квадрицепс', isBodyweight: false, sets: 4, reps: 8, weight: 70, notes: 'База, колени наружу' },
          { name: 'Жим штанги лежа на горизонтальной скамье', muscleGroup: 'Грудь', isBodyweight: false, sets: 4, reps: 8, weight: 60, notes: 'Пауза внизу 1 сек' },
          { name: 'Тяга верхнего блока к груди широким хватом', muscleGroup: 'Спина', isBodyweight: false, sets: 4, reps: 10, weight: 55, notes: 'Сведение лопаток' },
          { name: 'Жим гантелей сидя на скамье с упором спины', muscleGroup: 'Плечи (Дельты)', isBodyweight: false, sets: 3, reps: 10, weight: 18, notes: 'Дельты' },
          { name: 'Классическая планка на предплечьях', muscleGroup: 'Пресс и кор', isBodyweight: true, sets: 3, reps: 45, weight: 0, notes: 'Свой вес' }
        ]
      },
      2: {
        title: 'День 2: Full Body (Гипертрофия Б)',
        exercises: [
          { name: 'Румынская становая тяга со штангой', muscleGroup: 'Ягодицы и бицепс бедра', isBodyweight: false, sets: 4, reps: 10, weight: 60, notes: 'Акцент на растяжение бедра' },
          { name: 'Жим гантелей на наклонной скамье (30-45°)', muscleGroup: 'Грудь', isBodyweight: false, sets: 4, reps: 10, weight: 22, notes: 'Верхняя часть груди' },
          { name: 'Тяга штанги в наклоне прямым хватом', muscleGroup: 'Спина', isBodyweight: false, sets: 4, reps: 10, weight: 55, notes: 'Тяга к низу живота' },
          { name: 'Махи гантелями через стороны стоя (средняя дельта)', muscleGroup: 'Плечи (Дельты)', isBodyweight: false, sets: 3, reps: 12, weight: 10, notes: 'Локти чуть согнуты' },
          { name: 'Подъем ног в висе на перекладине / брусьях', muscleGroup: 'Пресс и кор', isBodyweight: true, sets: 3, reps: 12, weight: 0, notes: 'Свой вес' }
        ]
      },
      3: {
        title: 'День 3: Full Body (Объем В)',
        exercises: [
          { name: 'Жим ногами в платформе 45°', muscleGroup: 'Квадрицепс', isBodyweight: false, sets: 4, reps: 12, weight: 140, notes: 'Плотный упор тазом' },
          { name: 'Подтягивания на перекладине широким хватом', muscleGroup: 'Спина', isBodyweight: true, sets: 3, reps: 8, weight: 0, notes: 'Свой вес' },
          { name: 'Отжимания на брусьях (акцент на грудь)', muscleGroup: 'Грудь', isBodyweight: true, sets: 3, reps: 10, weight: 0, notes: 'Свой вес' },
          { name: 'Подъем штанги на бицепс стоя (прямой/EZ-гриф)', muscleGroup: 'Бицепс', isBodyweight: false, sets: 3, reps: 10, weight: 25, notes: 'Без читинга' },
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
          { name: 'Жим штанги лежа на горизонтальной скамье', muscleGroup: 'Грудь', isBodyweight: false, sets: 4, reps: 8, weight: 70, notes: 'Основная база' },
          { name: 'Жим гантелей на наклонной скамье (30-45°)', muscleGroup: 'Грудь', isBodyweight: false, sets: 4, reps: 10, weight: 24, notes: 'Угол 30 градусов' },
          { name: 'Армейский жим штанги стоя над головой', muscleGroup: 'Плечи (Дельты)', isBodyweight: false, sets: 4, reps: 8, weight: 40, notes: 'Кор в напряжении' },
          { name: 'Махи гантелями через стороны стоя (средняя дельта)', muscleGroup: 'Плечи (Дельты)', isBodyweight: false, sets: 3, reps: 12, weight: 12, notes: 'Изоляция' },
          { name: 'Французский жим с EZ-штангой лежа на скамье', muscleGroup: 'Трицепс', isBodyweight: false, sets: 3, reps: 10, weight: 28, notes: 'Локти фиксированы' }
        ]
      },
      2: {
        title: 'День 2: Pull (Тяни — Спина + Задняя дельта + Бицепс)',
        exercises: [
          { name: 'Подтягивания на перекладине широким хватом', muscleGroup: 'Спина', isBodyweight: true, sets: 4, reps: 8, weight: 0, notes: 'Свой вес' },
          { name: 'Тяга штанги в наклоне прямым хватом', muscleGroup: 'Спина', isBodyweight: false, sets: 4, reps: 8, weight: 65, notes: 'Тяга к поясу' },
          { name: 'Тяга горизонтального блока к поясу (сидя)', muscleGroup: 'Спина', isBodyweight: false, sets: 3, reps: 12, weight: 55, notes: 'Сжимать лопатки' },
          { name: 'Face Pull (тяга каната к лицу на верхнем блоке)', muscleGroup: 'Плечи (Дельты)', isBodyweight: false, sets: 4, reps: 12, weight: 25, notes: 'Задняя дельта' },
          { name: 'Подъем штанги на бицепс стоя (прямой/EZ-гриф)', muscleGroup: 'Бицепс', isBodyweight: false, sets: 3, reps: 10, weight: 30, notes: 'Чистая техника' }
        ]
      },
      3: {
        title: 'День 3: Legs (Ноги — Квадрицепс + Бицепс бедра + Кор)',
        exercises: [
          { name: 'Приседания со штангой на плечах (классика)', muscleGroup: 'Квадрицепс', isBodyweight: false, sets: 4, reps: 8, weight: 80, notes: 'Тяжелый присед' },
          { name: 'Жим ногами в платформе 45°', muscleGroup: 'Квадрицепс', isBodyweight: false, sets: 4, reps: 12, weight: 150, notes: 'Глубокая амплитуда' },
          { name: 'Румынская становая тяга со штангой', muscleGroup: 'Ягодицы и бицепс бедра', isBodyweight: false, sets: 4, reps: 10, weight: 70, notes: 'Растяжка бедра' },
          { name: 'Сгибания ног в тренажере лежа', muscleGroup: 'Ягодицы и бицепс бедра', isBodyweight: false, sets: 3, reps: 12, weight: 40, notes: 'Пиковое сокращение' },
          { name: 'Подъем ног в висе на перекладине / брусьях', muscleGroup: 'Пресс и кор', isBodyweight: true, sets: 3, reps: 12, weight: 0, notes: 'Свой вес' }
        ]
      }
    }
  },
  {
    id: 'upper_lower_4',
    name: 'Upper / Lower — Верх / Низ (4 дня)',
    desc: '2 дня верха и 2 дня низа (чередование силы и гипертрофии)',
    daysCount: 4,
    days: {
      1: { title: 'День 1: Верх тела (Силовой)', exercises: [] },
      2: { title: 'День 2: Низ тела (Силовой)', exercises: [] },
      3: { title: 'День 3: Верх тела (Гипертрофия)', exercises: [] },
      4: { title: 'День 4: Низ тела (Объем и ягодицы)', exercises: [] }
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
          { name: 'Ягодичный мост со штангой на скамье (Hip Thrust)', muscleGroup: 'Ягодицы и бицепс бедра', isBodyweight: false, sets: 4, reps: 12, weight: 50, notes: 'Пауза в верхней точке' },
          { name: 'Румынская тяга с гантелями стоя', muscleGroup: 'Ягодицы и бицепс бедра', isBodyweight: false, sets: 4, reps: 12, weight: 14, notes: 'Спина прямая' },
          { name: 'Болгарские сплит-приседания с гантелями', muscleGroup: 'Ягодицы и бицепс бедра', isBodyweight: false, sets: 3, reps: 10, weight: 8, notes: 'Колено не уходит вперед' },
          { name: 'Разведение ног в тренажере сидя (ягодицы)', muscleGroup: 'Ягодицы и бицепс бедра', isBodyweight: false, sets: 3, reps: 15, weight: 45, notes: 'Дропсет на последнем' }
        ]
      },
      2: {
        title: 'День 2: Спина, осанка и плечи',
        exercises: [
          { name: 'Тяга верхнего блока к груди широким хватом', muscleGroup: 'Спина', isBodyweight: false, sets: 4, reps: 12, weight: 35, notes: 'Тянем спиной' },
          { name: 'Тяга горизонтального блока к поясу (сидя)', muscleGroup: 'Спина', isBodyweight: false, sets: 3, reps: 12, weight: 30, notes: 'Лопатки вместе' },
          { name: 'Махи гантелями через стороны стоя (средняя дельта)', muscleGroup: 'Плечи (Дельты)', isBodyweight: false, sets: 3, reps: 12, weight: 6, notes: 'Без рывков' },
          { name: 'Разгибания на трицепс на блоке с канатной рукоятью', muscleGroup: 'Трицепс', isBodyweight: false, sets: 3, reps: 12, weight: 15, notes: 'Форма рук' },
          { name: 'Классическая планка на предплечьях', muscleGroup: 'Пресс и кор', isBodyweight: true, sets: 3, reps: 40, weight: 0, notes: 'Свой вес' }
        ]
      },
      3: {
        title: 'День 3: Ягодицы + Квадрицепс + Кор',
        exercises: [
          { name: 'Кубковые приседания с гантелью (Goblet Squat)', muscleGroup: 'Квадрицепс', isBodyweight: false, sets: 4, reps: 12, weight: 16, notes: 'Глубокий присед' },
          { name: 'Жим ногами в платформе 45°', muscleGroup: 'Квадрицепс', isBodyweight: false, sets: 4, reps: 12, weight: 80, notes: 'Ноги высоко и широко' },
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
