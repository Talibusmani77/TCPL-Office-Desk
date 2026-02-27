import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Download } from "lucide-react";

export function InstallPWA() {
    const [supportsPWA, setSupportsPWA] = useState(false);
    const [promptInstall, setPromptInstall] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const handler = (e: any) => {
            e.preventDefault();
            setSupportsPWA(true);
            setPromptInstall(e);
            // Automatically open the modal if the event fires
            setIsModalOpen(true);
        };

        window.addEventListener("beforeinstallprompt", handler);

        return () => window.removeEventListener("beforeinstallprompt", handler);
    }, []);

    const onClickInstall = async () => {
        if (!promptInstall) return;
        promptInstall.prompt();
        const { outcome } = await promptInstall.userChoice;
        if (outcome === 'accepted') {
            setIsModalOpen(false);
        }
    };

    if (!supportsPWA) return null;

    return (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent aria-describedby={undefined} className="sm:max-w-md">
                <DialogHeader>
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                        <Download className="h-8 w-8 text-primary" />
                    </div>
                    <DialogTitle className="text-center text-xl">Install TCPl-Desk App</DialogTitle>
                    <DialogDescription className="text-center">
                        Install the TCPl-Desk application for a better, faster, full-screen experience directly on your device!
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-3 mt-4">
                    <Button onClick={onClickInstall} className="w-full text-lg py-6 shadow-md">
                        Install App Now
                    </Button>
                    <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
                        Maybe Later
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
