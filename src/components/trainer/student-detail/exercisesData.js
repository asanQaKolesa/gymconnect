export const MUSCLE_GROUPS = [
  'Все группы',
  'Грудь',
  'Спина',
  'Квадрицепс',
  'Ягодицы / Бицепс бедра',
  'Плечи (Дельты)',
  'Бицепс',
  'Трицепс',
  'Пресс и Кор',
  'Кардио'
];

export const EXERCISES_DATABASE = [
  // Грудь
  { id: 'chest_1', nameRu: 'Жим штанги лежа', muscleGroup: 'Грудь', equipment: 'barbell', type: 'compound' },
  { id: 'chest_2', nameRu: 'Жим гантелей на наклонной скамье', muscleGroup: 'Грудь', equipment: 'dumbbell', type: 'compound' },
  { id: 'chest_3', nameRu: 'Отжимания на брусьях (акцент грудь)', muscleGroup: 'Грудь', equipment: 'bodyweight', type: 'compound' },
  { id: 'chest_4', nameRu: 'Сведение рук в кроссовере', muscleGroup: 'Грудь', equipment: 'cable', type: 'isolation' },
  { id: 'chest_5', nameRu: 'Разведение гантелей лежа', muscleGroup: 'Грудь', equipment: 'dumbbell', type: 'isolation' },
  { id: 'chest_6', nameRu: 'Жим в тренажере Хаммер', muscleGroup: 'Грудь', equipment: 'machine', type: 'compound' },
  { id: 'chest_7', nameRu: 'Жим штанги на наклонной скамье', muscleGroup: 'Грудь', equipment: 'barbell', type: 'compound' },
  { id: 'chest_8', nameRu: 'Сведение рук в бабочке (Pec-Deck)', muscleGroup: 'Грудь', equipment: 'machine', type: 'isolation' },
  { id: 'chest_9', nameRu: 'Отжимания от пола', muscleGroup: 'Грудь', equipment: 'bodyweight', type: 'compound' },

  // Спина
  { id: 'back_1', nameRu: 'Подтягивания широким хватом', muscleGroup: 'Спина', equipment: 'bodyweight', type: 'compound' },
  { id: 'back_2', nameRu: 'Тяга верхнего блока к груди', muscleGroup: 'Спина', equipment: 'cable', type: 'compound' },
  { id: 'back_3', nameRu: 'Тяга штанги в наклоне', muscleGroup: 'Спина', equipment: 'barbell', type: 'compound' },
  { id: 'back_4', nameRu: 'Тяга гантели одной рукой', muscleGroup: 'Спина', equipment: 'dumbbell', type: 'compound' },
  { id: 'back_5', nameRu: 'Горизонтальная тяга блока', muscleGroup: 'Спина', equipment: 'cable', type: 'compound' },
  { id: 'back_6', nameRu: 'Тяга Т-грифа', muscleGroup: 'Спина', equipment: 'machine', type: 'compound' },
  { id: 'back_7', nameRu: 'Пуловер на верхнем блоке', muscleGroup: 'Спина', equipment: 'cable', type: 'isolation' },
  { id: 'back_8', nameRu: 'Классическая становая тяга', muscleGroup: 'Спина', equipment: 'barbell', type: 'compound' },
  { id: 'back_9', nameRu: 'Гиперэкстензия', muscleGroup: 'Спина', equipment: 'bodyweight', type: 'isolation' },
  { id: 'back_10', nameRu: 'Шраги с гантелями', muscleGroup: 'Спина', equipment: 'dumbbell', type: 'isolation' },

  // Квадрицепс
  { id: 'quads_1', nameRu: 'Приседания со штангой', muscleGroup: 'Квадрицепс', equipment: 'barbell', type: 'compound' },
  { id: 'quads_2', nameRu: 'Жим ногами', muscleGroup: 'Квадрицепс', equipment: 'machine', type: 'compound' },
  { id: 'quads_3', nameRu: 'Фронтальные приседания', muscleGroup: 'Квадрицепс', equipment: 'barbell', type: 'compound' },
  { id: 'quads_4', nameRu: 'Разгибания ног в тренажере', muscleGroup: 'Квадрицепс', equipment: 'machine', type: 'isolation' },
  { id: 'quads_5', nameRu: 'Выпады с гантелями', muscleGroup: 'Квадрицепс', equipment: 'dumbbell', type: 'compound' },
  { id: 'quads_6', nameRu: 'Гакк-приседания', muscleGroup: 'Квадрицепс', equipment: 'machine', type: 'compound' },
  { id: 'quads_7', nameRu: 'Болгарские сплит-приседания', muscleGroup: 'Квадрицепс', equipment: 'dumbbell', type: 'compound' },
  { id: 'quads_8', nameRu: 'Зашагивания на тумбу', muscleGroup: 'Квадрицепс', equipment: 'dumbbell', type: 'compound' },
  { id: 'quads_9', nameRu: 'Кубковые приседания (Goblet)', muscleGroup: 'Квадрицепс', equipment: 'dumbbell', type: 'compound' },

  // Ягодицы / Бицепс бедра
  { id: 'glutes_1', nameRu: 'Ягодичный мостик', muscleGroup: 'Ягодицы / Бицепс бедра', equipment: 'barbell', type: 'compound' },
  { id: 'glutes_2', nameRu: 'Румынская тяга со штангой', muscleGroup: 'Ягодицы / Бицепс бедра', equipment: 'barbell', type: 'compound' },
  { id: 'glutes_3', nameRu: 'Сгибания ног лежа', muscleGroup: 'Ягодицы / Бицепс бедра', equipment: 'machine', type: 'isolation' },
  { id: 'glutes_4', nameRu: 'Сгибания ног сидя', muscleGroup: 'Ягодицы / Бицепс бедра', equipment: 'machine', type: 'isolation' },
  { id: 'glutes_5', nameRu: 'Отведение ноги назад в кроссовере', muscleGroup: 'Ягодицы / Бицепс бедра', equipment: 'cable', type: 'isolation' },
  { id: 'glutes_6', nameRu: 'Разведение ног в тренажере', muscleGroup: 'Ягодицы / Бицепс бедра', equipment: 'machine', type: 'isolation' },
  { id: 'glutes_7', nameRu: 'Мертвая тяга на прямых ногах', muscleGroup: 'Ягодицы / Бицепс бедра', equipment: 'barbell', type: 'compound' },
  { id: 'glutes_8', nameRu: 'Сведение ног в тренажере', muscleGroup: 'Ягодицы / Бицепс бедра', equipment: 'machine', type: 'isolation' },

  // Плечи (Дельты)
  { id: 'shoulders_1', nameRu: 'Армейский жим стоя', muscleGroup: 'Плечи (Дельты)', equipment: 'barbell', type: 'compound' },
  { id: 'shoulders_2', nameRu: 'Жим гантелей сидя', muscleGroup: 'Плечи (Дельты)', equipment: 'dumbbell', type: 'compound' },
  { id: 'shoulders_3', nameRu: 'Махи гантелями в стороны', muscleGroup: 'Плечи (Дельты)', equipment: 'dumbbell', type: 'isolation' },
  { id: 'shoulders_4', nameRu: 'Махи в наклоне (задняя дельта)', muscleGroup: 'Плечи (Дельты)', equipment: 'dumbbell', type: 'isolation' },
  { id: 'shoulders_5', nameRu: 'Тяга штанги к подбородку', muscleGroup: 'Плечи (Дельты)', equipment: 'barbell', type: 'compound' },
  { id: 'shoulders_6', nameRu: 'Жим Арнольда', muscleGroup: 'Плечи (Дельты)', equipment: 'dumbbell', type: 'compound' },
  { id: 'shoulders_7', nameRu: 'Фейспул (тяга каната к лицу)', muscleGroup: 'Плечи (Дельты)', equipment: 'cable', type: 'isolation' },
  { id: 'shoulders_8', nameRu: 'Отведения в тренажере обратная бабочка', muscleGroup: 'Плечи (Дельты)', equipment: 'machine', type: 'isolation' },

  // Бицепс
  { id: 'biceps_1', nameRu: 'Подъем штанги на бицепс', muscleGroup: 'Бицепс', equipment: 'barbell', type: 'isolation' },
  { id: 'biceps_2', nameRu: 'Подъем гантелей с супинацией', muscleGroup: 'Бицепс', equipment: 'dumbbell', type: 'isolation' },
  { id: 'biceps_3', nameRu: 'Молотки (Hammer curls)', muscleGroup: 'Бицепс', equipment: 'dumbbell', type: 'isolation' },
  { id: 'biceps_4', nameRu: 'Сгибания на скамье Скотта', muscleGroup: 'Бицепс', equipment: 'machine', type: 'isolation' },
  { id: 'biceps_5', nameRu: 'Сгибания рук на нижнем блоке', muscleGroup: 'Бицепс', equipment: 'cable', type: 'isolation' },
  { id: 'biceps_6', nameRu: 'Концентрированные сгибания', muscleGroup: 'Бицепс', equipment: 'dumbbell', type: 'isolation' },

  // Трицепс
  { id: 'triceps_1', nameRu: 'Французский жим штанги', muscleGroup: 'Трицепс', equipment: 'barbell', type: 'isolation' },
  { id: 'triceps_2', nameRu: 'Разгибания рук на блоке', muscleGroup: 'Трицепс', equipment: 'cable', type: 'isolation' },
  { id: 'triceps_3', nameRu: 'Отжимания на брусьях (акцент трицепс)', muscleGroup: 'Трицепс', equipment: 'bodyweight', type: 'compound' },
  { id: 'triceps_4', nameRu: 'Жим лежа узким хватом', muscleGroup: 'Трицепс', equipment: 'barbell', type: 'compound' },
  { id: 'triceps_5', nameRu: 'Разгибания гантели из-за головы', muscleGroup: 'Трицепс', equipment: 'dumbbell', type: 'isolation' },
  { id: 'triceps_6', nameRu: 'Обратные отжимания от скамьи', muscleGroup: 'Трицепс', equipment: 'bodyweight', type: 'compound' },

  // Пресс и Кор
  { id: 'abs_1', nameRu: 'Скручивания', muscleGroup: 'Пресс и Кор', equipment: 'bodyweight', type: 'isolation' },
  { id: 'abs_2', nameRu: 'Планка', muscleGroup: 'Пресс и Кор', equipment: 'bodyweight', type: 'isolation' },
  { id: 'abs_3', nameRu: 'Подъем ног в висе', muscleGroup: 'Пресс и Кор', equipment: 'bodyweight', type: 'isolation' },
  { id: 'abs_4', nameRu: 'Русские скручивания', muscleGroup: 'Пресс и Кор', equipment: 'bodyweight', type: 'isolation' },
  { id: 'abs_5', nameRu: 'Молитва на верхнем блоке', muscleGroup: 'Пресс и Кор', equipment: 'cable', type: 'isolation' },
  { id: 'abs_6', nameRu: 'Колесо для пресса', muscleGroup: 'Пресс и Кор', equipment: 'bodyweight', type: 'isolation' },

  // Кардио
  { id: 'cardio_1', nameRu: 'Беговая дорожка', muscleGroup: 'Кардио', equipment: 'machine', type: 'compound' },
  { id: 'cardio_2', nameRu: 'Эллипс', muscleGroup: 'Кардио', equipment: 'machine', type: 'compound' },
  { id: 'cardio_3', nameRu: 'Велотренажер', muscleGroup: 'Кардио', equipment: 'machine', type: 'compound' },
  { id: 'cardio_4', nameRu: 'Степпер', muscleGroup: 'Кардио', equipment: 'machine', type: 'compound' },
  { id: 'cardio_5', nameRu: 'Гребной тренажер', muscleGroup: 'Кардио', equipment: 'machine', type: 'compound' },
  { id: 'cardio_6', nameRu: 'Скакалка', muscleGroup: 'Кардио', equipment: 'bodyweight', type: 'compound' }
];

export const SPLIT_ARCHITECTURES = [
  { id: 'fullbody_1', name: 'Full Body (1 день)', days: 1 },
  { id: 'fullbody_2', name: 'Full Body (2 дня)', days: 2 },
  { id: 'fullbody_3', name: 'Full Body (3 дня)', days: 3 },
  { id: 'upper_lower_2', name: 'Верх / Низ (2 дня)', days: 2 },
  { id: 'upper_lower_4', name: 'Верх / Низ (4 дня)', days: 4 },
  { id: 'ppl_3', name: 'Push / Pull / Legs (3 дня)', days: 3 },
  { id: 'ppl_6', name: 'Push / Pull / Legs (6 дней)', days: 6 },
  { id: 'bro_4', name: 'Bro-split (4 дня)', days: 4 },
  { id: 'bro_5', name: 'Bro-split (5 дней)', days: 5 },
  { id: 'custom', name: 'Свой вариант', days: 1 }
];
