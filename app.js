const CONFIG = {
  // После публикации Google Apps Script вставьте сюда URL веб-приложения.
  apiUrl: "PASTE_GOOGLE_APPS_SCRIPT_URL_HERE"
};

const state = {
  guestId: new URLSearchParams(window.location.search).get("guest") || "",
  attendance: "",
  guests: "",
  guestsOther: "",
  alcohol: "",
  wine: "",
  spirits: "",
  beer: "",
  otherAlcohol: "",
  drinks: "",
  comment: ""
};

document.addEventListener("DOMContentLoaded", () => {
  const screens = [...document.querySelectorAll(".screen")];

  function show(name) {
    const target = screens.find(screen => screen.dataset.screen === name);
    if (!target) return;

    screens.forEach(screen => screen.classList.remove("active"));
    target.classList.add("active");
    window.scrollTo(0, 0);
  }

  function nextScreen(field) {
    switch (field) {
      case "attendance": return "guests";
      case "guests": return "alcohol";
      case "alcohol": return "comment";
      default: return null;
    }
  }

  // Переход с первого экрана.
  document.querySelector("[data-screen='welcome'] [data-next]")
    .addEventListener("click", () => show("attendance"));

  // Все кнопки выбора.
  document.querySelectorAll("[data-field]").forEach(button => {
    button.addEventListener("click", () => {
      const field = button.dataset.field;
      const value = button.dataset.value;

      state[field] = value;

      // Выделяем выбранный вариант.
      document
        .querySelectorAll(`[data-field="${field}"]`)
        .forEach(item => item.classList.remove("selected"));

      button.classList.add("selected");

      // Если гость не сможет прийти — сразу к комментарию.
      if (field === "attendance" && value === "no") {
        const progress = document.querySelector("[data-screen='comment'] .progress");
        progress.textContent = "02 / 02";
        show("comment");
        return;
      }

      // Показываем поле "другой вариант".
      if (field === "guests") {
        document
          .getElementById("guestsOther")
          .classList.toggle("visible", value === "other");
      }

      // Для алкоголя:
      // "Да" раскрывает дополнительные поля и НЕ переключает экран.
      // "Нет" сразу переходит дальше.
      if (field === "alcohol") {
        const details = document.getElementById("alcoholDetails");
        details.classList.toggle("visible", value === "yes");

        if (value === "yes") {
          return;
        }

        setTimeout(() => show("comment"), 120);
        return;
      }

      // Остальные этапы переключаются после выбора.
      if (button.dataset.next !== undefined) {
        const next = nextScreen(field);
        if (next) {
          setTimeout(() => show(next), 120);
        }
      }
    });
  });

  document.getElementById("alcoholNext").addEventListener("click", () => {
    show("comment");
  });

  document.getElementById("submit").addEventListener("click", async () => {
    const error = document.getElementById("error");
    const button = document.getElementById("submit");

    error.textContent = "";

    state.guestsOther = document.getElementById("guestsOther").value.trim();
    state.wine = document.getElementById("wine").value;
    state.spirits = document.getElementById("spirits").value;
    state.beer = document.getElementById("beer").value;
    state.otherAlcohol = document.getElementById("otherAlcohol").value;
    state.drinks = document.getElementById("drinks").value.trim();
    state.comment = document.getElementById("comment").value.trim();

    if (!state.attendance) {
      show("attendance");
      return;
    }

    button.disabled = true;
    button.textContent = "Отправляем…";

    try {
      if (CONFIG.apiUrl === "PASTE_GOOGLE_APPS_SCRIPT_URL_HERE") {
        throw new Error("Не настроен URL Google Apps Script.");
      }

      const response = await fetch(CONFIG.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify({
          ...state,
          submittedAt: new Date().toISOString()
        })
      });

      const result = await response.json();

      if (!result.ok) {
        throw new Error(result.error || "Ошибка сохранения");
      }

      show("success");
    } catch (e) {
      console.error(e);
      error.textContent = "Не удалось отправить ответ. Попробуйте ещё раз.";
      button.disabled = false;
      button.textContent = "Отправить ответ";
    }
  });
});
