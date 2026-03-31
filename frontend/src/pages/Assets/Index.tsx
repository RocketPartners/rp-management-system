import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { usePermission } from '@/hooks/usePermission';
import { apiDelete, apiGet, apiPost, apiPut } from '@/lib/spring-boot-api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    AlertTriangle,
    Barcode,
    Box,
    Building2,
    Calendar,
    ChevronLeft,
    ChevronRight,
    ClipboardList,
    DollarSign,
    Edit,
    Eye,
    FileText,
    Hash,
    History,
    Laptop,
    Loader2,
    LogIn,
    LogOut,
    MapPin,
    MoreVertical,
    Package,
    Plus,
    Search,
    Settings2,
    ShieldCheck,
    Tag,
    Trash2,
    User,
    Wrench,
    X,
} from 'lucide-react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

// ============================================
// Types
// ============================================

interface AssetCategory {
    id: number;
    name: string;
    code: string;
    description: string;
    tagPrefix: string;
    specTemplate: Record<string, string> | null;
    assetCount: number;
    active: boolean;
    createdAt: string;
}

interface AssigneeInfo {
    userId: number;
    userName: string;
    checkedOutAt: string;
    expectedReturnDate: string | null;
}

interface AssetResponse {
    id: number;
    name: string;
    assetTag: string;
    serialNumber: string | null;
    barcode: string | null;
    trackingType: 'INDIVIDUAL' | 'CONSUMABLE';
    manufacturer: string | null;
    model: string | null;
    description: string | null;
    specifications: Record<string, string> | null;
    quantity: number;
    minQuantity: number;
    purchaseDate: string | null;
    purchasePrice: number | null;
    warrantyExpiry: string | null;
    condition: string;
    status: string;
    location: string | null;
    notes: string | null;
    imageUrl: string | null;
    active: boolean;
    categoryId: number;
    categoryName: string;
    categoryCode: string;
    currentAssignee: AssigneeInfo | null;
    createdAt: string;
    updatedAt: string;
}

interface AssetDetailResponse extends AssetResponse {
    assignments: AssetAssignmentResponse[];
    history: AssetHistoryResponse[];
}

interface AssetAssignmentResponse {
    id: number;
    assetId: number;
    assetName: string;
    assetTag: string;
    categoryName: string;
    userId: number;
    userName: string;
    assignedById: number | null;
    assignedByName: string | null;
    quantityAssigned: number;
    checkedOutAt: string;
    expectedReturnDate: string | null;
    checkedInAt: string | null;
    conditionOnCheckout: string | null;
    conditionOnCheckin: string | null;
    checkoutNotes: string | null;
    checkinNotes: string | null;
    status: string;
}

interface AssetHistoryResponse {
    id: number;
    action: string;
    previousStatus: string | null;
    newStatus: string | null;
    notes: string | null;
    userName: string | null;
    performedByName: string | null;
    createdAt: string;
}

interface DashboardStats {
    totalAssets: number;
    available: number;
    assigned: number;
    inRepair: number;
    retired: number;
    lost: number;
    disposed: number;
    lowStockCount: number;
}

interface PagedResponse<T> {
    content: T[];
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
    empty: boolean;
}

interface UserOption {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
}

// ============================================
// Helpers
// ============================================

const STATUS_STYLES: Record<string, string> = {
    AVAILABLE: 'bg-green-100 text-green-700 border-green-200',
    ASSIGNED: 'bg-blue-100 text-blue-700 border-blue-200',
    IN_REPAIR: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    RETIRED: 'bg-gray-100 text-gray-700 border-gray-200',
    LOST: 'bg-red-100 text-red-700 border-red-200',
    DISPOSED: 'bg-gray-100 text-gray-500 border-gray-200',
};

const CONDITION_STYLES: Record<string, string> = {
    NEW: 'bg-green-100 text-green-700',
    GOOD: 'bg-blue-100 text-blue-700',
    FAIR: 'bg-yellow-100 text-yellow-700',
    POOR: 'bg-orange-100 text-orange-700',
    DAMAGED: 'bg-red-100 text-red-700',
};

function formatStatus(s: string) {
    return s.replace(/_/g, ' ');
}

