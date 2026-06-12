(function () {
  const body = document.body;
  const burger = document.querySelector(".burger");
  const nav = document.getElementById("mainNav");
  const modal = document.getElementById("requestModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalForm = document.getElementById("modalForm");
  const contactForm = document.getElementById("contactForm");
  const year = document.getElementById("year");

  const siteConfig = {
    phone: "+375291371216",
    email: "info@osbez.by",
    telegramBotEndpoint: "",
  };

  const mobileBreakpoint = 1180;

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  function isMobileHeader() {
    return window.innerWidth <= mobileBreakpoint;
  }

  function closeMobileNav() {
    if (!burger || !nav) return;

    nav.classList.remove("show");
    burger.classList.remove("active");
    burger.setAttribute("aria-expanded", "false");
    body.classList.remove("mobile-menu-open");
  }

  function openMobileNav() {
    if (!burger || !nav || !isMobileHeader()) return;

    nav.classList.add("show");
    burger.classList.add("active");
    burger.setAttribute("aria-expanded", "true");
    body.classList.add("mobile-menu-open");
  }

  if (burger && nav) {
    burger.addEventListener("click", function () {
      if (!isMobileHeader()) return;

      const isOpen = nav.classList.contains("show");

      if (isOpen) {
        closeMobileNav();
      } else {
        openMobileNav();
      }
    });

    nav.querySelectorAll("a, button[data-modal]").forEach(function (element) {
      element.addEventListener("click", closeMobileNav);
    });

    document.addEventListener("click", function (event) {
      if (!nav.classList.contains("show")) return;
      if (nav.contains(event.target) || burger.contains(event.target)) return;

      closeMobileNav();
    });

    window.addEventListener("resize", function () {
      if (!isMobileHeader()) {
        closeMobileNav();
      }
    });
  }

  function scrollToTop(event) {
    if (event) {
      event.preventDefault();
    }

    closeMobileNav();

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    if (window.location.hash) {
      history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search,
      );
    }
  }

  document.querySelectorAll("[data-scroll-top]").forEach(function (element) {
    element.addEventListener("click", scrollToTop);
  });

  function openModal(type, serviceName) {
    if (!modal || !modalForm || !modalTitle) return;

    closeMobileNav();

    modal.classList.remove("callback", "consultation");
    modal.classList.add(type === "callback" ? "callback" : "consultation");

    modalTitle.textContent =
      type === "callback"
        ? "Заказать обратный звонок"
        : "Заказать консультацию";

    modalForm.formType.value =
      type === "callback" ? "callback" : "consultation";

    const message = modalForm.querySelector('[name="message"]');
    if (message) {
      message.value = serviceName ? "Интересует: " + serviceName : "";
    }

    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
    body.classList.add("modal-open");

    const firstInput = modal.querySelector('input:not([type="hidden"])');
    if (firstInput) {
      setTimeout(function () {
        firstInput.focus();
      }, 50);
    }
  }

  function closeModal() {
    if (!modal) return;

    modal.classList.remove("show", "callback", "consultation");
    modal.setAttribute("aria-hidden", "true");
    body.classList.remove("modal-open");
  }

  document.querySelectorAll("[data-modal]").forEach(function (button) {
    button.addEventListener("click", function () {
      openModal(button.dataset.modal, button.dataset.service);
    });
  });

  document.querySelectorAll("[data-close-modal]").forEach(function (button) {
    button.addEventListener("click", closeModal);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeModal();
      closeMobileNav();
    }
  });

  document.querySelectorAll(".faq-item button").forEach(function (button) {
    button.addEventListener("click", function () {
      const item = button.closest(".faq-item");
      if (!item) return;

      item.classList.toggle("active");
    });
  });

  function validateForm(form) {
    const requiredFields = form.querySelectorAll("[required]");
    let isValid = true;

    requiredFields.forEach(function (field) {
      const value = field.value.trim();
      const fieldValid = value.length > 0;

      field.classList.toggle("error", !fieldValid);

      if (!fieldValid) {
        isValid = false;
      }
    });

    const emailField = form.querySelector('input[type="email"]');

    if (emailField && emailField.value.trim()) {
      const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        emailField.value.trim(),
      );

      emailField.classList.toggle("error", !emailValid);

      if (!emailValid) {
        isValid = false;
      }
    }

    const phoneField = form.querySelector('input[type="tel"]');

    if (phoneField && phoneField.value.trim()) {
      const digits = phoneField.value.replace(/\D/g, "");
      const phoneValid = digits.length >= 9;

      phoneField.classList.toggle("error", !phoneValid);

      if (!phoneValid) {
        isValid = false;
      }
    }

    return isValid;
  }

  function collectFormData(form) {
    const data = new FormData(form);

    return {
      formType: data.get("formType") || "contact",
      company: data.get("company") || "",
      name: data.get("name") || "",
      phone: data.get("phone") || "",
      email: data.get("email") || "",
      message: data.get("message") || "",
      sourcePhone: siteConfig.phone,
      sourceEmail: siteConfig.email,
    };
  }

  function setStatus(form, type, text) {
    const status = form.querySelector(".form-status");

    if (!status) return;

    status.className = "form-status " + type;
    status.textContent = text;
  }

  function handleSubmit(form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      if (!validateForm(form)) {
        setStatus(
          form,
          "error",
          "Проверьте обязательные поля и попробуйте еще раз.",
        );

        return;
      }

      const payload = collectFormData(form);

      console.log("Новая заявка:", payload);

      if (siteConfig.telegramBotEndpoint) {
        fetch(siteConfig.telegramBotEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).catch(function () {
          console.warn("Не удалось отправить заявку в указанный endpoint.");
        });
      }

      setStatus(
        form,
        "success",
        "Спасибо! Мы свяжемся с вами в ближайшее время.",
      );

      form.reset();

      if (form === modalForm) {
        setTimeout(closeModal, 1400);
      }
    });
  }

  if (modalForm) handleSubmit(modalForm);
  if (contactForm) handleSubmit(contactForm);

  const revealItems = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );

    revealItems.forEach(function (item) {
      observer.observe(item);
    });
  } else {
    revealItems.forEach(function (item) {
      item.classList.add("visible");
    });
  }
})();
