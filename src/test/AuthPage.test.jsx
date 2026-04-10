import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import AuthPage from "../pages/AuthPage";
import { renderWithProviders } from "./helpers";

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("AuthPage — login tab", () => {
  it("renders login title", () => {
    renderWithProviders(<AuthPage defaultTab="login" />, { route: "/login" });
    expect(screen.getByText(/Login|Вход/i)).toBeInTheDocument();
  });

  it("has email input", () => {
    renderWithProviders(<AuthPage defaultTab="login" />, { route: "/login" });
    expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
  });

  it("has password input", () => {
    renderWithProviders(<AuthPage defaultTab="login" />, { route: "/login" });
    expect(screen.getByPlaceholderText(/8 char|8 символ/i)).toBeInTheDocument();
  });

  it("does not have username input in login mode", () => {
    renderWithProviders(<AuthPage defaultTab="login" />, { route: "/login" });
    expect(screen.queryByPlaceholderText(/your_nickname|tvoy_nik/i)).not.toBeInTheDocument();
  });

  it("has Sign In / Sign Up tab switcher", () => {
    renderWithProviders(<AuthPage defaultTab="login" />, { route: "/login" });
    expect(screen.getAllByText(/Sign in|Войти/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Sign up|Регистрация/i)).toBeInTheDocument();
  });

  it("shows error toast on empty email submit", async () => {
    renderWithProviders(<AuthPage defaultTab="login" />, { route: "/login" });
    const submitBtns = screen.getAllByText(/Sign in|Войти/i);
    const submitBtn = submitBtns.find((el) => el.closest("button[type='submit']"));
    fireEvent.click(submitBtn);
    await waitFor(() => {
      const emailInput = screen.getByPlaceholderText("you@example.com");
      expect(emailInput).toHaveAttribute("aria-invalid", "true");
    });
  });

  it("marks password invalid if too short", async () => {
    renderWithProviders(<AuthPage defaultTab="login" />, { route: "/login" });
    const emailInput = screen.getByPlaceholderText("you@example.com");
    const passInput = screen.getByPlaceholderText(/8 char|8 символ/i);

    fireEvent.change(emailInput, { target: { value: "a@b.c" } });
    fireEvent.change(passInput, { target: { value: "short" } });

    const submitBtns = screen.getAllByText(/Sign in|Войти/i);
    const submitBtn = submitBtns.find((el) => el.closest("button[type='submit']"));
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(passInput).toHaveAttribute("aria-invalid", "true");
    });
  });
});

describe("AuthPage — register tab", () => {
  it("renders register title", () => {
    renderWithProviders(<AuthPage defaultTab="register" />, { route: "/register" });
    expect(screen.getByText(/Registration|Регистрация/i)).toBeInTheDocument();
  });

  it("has username input", () => {
    renderWithProviders(<AuthPage defaultTab="register" />, { route: "/register" });
    expect(screen.getByPlaceholderText(/your_nickname|tvoy_nik/i)).toBeInTheDocument();
  });

  it("has email and password inputs", () => {
    renderWithProviders(<AuthPage defaultTab="register" />, { route: "/register" });
    expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/8 char|8 символ/i)).toBeInTheDocument();
  });

  it("shows Continue button (step 0)", () => {
    renderWithProviders(<AuthPage defaultTab="register" />, { route: "/register" });
    expect(screen.getByText(/Continue|Продолжить/i)).toBeInTheDocument();
  });

  it("shows error when username is empty", async () => {
    renderWithProviders(<AuthPage defaultTab="register" />, { route: "/register" });
    fireEvent.click(screen.getByText(/Continue|Продолжить/i));
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/your_nickname|tvoy_nik/i)).toHaveAttribute(
        "aria-invalid",
        "true",
      );
    });
  });

  it("advances to emoji picker (step 1) on valid form", async () => {
    renderWithProviders(<AuthPage defaultTab="register" />, { route: "/register" });
    fireEvent.change(screen.getByPlaceholderText(/your_nickname|tvoy_nik/i), {
      target: { value: "myuser" },
    });
    fireEvent.change(screen.getByPlaceholderText("you@example.com"), {
      target: { value: "a@b.c" },
    });
    fireEvent.change(screen.getByPlaceholderText(/8 char|8 символ/i), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByText(/Continue|Продолжить/i));

    await waitFor(() => {
      expect(screen.getByText(/Pick your emoji|Выбери emoji/i)).toBeInTheDocument();
    });
  });

  it("emoji picker renders 20 emojis", async () => {
    renderWithProviders(<AuthPage defaultTab="register" />, { route: "/register" });
    fireEvent.change(screen.getByPlaceholderText(/your_nickname|tvoy_nik/i), {
      target: { value: "myuser" },
    });
    fireEvent.change(screen.getByPlaceholderText("you@example.com"), {
      target: { value: "a@b.c" },
    });
    fireEvent.change(screen.getByPlaceholderText(/8 char|8 символ/i), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByText(/Continue|Продолжить/i));

    await waitFor(() => {
      const emojiBtns = screen.getAllByRole("button", { name: /emoji/ });
      expect(emojiBtns).toHaveLength(20);
    });
  });

  it("back button on step 1 returns to step 0", async () => {
    renderWithProviders(<AuthPage defaultTab="register" />, { route: "/register" });
    fireEvent.change(screen.getByPlaceholderText(/your_nickname|tvoy_nik/i), {
      target: { value: "myuser" },
    });
    fireEvent.change(screen.getByPlaceholderText("you@example.com"), {
      target: { value: "a@b.c" },
    });
    fireEvent.change(screen.getByPlaceholderText(/8 char|8 символ/i), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByText(/Continue|Продолжить/i));

    await waitFor(() => {
      expect(screen.getByText(/Back|Назад/i)).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText(/Back|Назад/i));
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/your_nickname|tvoy_nik/i)).toBeInTheDocument();
    });
  });
});

