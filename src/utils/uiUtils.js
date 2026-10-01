export const showConfirm = (message) => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.showConfirm) {
      window.Telegram.WebApp.showConfirm(message, (agreed) => {
        resolve(agreed);
      });
    } else {
      resolve(window.confirm(message));
    }
  });
};

export const showAlert = (message) => {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp?.showAlert) {
    window.Telegram.WebApp.showAlert(message);
  } else {
    window.alert(message);
  }
};
