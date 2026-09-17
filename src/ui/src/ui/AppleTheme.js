// Единая дизайн-система в стиле Apple iOS UI Kit (Human Interface Guidelines)
export const appleTheme = {
  // Цветовая палитра Apple Light Mode
  colors: {
    bg: '#F2F2F7',          // Фирменный системный светло-серый фон iOS
    cardBg: '#FFFFFF',      // Кристально-белая карточка
    primaryText: '#000000', // Основной черный текст
    secondaryText: '#8E8E93',// Вторичный серый текст
    accentBlue: '#007AFF',  // Системный синий Apple
    accentGreen: '#34C759', // Зеленый (статусы, успех)
    accentOrange: '#FF9500',// Оранжевый акцент
    accentRed: '#FF3B30',   // Красный (удаление, ошибки)
    separator: '#C6C6C8',   // Тонкие линии разделения
    groupedBg: '#F9F9FB',   // Подложки
  },
  
  // Готовые стили токенов под компоненты из Figma
  styles: {
    card: "bg-white rounded-[20px] p-4 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-black/[0.04]",
    cardLarge: "bg-white rounded-[24px] p-5 shadow-[0_6px_24px_rgba(0,0,0,0.04)] border border-black/[0.04]",
    buttonPrimary: "w-full py-3.5 rounded-[16px] bg-[#007AFF] text-white font-semibold text-[16px] tracking-tight shadow-[0_4px_14px_rgba(0,122,255,0.3)] hover:bg-[#0056B3] active:scale-[0.98] transition-all",
    sectionTitle: "text-[13px] font-normal text-[#6C6C70] px-3 uppercase tracking-wide mb-2",
    fontFamily: "font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Display','SF_Pro_Text','Helvetica_Neue',sans-serif]"
  }
};
