import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Download, RefreshCw } from "lucide-react";
import { useRegisterSW } from 'virtual:pwa-register/react';

export function InstallPWA() {
    const [supportsPWA, setSupportsPWA] = useState(false);
    const [promptInstall, setPromptInstall] = useState<any>(null);
    const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

    // PWA Update Logic
    const {
        offlineReady: [offlineReady, setOfflineReady],
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r) {
            console.log('SW Registered: ' + r);
        },
        onRegisterError(error) {
            console.log('SW registration error', error);
        },
    });

    const closeUpdate = () => {
        setOfflineReady(false);
        setNeedRefresh(false);
    };

    useEffect(() => {
        const handler = (e: any) => {
            e.preventDefault();
            setSupportsPWA(true);
            setPromptInstall(e);
            setIsInstallModalOpen(true);
        };

        window.addEventListener("beforeinstallprompt", handler);

        return () => window.removeEventListener("beforeinstallprompt", handler);
    }, []);

    const onClickInstall = async () => {
        if (!promptInstall) return;
        promptInstall.prompt();
        const { outcome } = await promptInstall.userChoice;
        if (outcome === 'accepted') {
            setIsInstallModalOpen(false);
        }
    };

    return (
        <>
            {/* Installation Dialog */}
            <Dialog open={isInstallModalOpen} onOpenChange={setIsInstallModalOpen}>
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
                        <Button variant="ghost" onClick={() => setIsInstallModalOpen(false)}>
                            Maybe Later
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Update Available Dialog */}
            <Dialog open={needRefresh} onOpenChange={closeUpdate}>
                <DialogContent aria-describedby={undefined} className="sm:max-w-md border-primary/20">
                    <DialogHeader>
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 animate-pulse">
                            <RefreshCw className="h-8 w-8 text-primary" />
                        </div>
                        <DialogTitle className="text-center text-xl">Update Available</DialogTitle>
                        <DialogDescription className="text-center">
                            A new version of TCPl-Desk is available. Click update to load the latest features and fixes!
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-3 mt-4">
                        <Button
                            onClick={() => updateServiceWorker(true)}
                            className="w-full text-lg py-6 shadow-md gap-2"
                        >
                            <RefreshCw className="h-5 w-5" />
                            Update Now
                        </Button>
                        <Button variant="ghost" onClick={closeUpdate}>
                            Ignore
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
