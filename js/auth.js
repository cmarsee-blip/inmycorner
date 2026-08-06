/* ============================================================
   InMyCorner — Auth & Signup
   Handles: modal open/close, panel switching, and submitting
            the parent/athlete and mentor signup forms to Supabase.
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.getElementById("modalOverlay");
  const closeBtn = document.getElementById("modalClose");
  const panels = {
    chooser: document.getElementById("panelChooser"),
    family: document.getElementById("panelFamily"),
    mentor: document.getElementById("panelMentor"),
    success: document.getElementById("panelSuccess"),
  };

  function showPanel(name) {
    Object.values(panels).forEach((p) => (p.hidden = true));
    panels[name].hidden = false;
  }

  window.openModal = function (panelName = "chooser") {
    showPanel(panelName);
    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
  };

  window.closeModal = function () {
    overlay.classList.remove("open");
    document.body.style.overflow = "";
  };

  closeBtn.addEventListener("click", closeModal);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
  });

  // Chooser buttons ("I'm a parent" / "I'm an athlete")
  document.querySelectorAll(".modal-choice").forEach((btn) => {
    btn.addEventListener("click", () => showPanel(btn.dataset.open));
  });

  function showError(el, message) {
    el.textContent = message;
    el.hidden = false;
  }

  /* ──────────────────────────────────────────
     PARENT / ATHLETE (CHILD) SIGNUP
  ────────────────────────────────────────── */
  const familyForm = document.getElementById("familyForm");
  const familyError = document.getElementById("familyError");

  familyForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    familyError.hidden = true;

    const fd = new FormData(familyForm);
    const submitBtn = familyForm.querySelector(".modal-submit");
    submitBtn.disabled = true;
    submitBtn.textContent = "Creating profile...";

    try {
      // Create the auth user. The profile row in `families` is created
      // automatically by a database trigger (see supabase-schema.sql),
      // using the metadata passed in `options.data` below — this works
      // whether or not email confirmation is required.
      const { error: authError } = await supabaseClient.auth.signUp({
        email: fd.get("parent_email"),
        password: fd.get("password"),
        options: {
          data: {
            signup_type: "family",
            parent_name: fd.get("parent_name"),
            athlete_name: fd.get("athlete_name"),
            athlete_age: fd.get("athlete_age"),
            athlete_grade: fd.get("athlete_grade") || "",
            sport: fd.get("sport"),
          },
        },
      });

      if (authError) throw authError;

      document.getElementById("successMsg").textContent =
        "Check your email to confirm your account, then we'll start matching your child with a mentor.";
      showPanel("success");
      familyForm.reset();
    } catch (err) {
      showError(
        familyError,
        err.message || "Something went wrong. Please try again.",
      );
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Create Profile";
    }
  });

  /* ──────────────────────────────────────────
     ATHLETE MENTOR SIGNUP
  ────────────────────────────────────────── */
  const mentorForm = document.getElementById("mentorForm");
  const mentorError = document.getElementById("mentorError");

  mentorForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    mentorError.hidden = true;

    const fd = new FormData(mentorForm);
    const submitBtn = mentorForm.querySelector(".modal-submit");
    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting...";

    try {
      // Create the auth user. The profile row in `mentors` is created
      // automatically by a database trigger (see supabase-schema.sql).
      const { error: authError } = await supabaseClient.auth.signUp({
        email: fd.get("email"),
        password: fd.get("password"),
        options: {
          data: {
            signup_type: "mentor",
            full_name: fd.get("full_name"),
            sport: fd.get("sport"),
            level: fd.get("level"),
            team_or_school: fd.get("team_or_school") || "",
            bio: fd.get("bio") || "",
          },
        },
      });

      if (authError) throw authError;

      document.getElementById("successMsg").textContent =
        "Check your email to confirm your account. We'll email you next steps for your background check before you're matched.";
      showPanel("success");
      mentorForm.reset();
    } catch (err) {
      showError(
        mentorError,
        err.message || "Something went wrong. Please try again.",
      );
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Apply to Volunteer";
    }
  });
});
