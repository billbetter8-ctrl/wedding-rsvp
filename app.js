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
  drinks: [],
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

  // ✅ ИСПРАВЛЕНО: учитываем, был ли выбран только первый день
  function nextScreen(field) {
    switch (field) {
      case "attendance": return "days";
      case "days": return "guests";
      case "guests":
        // Если только первый день — пропускаем алкоголь
        return state.days === "first" ? "comment" : "alcohol";
      case "alcohol": return "comment";
      default: return null;
    }
  }

  // Первый экран → attendance
  const welcomeNext = document.querySelector("[data-screen='welcome'] [data-next]");
  if (welcomeNext) {
    welcomeNext.addEventListener("click", () => show("attendance"));
  }

  // Все кнопки выбора
  document.querySelectorAll("[data-field]").forEach(button => {
    button.addEventListener("click", () => {
      const field = button.dataset.field;
      const value = button.dataset.value;
      state[field] = value;

      // Выделяем выбранный вариант
      document
        .querySelectorAll(`[data-field="${field}"]`)
        .forEach(item => item.classList.remove("selected"));
      button.classList.add("selected");

      // Если гость не сможет прийти — сразу к комментарию
      if (field === "attendance" && value === "no") {
        const progress = document.querySelector("[data-screen='comment'] .progress");
        if (progress) progress.textContent = "02 / 02";
        show("comment");
        return;
      }

      // Показываем поле "другой вариант"
      if (field === "guests") {
        const wrap = document.getElementById("guestsOtherWrap");
        if (wrap) wrap.classList.toggle("visible", value === "other");
      }

      // Для алкоголя
      if (field === "alcohol") {
        const details = document.getElementById("alcoholDetails");
        const drinkList = document.getElementById("drinkList");
        const title = document.getElementById("alcoholCommentTitle");
        const area = document.getElementById("alcoholComment");

        if (details) details.classList.add("visible");
        if (drinkList) drinkList.classList.toggle("visible", value === "yes");

        if (value === "yes") {
          if (title) title.textContent = "Комментарий";
          if (area) area.placeholder = "Например: белое сухое, без крепкого";
        } else {
          if (title) title.textContent = "Что будете пить?";
          if (area) area.placeholder = "Например: яблочный сок, лимонад";
          state.drinks = [];
          document.querySelectorAll("[data-drink]").forEach(chip => chip.classList.remove("selected"));
        }
        return;
      }

      // Остальные этапы переключаются после выбора
      if (button.dataset.next !== undefined) {
        const next = nextScreen(field);
        if (next) setTimeout(() => show(next), 120);
      }
    });
  });

  // Выбор напитков (можно несколько)
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

  // Кнопка "Продолжить" после алкоголя
  const alcoholNext = document.getElementById("alcoholNext");
  if (alcoholNext) {
    alcoholNext.addEventListener("click", () => show("comment"));
  }

  // Отправка формы
  const submitBtn = document.getElementById("submit");
  if (submitBtn) {
    submitBtn.addEventListener("click", async () => {
      const error = document.getElementById("error");
      const button = document.getElementById("submit");
      if (error) error.textContent = "";

      state.guestsOther = (document.getElementById("guestsOther")?.value || "").trim();
      state.alcoholComment = (document.getElementById("alcoholComment")?.value || "").trim();
      state.comment = (document.getElementById("comment")?.value || "").trim();

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
        launchConfetti();
      } catch (e) {
        console.error(e);
        if (error) {
          error.textContent = e.message === "Не настроен URL Google Apps Script."
            ? "Сервис временно недоступен. Свяжитесь с нами напрямую."
            : "Не удалось отправить ответ. Проверьте интернет и попробуйте ещё раз.";
        }
        button.disabled = false;
        button.textContent = "Отправить ответ";
      }
    });
  }

  // Показываем первый экран при загрузке
  show("welcome");
});

// ===== Конфетти на экране успеха =====
function launchConfetti() {
  const container = document.getElementById("confetti");
  if (!container) return;
  const colors = ["#8d6f61", "#c9bcb0", "#f5ede6", "#ded7cf", "#fffdf9"];
  container.innerHTML = "";
  for (let i = 0; i < 50; i++) {
    const piece = document.createElement("div");
    piece.className = "confetti-piece";
    piece.style.left = Math.random() * 100 + "%";
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDuration = (Math.random() * 2 + 2) + "s";
    piece.style.animationDelay = Math.random() * 0.5 + "s";
    piece.style.width = (Math.random() * 8 + 6) + "px";
    piece.style.height = piece.style.width;
    piece.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";
    container.appendChild(piece);
  }
  setTimeout(() => { container.innerHTML = ""; }, 5000);
}