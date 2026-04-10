import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import Header from "../components/Header";
import { useLang } from "../LangContext";
import { AUTH_DEFAULT_EMOJI, useAuth } from "../AuthContext";

const EMOJI_PRESET = [
  "⚡️", "🔥", "🪩", "🌈", "🦊", "🐙", "🐼", "🦄", "🍓", "🍀",
  "🌊", "🌙", "☀️", "🛰️", "🎧", "🎮", "📎", "🧠", "💎", "🪐",
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function messageForError(error, t) {
  if (!error?.code) return error?.message || t.errorGeneric;
  switch (error.code) {
    case "user/email_exists":
      return t.authErrorEmailExists;
    case "user/username_exists":
      return t.authErrorUsernameExists;
    case "auth/incorrect_email_or_password":
      return t.authErrorInvalidCredentials;
    case "auth/not_authenticated":
      return t.authErrorNotAuthenticated;
    case "auth/token_expired":
      return t.authErrorTokenExpired;
    default:
      return error.message || t.errorGeneric;
  }
}

const fieldClass = (isError) =>
  `mt-2 w-full rounded-2xl border px-4 py-3 outline-none transition font-mono text-base placeholder:font-mono ${
    isError
      ? "border-red-500/70 focus:border-red-500 focus:ring-2 focus:ring-red-500/30 bg-red-500/5 shadow-[inset_0_2px_12px_rgba(239,68,68,0.15)]"
      : "border-white/50 dark:border-white/10 bg-white/25 dark:bg-black/30 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 shadow-[inset_0_2px_12px_rgba(0,0,0,0.08)] dark:shadow-[inset_0_2px_10px_0_rgba(255,255,255,0.05)]"
  }`;

const AuthTabSwitch = ({ tab, onSwitch, t }) => (
  <div className="w-full max-w-xl relative rounded-3xl border border-white/45 dark:border-white/10 bg-white/50 dark:bg-slate-900/35 backdrop-blur-[35px] p-1.5 shadow-lg dark:shadow-2xl overflow-hidden">
    <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-blue-500/8 via-transparent to-purple-500/8" />
    <div className="relative grid grid-cols-2 gap-1">
      <button
        type="button"
        onClick={() => onSwitch("login")}
        className="cursor-pointer relative py-3 rounded-2xl font-display font-bold text-sm sm:text-base"
      >
        {tab === "login" && (
          <motion.div
            layoutId="auth-tab-pill"
            transition={{ type: "spring", stiffness: 420, damping: 35 }}
            className="absolute inset-0 rounded-2xl bg-blue-500/18 dark:bg-blue-500/25 border border-blue-400/40 shadow-[0_8px_25px_rgba(59,130,246,0.22)]"
          />
        )}
        <span className={`relative z-10 ${tab === "login" ? "text-blue-700 dark:text-white" : "text-slate-600 dark:text-slate-300"}`}>
          {t.signIn}
        </span>
      </button>

      <button
        type="button"
        onClick={() => onSwitch("register")}
        className="cursor-pointer relative py-3 rounded-2xl font-display font-bold text-sm sm:text-base"
      >
        {tab === "register" && (
          <motion.div
            layoutId="auth-tab-pill"
            transition={{ type: "spring", stiffness: 420, damping: 35 }}
            className="absolute inset-0 rounded-2xl bg-blue-500/18 dark:bg-blue-500/25 border border-blue-400/40 shadow-[0_8px_25px_rgba(59,130,246,0.22)]"
          />
        )}
        <span className={`relative z-10 ${tab === "register" ? "text-blue-700 dark:text-white" : "text-slate-600 dark:text-slate-300"}`}>
          {t.signUp}
        </span>
      </button>
    </div>
  </div>
);

const AuthPage = ({ defaultTab = "login" }) => {
  const MotionDiv = motion.div;
  const MotionButton = motion.button;
  const { t } = useLang();
  const { login, register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState(defaultTab);
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorField, setErrorField] = useState(null);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    emoji: AUTH_DEFAULT_EMOJI,
  });

  useEffect(() => {
    setTab(defaultTab);
    setStep(0);
    setErrorField(null);
  }, [defaultTab]);

  useEffect(() => {
    if (isAuthenticated) navigate("/", { replace: true });
  }, [isAuthenticated, navigate]);

  const title = useMemo(() => {
    if (tab === "register" && step === 1) return t.registerContinueTitle;
    return tab === "register" ? t.registerTitle : t.loginTitle;
  }, [step, t, tab]);

  const subtitle = useMemo(() => {
    if (tab === "register" && step === 1) return t.registerContinueSubtitle;
    return tab === "register" ? t.registerSubtitle : t.loginSubtitle;
  }, [step, t, tab]);

  const switchTab = (nextTab) => {
    setTab(nextTab);
    setStep(0);
    setErrorField(null);
    navigate(nextTab === "register" ? "/register" : "/login");
  };

  const validateCredentialsStep = () => {
    if (tab === "register" && !form.username.trim()) {
      setErrorField("username");
      toast.error(t.authErrorFillRequired);
      return false;
    }
    if (!form.email.trim()) {
      setErrorField("email");
      toast.error(t.authErrorFillRequired);
      return false;
    }
    if (!EMAIL_RE.test(form.email.trim())) {
      setErrorField("email");
      toast.error(t.authErrorInvalidEmail || "Введите корректный email");
      return false;
    }
    if (!form.password.trim() || form.password.length < 8) {
      setErrorField("password");
      toast.error(t.passwordPlaceholder);
      return false;
    }
    return true;
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (isLoading) return;
    setErrorField(null);

    if (!validateCredentialsStep()) return;

    if (tab === "register" && step === 0) {
      toast.success(t.authStepContinue);
      setStep(1);
      return;
    }

    setIsLoading(true);
    try {
      if (tab === "login") {
        await login({ email: form.email.trim(), password: form.password });
        toast.success(t.authLoginSuccess);
      } else {
        await register({
          username: form.username.trim(),
          email: form.email.trim(),
          password: form.password,
          emoji: form.emoji,
        });
        toast.success(t.authRegisterSuccess);
      }
      navigate("/", { replace: true });
    } catch (error) {
      toast.error(messageForError(error, t));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-slate-800 dark:text-slate-200 font-sans selection:bg-blue-500/30 relative overflow-hidden transition-colors duration-500">
      <div className="fixed top-[-20%] sm:top-[-15%] left-[50%] -translate-x-1/2 w-[300px] sm:w-[800px] h-[300px] sm:h-[400px] rounded-[100%] bg-blue-500/10 dark:bg-blue-500/20 blur-[120px] sm:blur-[140px] pointer-events-none z-0 animate-float-delayed" />
      <div className="fixed top-[-10%] left-[-10%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full bg-blue-500/20 dark:bg-blue-600/30 blur-[110px] sm:blur-[130px] pointer-events-none z-0 animate-float" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[350px] sm:w-[600px] h-[350px] sm:h-[600px] rounded-full bg-purple-500/10 dark:bg-purple-600/20 blur-[130px] sm:blur-[150px] pointer-events-none z-0 animate-float-delayed" />
      <div className="fixed top-[30%] left-[40%] w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 blur-[100px] sm:blur-[120px] pointer-events-none z-0 animate-float" />

      <Header />

      <main className="min-h-screen max-w-4xl mx-auto px-4 sm:px-6 pt-28 sm:pt-32 pb-10 flex flex-col items-center justify-center gap-4 sm:gap-6">
        <MotionDiv
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <h1 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">{title}</h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">{subtitle}</p>
        </MotionDiv>

        <AuthTabSwitch tab={tab} onSwitch={switchTab} t={t} />

        <form onSubmit={onSubmit} noValidate className="w-full max-w-xl space-y-4">
          <AnimatePresence mode="wait">
            {(tab === "login" || step === 0) && (
              <MotionDiv
                key={`${tab}-step0`}
                layout
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
                className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-[40px] transform-gpu border border-white/50 dark:border-white/10 shadow-lg dark:shadow-2xl rounded-3xl p-4 sm:p-6 relative overflow-hidden transition-shadow duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent dark:from-white/5 pointer-events-none" />
                <div className="relative z-10 space-y-4">
                  {tab === "register" && (
                    <label className="block">
                      <span className="text-sm sm:text-base font-display font-semibold text-slate-600 dark:text-slate-300">{t.usernameLabel}</span>
                      <input
                        type="text"
                        value={form.username}
                        onChange={(e) => {
                          setForm((prev) => ({ ...prev, username: e.target.value }));
                          if (errorField === "username") setErrorField(null);
                        }}
                        className={fieldClass(errorField === "username")}
                        placeholder={t.usernamePlaceholder}
                        maxLength={20}
                        aria-invalid={errorField === "username"}
                      />
                    </label>
                  )}

                  <label className="block">
                    <span className="text-sm sm:text-base font-display font-semibold text-slate-600 dark:text-slate-300">Email</span>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => {
                        setForm((prev) => ({ ...prev, email: e.target.value }));
                        if (errorField === "email") setErrorField(null);
                      }}
                      className={fieldClass(errorField === "email")}
                      placeholder="you@example.com"
                      aria-invalid={errorField === "email"}
                    />
                  </label>

                  <label className="block">
                    <span className="text-sm sm:text-base font-display font-semibold text-slate-600 dark:text-slate-300">Password</span>
                    <input
                      type="password"
                      value={form.password}
                      onChange={(e) => {
                        setForm((prev) => ({ ...prev, password: e.target.value }));
                        if (errorField === "password") setErrorField(null);
                      }}
                      className={fieldClass(errorField === "password")}
                      placeholder={t.passwordPlaceholder}
                      aria-invalid={errorField === "password"}
                    />
                  </label>
                </div>
              </MotionDiv>
            )}

            {tab === "register" && step === 1 && (
              <MotionDiv
                key="register-step1"
                layout
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
                className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-[40px] transform-gpu border border-white/50 dark:border-white/10 shadow-lg dark:shadow-2xl rounded-3xl p-4 sm:p-6 relative overflow-hidden transition-shadow duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent dark:from-white/5 pointer-events-none" />
                <div className="relative z-10 space-y-4">
                  <div className="rounded-3xl border border-white/40 dark:border-white/10 bg-white/30 dark:bg-black/20 p-4 sm:p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">{t.selectedEmoji}</p>
                        <p className="font-semibold text-slate-700 dark:text-slate-200">{t.avatarPreview}</p>
                      </div>
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/60 dark:bg-slate-900/60 text-3xl border border-white/40 dark:border-white/10">
                        {form.emoji || AUTH_DEFAULT_EMOJI}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-5 gap-2">
                    {EMOJI_PRESET.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => {
                          setForm((prev) => ({ ...prev, emoji }));
                          toast.success(`${t.selectedEmoji}: ${emoji}`);
                        }}
                        className={`cursor-pointer h-12 rounded-2xl border transition-all flex items-center justify-center text-2xl ${
                          form.emoji === emoji
                            ? "bg-blue-500/15 border-blue-400 shadow-[0_0_20px_rgba(37,99,235,0.2)]"
                            : "bg-white/35 dark:bg-black/20 border-white/50 dark:border-white/10 hover:border-blue-300"
                        }`}
                        aria-label={`emoji ${emoji}`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </MotionDiv>
            )}
          </AnimatePresence>

          <div className="bg-white/50 dark:bg-slate-900/35 backdrop-blur-[30px] border border-white/50 dark:border-white/10 rounded-3xl shadow-lg dark:shadow-2xl p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              {tab === "register" && step === 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="order-2 sm:order-1 w-full sm:w-auto cursor-pointer inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-base font-display font-bold border border-white/50 dark:border-white/10 bg-white/35 dark:bg-black/20 hover:bg-white/60 dark:hover:bg-black/35 transition"
                >
                  <ArrowLeft size={16} />
                  {t.back}
                </button>
              ) : (
                <Link
                  to="/"
                  className="order-2 sm:order-1 w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-base font-display font-bold border border-white/50 dark:border-white/10 bg-white/35 dark:bg-black/20 hover:bg-white/60 dark:hover:bg-black/35 transition"
                >
                  <ArrowLeft size={16} />
                  {t.goHome}
                </Link>
              )}

              <MotionButton
                type="submit"
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.02 }}
                disabled={isLoading}
                className="order-1 sm:order-2 w-full sm:w-auto cursor-pointer bg-blue-500/15 dark:bg-blue-600/20 backdrop-blur-xl border border-blue-500/30 dark:border-blue-400/40 border-t-blue-400/20 dark:border-t-white/20 text-blue-600 dark:text-white font-display font-black text-base px-5 py-3 sm:h-12 rounded-2xl transition-all flex items-center justify-center gap-2 group/btn active:scale-[0.97] shrink-0 shadow-xl dark:shadow-[0_0_25px_rgba(37,99,235,0.15)] overflow-hidden relative disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    {t.loading}
                  </>
                ) : tab === "register" && step === 0 ? (
                  <>
                    {t.continue}
                    <ArrowRight size={16} />
                  </>
                ) : (
                  <>
                    {tab === "register" ? t.createAccount : t.signIn}
                    {tab === "register" ? <Sparkles size={16} /> : <Check size={16} />}
                  </>
                )}
                <MotionDiv
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/40 via-indigo-500/50 via-purple-400/40 to-transparent -skew-x-[20deg] blur-md"
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ repeat: Infinity, duration: 6, ease: "linear", repeatDelay: 0.5 }}
                />
              </MotionButton>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
};

export default AuthPage;

