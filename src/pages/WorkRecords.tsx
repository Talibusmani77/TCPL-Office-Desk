import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Plus, ClipboardList, Search, Clock, PackageOpen, FileText, Download } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { exportToExcel } from "@/utils/exportToExcel";
import { ExportPasswordDialog } from "@/components/shared/ExportPasswordDialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MoreVertical, Edit, Trash2 } from "lucide-react";
import { useWorkRecords, useDeleteWorkRecord } from "@/hooks/useWorkRecords";
import { WorkRecordFormDialog } from "@/components/work-records/WorkRecordFormDialog";
import { WorkRecord } from "@/types/database";
import { Badge } from "@/components/ui/badge";
import { useEmployees } from "@/hooks/useEmployees";

export default function WorkRecords() {
    const { data: records = [], isLoading } = useWorkRecords();
    const { data: employees = [] } = useEmployees();
    const deleteRecord = useDeleteWorkRecord();
    const [searchQuery, setSearchQuery] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<WorkRecord | null>(null);
    const [exportDialogOpen, setExportDialogOpen] = useState(false);

    const filteredRecords = records.filter((record) => {
        const searchString = `${record.title} ${record.record_type} ${record.notes || ""}`.toLowerCase();
        return searchString.includes(searchQuery.toLowerCase());
    });

    const handleEdit = (record: WorkRecord) => {
        setSelectedRecord(record);
        setIsDialogOpen(true);
    };

    const handleCreate = () => {
        setSelectedRecord(null);
        setIsDialogOpen(true);
    };

    const handleDelete = (id: string) => {
        if (window.confirm("Are you sure you want to delete this work record?")) {
            deleteRecord.mutate(id);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Completed':
                return <Badge className="bg-green-500 hover:bg-green-600">Completed</Badge>;
            default:
                return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-black">Pending</Badge>;
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'Challan': return <FileText className="h-4 w-4 text-blue-500" />;
            case 'Stock Usage': return <PackageOpen className="h-4 w-4 text-purple-500" />;
            case 'General Reminder': return <Clock className="h-4 w-4 text-orange-500" />;
            default: return <ClipboardList className="h-4 w-4" />;
        }
    };

    const challansCount = records.filter(r => r.record_type === 'Challan').length;
    const stockCount = records.filter(r => r.record_type === 'Stock Usage').length;
    const pendingReminders = records.filter(r => r.record_type === 'General Reminder' && r.status === 'Pending').length;

    const getHandoverName = (empId?: string | null, customName?: string | null) => {
        if (customName) return customName;
        if (empId) {
            const emp = employees.find(e => e.id === empId);
            return emp ? emp.name : "Unknown";
        }
        return null;
    };

    return (
        <DashboardLayout title="Work Records" subtitle="Manage challans, track site stock usage, and view general reminders.">
            <div className="space-y-6 animate-in">
                <div className="flex justify-end items-center gap-2">
                    <Button variant="outline" onClick={() => setExportDialogOpen(true)} className="gap-2">
                        <Download className="h-4 w-4" />
                        Export
                    </Button>
                    <Button onClick={handleCreate} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Record
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
                            <ClipboardList className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{records.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Challans Issued</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{challansCount}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Stock Usages</CardTitle>
                            <PackageOpen className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stockCount}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-destructive">Pending Reminders</CardTitle>
                            <Clock className="h-4 w-4 text-destructive" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-destructive">{pendingReminders}</div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>All Records</CardTitle>
                            <div className="relative w-72">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search records..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Type & Title</TableHead>
                                        <TableHead>Key Details</TableHead>
                                        <TableHead>Date / Deadline</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center h-24">
                                                Loading data...
                                            </TableCell>
                                        </TableRow>
                                    ) : filteredRecords.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                                No work records found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredRecords.map((record) => (
                                            <TableRow key={record.id}>
                                                <TableCell>
                                                    <div className="flex items-start gap-3">
                                                        <div className="mt-1 bg-muted p-1.5 rounded-md">
                                                            {getTypeIcon(record.record_type)}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-base">{record.title}</p>
                                                            <p className="text-xs text-muted-foreground">{record.record_type}</p>
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                <TableCell>
                                                    <div className="text-sm max-w-[250px]">
                                                        {record.record_type === 'Challan' && (
                                                            <div className="flex flex-col gap-1.5 border-l-2 pl-3 py-1">
                                                                <div className={record.challan_given ? "text-green-600" : "text-muted-foreground"}>
                                                                    <span className="font-medium text-xs">Challan:</span> {record.challan_given ? "Given" : "Pending"}
                                                                    {record.challan_given && getHandoverName(record.challan_handover_employee_id, record.challan_handover_custom_name) && (
                                                                        <span className="text-muted-foreground ml-1.5 italic text-xs">
                                                                            &rarr; {getHandoverName(record.challan_handover_employee_id, record.challan_handover_custom_name)}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className={record.receiving_received ? "text-green-600" : "text-muted-foreground"}>
                                                                    <span className="font-medium text-xs">Receiving:</span> {record.receiving_received ? "Received" : "Pending"}
                                                                    {record.receiving_received && getHandoverName(record.receiving_handover_employee_id, record.receiving_handover_custom_name) && (
                                                                        <span className="text-muted-foreground ml-1.5 italic text-xs">
                                                                            &larr; {getHandoverName(record.receiving_handover_employee_id, record.receiving_handover_custom_name)}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                        {record.record_type === 'Stock Usage' && (
                                                            <div>
                                                                <p className="font-medium truncate" title={record.stock_used || ""}>Item: {record.stock_used}</p>
                                                                <p className="text-muted-foreground truncate text-xs" title={record.stock_purpose || ""}>Purpose: {record.stock_purpose}</p>
                                                            </div>
                                                        )}
                                                        {record.notes && (
                                                            <p className="text-muted-foreground text-xs truncate mt-1" title={record.notes}>
                                                                {record.notes}
                                                            </p>
                                                        )}
                                                    </div>
                                                </TableCell>

                                                <TableCell className="whitespace-nowrap">
                                                    <div className="text-sm">
                                                        <p className="text-muted-foreground text-xs">Created: {format(new Date(record.created_at), "MMM d")}</p>
                                                        {record.reminder_date && (
                                                            <p className="font-medium mt-1 text-orange-600">
                                                                Due: {format(new Date(record.reminder_date), "MMM d, yyyy")}
                                                            </p>
                                                        )}
                                                    </div>
                                                </TableCell>

                                                <TableCell>
                                                    {getStatusBadge(record.status)}
                                                </TableCell>

                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => handleEdit(record)}>
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                className="text-red-600"
                                                                onClick={() => handleDelete(record.id)}
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                <WorkRecordFormDialog
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    record={selectedRecord}
                />

                <ExportPasswordDialog
                    open={exportDialogOpen}
                    onOpenChange={setExportDialogOpen}
                    onSuccess={() => {
                        const exportData = filteredRecords.map(r => ({
                            Type: r.record_type,
                            Title: r.title,
                            Status: r.status,
                            Date: format(new Date(r.created_at), "MMM d, yyyy"),
                            // Type Specific
                            Challan_Given: r.record_type === 'Challan' ? (r.challan_given ? "Yes" : "No") : "",
                            Challan_Handover: r.record_type === 'Challan' ? getHandoverName(r.challan_handover_employee_id, r.challan_handover_custom_name) || "" : "",
                            Receiving_Received: r.record_type === 'Challan' ? (r.receiving_received ? "Yes" : "No") : "",
                            Receiving_Handover: r.record_type === 'Challan' ? getHandoverName(r.receiving_handover_employee_id, r.receiving_handover_custom_name) || "" : "",
                            Stock_Used: r.record_type === 'Stock Usage' ? r.stock_used || "" : "",
                            Stock_Purpose: r.record_type === 'Stock Usage' ? r.stock_purpose || "" : "",
                            Reminder_Date: r.reminder_date ? format(new Date(r.reminder_date), "MMM d, yyyy") : "",
                            Notes: r.notes || "",
                        }));
                        exportToExcel(exportData, "Work_Records");
                    }}
                    moduleName="Work Records"
                />
            </div>
        </DashboardLayout>
    );
}
