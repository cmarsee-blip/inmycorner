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
      // 1. Create the auth user
      const { data: authData, error: authError } =
        await supabaseClient.auth.signUp({
          email: fd.get("parent_email"),
          password: fd.get("password"),
        });

      if (authError) throw authError;

      // 2. Insert the family/athlete profile row, linked to that user
      const { error: insertError } = await supabaseClient
        .from("families")
        .insert({
          id: authData.user.id,
          parent_name: fd.get("parent_name"),
          parent_email: fd.get("parent_email"),
          athlete_name: fd.get("athlete_name"),
          athlete_age: Number(fd.get("athlete_age")),
          athlete_grade: fd.get("athlete_grade") || null,
          sport: fd.get("sport"),
        });

      if (insertError) throw insertError;

      document.getElementById("successMsg").textContent =
        "Check your email to confirm your account, then we'll start matching your child with a mentor.";
      showPanel("success");
      familyForm.reset();
    } catch (err) {
      showError(familyError, err.message || "Something went wrong. Please try again.");
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
      // 1. Create the auth user
      const { data: authData, error: authError } =
        await supabaseClient.auth.signUp({
          email: fd.get("email"),
          password: fd.get("password"),
        });

      if (authError) throw authError;

      // 2. Insert the mentor profile row. background_check_status
      //    defaults to 'pending' — a mentor is NOT matchable until
      //    that's updated to 'cleared' (done server-side after the
      //    background check API call completes).
      const { error: insertError } = await supabaseClient
        .from("mentors")
        .insert({
          id: authData.user.id,
          full_name: fd.get("full_name"),
          email: fd.get("email"),
          sport: fd.get("sport"),
          level: fd.get("level"),
          team_or_school: fd.get("team_or_school") || null,
          bio: fd.get("bio") || null,
        });

      if (insertError) throw insertError;

      document.getElementById("successMsg").textContent =
        "Check your email to confirm your account. We'll email you next steps for your background check before you're matched.";
      showPanel("success");
      mentorForm.reset();
    } catch (err) {
      showError(mentorError, err.message || "Something went wrong. Please try again.");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Apply to Volunteer";
    }
  });
});
