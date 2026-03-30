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
import type { DepartmentResponse, PagedResponse } from '@/types';

interface UserOption {
    id: number;
    fullName: string;
    email: string;
}

interface FormState {
    name: string;
    code: string;
    description: string;
    parentId: string;
    managerId: string;
    isActive: string;
}

const initialForm: FormState = {
    name: '',
    code: '',
    description: '',
    parentId: '',
    managerId: '',
    isActive: 'true',
};

export default function DepartmentCreateEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [form, setForm] = useState<FormState>(initialForm);
    const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

    // Fetch existing department for edit
    const { data: department, isLoading: loadingDepartment } = useQuery({
        queryKey: ['department', id],
        queryFn: () => apiGet<DepartmentResponse>(`/departments/${id}`),
        enabled: isEdit,
    });

    // Fetch departments for parent dropdown
    const { data: allDepartments } = useQuery({
        queryKey: ['departments-active'],
        queryFn: () => apiGet<DepartmentResponse[]>('/departments/active'),
    });

    // Fetch users for manager dropdown
    const { data: usersData } = useQuery({
        queryKey: ['users-for-select'],
        queryFn: () =>
            apiGet<PagedResponse<UserOption>>('/users/search?size=1000&status=ACTIVE'),
    });

    // Populate form on edit
    useEffect(() => {
        if (department && isEdit) {
            setForm({
                name: department.name || '',
                code: department.code || '',
                description: department.description || '',
                parentId: department.parentId ? String(department.parentId) : '',
                managerId: department.managerId ? String(department.managerId) : '',
                isActive: department.isActive ? 'true' : 'false',
            });
        }
    }, [department, isEdit]);

    const mutation = useMutation({
        mutationFn: async (payload: Record<string, unknown>) => {
            if (isEdit) {
                return apiPut(`/departments/${id}`, payload);
            }
            return apiPost('/departments', payload);
        },
        onSuccess: () => {
            toast.success(
                isEdit
                    ? 'Department updated successfully'
                    : 'Department created successfully',
            );
            navigate('/departments');
        },
        onError: (error: unknown) => {
            const message =
                error instanceof Error ? error.message : 'Something went wrong';
            toast.error(message);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validate
        const newErrors: Partial<Record<keyof FormState, string>> = {};
        if (!form.name.trim()) newErrors.name = 'Name is required';
        if (!form.code.trim()) newErrors.code = 'Code is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        mutation.mutate({
            name: form.name.trim(),
            code: form.code.trim().toUpperCase(),
            description: form.description.trim() || null,
            parentId: form.parentId ? Number(form.parentId) : null,
            managerId: form.managerId ? Number(form.managerId) : null,
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

    // Auto-generate code from name (only on create)
    const handleNameChange = (value: string) => {
        setField('name', value);
        if (!isEdit && !form.code) {
            const autoCode = value
                .toUpperCase()
                .replace(/[^A-Z0-9\s]/g, '')
                .replace(/\s+/g, '_')
                .substring(0, 50);
            setForm((prev) => ({ ...prev, name: value, code: autoCode }));
        }
    };

    const parentOptions = (allDepartments || []).filter(
        (d) => !isEdit || d.id !== Number(id),
    );
    const userOptions = usersData?.content || [];

    if (isEdit && loadingDepartment) {
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
                    {isEdit ? 'Edit Department' : 'Create Department'} | HRIS
                </title>
            </Helmet>

            <div className="mx-auto max-w-2xl space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link to="/departments">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {isEdit ? 'Edit Department' : 'Create Department'}
                        </h1>
                        <p className="text-sm text-gray-500">
                            {isEdit
                                ? 'Update department information.'
                                : 'Add a new department to the organization.'}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Department Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Name */}
                            <div className="space-y-1.5">
                                <Label htmlFor="name">
                                    Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    value={form.name}
                                    onChange={(e) => handleNameChange(e.target.value)}
                                    placeholder="e.g. Engineering"
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-500">{errors.name}</p>
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
                                    placeholder="e.g. ENG"
                                />
                                {errors.code && (
                                    <p className="text-sm text-red-500">{errors.code}</p>
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
                                    placeholder="Brief description of the department..."
                                    rows={3}
                                />
                            </div>

                            {/* Parent Department */}
                            <div className="space-y-1.5">
                                <Label>Parent Department</Label>
                                <Select
                                    value={form.parentId || 'none'}
                                    onValueChange={(v) =>
                                        setField('parentId', v === 'none' ? '' : v)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="None" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">None</SelectItem>
                                        {parentOptions.map((d) => (
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

                            {/* Manager */}
                            <div className="space-y-1.5">
                                <Label>Manager</Label>
                                <Select
                                    value={form.managerId || 'none'}
                                    onValueChange={(v) =>
                                        setField('managerId', v === 'none' ? '' : v)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="None" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">None</SelectItem>
                                        {userOptions.map((u) => (
                                            <SelectItem
                                                key={u.id}
                                                value={String(u.id)}
                                            >
                                                {u.fullName} ({u.email})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
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
                        <Link to="/departments">
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </Link>
                        <Button type="submit" disabled={mutation.isPending}>
                            {mutation.isPending && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            {isEdit ? 'Update Department' : 'Create Department'}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}
