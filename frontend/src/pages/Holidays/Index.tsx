/**
 * Holidays Management Page
 * List holidays, manage country configs, trigger fetch
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import {
    Calendar,
    Globe,
    Loader2,
    PartyPopper,
    Plus,
    RefreshCw,
    Search,
    Trash2,
    X,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { usePermission } from '@/hooks/use-permission';
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/spring-boot-api';

interface HolidayResponse {
    id: number;
    name: string;
    date: string;
    countryCode: string;
    countryName: string;
    state: string;
    region: string;
    type: string;
    description: string;
    isActive: boolean;
}

interface CountryConfig {
    id: number;
    countryCode: string;
    countryName: string;
    isActive: boolean;
}

const currentYear = new Date().getFullYear();

export default function HolidayList() {
    const queryClient = useQueryClient();
    const { can } = usePermission();

    const [yearFilter, setYearFilter] = useState(String(currentYear));
    const [countryFilter, setCountryFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [addCountryDialog, setAddCountryDialog] = useState(false);
    const [newCountryCode, setNewCountryCode] = useState('');
    const [newCountryName, setNewCountryName] = useState('');

    // Fetch holidays
    const { data: holidays, isLoading } = useQuery({
        queryKey: ['holidays', yearFilter, countryFilter],
        queryFn: async () => {
            const params = new URLSearchParams();
            params.set('year', yearFilter);
            if (countryFilter !== 'all') params.set('countryCode', countryFilter);
            return apiGet<HolidayResponse[]>(`/holidays?${params.toString()}`);
        },
    });

    // Fetch country configs
    const { data: countries } = useQuery({
        queryKey: ['holiday-countries'],
        queryFn: () => apiGet<CountryConfig[]>('/holidays/countries'),
    });

    // Fetch holidays mutation
    const fetchMutation = useMutation({
        mutationFn: (countryCode?: string) =>
            countryCode ? apiPost(`/holidays/fetch/${countryCode}`) : apiPost('/holidays/fetch'),
        onSuccess: () => {
            toast.success('Holidays fetched successfully');
            queryClient.invalidateQueries({ queryKey: ['holidays'] });
        },
        onError: (err: Error) => toast.error(err.message),
    });

    // Add country mutation
    const addCountryMutation = useMutation({
        mutationFn: (data: { countryCode: string; countryName: string }) =>
            apiPost('/holidays/countries', data),
        onSuccess: () => {
            toast.success('Country added');
            queryClient.invalidateQueries({ queryKey: ['holiday-countries'] });
            setAddCountryDialog(false);
            setNewCountryCode('');
            setNewCountryName('');
        },
        onError: (err: Error) => toast.error(err.message),
    });

    // Toggle country mutation
    const toggleMutation = useMutation({
        mutationFn: (id: number) => apiPatch(`/holidays/countries/${id}/toggle`),
        onSuccess: () => {
            toast.success('Country config updated');
            queryClient.invalidateQueries({ queryKey: ['holiday-countries'] });
        },
        onError: (err: Error) => toast.error(err.message),
    });

    // Delete country mutation
    const deleteCountryMutation = useMutation({
        mutationFn: (id: number) => apiDelete(`/holidays/countries/${id}`),
        onSuccess: () => {
            toast.success('Country config removed');
            queryClient.invalidateQueries({ queryKey: ['holiday-countries'] });
        },
        onError: (err: Error) => toast.error(err.message),
    });

    const filteredHolidays = (holidays || []).filter((h) =>
        !search || h.name.toLowerCase().includes(search.toLowerCase()),
    );

    const formatDate = (date: string) => new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

    return (
        <>
            <Helmet><title>Holidays | HRIS</title></Helmet>

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-amber-100 p-2">
                            <PartyPopper className="h-6 w-6 text-amber-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Holidays</h1>
                            <p className="text-sm text-gray-500">Manage public holidays by country</p>
                        </div>
                    </div>
                    {can('HOLIDAY_CREATE') && (
                        <Button onClick={() => fetchMutation.mutate(undefined)} disabled={fetchMutation.isPending}>
                            {fetchMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                            Fetch All Holidays
                        </Button>
                    )}
                </div>

                {/* Country Configs */}
                {can('HOLIDAY_CREATE') && (
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2 text-base"><Globe className="h-5 w-5" />Configured Countries</CardTitle>
                                <Button size="sm" variant="outline" onClick={() => setAddCountryDialog(true)}>
                                    <Plus className="mr-2 h-4 w-4" />Add Country
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {(countries || []).length === 0 ? (
                                <p className="text-sm text-gray-500">No countries configured. Add one to start fetching holidays.</p>
                            ) : (
                                <div className="flex flex-wrap gap-3">
                                    {(countries || []).map((c) => (
                                        <div key={c.id} className="flex items-center gap-2 rounded-lg border px-3 py-2">
                                            <span className="text-sm font-medium">{c.countryName}</span>
                                            <Badge variant="secondary">{c.countryCode}</Badge>
                                            <Switch checked={c.isActive} onCheckedChange={() => toggleMutation.mutate(c.id)} />
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => deleteCountryMutation.mutate(c.id)}>
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Filters */}
                <div className="flex flex-col gap-4 sm:flex-row">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input placeholder="Search holidays..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
                        {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="h-4 w-4 text-gray-400" /></button>}
                    </div>
                    <Select value={yearFilter} onValueChange={setYearFilter}>
                        <SelectTrigger className="w-full sm:w-28"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
                                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={countryFilter} onValueChange={setCountryFilter}>
                        <SelectTrigger className="w-full sm:w-44"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Countries</SelectItem>
                            {(countries || []).map((c) => (
                                <SelectItem key={c.countryCode} value={c.countryCode}>{c.countryName}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Holidays Table */}
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Holiday</TableHead>
                                    <TableHead>Country</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Region</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i}>{Array.from({ length: 5 }).map((_, j) => (<TableCell key={j}><Skeleton className="h-5 w-20" /></TableCell>))}</TableRow>
                                    ))
                                ) : filteredHolidays.length === 0 ? (
                                    <TableRow><TableCell colSpan={5}><div className="flex flex-col items-center justify-center py-12"><PartyPopper className="mb-3 h-12 w-12 text-gray-300" /><p className="text-lg font-medium">No holidays found</p><p className="text-sm text-gray-500">Try changing the year or country filter, or fetch holidays.</p></div></TableCell></TableRow>
                                ) : (
                                    filteredHolidays.map((h) => (
                                        <TableRow key={h.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-gray-400" />
                                                    <span className="font-medium">{formatDate(h.date)}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell><span className="font-medium text-gray-900">{h.name}</span></TableCell>
                                            <TableCell><Badge variant="secondary">{h.countryCode}</Badge></TableCell>
                                            <TableCell><span className="text-sm text-gray-600">{h.type || '—'}</span></TableCell>
                                            <TableCell><span className="text-sm text-gray-600">{h.state || h.region || 'National'}</span></TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <p className="text-center text-sm text-gray-500">{filteredHolidays.length} holidays</p>
            </div>

            {/* Add Country Dialog */}
            <Dialog open={addCountryDialog} onOpenChange={setAddCountryDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Country</DialogTitle>
                        <DialogDescription>Add a country to fetch public holidays for.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2"><Label>Country Code *</Label><Input value={newCountryCode} onChange={(e) => setNewCountryCode(e.target.value.toUpperCase())} placeholder="e.g., PH" maxLength={2} /></div>
                        <div className="space-y-2"><Label>Country Name *</Label><Input value={newCountryName} onChange={(e) => setNewCountryName(e.target.value)} placeholder="e.g., Philippines" /></div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAddCountryDialog(false)}>Cancel</Button>
                        <Button disabled={!newCountryCode || !newCountryName || addCountryMutation.isPending} onClick={() => addCountryMutation.mutate({ countryCode: newCountryCode, countryName: newCountryName })}>
                            {addCountryMutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Adding...</> : 'Add Country'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
