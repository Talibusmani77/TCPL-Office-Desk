import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock, Eye, EyeOff, KeyRound } from "lucide-react";
import { useSettings, useUpdateSettings } from "@/hooks/useSettings";

interface PasswordGateProps {
    children: React.ReactNode;
    pageLabel?: string;
}

type Screen = "setup" | "login" | "reset-verify-pin" | "reset-new-password";

export function PasswordGate({ children, pageLabel = "this page" }: PasswordGateProps) {
    const { data: settings, isLoading } = useSettings();
    const updateSettings = useUpdateSettings();

    const [unlocked, setUnlocked] = useState(false);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [pin, setPin] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [screen, setScreen] = useState<Screen>("login");

    useEffect(() => {
        if (!isLoading) {
            setScreen(settings?.password ? "login" : "setup");
        }
    }, [isLoading, settings?.password]);

    // --- SETUP: Set password + 4-digit PIN ---
    const handleSetPassword = async () => {
        setError("");
        if (password.length < 4) {
            setError("Password must be at least 4 characters");
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        if (!/^\d{4}$/.test(pin)) {
            setError("Recovery PIN must be exactly 4 digits");
            return;
        }

        await updateSettings.mutateAsync({ password, pin });
        setUnlocked(true);
        setPassword("");
        setConfirmPassword("");
        setPin("");
    };

    // --- LOGIN: Verify password ---
    const handleVerifyPassword = () => {
        setError("");
        if (password === settings?.password) {
            setUnlocked(true);
            setPassword("");
        } else {
            setError("Incorrect password");
        }
    };

    // --- RESET STEP 1: Verify PIN ---
    const handleVerifyPin = () => {
        setError("");
        if (pin === settings?.pin) {
            setPin("");
            setPassword("");
            setConfirmPassword("");
            setScreen("reset-new-password");
        } else {
            setError("Incorrect PIN");
        }
    };

    // --- RESET STEP 2: Set new password ---
    const handleResetPassword = async () => {
        setError("");
        if (password.length < 4) {
            setError("Password must be at least 4 characters");
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        await updateSettings.mutateAsync({ password });
        setUnlocked(true);
        setPassword("");
        setConfirmPassword("");
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            if (screen === "setup") handleSetPassword();
            else if (screen === "login") handleVerifyPassword();
            else if (screen === "reset-verify-pin") handleVerifyPin();
            else if (screen === "reset-new-password") handleResetPassword();
        }
    };

    if (isLoading) {
        return <div className="min-h-[60vh] flex items-center justify-center p-4 text-muted-foreground">Loading Security Settings...</div>;
    }

    if (unlocked) {
        return <>{children}</>;
    }

    const getTitle = () => {
        switch (screen) {
            case "setup": return "Set Password";
            case "login": return "Enter Password";
            case "reset-verify-pin": return "Verify Recovery PIN";
            case "reset-new-password": return "Set New Password";
        }
    };

    const getSubtitle = () => {
        switch (screen) {
            case "setup": return `Set a password & recovery PIN to protect ${pageLabel}`;
            case "login": return `Enter your password to access ${pageLabel}`;
            case "reset-verify-pin": return "Enter your 4-digit recovery PIN to reset password";
            case "reset-new-password": return "PIN verified! Set your new password";
        }
    };

    const getIcon = () => {
        if (screen === "reset-verify-pin") return <KeyRound className="h-7 w-7 text-primary" />;
        return <Lock className="h-7 w-7 text-primary" />;
    };

    return (
        <div className="min-h-[60vh] flex items-center justify-center p-4">
            <Card className="w-full max-w-sm">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                        {getIcon()}
                    </div>
                    <CardTitle className="text-xl">{getTitle()}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{getSubtitle()}</p>
                </CardHeader>
                <CardContent className="space-y-4">

                    {/* === SETUP SCREEN === */}
                    {screen === "setup" && (
                        <>
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                                    onKeyDown={handleKeyDown}
                                    className="pr-10"
                                    autoFocus
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                                onKeyDown={handleKeyDown}
                            />
                            <div>
                                <p className="text-xs text-muted-foreground mb-1.5">Set a 4-digit recovery PIN (used to reset password)</p>
                                <Input
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={4}
                                    placeholder="4-digit PIN (e.g. 1234)"
                                    value={pin}
                                    onChange={(e) => { setPin(e.target.value.replace(/\D/g, "").slice(0, 4)); setError(""); }}
                                    onKeyDown={handleKeyDown}
                                    className="tracking-[0.5em] text-center font-mono text-lg"
                                />
                            </div>
                        </>
                    )}

                    {/* === LOGIN SCREEN === */}
                    {screen === "login" && (
                        <div className="relative">
                            <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                                onKeyDown={handleKeyDown}
                                className="pr-10"
                                autoFocus
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    )}

                    {/* === RESET: VERIFY PIN === */}
                    {screen === "reset-verify-pin" && (
                        <Input
                            type="text"
                            inputMode="numeric"
                            maxLength={4}
                            placeholder="Enter 4-digit PIN"
                            value={pin}
                            onChange={(e) => { setPin(e.target.value.replace(/\D/g, "").slice(0, 4)); setError(""); }}
                            onKeyDown={handleKeyDown}
                            className="tracking-[0.5em] text-center font-mono text-lg"
                            autoFocus
                        />
                    )}

                    {/* === RESET: NEW PASSWORD === */}
                    {screen === "reset-new-password" && (
                        <>
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="New Password"
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                                    onKeyDown={handleKeyDown}
                                    className="pr-10"
                                    autoFocus
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="Confirm New Password"
                                value={confirmPassword}
                                onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                                onKeyDown={handleKeyDown}
                            />
                        </>
                    )}

                    {error && (
                        <p className="text-sm text-destructive text-center">{error}</p>
                    )}

                    {/* ACTION BUTTON */}
                    <Button
                        className="w-full"
                        onClick={() => {
                            if (screen === "setup") handleSetPassword();
                            else if (screen === "login") handleVerifyPassword();
                            else if (screen === "reset-verify-pin") handleVerifyPin();
                            else if (screen === "reset-new-password") handleResetPassword();
                        }}
                    >
                        {screen === "setup" && "Set Password & Continue"}
                        {screen === "login" && "Unlock"}
                        {screen === "reset-verify-pin" && "Verify PIN"}
                        {screen === "reset-new-password" && "Save New Password"}
                    </Button>

                    {/* FORGOT PASSWORD LINK */}
                    {screen === "login" && (
                        <p className="text-xs text-muted-foreground text-center">
                            Forgot password?{" "}
                            <button
                                type="button"
                                className="text-primary underline"
                                onClick={() => {
                                    setError("");
                                    setPassword("");
                                    setPin("");
                                    setScreen("reset-verify-pin");
                                }}
                            >
                                Reset
                            </button>
                        </p>
                    )}

                    {/* BACK TO LOGIN LINK */}
                    {(screen === "reset-verify-pin" || screen === "reset-new-password") && (
                        <p className="text-xs text-muted-foreground text-center">
                            <button
                                type="button"
                                className="text-primary underline"
                                onClick={() => {
                                    setError("");
                                    setPassword("");
                                    setPin("");
                                    setScreen("login");
                                }}
                            >
                                Back to login
                            </button>
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
