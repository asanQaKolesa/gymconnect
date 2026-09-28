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
  { id: 'ch_1', name: 'Жим штанги лежа на горизонтальной скамье', muscle: 'Грудь', isBodyweight: false },
  { id: 'ch_2', name: 'Жим гантелей на наклонной скамье (30-45°)', muscle: 'Грудь', isBodyweight: false },
  { id: 'ch_3', name: 'Жим штанги на наклонной скамье вверх головой', muscle: 'Грудь', isBodyweight: false },
  { id: 'ch_4', name: 'Жим гантелей на горизонтальной скамье', muscle: 'Грудь', isBodyweight: false },
  { id: 'ch_5', name: 'Жим в тренажере Хаммер (Hammer Strength)', muscle: 'Грудь', isBodyweight: false },
  { id: 'ch_6', name: 'Жим штанги в тренажере Смита', muscle: 'Грудь', isBodyweight: false },
  { id: 'ch_7', name: 'Жим гантелей на скамье вниз головой', muscle: 'Грудь', isBodyweight: false },
  { id: 'ch_8', name: 'Сведение рук в кроссовере на верхнем блоке', muscle: 'Грудь', isBodyweight: false },
  { id: 'ch_9', name: 'Сведение рук в кроссовере на нижнем блоке', muscle: 'Грудь', isBodyweight: false },
  { id: 'ch_10', name: 'Сведение рук в тренажере «Бабочка» (Pec-Deck)', muscle: 'Грудь', isBodyweight: false },
  { id: 'ch_11', name: 'Разведение гантелей на горизонтальной скамье', muscle: 'Грудь', isBodyweight: false },
  { id: 'ch_12', name: 'Разведение гантелей на наклонной скамье', muscle: 'Грудь', isBodyweight: false },
  { id: 'ch_13', name: 'Отжимания на брусьях с акцентом на грудь', muscle: 'Грудь', isBodyweight: true },
  { id: 'ch_14', name: 'Отжимания от пола широким хватом', muscle: 'Грудь', isBodyweight: true },
  { id: 'ch_15', name: 'Пуловер с гантелью на скамье', muscle: 'Грудь', isBodyweight: false },

  // ================= 2. СПИНА =================
  { id: 'bk_1', name: 'Подтягивания на перекладине широким хватом к груди', muscle: 'Спина', isBodyweight: true },
  { id: 'bk_2', name: 'Подтягивания нейтральным параллельным хватом', muscle: 'Спина', isBodyweight: true },
  { id: 'bk_3', name: 'Подтягивания обратным хватом (супинированным)', muscle: 'Спина', isBodyweight: true },
  { id: 'bk_4', name: 'Подтягивания в гравитроне с разгрузкой веса', muscle: 'Спина', isBodyweight: false },
  { id: 'bk_5', name: 'Тяга верхнего блока к груди широким хватом', muscle: 'Спина', isBodyweight: false },
  { id: 'bk_6', name: 'Тяга верхнего блока узким параллельным хватом', muscle: 'Спина', isBodyweight: false },
  { id: 'bk_7', name: 'Тяга верхнего блока за голову', muscle: 'Спина', isBodyweight: false },
  { id: 'bk_8', name: 'Тяга горизонтального блока к поясу сидя', muscle: 'Спина', isBodyweight: false },
  { id: 'bk_9', name: 'Тяга штанги в наклоне прямым хватом', muscle: 'Спина', isBodyweight: false },
  { id: 'bk_10', name: 'Тяга штанги в наклоне обратным хватом (хват Ятса)', muscle: 'Спина', isBodyweight: false },
  { id: 'bk_11', name: 'Тяга Т-грифа с упором грудью в подушку', muscle: 'Спина', isBodyweight: false },
  { id: 'bk_12', name: 'Тяга гантели одной рукой в упоре на скамью', muscle: 'Спина', isBodyweight: false },
  { id: 'bk_13', name: 'Тяга двух гантелей в наклоне лежа на животе', muscle: 'Спина', isBodyweight: false },
  { id: 'bk_14', name: 'Классическая становая тяга со штангой с помоста', muscle: 'Спина', isBodyweight: false },
  { id: 'bk_15', name: 'Становая тяга сумо с широкой постановкой ног', muscle: 'Спина', isBodyweight: false },
  { id: 'bk_16', name: 'Гиперэкстензия на наклонной скамье 45°', muscle: 'Спина', isBodyweight: true },
  { id: 'bk_17', name: 'Пуловер на верхнем блоке прямыми руками стоя', muscle: 'Спина', isBodyweight: false },
  { id: 'bk_18', name: 'Тяга в рычажном тренажере на широчайшие (одной рукой)', muscle: 'Спина', isBodyweight: false },
  { id: 'bk_19', name: 'Шраги со штангой стоя (верх трапеции)', muscle: 'Спина', isBodyweight: false },
  { id: 'bk_20', name: 'Шраги с гантелями стоя с паузой вверху', muscle: 'Спина', isBodyweight: false },

  // ================= 3. НОГИ / КВАДРИЦЕПС =================
  { id: 'lg_1', name: 'Приседания со штангой на плечах (классические)', muscle: 'Квадрицепс', isBodyweight: false },
  { id: 'lg_2', name: 'Фронтальные приседания со штангой на груди', muscle: 'Квадрицепс', isBodyweight: false },
  { id: 'lg_3', name: 'Приседания в тренажере Смита с выносом ног', muscle: 'Квадрицепс', isBodyweight: false },
  { id: 'lg_4', name: 'Жим ногами в наклонной платформе (45°)', muscle: 'Квадрицепс', isBodyweight: false },
  { id: 'lg_5', name: 'Гакк-приседания в тренажере с узкой постановкой', muscle: 'Квадрицепс', isBodyweight: false },
  { id: 'lg_6', name: 'Разгибания голени в тренажере сидя', muscle: 'Квадрицепс', isBodyweight: false },
  { id: 'lg_7', name: 'Разгибание одной ноги в тренажере поочередно', muscle: 'Квадрицепс', isBodyweight: false },
  { id: 'lg_8', name: 'Кубковые приседания с гантелью / гирей (Goblet)', muscle: 'Квадрицепс', isBodyweight: false },
  { id: 'lg_9', name: 'Выпады в шаге с гантелями в руках', muscle: 'Квадрицепс', isBodyweight: false },
  { id: 'lg_10', name: 'Обратные выпады назад на месте', muscle: 'Квадрицепс', isBodyweight: false },
  { id: 'lg_11', name: 'Зашагивания на высокую тумбу с гантелями', muscle: 'Квадрицепс', isBodyweight: false },
  { id: 'lg_12', name: 'Сисси-приседания у опоры (изоляция квадрицепса)', muscle: 'Квадрицепс', isBodyweight: true },
  { id: 'lg_13', name: 'Воздушные приседания в темпе со своим весом', muscle: 'Квадрицепс', isBodyweight: true },
  { id: 'lg_14', name: 'Статическое приседание у стены («Стульчик»)', muscle: 'Квадрицепс', isBodyweight: true },

  // ================= 4. ЯГОДИЦЫ И БИЦЕПС БЕДРА =================
  { id: 'gl_1', name: 'Ягодичный мост со штангой на скамье (Hip Thrust)', muscle: 'Ягодицы и бицепс бедра', isBodyweight: false },
  { id: 'gl_2', name: 'Ягодичный мост в специализированном тренажере', muscle: 'Ягодицы и бицепс бедра', isBodyweight: false },
  { id: 'gl_3', name: 'Ягодичный мост в тренажере Смита', muscle: 'Ягодицы и бицепс бедра', isBodyweight: false },
  { id: 'gl_4', name: 'Болгарские сплит-приседания с гантелями', muscle: 'Ягодицы и бицепс бедра', isBodyweight: false },
  { id: 'gl_5', name: 'Болгарские выпады в тренажере Смита', muscle: 'Ягодицы и бицепс бедра', isBodyweight: false },
  { id: 'gl_6', name: 'Румынская становая тяга со штангой', muscle: 'Ягодицы и бицепс бедра', isBodyweight: false },
  { id: 'gl_7', name: 'Румынская тяга с гантелями стоя', muscle: 'Ягодицы и бицепс бедра', isBodyweight: false },
  { id: 'gl_8', name: 'Румынская тяга на одной ноге с гантелью', muscle: 'Ягодицы и бицепс бедра', isBodyweight: false },
  { id: 'gl_9', name: 'Сгибания ног в тренажере лежа на животе', muscle: 'Ягодицы и бицепс бедра', isBodyweight: false },
  { id: 'gl_10', name: 'Сгибания ног в тренажере сидя', muscle: 'Ягодицы и бицепс бедра', isBodyweight: false },
  { id: 'gl_11', name: 'Сгибание одной ноги в тренажере стоя', muscle: 'Ягодицы и бицепс бедра', isBodyweight: false },
  { id: 'gl_12', name: 'Отведение ноги назад в кроссовере с манжетой', muscle: 'Ягодицы и бицепс бедра', isBodyweight: false },
  { id: 'gl_13', name: 'Махи ногой в сторону в кроссовере (средняя ягодичная)', muscle: 'Ягодицы и бицепс бедра', isBodyweight: false },
  { id: 'gl_14', name: 'Разведение ног в тренажере сидя с наклоном корпуса', muscle: 'Ягодицы и бицепс бедра', isBodyweight: false },
  { id: 'gl_15', name: 'Сведение ног в тренажере сидя (приводящие мышцы)', muscle: 'Ягодицы и бицепс бедра', isBodyweight: false },
  { id: 'gl_16', name: 'Подъем на носки стоя в тренажере (икроножные)', muscle: 'Ягодицы и бицепс бедра', isBodyweight: false },
  { id: 'gl_17', name: 'Подъем на носки в тренажере для жима ногами', muscle: 'Ягодицы и бицепс бедра', isBodyweight: false },
  { id: 'gl_18', name: 'Подъем на носки сидя в тренажере (камбаловидная)', muscle: 'Ягодицы и бицепс бедра', isBodyweight: false },

  // ================= 5. ПЛЕЧИ (ДЕЛЬТЫ) =================
  { id: 'sh_1', name: 'Армейский жим штанги стоя над головой (базовый)', muscle: 'Плечи (Дельты)', isBodyweight: false },
  { id: 'sh_2', name: 'Жим штанги сидя над головой со стоек', muscle: 'Плечи (Дельты)', isBodyweight: false },
  { id: 'sh_3', name: 'Жим гантелей сидя на скамье с упором спины', muscle: 'Плечи (Дельты)', isBodyweight: false },
  { id: 'sh_4', name: 'Жим Арнольда с гантелями с разворотом кистей', muscle: 'Плечи (Дельты)', isBodyweight: false },
  { id: 'sh_5', name: 'Жим в рычажном тренажере на плечи (Shoulder Press)', muscle: 'Плечи (Дельты)', isBodyweight: false },
  { id: 'sh_6', name: 'Жим штанги в Смите с груди сидя', muscle: 'Плечи (Дельты)', isBodyweight: false },
  { id: 'sh_7', name: 'Махи гантелями через стороны стоя (средняя дельта)', muscle: 'Плечи (Дельты)', isBodyweight: false },
  { id: 'sh_8', name: 'Махи гантелями через стороны сидя на скамье', muscle: 'Плечи (Дельты)', isBodyweight: false },
  { id: 'sh_9', name: 'Махи в кроссовере с нижнего блока одной рукой', muscle: 'Плечи (Дельты)', isBodyweight: false },
  { id: 'sh_10', name: 'Подъем гантелей перед собой стоя (передняя дельта)', muscle: 'Плечи (Дельты)', isBodyweight: false },
  { id: 'sh_11', name: 'Подъем диска от штанги перед собой на вытянутых руках', muscle: 'Плечи (Дельты)', isBodyweight: false },
  { id: 'sh_12', name: 'Тяга штанги к подбородку широким хватом (протяжка)', muscle: 'Плечи (Дельты)', isBodyweight: false },
  { id: 'sh_13', name: 'Тяга каната на нижнем блоке к подбородку', muscle: 'Плечи (Дельты)', isBodyweight: false },
  { id: 'sh_14', name: 'Махи гантелями в наклоне (задняя дельта)', muscle: 'Плечи (Дельты)', isBodyweight: false },
  { id: 'sh_15', name: 'Махи гантелями лежа на животе на наклонной скамье', muscle: 'Плечи (Дельты)', isBodyweight: false },
  { id: 'sh_16', name: 'Разведения в тренажере обратная бабочка (Rear Delt)', muscle: 'Плечи (Дельты)', isBodyweight: false },
  { id: 'sh_17', name: 'Face Pull (тяга каната к лицу на верхнем блоке)', muscle: 'Плечи (Дельты)', isBodyweight: false },
  { id: 'sh_18', name: 'Кроссовер на заднюю дельту с верхних блоков крест-накрест', muscle: 'Плечи (Дельты)', isBodyweight: false },

  // ================= 6. БИЦЕПС =================
  { id: 'bi_1', name: 'Подъем штанги на бицепс стоя (прямой / EZ-гриф)', muscle: 'Бицепс', isBodyweight: false },
  { id: 'bi_2', name: 'Подъем гантелей на бицепс стоя с супинацией кисти', muscle: 'Бицепс', isBodyweight: false },
  { id: 'bi_3', name: 'Молотковые сгибания с гантелями стоя (Hammer Curls)', muscle: 'Бицепс', isBodyweight: false },
  { id: 'bi_4', name: 'Сгибания рук на скамье Скотта со штангой', muscle: 'Бицепс', isBodyweight: false },
  { id: 'bi_5', name: 'Сгибания рук на скамье Скотта с гантелью одной рукой', muscle: 'Бицепс', isBodyweight: false },
  { id: 'bi_6', name: 'Сгибания на бицепс сидя на наклонной скамье', muscle: 'Бицепс', isBodyweight: false },
  { id: 'bi_7', name: 'Концентрированные сгибания на бицепс с упором в бедро', muscle: 'Бицепс', isBodyweight: false },
  { id: 'bi_8', name: 'Сгибания рук на нижнем блоке кроссовера с рукоятью', muscle: 'Бицепс', isBodyweight: false },
  { id: 'bi_9', name: 'Сгибания на нижнем блоке с канатной рукоятью (молотки)', muscle: 'Бицепс', isBodyweight: false },
  { id: 'bi_10', name: 'Сгибания рук на верхних блоках кроссовера («Двойной бицепс»)', muscle: 'Бицепс', isBodyweight: false },
  { id: 'bi_11', name: 'Паучьи сгибания с гантелями на наклонной скамье', muscle: 'Бицепс', isBodyweight: false },
  { id: 'bi_12', name: 'Подъем штанги на бицепс обратным хватом (брахиалис)', muscle: 'Бицепс', isBodyweight: false },

  // ================= 7. ТРИЦЕПС =================
  { id: 'tri_1', name: 'Французский жим с EZ-штангой лежа на горизонтальной скамье', muscle: 'Трицепс', isBodyweight: false },
  { id: 'tri_2', name: 'Французский жим с гантелями лежа', muscle: 'Трицепс', isBodyweight: false },
  { id: 'tri_3', name: 'Разгибания на трицепс на блоке с канатной рукоятью', muscle: 'Трицепс', isBodyweight: false },
  { id: 'tri_4', name: 'Разгибания на блоке с прямой / V-образной рукоятью', muscle: 'Трицепс', isBodyweight: false },
  { id: 'tri_5', name: 'Разгибания на блоке обратным хватом одной рукой', muscle: 'Трицепс', isBodyweight: false },
  { id: 'tri_6', name: 'Отжимания на брусьях с акцентом на трицепс (узкий хват)', muscle: 'Трицепс', isBodyweight: true },
  { id: 'tri_7', name: 'Жим штанги узким хватом лежа на скамье', muscle: 'Трицепс', isBodyweight: false },
  { id: 'tri_8', name: 'Жим узким хватом в тренажере Смита', muscle: 'Трицепс', isBodyweight: false },
  { id: 'tri_9', name: 'Разгибание гантели из-за головы двумя руками сидя', muscle: 'Трицепс', isBodyweight: false },
  { id: 'tri_10', name: 'Разгибание гантели из-за головы одной рукой сидя', muscle: 'Трицепс', isBodyweight: false },
  { id: 'tri_11', name: 'Французский жим из-за головы на нижнем блоке стоя', muscle: 'Трицепс', isBodyweight: false },
  { id: 'tri_12', name: 'Обратные отжимания от скамьи с согнутыми/прямыми ногами', muscle: 'Трицепс', isBodyweight: true },
  { id: 'tri_13', name: 'Разгибание руки назад в наклоне с гантелью (Kickback)', muscle: 'Трицепс', isBodyweight: false },

  // ================= 8. ПРЕСС И КОР =================
  { id: 'ab_1', name: 'Классическая планка на предплечьях на время', muscle: 'Пресс и кор', isBodyweight: true },
  { id: 'ab_2', name: 'Боковая планка на предплечье', muscle: 'Пресс и кор', isBodyweight: true },
  { id: 'ab_3', name: 'Динамическая планка с переходом на прямые руки', muscle: 'Пресс и кор', isBodyweight: true },
  { id: 'ab_4', name: 'Скручивания на наклонной римской скамье', muscle: 'Пресс и кор', isBodyweight: true },
  { id: 'ab_5', name: 'Подъем прямых ног в висе на перекладине', muscle: 'Пресс и кор', isBodyweight: true },
  { id: 'ab_6', name: 'Подъем коленей к груди в упоре на брусьях', muscle: 'Пресс и кор', isBodyweight: true },
  { id: 'ab_7', name: 'Скручивания на полу с фиксацией ног', muscle: 'Пресс и кор', isBodyweight: true },
  { id: 'ab_8', name: 'Скручивания на верхнем блоке на коленях («Молитва»)', muscle: 'Пресс и кор', isBodyweight: false },
  { id: 'ab_9', name: 'Русские скручивания сидя на полу с диском', muscle: 'Пресс и кор', isBodyweight: false },
  { id: 'ab_10', name: 'Ролик для пресса с колен (Ab Wheel Roller)', muscle: 'Пресс и кор', isBodyweight: true },
  { id: 'ab_11', name: 'Вакуум живота стоя на выдохе (поперечная мышца)', muscle: 'Пресс и кор', isBodyweight: true },
  { id: 'ab_12', name: 'Упражнение «Книжка» (складка на пресс) на полу', muscle: 'Пресс и кор', isBodyweight: true },
  { id: 'ab_13', name: 'Велосипед с диагональным касанием локтем колена', muscle: 'Пресс и кор', isBodyweight: true },
  { id: 'ab_14', name: 'Мертвый жук (Dead Bug) на полу', muscle: 'Пресс и кор', isBodyweight: true },

  // ================= 9. КАРДИО И ФУНКЦИОНАЛ =================
  { id: 'fn_1', name: 'Бёрпи (Burpee) со взрывным прыжком вверх', muscle: 'Кардио и функционал', isBodyweight: true },
  { id: 'fn_2', name: 'Махи гирей двумя руками перед собой (Kettlebell Swing)', muscle: 'Кардио и функционал', isBodyweight: false },
  { id: 'fn_3', name: 'Гребной тренажер (Concept2 Rowing)', muscle: 'Кардио и функционал', isBodyweight: false },
  { id: 'fn_4', name: 'Аэрбайк (Assault AirBike) интервалы высокой мощности', muscle: 'Кардио и функционал', isBodyweight: false },
  { id: 'fn_5', name: 'Беговая дорожка (ходьба в горку под наклоном 12-15%)', muscle: 'Кардио и функционал', isBodyweight: false },
  { id: 'fn_6', name: 'Интервальный спринтерский бег на дорожке', muscle: 'Кардио и функционал', isBodyweight: false },
  { id: 'fn_7', name: 'Скакалка (одинарные и двойные прыжки)', muscle: 'Кардио и функционал', isBodyweight: true },
  { id: 'fn_8', name: 'Боевые канаты (Battle Ropes) попеременная волна', muscle: 'Кардио и функционал', isBodyweight: true },
  { id: 'fn_9', name: 'Рывок гири одной рукой над головой (Snatch)', muscle: 'Кардио и функционал', isBodyweight: false },
  { id: 'fn_10', name: 'Толчок двух гирь по длинному циклу', muscle: 'Кардио и функционал', isBodyweight: false },
  { id: 'fn_11', name: 'Запрыгивания на тумбу (Box Jumps 50-70см)', muscle: 'Кардио и функционал', isBodyweight: true },
  { id: 'fn_12', name: 'Фермерская прогулка с тяжелыми гантелями / гирями', muscle: 'Кардио и функционал', isBodyweight: false },
  { id: 'fn_13', name: 'Слэд-толкание саней с весом по дорожке (Prowler Push)', muscle: 'Кардио и функционал', isBodyweight: false },
  { id: 'fn_14', name: 'Эллиптический тренажер (кардио средней интенсивности)', muscle: 'Кардио и функционал', isBodyweight: false }
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
