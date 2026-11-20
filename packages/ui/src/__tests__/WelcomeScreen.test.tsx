import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { WelcomeScreen } from "../components/WelcomeScreen.js";

describe("WelcomeScreen", () => {
  it("renders Welcome Showcase by default with 4 feature cards and 'Get Exploit' CTA", () => {
    const handleLogin = vi.fn();
    const handleRegister = vi.fn();
    const handleVerifyCode = vi.fn();
    const handleResendCode = vi.fn();

    render(
      <WelcomeScreen
        onLogin={handleLogin}
        onRegister={handleRegister}
        onVerifyCode={handleVerifyCode}
        onResendCode={handleResendCode}
      />,
    );

    // Header & tagline
    expect(screen.getByRole("heading", { name: "Codefy" })).toBeDefined();
    expect(
      screen.getByText(/Deterministic Taint Flow Intelligence & Autonomous AST Security Scanner/i),
    ).toBeDefined();

    // 4 Feature cards
    expect(screen.getByText("Deterministic SAST")).toBeDefined();
    expect(screen.getByText("Attack Flow Graphs")).toBeDefined();
    expect(screen.getByText("Exploit Verification")).toBeDefined();
    expect(screen.getByText("AI Security Copilot")).toBeDefined();

    // "Get Exploit" button
    expect(screen.getByRole("button", { name: /Get Exploit/i })).toBeDefined();
  });

  it("switches from Welcome Showcase to Login form when 'Get Exploit' is clicked", () => {
    const handleLogin = vi.fn();
    const handleRegister = vi.fn();
    const handleVerifyCode = vi.fn();
    const handleResendCode = vi.fn();

    render(
      <WelcomeScreen
        onLogin={handleLogin}
        onRegister={handleRegister}
        onVerifyCode={handleVerifyCode}
        onResendCode={handleResendCode}
      />,
    );

    const getExploitBtn = screen.getByRole("button", { name: /Get Exploit/i });
    fireEvent.click(getExploitBtn);

    // Now in Auth view: Login & Registration
    expect(screen.getAllByRole("button", { name: /^log in$/i }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Forgot password\?/i)).toBeDefined();
    expect(screen.getByRole("button", { name: /Back to Features/i })).toBeDefined();
  });

  it("navigates back to Welcome Showcase when 'Back to Features' is clicked", () => {
    const handleLogin = vi.fn();
    const handleRegister = vi.fn();
    const handleVerifyCode = vi.fn();
    const handleResendCode = vi.fn();

    render(
      <WelcomeScreen
        onLogin={handleLogin}
        onRegister={handleRegister}
        onVerifyCode={handleVerifyCode}
        onResendCode={handleResendCode}
        initialMode="login"
      />,
    );

    const backBtn = screen.getByRole("button", { name: /Back to Features/i });
    fireEvent.click(backBtn);

    // Returns to showcase
    expect(screen.getByText("Deterministic SAST")).toBeDefined();
    expect(screen.getByRole("button", { name: /Get Exploit/i })).toBeDefined();
  });

  it("switches to forgot_password mode and requests reset code", async () => {
    const handleLogin = vi.fn();
    const handleRegister = vi.fn();
    const handleVerifyCode = vi.fn();
    const handleResendCode = vi.fn();
    const handleForgotPassword = vi.fn().mockResolvedValue({ ok: true as const });

    render(
      <WelcomeScreen
        onLogin={handleLogin}
        onRegister={handleRegister}
        onVerifyCode={handleVerifyCode}
        onResendCode={handleResendCode}
        onForgotPassword={handleForgotPassword}
        initialMode="login"
      />,
    );

    fireEvent.click(screen.getByText(/Forgot password\?/i));

    expect(screen.getByText(/Enter your email to receive a password reset code/i)).toBeDefined();
    const emailInput = screen.getByPlaceholderText("you@example.com");
    fireEvent.change(emailInput, { target: { value: "developer@example.com" } });

    const submitBtn = screen.getByRole("button", { name: /Send Reset Code/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(handleForgotPassword).toHaveBeenCalledWith("developer@example.com");
      expect(screen.getByText(/Enter the code and set your new password/i)).toBeDefined();
    });
  });

  it("completes password reset flow and returns to login", async () => {
    const handleLogin = vi.fn();
    const handleRegister = vi.fn();
    const handleVerifyCode = vi.fn();
    const handleResendCode = vi.fn();
    const handleForgotPassword = vi.fn().mockResolvedValue({ ok: true as const });
    const handleResetPassword = vi.fn().mockResolvedValue({ ok: true as const });

    render(
      <WelcomeScreen
        onLogin={handleLogin}
        onRegister={handleRegister}
        onVerifyCode={handleVerifyCode}
        onResendCode={handleResendCode}
        onForgotPassword={handleForgotPassword}
        onResetPassword={handleResetPassword}
        initialMode="login"
      />,
    );

    // Switch to forgot password
    fireEvent.click(screen.getByText(/Forgot password\?/i));
    const emailInput = screen.getByPlaceholderText("you@example.com");
    fireEvent.change(emailInput, { target: { value: "alice@security.internal" } });
    fireEvent.click(screen.getByRole("button", { name: /Send Reset Code/i }));

    await waitFor(() => {
      expect(screen.getByPlaceholderText("123456")).toBeDefined();
    });

    // Enter code and new password
    fireEvent.change(screen.getByPlaceholderText("123456"), { target: { value: "654321" } });
    fireEvent.change(screen.getByPlaceholderText("At least 8 characters"), {
      target: { value: "NewSecurePassword123!" },
    });
    fireEvent.change(screen.getByPlaceholderText("Confirm new password"), {
      target: { value: "NewSecurePassword123!" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Reset Password & Log In/i }));

    await waitFor(() => {
      expect(handleResetPassword).toHaveBeenCalledWith({
        email: "alice@security.internal",
        code: "654321",
        newPassword: "NewSecurePassword123!",
      });
      expect(
        screen.getByText(/Password successfully updated! Please log in with your new password./i),
      ).toBeDefined();
    });
  });
});
