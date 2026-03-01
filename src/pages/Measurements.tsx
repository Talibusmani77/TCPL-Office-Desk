import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Plus, Ruler, Search } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useMeasurements, useDeleteMeasurement } from "@/hooks/useMeasurements";
import { MeasurementFormDialog } from "@/components/measurements/MeasurementFormDialog";
import { Measurement } from "@/types/database";

const Measurements = () => {
    const { data: measurements = [], isLoading } = useMeasurements();
    const deleteMeasurement = useDeleteMeasurement();
    const [searchQuery, setSearchQuery] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedMeasurement, setSelectedMeasurement] = useState<Measurement | null>(null);

    const filteredMeasurements = measurements.filter((measurement) => {
        const searchString = `${measurement.site_location} ${measurement.site_address || ""} ${measurement.employees?.name || ""}`.toLowerCase();
        return searchString.includes(searchQuery.toLowerCase());
    });

    const handleEdit = (measurement: Measurement) => {
        setSelectedMeasurement(measurement);
        setIsDialogOpen(true);
    };

    const handleCreate = () => {
        setSelectedMeasurement(null);
        setIsDialogOpen(true);
    };

    const handleDelete = (id: string) => {
        if (window.confirm("Are you sure you want to delete this measurement record?")) {
            deleteMeasurement.mutate(id);
        }
    };

    const totalMeasurementsThisMonth = measurements.filter(m => {
        const date = new Date(m.measurement_date);
        const now = new Date();
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length;

    return (
        <DashboardLayout title="Site Measurements" subtitle="Track and manage on-site measurements and location details.">
            <div className="space-y-6 animate-in">
                <div className="flex justify-end items-center">
                    <Button onClick={handleCreate} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Measurement
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
                            <Ruler className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{measurements.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Recorded This Month</CardTitle>
                            <Ruler className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalMeasurementsThisMonth}</div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>Measurement Records</CardTitle>
                            <div className="relative w-72">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search location or employee..."
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
                                        <TableHead>Date</TableHead>
                                        <TableHead>Employee</TableHead>
                                        <TableHead>Site Location</TableHead>
                                        <TableHead>Measurements (L \xB7 B)</TableHead>
                                        <TableHead>Notes</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center h-24">
                                                Loading data...
                                            </TableCell>
                                        </TableRow>
                                    ) : filteredMeasurements.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                                No measurement records found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredMeasurements.map((record) => (
                                            <TableRow key={record.id}>
                                                <TableCell className="whitespace-nowrap">
                                                    {format(new Date(record.measurement_date), "MMM d, yyyy")}
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">{record.employees?.name}</p>
                                                        <p className="text-xs text-muted-foreground">{record.employees?.designation}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <p className="font-medium">{record.site_location}</p>
                                                    {record.site_address && (
                                                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                                            {record.site_address}
                                                        </p>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm">
                                                        <div className="flex flex-col mb-2">
                                                            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1">Length</span>
                                                            <div className="space-y-0.5">
                                                                {(record.length_feet > 0 || record.length_inches > 0) && (
                                                                    <div>{record.length_feet > 0 && `${record.length_feet} ft `}{record.length_inches > 0 && `${record.length_inches} in`}</div>
                                                                )}
                                                                {(record.length_m > 0 || record.length_cm > 0 || record.length_mm > 0) && (
                                                                    <div className="text-xs text-muted-foreground">
                                                                        {record.length_m > 0 && `${record.length_m} m `}{record.length_cm > 0 && `${record.length_cm} cm `}{record.length_mm > 0 && `${record.length_mm} mm`}
                                                                    </div>
                                                                )}
                                                                {record.length_feet === 0 && record.length_inches === 0 && record.length_m === 0 && record.length_cm === 0 && record.length_mm === 0 && <div className="text-xs italic text-muted-foreground">Not recorded</div>}
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1">Breadth</span>
                                                            <div className="space-y-0.5">
                                                                {(record.breadth_feet > 0 || record.breadth_inches > 0) && (
                                                                    <div>{record.breadth_feet > 0 && `${record.breadth_feet} ft `}{record.breadth_inches > 0 && `${record.breadth_inches} in`}</div>
                                                                )}
                                                                {(record.breadth_m > 0 || record.breadth_cm > 0 || record.breadth_mm > 0) && (
                                                                    <div className="text-xs text-muted-foreground">
                                                                        {record.breadth_m > 0 && `${record.breadth_m} m `}{record.breadth_cm > 0 && `${record.breadth_cm} cm `}{record.breadth_mm > 0 && `${record.breadth_mm} mm`}
                                                                    </div>
                                                                )}
                                                                {record.breadth_feet === 0 && record.breadth_inches === 0 && record.breadth_m === 0 && record.breadth_cm === 0 && record.breadth_mm === 0 && <div className="text-xs italic text-muted-foreground">Not recorded</div>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="max-w-[150px] truncate" title={record.notes || ""}>
                                                    {record.notes || "-"}
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

                <MeasurementFormDialog
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    measurement={selectedMeasurement}
                />
            </div>
        </DashboardLayout>
    );
};

export default Measurements;