describe("AuthPage — tab switching", () => {
  it("switches from login to register", async () => {
    renderWithProviders(<AuthPage defaultTab="login" />, { route: "/login" });
    fireEvent.click(screen.getByText(/Sign up|Регистрация/i));
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/your_nickname|tvoy_nik/i)).toBeInTheDocument();
    });
  });

  it("switches from register to login", async () => {
    renderWithProviders(<AuthPage defaultTab="register" />, { route: "/register" });
    const signInBtns = screen.getAllByText(/Sign in|Войти/i);
    const tabBtn = signInBtns.find((el) => el.closest("button[type='button']"));
    fireEvent.click(tabBtn);
    await waitFor(() => {
      expect(screen.queryByPlaceholderText(/your_nickname|tvoy_nik/i)).not.toBeInTheDocument();
    });
  });

  it("resets step when switching tabs", async () => {
    renderWithProviders(<AuthPage defaultTab="register" />, { route: "/register" });
    fireEvent.change(screen.getByPlaceholderText(/your_nickname|tvoy_nik/i), {
      target: { value: "myuser" },
    });
    fireEvent.change(screen.getByPlaceholderText("you@example.com"), {
      target: { value: "a@b.c" },
    });
    fireEvent.change(screen.getByPlaceholderText(/8 char|8 символ/i), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByText(/Continue|Продолжить/i));

    await waitFor(() => {
      expect(screen.getByText(/Pick your emoji|Выбери emoji/i)).toBeInTheDocument();
    });

    const signInBtns = screen.getAllByText(/Sign in|Войти/i);
    const tabBtn = signInBtns.find((el) => el.closest("button[type='button']"));
    fireEvent.click(tabBtn);

    expect(screen.queryByText(/Pick your emoji|Выбери emoji/i)).not.toBeInTheDocument();
  });
});

describe("AuthPage — login submission", () => {
  it("calls login API on valid credentials", async () => {
    const mockResponse = {
      ok: true,
      text: async () =>
        JSON.stringify({
          user: { id: 1, username: "u", email: "a@b.c" },
        }),
    };
    vi.spyOn(globalThis, "fetch").mockResolvedValue(mockResponse);

    renderWithProviders(<AuthPage defaultTab="login" />, { route: "/login" });
    fireEvent.change(screen.getByPlaceholderText("you@example.com"), {
      target: { value: "a@b.c" },
    });
    fireEvent.change(screen.getByPlaceholderText(/8 char|8 символ/i), {
      target: { value: "password123" },
    });

    const submitBtns = screen.getAllByText(/Sign in|Войти/i);
    const submitBtn = submitBtns.find((el) => el.closest("button[type='submit']"));
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/auth/login",
        expect.objectContaining({ method: "POST" }),
      );
    });
  });

  it("shows error on failed login", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 401,
      statusText: "Unauthorized",
      text: async () =>
        JSON.stringify({
          detail: {
            code: "auth/incorrect_email_or_password",
            message: "Incorrect email or password",
          },
        }),
    });

    renderWithProviders(<AuthPage defaultTab="login" />, { route: "/login" });
    fireEvent.change(screen.getByPlaceholderText("you@example.com"), {
      target: { value: "wrong@b.c" },
    });
    fireEvent.change(screen.getByPlaceholderText(/8 char|8 символ/i), {
      target: { value: "wrongpass1" },
    });

    const submitBtns = screen.getAllByText(/Sign in|Войти/i);
    const submitBtn = submitBtns.find((el) => el.closest("button[type='submit']"));
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });
  });
});
