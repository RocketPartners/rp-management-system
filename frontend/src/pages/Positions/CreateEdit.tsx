import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { apiGet, apiPost, apiPut } from '@/lib/spring-boot-api';
import type { DepartmentResponse, PositionResponse } from '@/types';

interface FormState {
    title: string;
    code: string;
    description: string;
    departmentId: string;
    minSalary: string;
    maxSalary: string;
    level: string;
    isActive: string;
}

const initialForm: FormState = {
    title: '',
    code: '',
    description: '',
    departmentId: '',
    minSalary: '',
    maxSalary: '',
    level: '',
    isActive: 'true',
};

export default function PositionCreateEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [form, setForm] = useState<FormState>(initialForm);
    const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

    // Fetch existing position for edit
    const { data: position, isLoading: loadingPosition } = useQuery({
        queryKey: ['position', id],
        queryFn: () => apiGet<PositionResponse>(`/positions/${id}`),
        enabled: isEdit,
    });

    // Fetch departments for dropdown
    const { data: departments } = useQuery({
        queryKey: ['departments-active'],
        queryFn: () => apiGet<DepartmentResponse[]>('/departments/active'),
    });

    // Populate form on edit
    useEffect(() => {
        if (position && isEdit) {
            setForm({
                title: position.title || '',
                code: position.code || '',
                description: position.description || '',
                departmentId: position.departmentId
                    ? String(position.departmentId)
                    : '',
                minSalary: position.minSalary != null ? String(position.minSalary) : '',
                maxSalary: position.maxSalary != null ? String(position.maxSalary) : '',
                level: position.level || '',
                isActive: position.isActive ? 'true' : 'false',
            });
        }
    }, [position, isEdit]);

    const mutation = useMutation({
        mutationFn: async (payload: Record<string, unknown>) => {
            if (isEdit) {
                return apiPut(`/positions/${id}`, payload);
            }
            return apiPost('/positions', payload);
        },
        onSuccess: () => {
            toast.success(
                isEdit
                    ? 'Position updated successfully'
                    : 'Position created successfully',
            );
            navigate('/positions');
        },
        onError: (error: unknown) => {
            const message =
                error instanceof Error ? error.message : 'Something went wrong';
            toast.error(message);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newErrors: Partial<Record<keyof FormState, string>> = {};
        if (!form.title.trim()) newErrors.title = 'Title is required';
        if (!form.code.trim()) newErrors.code = 'Code is required';
        if (
            form.minSalary &&
            form.maxSalary &&
            Number(form.minSalary) > Number(form.maxSalary)
        ) {
            newErrors.maxSalary = 'Max salary must be greater than min salary';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        mutation.mutate({
            title: form.title.trim(),
            code: form.code.trim().toUpperCase(),
            description: form.description.trim() || null,
            departmentId: form.departmentId ? Number(form.departmentId) : null,
            minSalary: form.minSalary ? Number(form.minSalary) : null,
            maxSalary: form.maxSalary ? Number(form.maxSalary) : null,
            level: form.level.trim() || null,
            isActive: form.isActive === 'true',
        });
    };

    const setField = (field: keyof FormState, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => {
                const next = { ...prev };
                delete next[field];
                return next;
            });
        }
    };

    // Auto-generate code from title (only on create)
    const handleTitleChange = (value: string) => {
        setField('title', value);
        if (!isEdit && !form.code) {
            const autoCode = value
                .toUpperCase()
                .replace(/[^A-Z0-9\s]/g, '')
                .replace(/\s+/g, '_')
                .substring(0, 50);
            setForm((prev) => ({ ...prev, title: value, code: autoCode }));
        }
    };

    const departmentOptions = departments || [];

    if (isEdit && loadingPosition) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <title>
                    {isEdit ? 'Edit Position' : 'Create Position'} | HRIS
                </title>
            </Helmet>

            <div className="mx-auto max-w-2xl space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link to="/positions">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {isEdit ? 'Edit Position' : 'Create Position'}
                        </h1>
                        <p className="text-sm text-gray-500">
                            {isEdit
                                ? 'Update position information.'
                                : 'Add a new position to the organization.'}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Position Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Title */}
                            <div className="space-y-1.5">
                                <Label htmlFor="title">
                                    Title <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="title"
                                    value={form.title}
                                    onChange={(e) => handleTitleChange(e.target.value)}
                                    placeholder="e.g. Senior Software Engineer"
                                />
                                {errors.title && (
                                    <p className="text-sm text-red-500">
                                        {errors.title}
                                    </p>
                                )}
                            </div>

                            {/* Code */}
                            <div className="space-y-1.5">
                                <Label htmlFor="code">
                                    Code <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="code"
                                    value={form.code}
                                    onChange={(e) =>
                                        setField('code', e.target.value.toUpperCase())
                                    }
                                    placeholder="e.g. SR_SWE"
                                />
                                {errors.code && (
                                    <p className="text-sm text-red-500">
                                        {errors.code}
                                    </p>
                                )}
                            </div>

                            {/* Description */}
                            <div className="space-y-1.5">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={form.description}
                                    onChange={(e) =>
                                        setField('description', e.target.value)
                                    }
                                    placeholder="Brief description of the position..."
                                    rows={3}
                                />
                            </div>

                            {/* Department */}
                            <div className="space-y-1.5">
                                <Label>Department</Label>
                                <Select
                                    value={form.departmentId || 'none'}
                                    onValueChange={(v) =>
                                        setField('departmentId', v === 'none' ? '' : v)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="None" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">None</SelectItem>
                                        {departmentOptions.map((d) => (
                                            <SelectItem
                                                key={d.id}
                                                value={String(d.id)}
                                            >
                                                {d.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Level */}
                            <div className="space-y-1.5">
                                <Label htmlFor="level">Level</Label>
                                <Input
                                    id="level"
                                    value={form.level}
                                    onChange={(e) => setField('level', e.target.value)}
                                    placeholder="e.g. Senior, Mid, Junior"
                                />
                            </div>

                            {/* Salary Range */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="minSalary">Min Salary</Label>
                                    <Input
                                        id="minSalary"
                                        type="number"
                                        value={form.minSalary}
                                        onChange={(e) =>
                                            setField('minSalary', e.target.value)
                                        }
                                        placeholder="0"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="maxSalary">Max Salary</Label>
                                    <Input
                                        id="maxSalary"
                                        type="number"
                                        value={form.maxSalary}
                                        onChange={(e) =>
                                            setField('maxSalary', e.target.value)
                                        }
                                        placeholder="0"
                                    />
                                    {errors.maxSalary && (
                                        <p className="text-sm text-red-500">
                                            {errors.maxSalary}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Status */}
                            <div className="space-y-1.5">
                                <Label>Status</Label>
                                <Select
                                    value={form.isActive}
                                    onValueChange={(v) => setField('isActive', v)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="true">Active</SelectItem>
                                        <SelectItem value="false">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="mt-6 flex justify-end gap-3">
                        <Link to="/positions">
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </Link>
                        <Button type="submit" disabled={mutation.isPending}>
                            {mutation.isPending && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            {isEdit ? 'Update Position' : 'Create Position'}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}