function formatDate(d: string | null) {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatCurrency(amount: number | null) {
    if (amount == null) return '-';
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
}

// ============================================
// Section Header (reusable within dialogs)
// ============================================

function SectionHeader({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description?: string }) {
    return (
        <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2">
                <Icon className="h-4 w-4 text-blue-600" />
            </div>
            <div>
                <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
                {description && <p className="text-xs text-gray-500">{description}</p>}
            </div>
        </div>
    );
}

// ============================================
// Create / Edit Dialog
// ============================================

function CreateEditDialog({
    open,
    onOpenChange,
    asset,
    categories,
}: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    asset: AssetResponse | null;
    categories: AssetCategory[];
}) {
    const queryClient = useQueryClient();
    const isEdit = !!asset;

    const [form, setForm] = useState({
        name: asset?.name ?? '',
        categoryId: asset?.categoryId?.toString() ?? '',
        trackingType: asset?.trackingType ?? 'INDIVIDUAL',
        serialNumber: asset?.serialNumber ?? '',
        barcode: asset?.barcode ?? '',
        manufacturer: asset?.manufacturer ?? '',
        model: asset?.model ?? '',
        description: asset?.description ?? '',
        quantity: asset?.quantity?.toString() ?? '1',
        minQuantity: asset?.minQuantity?.toString() ?? '0',
        purchaseDate: asset?.purchaseDate ?? '',
        purchasePrice: asset?.purchasePrice?.toString() ?? '',
        warrantyExpiry: asset?.warrantyExpiry ?? '',
        condition: asset?.condition ?? 'NEW',
        location: asset?.location ?? '',
        notes: asset?.notes ?? '',
    });

    const setField = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

    const mutation = useMutation({
        mutationFn: (data: Record<string, unknown>) =>
            isEdit ? apiPut(`/assets/${asset!.id}`, data) : apiPost('/assets', data),
        onSuccess: () => {
            toast.success(isEdit ? 'Asset updated' : 'Asset created');
            queryClient.invalidateQueries({ queryKey: ['assets'] });
            queryClient.invalidateQueries({ queryKey: ['asset-stats'] });
            onOpenChange(false);
        },
        onError: (err: Error) => toast.error(err.message),
    });

    const handleSubmit = () => {
        if (!form.name || !form.categoryId) {
            toast.error('Name and category are required');
            return;
        }
        mutation.mutate({
            name: form.name,
            categoryId: Number(form.categoryId),
            trackingType: form.trackingType,
            serialNumber: form.serialNumber || null,
            barcode: form.barcode || null,
            manufacturer: form.manufacturer || null,
            model: form.model || null,
            description: form.description || null,
            quantity: Number(form.quantity) || 1,
            minQuantity: Number(form.minQuantity) || 0,
            purchaseDate: form.purchaseDate || null,
            purchasePrice: form.purchasePrice ? Number(form.purchasePrice) : null,
            warrantyExpiry: form.warrantyExpiry || null,
            condition: form.condition,
            location: form.location || null,
            notes: form.notes || null,
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-w-4xl flex-col max-h-[90vh] p-0 gap-0">
                <DialogHeader className="shrink-0 border-b px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-blue-100 p-2.5">
                            {isEdit ? <Edit className="h-5 w-5 text-blue-600" /> : <Plus className="h-5 w-5 text-blue-600" />}
                        </div>
                        <div>
                            <DialogTitle className="text-lg">{isEdit ? 'Edit Asset' : 'Add New Asset'}</DialogTitle>
                            <DialogDescription>
                                {isEdit
                                    ? `Editing ${asset?.assetTag} — ${asset?.name}`
                                    : 'Fill in the details to register a new asset in the system'}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                    {/* Tracking Type Selector (create only) */}
                    {!isEdit && (
                        <div className="space-y-3">
                            <SectionHeader icon={Settings2} title="Asset Type" description="Choose how this asset will be tracked" />
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setField('trackingType', 'INDIVIDUAL')}
                                    className={`flex items-center gap-3 rounded-lg border-2 p-4 text-left transition-all ${
                                        form.trackingType === 'INDIVIDUAL'
                                            ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-200'
                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    <div className={`rounded-lg p-2 ${form.trackingType === 'INDIVIDUAL' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                                        <Laptop className={`h-5 w-5 ${form.trackingType === 'INDIVIDUAL' ? 'text-blue-600' : 'text-gray-500'}`} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">Individual</p>
                                        <p className="text-xs text-gray-500">Unique tracked item (laptop, monitor)</p>
                                    </div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setField('trackingType', 'CONSUMABLE')}
                                    className={`flex items-center gap-3 rounded-lg border-2 p-4 text-left transition-all ${
                                        form.trackingType === 'CONSUMABLE'
                                            ? 'border-purple-500 bg-purple-50 ring-1 ring-purple-200'
                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    <div className={`rounded-lg p-2 ${form.trackingType === 'CONSUMABLE' ? 'bg-purple-100' : 'bg-gray-100'}`}>
                                        <Package className={`h-5 w-5 ${form.trackingType === 'CONSUMABLE' ? 'text-purple-600' : 'text-gray-500'}`} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">Consumable</p>
                                        <p className="text-xs text-gray-500">Quantity-based (pens, paper, cables)</p>
                                    </div>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Basic Information */}
                    <div className="space-y-3">
                        <SectionHeader icon={Tag} title="Basic Information" description="Name, category, and manufacturer details" />
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label>Name <span className="text-red-500">*</span></Label>
                                <div className="relative">
                                    <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <Input className="pl-10" placeholder="e.g. MacBook Pro 14" value={form.name} onChange={(e) => setField('name', e.target.value)} />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label>Category <span className="text-red-500">*</span></Label>
                                <Select value={form.categoryId} onValueChange={(v) => setField('categoryId', v)}>
                                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                                    <SelectContent>
                                        {categories.map((c) => (
                                            <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label>Manufacturer</Label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <Input className="pl-10" placeholder="e.g. Apple" value={form.manufacturer} onChange={(e) => setField('manufacturer', e.target.value)} />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label>Model</Label>
                                <div className="relative">
                                    <Settings2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <Input className="pl-10" placeholder="e.g. M3 Pro 2024" value={form.model} onChange={(e) => setField('model', e.target.value)} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Identification */}
                    <div className="space-y-3">
                        <SectionHeader icon={Hash} title="Identification" description="Serial number, barcode, and tracking identifiers" />
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label>Serial Number</Label>
                                <div className="relative">
                                    <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <Input className="pl-10 font-mono" placeholder="e.g. FVFXM3XQ1P" value={form.serialNumber} onChange={(e) => setField('serialNumber', e.target.value)} />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label>Barcode</Label>
                                <div className="relative">
                                    <Barcode className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <Input className="pl-10 font-mono" placeholder="e.g. 123456789012" value={form.barcode} onChange={(e) => setField('barcode', e.target.value)} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stock (consumable only) */}
                    {form.trackingType === 'CONSUMABLE' && (
                        <>
                            <Separator />
                            <div className="space-y-3">
                                <SectionHeader icon={Package} title="Stock Levels" description="Set quantity and low-stock alert threshold" />
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label>Current Quantity</Label>
                                        <Input type="number" min="1" value={form.quantity} onChange={(e) => setField('quantity', e.target.value)} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label>Minimum Quantity</Label>
                                        <Input type="number" min="0" value={form.minQuantity} onChange={(e) => setField('minQuantity', e.target.value)} />
                                        <p className="text-xs text-gray-500">Alert when stock falls below this level</p>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    <Separator />

                    {/* Procurement & Warranty */}
                    <div className="space-y-3">
                        <SectionHeader icon={DollarSign} title="Procurement & Warranty" description="Purchase details and warranty information" />
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <Label>Purchase Date</Label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <Input type="date" className="pl-10" value={form.purchaseDate} onChange={(e) => setField('purchaseDate', e.target.value)} />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label>Purchase Price</Label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <Input type="number" step="0.01" className="pl-10" placeholder="0.00" value={form.purchasePrice} onChange={(e) => setField('purchasePrice', e.target.value)} />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label>Warranty Expiry</Label>
                                <div className="relative">
                                    <ShieldCheck className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <Input type="date" className="pl-10" value={form.warrantyExpiry} onChange={(e) => setField('warrantyExpiry', e.target.value)} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Condition & Location */}
                    <div className="space-y-3">
                        <SectionHeader icon={Wrench} title="Condition & Location" />
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label>Condition</Label>
                                <Select value={form.condition} onValueChange={(v) => setField('condition', v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {['NEW', 'GOOD', 'FAIR', 'POOR', 'DAMAGED'].map((c) => (
                                            <SelectItem key={c} value={c}>{c}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label>Location</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <Input className="pl-10" placeholder="e.g. Office 3rd Floor" value={form.location} onChange={(e) => setField('location', e.target.value)} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Additional Details */}
                    <div className="space-y-3">
                        <SectionHeader icon={FileText} title="Additional Details" />
                        <div className="space-y-1.5">
                            <Label>Description</Label>
                            <Textarea rows={2} placeholder="Brief description of the asset..." value={form.description} onChange={(e) => setField('description', e.target.value)} />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Notes</Label>
                            <Textarea rows={2} placeholder="Internal notes (not visible to assignees)..." value={form.notes} onChange={(e) => setField('notes', e.target.value)} />
                        </div>
                    </div>
                </div>

                <DialogFooter className="shrink-0 border-t px-6 py-4">
                    <p className="mr-auto text-xs text-gray-400"><span className="text-red-500">*</span> Required fields</p>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={mutation.isPending}>
                        {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isEdit ? 'Save Changes' : 'Create Asset'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ============================================
// Check-Out Dialog
// ============================================

function CheckOutDialog({
    open,
    onOpenChange,
    asset,
}: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    asset: AssetResponse | null;
}) {
    const queryClient = useQueryClient();
    const [userId, setUserId] = useState('');
    const [expectedReturn, setExpectedReturn] = useState('');
    const [condition, setCondition] = useState(asset?.condition ?? 'GOOD');
    const [notes, setNotes] = useState('');
    const [qty, setQty] = useState('1');

    const { data: users } = useQuery({
        queryKey: ['users-list'],
        queryFn: () => apiGet<PagedResponse<UserOption>>('/users?size=200'),
        enabled: open,
    });

    const mutation = useMutation({
        mutationFn: (data: Record<string, unknown>) => apiPost('/asset-assignments/check-out', data),
        onSuccess: () => {
            toast.success('Asset checked out successfully');
            queryClient.invalidateQueries({ queryKey: ['assets'] });
            queryClient.invalidateQueries({ queryKey: ['asset-stats'] });
            onOpenChange(false);
        },
        onError: (err: Error) => toast.error(err.message),
    });

    const handleSubmit = () => {
        if (!userId) { toast.error('Select a user'); return; }
        mutation.mutate({
            assetId: asset!.id,
            userId: Number(userId),
            expectedReturnDate: expectedReturn || null,
            conditionOnCheckout: condition,
            notes: notes || null,
            quantity: asset?.trackingType === 'CONSUMABLE' ? Number(qty) : 1,
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-w-lg flex-col max-h-[85vh] p-0 gap-0">
                <DialogHeader className="shrink-0 border-b px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-blue-100 p-2.5">
                            <LogOut className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <DialogTitle className="text-lg">Check Out Asset</DialogTitle>
                            <DialogDescription>Assign this asset to a team member</DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                    {/* Asset Preview */}
                    <div className="flex items-center gap-4 rounded-lg border border-blue-100 bg-blue-50/50 p-4">
                        <div className="rounded-lg bg-white p-2.5 shadow-sm">
                            {asset?.trackingType === 'INDIVIDUAL'
                                ? <Laptop className="h-6 w-6 text-blue-600" />
                                : <Package className="h-6 w-6 text-purple-600" />
                            }
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">{asset?.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="font-mono text-xs font-medium text-blue-600">{asset?.assetTag}</span>
                                {asset?.serialNumber && (
                                    <>
                                        <span className="text-gray-300">|</span>
                                        <span className="font-mono text-xs text-gray-500">{asset.serialNumber}</span>
                                    </>
                                )}
                            </div>
                        </div>
                        <Badge variant="outline" className={CONDITION_STYLES[asset?.condition ?? ''] ?? ''}>
                            {asset?.condition}
                        </Badge>
                    </div>

                    {/* Assign to */}
                    <div className="space-y-1.5">
                        <Label>Assign to <span className="text-red-500">*</span></Label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <Select value={userId} onValueChange={setUserId}>
                                <SelectTrigger className="pl-10"><SelectValue placeholder="Select a team member" /></SelectTrigger>
                                <SelectContent>
                                    {users?.content?.map((u) => (
                                        <SelectItem key={u.id} value={u.id.toString()}>
                                            {u.firstName} {u.lastName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Quantity (consumable only) */}
                    {asset?.trackingType === 'CONSUMABLE' && (
                        <div className="space-y-1.5">
                            <Label>Quantity to assign</Label>
                            <Input type="number" min="1" max={asset.quantity} value={qty} onChange={(e) => setQty(e.target.value)} />
                            <p className="text-xs text-gray-500">{asset.quantity} currently in stock</p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label>Condition at Checkout</Label>
                            <Select value={condition} onValueChange={setCondition}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {['NEW', 'GOOD', 'FAIR', 'POOR', 'DAMAGED'].map((c) => (
                                        <SelectItem key={c} value={c}>{c}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label>Expected Return</Label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <Input type="date" className="pl-10" value={expectedReturn} onChange={(e) => setExpectedReturn(e.target.value)} />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label>Notes</Label>
                        <Textarea rows={2} placeholder="Any notes about this checkout..." value={notes} onChange={(e) => setNotes(e.target.value)} />
                    </div>
                </div>

                <DialogFooter className="shrink-0 border-t px-6 py-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={mutation.isPending}>
                        {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {mutation.isPending ? 'Assigning...' : 'Check Out'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ============================================
// Detail Info Row (reusable within detail dialog)
// ============================================

function DetailRow({ icon: Icon, label, children }: { icon: React.ElementType; label: string; children: React.ReactNode }) {
    return (
        <div className="flex items-start gap-3 py-2">
            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
            <div className="min-w-0">
                <p className="text-xs font-medium text-gray-500">{label}</p>
                <div className="mt-0.5 text-sm text-gray-900">{children}</div>
            </div>
        </div>
    );
}

// ============================================
// Asset Detail Dialog
// ============================================

function AssetDetailDialog({
    open,
    onOpenChange,
    assetId,
}: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    assetId: number | null;
}) {
    const { data: detail, isLoading } = useQuery({
        queryKey: ['asset-detail', assetId],
        queryFn: () => apiGet<AssetDetailResponse>(`/assets/${assetId}`),
        enabled: open && !!assetId,
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-w-3xl flex-col max-h-[90vh] p-0 gap-0">
                <DialogHeader className="shrink-0 border-b px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-blue-100 p-2.5">
                            <Eye className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <DialogTitle className="text-lg">Asset Details</DialogTitle>
                            <DialogDescription className="truncate">
                                {detail?.assetTag ? `${detail.assetTag} — ${detail.name}` : 'Loading...'}
                            </DialogDescription>
                        </div>
                        {detail && (
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className={STATUS_STYLES[detail.status] ?? ''}>
                                    {formatStatus(detail.status)}
                                </Badge>
                                <Badge variant="outline" className={CONDITION_STYLES[detail.condition] ?? ''}>
                                    {detail.condition}
                                </Badge>
                            </div>
                        )}
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto px-6 py-5">
                    {isLoading ? (
                        <div className="space-y-4">
                            <Skeleton className="h-24 w-full rounded-lg" />
                            <div className="grid grid-cols-2 gap-4">
                                {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
                            </div>
                        </div>
                    ) : detail ? (
                        <div className="space-y-6">
                            {/* Hero Card */}
                            <div className="flex items-center gap-4 rounded-lg border bg-gray-50/50 p-4">
                                <div className="rounded-xl bg-white p-3 shadow-sm">
                                    {detail.trackingType === 'INDIVIDUAL'
                                        ? <Laptop className="h-8 w-8 text-blue-600" />
                                        : <Package className="h-8 w-8 text-purple-600" />
                                    }
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-lg font-semibold text-gray-900 truncate">{detail.name}</p>
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                                        <span className="font-mono text-sm font-medium text-blue-600">{detail.assetTag}</span>
                                        {detail.serialNumber && (
                                            <span className="flex items-center gap-1 text-xs text-gray-500">
                                                <Hash className="h-3 w-3" />
                                                <span className="font-mono">{detail.serialNumber}</span>
                                            </span>
                                        )}
                                        {detail.barcode && (
                                            <span className="flex items-center gap-1 text-xs text-gray-500">
                                                <Barcode className="h-3 w-3" />
                                                <span className="font-mono">{detail.barcode}</span>
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                    {detail.trackingType === 'INDIVIDUAL' ? 'Individual' : 'Consumable'}
                                </Badge>
                            </div>

                            {/* Info Grid */}
                            <div className="grid grid-cols-2 gap-x-6">
                                <DetailRow icon={Tag} label="Category">{detail.categoryName}</DetailRow>
                                <DetailRow icon={Building2} label="Manufacturer">
                                    {detail.manufacturer ? `${detail.manufacturer}${detail.model ? ` ${detail.model}` : ''}` : '-'}
                                </DetailRow>
                                <DetailRow icon={MapPin} label="Location">{detail.location ?? '-'}</DetailRow>
                                <DetailRow icon={DollarSign} label="Purchase Price">{formatCurrency(detail.purchasePrice)}</DetailRow>
                                <DetailRow icon={Calendar} label="Purchase Date">{formatDate(detail.purchaseDate)}</DetailRow>
                                <DetailRow icon={ShieldCheck} label="Warranty Expiry">{formatDate(detail.warrantyExpiry)}</DetailRow>
                                {detail.trackingType === 'CONSUMABLE' && (
                                    <>
                                        <DetailRow icon={Package} label="Stock">
                                            <span className={detail.quantity <= detail.minQuantity && detail.minQuantity > 0 ? 'font-semibold text-red-600' : ''}>
                                                {detail.quantity}
                                            </span>
                                            <span className="text-gray-400"> / {detail.minQuantity} min</span>
                                        </DetailRow>
                                    </>
                                )}
                                {detail.currentAssignee && (
                                    <DetailRow icon={User} label="Assigned To">
                                        <span className="font-medium">{detail.currentAssignee.userName}</span>
                                        <span className="text-gray-500"> since {formatDate(detail.currentAssignee.checkedOutAt)}</span>
                                    </DetailRow>
                                )}
                            </div>

                            {/* Specifications */}
                            {detail.specifications && Object.keys(detail.specifications).length > 0 && (
                                <>
                                    <Separator />
                                    <div className="space-y-3">
                                        <SectionHeader icon={ClipboardList} title="Specifications" />
                                        <div className="grid grid-cols-2 gap-2 rounded-lg border bg-gray-50/50 p-4 text-sm">
                                            {Object.entries(detail.specifications).filter(([, v]) => v).map(([k, v]) => (
                                                <div key={k} className="flex justify-between border-b border-dashed border-gray-200 py-1.5 last:border-0">
                                                    <span className="text-gray-500 capitalize">{k}</span>
                                                    <span className="font-medium text-gray-900">{v}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Notes */}
                            {detail.notes && (
                                <>
                                    <Separator />
                                    <div className="space-y-2">
                                        <SectionHeader icon={FileText} title="Notes" />
                                        <p className="rounded-lg border bg-gray-50/50 p-3 text-sm text-gray-600">{detail.notes}</p>
                                    </div>
                                </>
                            )}

                            {/* Assignment History */}
                            {detail.assignments.length > 0 && (
                                <>
                                    <Separator />
                                    <div className="space-y-3">
                                        <SectionHeader icon={User} title="Assignment History" description={`${detail.assignments.length} record(s)`} />
                                        <div className="space-y-2">
                                            {detail.assignments.map((a) => (
                                                <div key={a.id} className="flex items-center gap-3 rounded-lg border p-3">
                                                    <div className={`rounded-full p-1.5 ${a.status === 'CHECKED_OUT' ? 'bg-blue-100' : 'bg-green-100'}`}>
                                                        {a.status === 'CHECKED_OUT'
                                                            ? <LogOut className="h-3.5 w-3.5 text-blue-600" />
                                                            : <LogIn className="h-3.5 w-3.5 text-green-600" />
                                                        }
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900">{a.userName}</p>
                                                        <p className="text-xs text-gray-500">
                                                            {formatDate(a.checkedOutAt)}
                                                            {a.checkedInAt && ` → ${formatDate(a.checkedInAt)}`}
                                                            {a.assignedByName && ` · by ${a.assignedByName}`}
                                                        </p>
                                                    </div>
                                                    <Badge variant="outline" className={a.status === 'CHECKED_OUT' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-green-50 text-green-700 border-green-200'}>
                                                        {a.status === 'CHECKED_OUT' ? 'Active' : 'Returned'}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Audit Trail */}
                            {detail.history.length > 0 && (
                                <>
                                    <Separator />
                                    <div className="space-y-3">
                                        <SectionHeader icon={History} title="Audit Trail" description={`${detail.history.length} event(s)`} />
                                        <div className="rounded-lg border">
                                            {detail.history.map((h, i) => (
                                                <div key={h.id} className={`flex items-start gap-3 px-4 py-3 ${i < detail.history.length - 1 ? 'border-b' : ''}`}>
                                                    <div className="mt-0.5 rounded-full bg-gray-100 p-1">
                                                        <History className="h-3 w-3 text-gray-500" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-medium text-gray-900">{h.action}</span>
                                                            {h.performedByName && (
                                                                <span className="text-xs text-gray-500">by {h.performedByName}</span>
                                                            )}
                                                        </div>
                                                        {h.notes && <p className="mt-0.5 text-xs text-gray-500">{h.notes}</p>}
                                                    </div>
                                                    <span className="shrink-0 text-xs text-gray-400">{formatDate(h.createdAt)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : null}
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ============================================
// Main Page
// ============================================

export default function AssetsIndex() {
    const { can } = usePermission();
    const queryClient = useQueryClient();

    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [page, setPage] = useState(0);

    const [createOpen, setCreateOpen] = useState(false);
    const [editAsset, setEditAsset] = useState<AssetResponse | null>(null);
    const [checkOutAsset, setCheckOutAsset] = useState<AssetResponse | null>(null);
    const [detailAssetId, setDetailAssetId] = useState<number | null>(null);

    // Fetch categories
    const { data: categories } = useQuery({
        queryKey: ['asset-categories'],
        queryFn: () => apiGet<AssetCategory[]>('/asset-categories'),
    });

    // Fetch stats
    const { data: stats } = useQuery({
        queryKey: ['asset-stats'],
        queryFn: () => apiGet<DashboardStats>('/assets/dashboard-stats'),
    });

    // Fetch assets with filters
    const { data: assetsData, isLoading } = useQuery({
        queryKey: ['assets', search, categoryFilter, statusFilter, typeFilter, page],
        queryFn: () => {
            const params = new URLSearchParams();
            if (search) params.set('search', search);
            if (categoryFilter !== 'all') params.set('categoryId', categoryFilter);
            if (statusFilter !== 'all') params.set('status', statusFilter);
            if (typeFilter !== 'all') params.set('trackingType', typeFilter);
            params.set('page', String(page));
            params.set('size', '20');
            return apiGet<PagedResponse<AssetResponse>>(`/assets?${params}`);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => apiDelete(`/assets/${id}`),
        onSuccess: () => {
            toast.success('Asset deleted');
            queryClient.invalidateQueries({ queryKey: ['assets'] });
            queryClient.invalidateQueries({ queryKey: ['asset-stats'] });
        },
        onError: (err: Error) => toast.error(err.message),
    });

    const checkInMutation = useMutation({
        mutationFn: ({ assignmentId }: { assignmentId: number }) =>
            apiPost(`/asset-assignments/${assignmentId}/check-in`, { conditionOnCheckin: 'GOOD' }),
        onSuccess: () => {
            toast.success('Asset checked in');
            queryClient.invalidateQueries({ queryKey: ['assets'] });
            queryClient.invalidateQueries({ queryKey: ['asset-stats'] });
        },
        onError: (err: Error) => toast.error(err.message),
    });

    const handleSearch = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        setPage(0);
    }, []);

    const handleReset = () => {
        setSearch('');
        setCategoryFilter('all');
        setStatusFilter('all');
        setTypeFilter('all');
        setPage(0);
    };

    const handleDelete = (asset: AssetResponse) => {
        if (window.confirm(`Delete "${asset.name}" (${asset.assetTag})?`)) {
            deleteMutation.mutate(asset.id);
        }
    };

    const handleCheckIn = async (asset: AssetResponse) => {
        const detail = await apiGet<AssetDetailResponse>(`/assets/${asset.id}`);
        const activeAssignment = detail.assignments.find((a) => a.status === 'CHECKED_OUT');
        if (activeAssignment) {
            checkInMutation.mutate({ assignmentId: activeAssignment.id });
        } else {
            toast.error('No active assignment found');
        }
    };

    const hasFilters = search || categoryFilter !== 'all' || statusFilter !== 'all' || typeFilter !== 'all';

    const statCards = [
        { label: 'Total', value: stats?.totalAssets ?? 0, icon: Package, color: 'text-gray-600 bg-gray-100' },
        { label: 'Available', value: stats?.available ?? 0, icon: Box, color: 'text-green-600 bg-green-100' },
        { label: 'Assigned', value: stats?.assigned ?? 0, icon: Laptop, color: 'text-blue-600 bg-blue-100' },
        { label: 'In Repair', value: stats?.inRepair ?? 0, icon: AlertTriangle, color: 'text-yellow-600 bg-yellow-100' },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-blue-100 p-2">
                        <Package className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900">Asset Management</h1>
                        <p className="text-sm text-gray-500">Track and manage company assets</p>
                    </div>
                </div>
                {can('assets.create') && (
                    <Button onClick={() => setCreateOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Asset
                    </Button>
                )}
            </div>

            <div className="px-6 space-y-6">
                {/* Stat Cards */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    {statCards.map((s) => (
                        <Card key={s.label}>
                            <CardContent className="flex items-center gap-4 py-4">
                                <div className={`rounded-lg p-2.5 ${s.color}`}>
                                    <s.icon className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                                    <p className="text-sm text-gray-500">{s.label}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSearch} className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                <Input
                                    type="text"
                                    placeholder="Search by name, asset tag, serial number, manufacturer..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="h-11 pl-10 text-base"
                                />
                            </div>
                            <div className="flex flex-wrap items-end gap-3">
                                <div className="min-w-[180px] flex-1 space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700">Category</label>
                                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                        <SelectTrigger className="h-10"><SelectValue placeholder="All Categories" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Categories</SelectItem>
                                            {categories?.map((c) => (
                                                <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="min-w-[180px] flex-1 space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700">Status</label>
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="h-10"><SelectValue placeholder="All Status" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Status</SelectItem>
                                            {['AVAILABLE', 'ASSIGNED', 'IN_REPAIR', 'RETIRED', 'LOST', 'DISPOSED'].map((s) => (
                                                <SelectItem key={s} value={s}>{formatStatus(s)}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="min-w-[180px] flex-1 space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700">Type</label>
                                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                                        <SelectTrigger className="h-10"><SelectValue placeholder="All Types" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Types</SelectItem>
                                            <SelectItem value="INDIVIDUAL">Individual</SelectItem>
                                            <SelectItem value="CONSUMABLE">Consumable</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex gap-2">
                                    <Button type="submit" className="h-10"><Search className="mr-2 h-4 w-4" />Search</Button>
                                    {hasFilters && (
                                        <Button type="button" variant="outline" onClick={handleReset} className="h-10">
                                            <X className="mr-2 h-4 w-4" />Reset
                                        </Button>
                                    )}
                                </div>
                            </div>
                            <div className="border-t pt-2 text-sm text-gray-600">
                                Showing <span className="font-semibold text-gray-900">{assetsData?.totalElements ?? 0}</span> assets
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Table */}
                <Card>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50 hover:bg-gray-50">
                                    <TableHead className="font-semibold">Asset</TableHead>
                                    <TableHead className="font-semibold">Tag / Serial</TableHead>
                                    <TableHead className="font-semibold">Category</TableHead>
                                    <TableHead className="font-semibold">Stock / Assignee</TableHead>
                                    <TableHead className="font-semibold">Condition</TableHead>
                                    <TableHead className="font-semibold">Status</TableHead>
                                    <TableHead className="text-right font-semibold">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    [...Array(5)].map((_, i) => (
                                        <TableRow key={i}>
                                            {[...Array(7)].map((__, j) => (
                                                <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : assetsData && assetsData.content.length > 0 ? (
                                    assetsData.content.map((asset) => (
                                        <TableRow key={asset.id} className="hover:bg-gray-50">
                                            <TableCell className="py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="rounded-lg bg-blue-50 p-2">
                                                        {asset.trackingType === 'INDIVIDUAL' ? (
                                                            <Laptop className="h-4 w-4 text-blue-600" />
                                                        ) : (
                                                            <Package className="h-4 w-4 text-purple-600" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{asset.name}</p>
                                                        {asset.manufacturer && (
                                                            <p className="text-xs text-gray-500">{asset.manufacturer} {asset.model}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <p className="font-mono text-sm font-medium text-gray-900">{asset.assetTag}</p>
                                                {asset.serialNumber && (
                                                    <div className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
                                                        <Barcode className="h-3 w-3" />
                                                        <span className="font-mono">{asset.serialNumber}</span>
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{asset.categoryName}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                {asset.trackingType === 'CONSUMABLE' ? (
                                                    <div className="flex items-center gap-1.5">
                                                        <span className={`font-semibold ${asset.quantity <= asset.minQuantity && asset.minQuantity > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                                                            {asset.quantity}
                                                        </span>
                                                        <span className="text-xs text-gray-400">/ {asset.minQuantity} min</span>
                                                        {asset.quantity <= asset.minQuantity && asset.minQuantity > 0 && (
                                                            <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                                                        )}
                                                    </div>
                                                ) : asset.currentAssignee ? (
                                                    <div className="text-sm">
                                                        <p className="font-medium text-gray-900">{asset.currentAssignee.userName}</p>
                                                        <p className="text-xs text-gray-500">Since {formatDate(asset.currentAssignee.checkedOutAt)}</p>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-400">Unassigned</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={CONDITION_STYLES[asset.condition] ?? ''}>
                                                    {asset.condition}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={STATUS_STYLES[asset.status] ?? ''}>
                                                    {formatStatus(asset.status)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <button className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-gray-100">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48">
                                                        <DropdownMenuItem onClick={() => setDetailAssetId(asset.id)}>
                                                            <Eye className="mr-2 h-4 w-4" />View Details
                                                        </DropdownMenuItem>
                                                        {can('assets.edit') && (
                                                            <DropdownMenuItem onClick={() => setEditAsset(asset)}>
                                                                <Edit className="mr-2 h-4 w-4" />Edit
                                                            </DropdownMenuItem>
                                                        )}
                                                        {can('assets.assign') && asset.status === 'AVAILABLE' && (
                                                            <DropdownMenuItem onClick={() => setCheckOutAsset(asset)}>
                                                                <LogOut className="mr-2 h-4 w-4" />Check Out
                                                            </DropdownMenuItem>
                                                        )}
                                                        {can('assets.assign') && asset.status === 'ASSIGNED' && asset.trackingType === 'INDIVIDUAL' && (
                                                            <DropdownMenuItem onClick={() => handleCheckIn(asset)}>
                                                                <LogIn className="mr-2 h-4 w-4" />Check In
                                                            </DropdownMenuItem>
                                                        )}
                                                        {can('assets.delete') && asset.status !== 'ASSIGNED' && (
                                                            <>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem onClick={() => handleDelete(asset)} className="text-red-600 focus:bg-red-50 focus:text-red-600">
                                                                    <Trash2 className="mr-2 h-4 w-4" />Delete
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="py-16 text-center">
                                            <div className="flex flex-col items-center">
                                                <div className="mb-4 rounded-full bg-gray-100 p-4">
                                                    <Package className="h-12 w-12 text-gray-400" />
                                                </div>
                                                <p className="mb-1 text-lg font-medium text-gray-900">No assets found</p>
                                                <p className="mb-4 text-sm text-gray-500">Get started by adding your first asset</p>
                                                {can('assets.create') && (
                                                    <Button onClick={() => setCreateOpen(true)}>
                                                        <Plus className="mr-2 h-4 w-4" />Add Asset
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {assetsData && assetsData.content.length > 0 && (
                        <div className="flex items-center justify-between border-t bg-gray-50 px-6 py-4">
                            <p className="text-sm text-gray-700">
                                Page <span className="font-medium">{assetsData.pageNumber + 1}</span> of{' '}
                                <span className="font-medium">{assetsData.totalPages}</span>{' '}
                                ({assetsData.totalElements} total)
                            </p>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => setPage((p) => p - 1)} disabled={assetsData.first}>
                                    <ChevronLeft className="mr-1 h-4 w-4" />Previous
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={assetsData.last}>
                                    Next<ChevronRight className="ml-1 h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </Card>
            </div>

            {/* Dialogs */}
            {createOpen && (
                <CreateEditDialog open={createOpen} onOpenChange={setCreateOpen} asset={null} categories={categories ?? []} />
            )}
            {editAsset && (
                <CreateEditDialog open={!!editAsset} onOpenChange={(v) => !v && setEditAsset(null)} asset={editAsset} categories={categories ?? []} />
            )}
            {checkOutAsset && (
                <CheckOutDialog open={!!checkOutAsset} onOpenChange={(v) => !v && setCheckOutAsset(null)} asset={checkOutAsset} />
            )}
            {detailAssetId && (
                <AssetDetailDialog open={!!detailAssetId} onOpenChange={(v) => !v && setDetailAssetId(null)} assetId={detailAssetId} />
            )}
        </div>
    );
}
