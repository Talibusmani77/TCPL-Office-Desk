import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSettings } from "@/hooks/useSettings";
import { toast } from "sonner";
import { Lock } from "lucide-react";

interface ExportPasswordDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    moduleName: string;
}

export function ExportPasswordDialog({ open, onOpenChange, onSuccess, moduleName }: ExportPasswordDialogProps) {
    const { data: settings, isLoading } = useSettings();
    const [password, setPassword] = useState("");

    const handleExport = (e: React.FormEvent) => {
        e.preventDefault();

        if (isLoading) return;

        if (settings?.password === password) {
            setPassword(""); // Clear input
            onSuccess(); // Trigger the export function passed down
            onOpenChange(false); // Close modal
        } else {
            toast.error("Incorrect password", {
                description: "Cannot export data. Please try again."
            });
            setPassword(""); // clear input for next try
        }
    };

    return (
        <Dialog open={open} onOpenChange={(val) => {
            // clear state if closing normally
            if (!val) setPassword("");
            onOpenChange(val);
        }}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Lock className="w-5 h-5 text-muted-foreground" />
                        Export {moduleName}
                    </DialogTitle>
                    <DialogDescription>
                        Please enter the administrator password to authorize the download of {moduleName.toLowerCase()} records.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleExport} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="export_password">Password</Label>
                        <Input
                            id="export_password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter global password..."
                            autoFocus
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={!password || isLoading}>
                            Export to Excel
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
