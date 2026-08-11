const CONFIG = {
  apiUrl: atob("aHR0cHM6Ly9zY3JpcHQuZ29vZ2xlLmNvbS9tYWNyb3Mvcy9BS2Z5Y2J4U3p0MkRLZkVsVU1ucVJ4SlNoaXV4am9peFBCcGcxakJQRmpaMm9HMVZKeHRqYm5yeUFka1ZDcHNTQ2tnTHo3bllldy9leGVj")
};

const state = {
  guestId: new URLSearchParams(window.location.search).get("guest") || "",
  attendance: "",
  days: "",
  guests: "",
  guestsOther: "",
  alcohol: "",
  drinks: [],          // выбранные напитки
  alcoholComment: "",
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
     case "attendance": return "days";
     case "days": return "guests";
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
// "Да" показывает список напитков и комментарий.
// "Нет" показывает только комментарий (сок / лимонад).
// В обоих случаях дальше — по кнопке "Продолжить".
if (field === "alcohol") {
  document.getElementById("alcoholDetails").classList.add("visible");
  document.getElementById("drinkList").classList.toggle("visible", value === "Алкаш");

  const title = document.getElementById("alcoholCommentTitle");
  const area = document.getElementById("alcoholComment");

  if (value === "yes") {
    title.textContent = "Комментарий";
    area.placeholder = "Например: белое сухое, без крепкого";
  } else {
    title.textContent = "Что будете пить?";
    area.placeholder = "Например: яблочный сок, лимонад";
    // Снимаем выбор напитков, если он был.
    state.drinks = [];
    document.querySelectorAll("[data-drink]").forEach(chip => chip.classList.remove("selected"));
  }
  return;
}

      // Остальные этапы переключаются после выбора.
      if (button.dataset.next !== undefined) {
        const next = nextScreen(field);
        if (next) setTimeout(() => show(next), 120);
      }
    });
  });

  // Выбор напитков: можно отметить несколько.
  document.querySelectorAll("[data-drink]").forEach(chip => {
    chip.addEventListener("click", () => {
      const name = chip.dataset.drink;
      chip.classList.toggle("selected");
      if (state.drinks.includes(name)) {
        state.drinks = state.drinks.filter(item => item !== name);
      } else {
        state.drinks.push(name);
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
    state.alcoholComment = document.getElementById("alcoholComment").value.trim();
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
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          ...state,
          drinks: state.drinks.join(", "),
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