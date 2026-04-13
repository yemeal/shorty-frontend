import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import Header from "../components/Header";
import { useLang } from "../LangContext";
import { AUTH_DEFAULT_EMOJI, useAuth } from "../AuthContext";
import { MOTION_EASE_SMOOTH } from "../lib/motionTokens";
import PageHeaderReveal from "../components/PageHeaderReveal";
import AppBackground from "../shared/ui/AppBackground";
import { GlassSecondaryLink } from "../shared/ui/GlassSecondaryAction";
import { EMAIL_RE, messageForAuthError } from "../features/auth/lib/authValidation";
import AuthTabSwitch from "../features/auth/ui/AuthTabSwitch";

const EMOJI_PRESET = [
  "⚡️", "🔥", "🪩", "🌈", "🦊", "🐙", "🐼", "🦄", "🍓", "🍀",
  "🌊", "🌙", "☀️", "🛰️", "🎧", "🎮", "📎", "🧠", "💎", "🪐",
];

const IS_TEST_ENV = import.meta.env.MODE === "test";

const fieldClass = (isError) =>
  `mt-2 w-full rounded-2xl border px-4 py-3 outline-none transition font-mono text-base tracking-[0.01em] placeholder:font-mono placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-800 dark:text-white ${
    isError
      ? "border-red-500/70 focus:border-red-500 focus:ring-2 focus:ring-red-500/30 bg-red-500/5 shadow-[inset_0_2px_12px_rgba(239,68,68,0.15)]"
      : "border-white/50 dark:border-white/10 bg-white/25 dark:bg-black/30 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 shadow-[inset_0_2px_12px_rgba(0,0,0,0.08)] dark:shadow-[inset_0_2px_10px_0_rgba(255,255,255,0.05)]"
  }`;

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
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [step0Expanded, setStep0Expanded] = useState(IS_TEST_ENV && (defaultTab === "login" || defaultTab === "register"));
  const [step1Expanded, setStep1Expanded] = useState(IS_TEST_ENV ? defaultTab === "register" && step === 1 : false);
  const didInitialDropletRef = useRef(IS_TEST_ENV);
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

  useEffect(() => {
    const shouldShowStep0 = tab === "login" || step === 0;
    const shouldShowStep1 = tab === "register" && step === 1;

    if (IS_TEST_ENV) {
      setStep0Expanded(shouldShowStep0);
      setStep1Expanded(shouldShowStep1);
      return undefined;
    }

    if (!didInitialDropletRef.current) {
      setStep0Expanded(false);
      setStep1Expanded(false);
      const id = window.setTimeout(() => {
        setStep0Expanded(shouldShowStep0);
        setStep1Expanded(shouldShowStep1);
        didInitialDropletRef.current = true;
      }, 24);
      return () => window.clearTimeout(id);
    }

    setStep0Expanded(shouldShowStep0);
    setStep1Expanded(shouldShowStep1);
    return undefined;
  }, [step, tab]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape" && document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

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
      toast.error(messageForAuthError(error, t));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-slate-800 dark:text-slate-200 font-sans selection:bg-blue-500/30 relative overflow-hidden transition-colors duration-500">
      <AppBackground />

      <Header />

      <main className="min-h-screen max-w-4xl mx-auto px-4 sm:px-6 pt-28 sm:pt-32 pb-10 flex flex-col items-center justify-center gap-5 sm:gap-6">
        <PageHeaderReveal
          title={title}
          subtitle={subtitle}
          className="text-center space-y-2"
          titleClassName="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white"
          subtitleClassName="text-sm sm:text-base text-slate-600 dark:text-slate-400"
        />

        <AuthTabSwitch tab={tab} onSwitch={switchTab} t={t} />

        <form onSubmit={onSubmit} noValidate className="w-full max-w-xl space-y-4 sm:space-y-4 pb-3 dark:pb-0">
            <div
              className={`grid origin-center mx-auto transition-[grid-template-rows,width] duration-[400ms] ease-[cubic-bezier(0.23,1,0.32,1)] ${
                step0Expanded ? "grid-rows-[1fr] w-full" : "grid-rows-[0fr] w-36 sm:w-40"
              }`}
            >
              <div className="overflow-hidden min-h-0 px-1 pb-1">
                <MotionDiv
                  initial={false}
                  animate={{ opacity: step0Expanded ? 1 : 0 }}
                  transition={{ duration: 0.28, ease: MOTION_EASE_SMOOTH }}
                  className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-[40px] transform-gpu border border-white/50 dark:border-white/10 shadow-lg dark:shadow-2xl rounded-3xl p-4 sm:p-6 pb-7 sm:pb-9 dark:pb-6 relative overflow-hidden transition-shadow duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent dark:from-white/5 pointer-events-none" />
                  <div className="relative z-10 space-y-4">
                    <div
                      className={`grid transition-[grid-template-rows,opacity] duration-[320ms] ease-[cubic-bezier(0.23,1,0.32,1)] ${
                        tab === "register" ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="overflow-hidden min-h-0">
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
                      </div>
                    </div>

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
                      <div className="relative">
                        <input
                          type={isPasswordVisible ? "text" : "password"}
                          value={form.password}
                          onChange={(e) => {
                            setForm((prev) => ({ ...prev, password: e.target.value }));
                            if (errorField === "password") setErrorField(null);
                          }}
                          className={`${fieldClass(errorField === "password")} pr-12`}
                          placeholder={t.passwordPlaceholder}
                          aria-invalid={errorField === "password"}
                        />
                        <button
                          type="button"
                          onMouseDown={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                          }}
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            setIsPasswordVisible((prev) => !prev);
                          }}
                          className="cursor-pointer absolute right-3 top-[calc(50%+0.25rem)] -translate-y-1/2 h-8 w-8 rounded-xl border border-white/50 dark:border-white/10 bg-white/45 dark:bg-slate-900/40 text-slate-500 hover:text-blue-500 hover:border-blue-400 transition-colors flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/35"
                          aria-label={isPasswordVisible ? "Hide password" : "Show password"}
                        >
                          {isPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </label>
                  </div>
                </MotionDiv>
              </div>
            </div>

            <div
              className={`grid origin-center mx-auto transition-[grid-template-rows,width] duration-[400ms] ease-[cubic-bezier(0.23,1,0.32,1)] ${
                step1Expanded ? "grid-rows-[1fr] w-full mt-2" : "grid-rows-[0fr] w-40 sm:w-44"
              }`}
            >
              <div className="overflow-hidden min-h-0 px-1 pb-1">
                <MotionDiv
                  initial={false}
                  animate={{ opacity: step1Expanded ? 1 : 0 }}
                  transition={{ duration: 0.28, ease: MOTION_EASE_SMOOTH }}
                  className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-[40px] transform-gpu border border-white/50 dark:border-white/10 shadow-lg dark:shadow-2xl rounded-3xl p-4 sm:p-6 pb-5 sm:pb-7 dark:pb-6 relative overflow-hidden transition-shadow duration-300"
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
              </div>
            </div>

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
                <GlassSecondaryLink
                  to="/"
                  className="order-2 sm:order-1 w-full sm:w-auto"
                >
                  <ArrowLeft size={16} />
                  {t.goHome}
                </GlassSecondaryLink>
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

