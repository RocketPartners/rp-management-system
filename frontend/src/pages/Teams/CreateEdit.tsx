import { useEffect, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
    ArrowLeft,
    Check,
    Loader2,
    Save,
    Search,
    UsersRound,
    X,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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
import { Textarea } from '@/components/ui/textarea';
import { apiGet, apiPost, apiPut } from '@/lib/spring-boot-api';
import type {
    TeamResponse,
    UserResponse,
    PagedResponse,
} from '@/types';

interface UserOption {
    id: number;
    name: string;
    position: string | null;
    department: string | null;
}

function UserSearchSelect({
    users,
    value,
    onChange,
    excludeIds = [],
    error,
    placeholder = 'Select user...',
}: {
    users: UserOption[];
    value: string;
    onChange: (val: string) => void;
    excludeIds?: number[];
    error?: string;
    placeholder?: string;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const selectedUser = users.find((u) => u.id === parseInt(value));

    const filteredUsers = users.filter((user) => {
        if (excludeIds.includes(user.id)) return false;
        const query = searchQuery.toLowerCase();
        return (
            user.name.toLowerCase().includes(query) ||
            user.position?.toLowerCase().includes(query) ||
            user.department?.toLowerCase().includes(query)
        );
    });

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isOpen]);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`flex w-full items-center justify-between rounded-md border bg-white px-3 py-2 text-left shadow-sm transition-colors ${
                    error ? 'border-red-500' : 'border-gray-300'
                } ${isOpen ? 'border-blue-500 ring-2 ring-blue-500' : ''}`}
            >
                {selectedUser ? (
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                        <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-600">
                            <span className="text-xs font-medium text-white">
                                {selectedUser.name.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div className="flex min-w-0 flex-col">
                            <span className="truncate font-medium text-gray-900">
                                {selectedUser.name}
                            </span>
                            {selectedUser.position && (
                                <span className="truncate text-xs text-gray-500">
                                    {selectedUser.position}
                                </span>
                            )}
                        </div>
                    </div>
                ) : (
                    <span className="text-gray-500">{placeholder}</span>
                )}
                <div className="ml-2 flex items-center gap-1">
                    {selectedUser && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onChange('');
                                setSearchQuery('');
                            }}
                            className="rounded p-1 transition-colors hover:bg-gray-100"
                        >
                            <X className="h-4 w-4 text-gray-400" />
                        </button>
                    )}
                </div>
            </button>

            {isOpen && (
                <div className="absolute z-50 mt-1 max-h-[300px] w-full overflow-hidden rounded-md border border-gray-300 bg-white shadow-lg">
                    <div className="sticky top-0 border-b border-gray-200 bg-white p-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by name, position, or department..."
                                className="w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                    <div className="max-h-[240px] overflow-y-auto">
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map((user) => (
                                <button
                                    key={user.id}
                                    type="button"
                                    onClick={() => {
                                        onChange(String(user.id));
                                        setIsOpen(false);
                                        setSearchQuery('');
                                    }}
                                    className={`flex w-full items-center gap-3 px-3 py-2.5 transition-colors hover:bg-gray-50 ${
                                        value === String(user.id)
                                            ? 'bg-blue-50'
                                            : ''
                                    }`}
                                >
                                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-600">
                                        <span className="text-sm font-medium text-white">
                                            {user.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="min-w-0 flex-1 text-left">
                                        <span className="truncate font-medium text-gray-900">
                                            {user.name}
                                        </span>
                                        {(user.position || user.department) && (
                                            <div className="flex items-center gap-2 truncate text-xs text-gray-500">
                                                {user.position && (
                                                    <span>{user.position}</span>
                                                )}
                                                {user.position &&
                                                    user.department && (
                                                        <span>&middot;</span>
                                                    )}
                                                {user.department && (
                                                    <span>
                                                        {user.department}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    {value === String(user.id) && (
                                        <Check className="h-4 w-4 flex-shrink-0 text-blue-600" />
                                    )}
                                </button>
                            ))
                        ) : (
                            <div className="px-3 py-8 text-center text-sm text-gray-500">
                                No users found
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

interface FormData {
    name: string;
    description: string;
    leaderId: string;
    subLeaderId: string;
    status: string;
    memberIds: number[];
}

export default function TeamCreateEdit() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const isEditing = !!id;

    const { data: team, isLoading: teamLoading } = useQuery({
        queryKey: ['teams', Number(id)],
        queryFn: () => apiGet<TeamResponse>(`/teams/${id}`),
        enabled: isEditing,
    });

    const { data: usersPage, isLoading: usersLoading } = useQuery({
        queryKey: ['users', 'active-all'],
        queryFn: () =>
            apiGet<PagedResponse<UserResponse>>(
                '/users/search?size=1000&status=ACTIVE',
            ),
    });

    const userOptions: UserOption[] = (usersPage?.content ?? []).map((u) => ({
        id: u.id,
        name: u.fullName,
        position: u.positionTitle,
        department: u.departmentName,
    }));

    const [formData, setFormData] = useState<FormData>({
        name: '',
        description: '',
        leaderId: '',
        subLeaderId: '',
        status: 'ACTIVE',
        memberIds: [],
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [memberSearch, setMemberSearch] = useState('');
    const [initialized, setInitialized] = useState(false);

    // Initialize form data when team loads (edit mode)
    useEffect(() => {
        if (isEditing && team && !initialized) {
            setFormData({
                name: team.name,
                description: team.description || '',
                leaderId: team.leaderId ? String(team.leaderId) : '',
                subLeaderId: team.subLeaderId ? String(team.subLeaderId) : '',
                status: team.status,
                memberIds:
                    team.members?.map((m) => m.userId) || [],
            });
            setInitialized(true);
        }
    }, [team, isEditing, initialized]);

    // Auto-add leader and sub-leader to members list
    useEffect(() => {
        const newMembers = [...formData.memberIds];
        let changed = false;

        if (
            formData.leaderId &&
            !newMembers.includes(parseInt(formData.leaderId))
        ) {
            newMembers.push(parseInt(formData.leaderId));
            changed = true;
        }
        if (
            formData.subLeaderId &&
            !newMembers.includes(parseInt(formData.subLeaderId))
        ) {
            newMembers.push(parseInt(formData.subLeaderId));
            changed = true;
        }

        if (changed) {
            setFormData((prev) => ({ ...prev, memberIds: newMembers }));
        }
    }, [formData.leaderId, formData.subLeaderId]);

    const createMutation = useMutation({
        mutationFn: (payload: Record<string, unknown>) =>
            apiPost<TeamResponse>('/teams', payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teams'] });
            toast.success('Team created successfully');
            navigate('/teams');
        },
        onError: (err: Error) => toast.error(err.message),
    });

    const updateMutation = useMutation({
        mutationFn: (payload: Record<string, unknown>) =>
            apiPut<TeamResponse>(`/teams/${id}`, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teams'] });
            toast.success('Team updated successfully');
            navigate(`/teams/${id}`);
        },
        onError: (err: Error) => toast.error(err.message),
    });

    const isSubmitting = createMutation.isPending || updateMutation.isPending;

    function setField<K extends keyof FormData>(key: K, value: FormData[K]) {
        setFormData((prev) => ({ ...prev, [key]: value }));
        setErrors((prev) => {
            const next = { ...prev };
            delete next[key];
            return next;
        });
    }

    function validate(): boolean {
        const newErrors: Record<string, string> = {};
        if (!formData.name.trim()) {
            newErrors.name = 'Team name is required';
        }
        if (!formData.status) {
            newErrors.status = 'Status is required';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!validate()) return;

        const payload = {
            name: formData.name,
            description: formData.description || null,
            leaderId: formData.leaderId ? parseInt(formData.leaderId) : null,
            subLeaderId: formData.subLeaderId
                ? parseInt(formData.subLeaderId)
                : null,
            status: formData.status,
            memberIds: formData.memberIds,
        };

        if (isEditing) {
            updateMutation.mutate(payload);
        } else {
            createMutation.mutate(payload);
        }
    }

    function toggleMember(userId: number) {
        const leaderId = parseInt(formData.leaderId);
        const subLeaderId = parseInt(formData.subLeaderId);

        // Don't allow removing leader or sub-leader from members
        if (userId === leaderId || userId === subLeaderId) return;

        if (formData.memberIds.includes(userId)) {
            setField(
                'memberIds',
                formData.memberIds.filter((mid) => mid !== userId),
            );
        } else {
            setField('memberIds', [...formData.memberIds, userId]);
        }
    }

    const filteredMemberUsers = userOptions.filter((user) => {
        const query = memberSearch.toLowerCase();
        return (
            user.name.toLowerCase().includes(query) ||
            user.position?.toLowerCase().includes(query) ||
            user.department?.toLowerCase().includes(query)
        );
    });

    if (isEditing && (teamLoading || usersLoading)) {
        return (
            <>
                <Helmet>
                    <title>Edit Team | HRIS</title>
                </Helmet>
                <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-64 w-full" />
                </div>
            </>
        );
    }

    return (
        <>
            <Helmet>
                <title>
                    {isEditing ? `Edit ${team?.name}` : 'Create Team'} | HRIS
                </title>
            </Helmet>

            <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <Button asChild variant="ghost" size="sm">
                        <Link to="/teams">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Link>
                    </Button>
                    <div className="h-8 w-px bg-gray-300" />
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-blue-100 p-2">
                            <UsersRound className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">
                                {isEditing ? 'Edit Team' : 'Create Team'}
                            </h2>
                            <p className="mt-1 text-gray-600">
                                {isEditing
                                    ? `Editing "${team?.name}"`
                                    : 'Set up a new team with leader and members'}
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Team Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Team Details</CardTitle>
                            <CardDescription>
                                Basic information about the team
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Team Name *</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) =>
                                            setField('name', e.target.value)
                                        }
                                        placeholder="e.g. Engineering Team"
                                        className={
                                            errors.name ? 'border-red-500' : ''
                                        }
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-red-500">
                                            {errors.name}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="status">Status *</Label>
                                    <Select
                                        value={formData.status}
                                        onValueChange={(value) =>
                                            setField('status', value)
                                        }
                                    >
                                        <SelectTrigger
                                            className={
                                                errors.status
                                                    ? 'border-red-500'
                                                    : ''
                                            }
                                        >
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ACTIVE">
                                                Active
                                            </SelectItem>
                                            <SelectItem value="INACTIVE">
                                                Inactive
                                            </SelectItem>
                                            <SelectItem value="ARCHIVED">
                                                Archived
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.status && (
                                        <p className="text-sm text-red-500">
                                            {errors.status}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) =>
                                        setField('description', e.target.value)
                                    }
                                    placeholder="Brief description of the team's purpose..."
                                    rows={3}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Leadership */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Leadership</CardTitle>
                            <CardDescription>
                                Assign team leader (POC) and optional sub-leader
                                (Sub-POC)
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Team Leader (POC)</Label>
                                    <UserSearchSelect
                                        users={userOptions}
                                        value={formData.leaderId}
                                        onChange={(val) =>
                                            setField('leaderId', val)
                                        }
                                        excludeIds={
                                            formData.subLeaderId
                                                ? [
                                                      parseInt(
                                                          formData.subLeaderId,
                                                      ),
                                                  ]
                                                : []
                                        }
                                        error={errors.leaderId}
                                        placeholder="Select team leader..."
                                    />
                                    {errors.leaderId && (
                                        <p className="text-sm text-red-500">
                                            {errors.leaderId}
                                        </p>
                                    )}
                                    <p className="text-xs text-gray-500">
                                        The team leader will be auto-prefilled
                                        as leave approver for team members.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label>Sub-Leader (Sub-POC)</Label>
                                    <UserSearchSelect
                                        users={userOptions}
                                        value={formData.subLeaderId}
                                        onChange={(val) =>
                                            setField('subLeaderId', val)
                                        }
                                        excludeIds={
                                            formData.leaderId
                                                ? [
                                                      parseInt(
                                                          formData.leaderId,
                                                      ),
                                                  ]
                                                : []
                                        }
                                        error={errors.subLeaderId}
                                        placeholder="Select sub-leader (optional)..."
                                    />
                                    {errors.subLeaderId && (
                                        <p className="text-sm text-red-500">
                                            {errors.subLeaderId}
                                        </p>
                                    )}
                                    <p className="text-xs text-gray-500">
                                        Informational only. Not used for leave
                                        auto-fill.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Members */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Team Members</CardTitle>
                            <CardDescription>
                                Select users to add to this team. Leader and
                                sub-leader are automatically included.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Selected Members Summary */}
                            {formData.memberIds.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {formData.memberIds.map((memberId) => {
                                        const user = userOptions.find(
                                            (u) => u.id === memberId,
                                        );
                                        if (!user) return null;
                                        const isLeader =
                                            memberId ===
                                            parseInt(formData.leaderId);
                                        const isSubLeader =
                                            memberId ===
                                            parseInt(formData.subLeaderId);
                                        return (
                                            <Badge
                                                key={memberId}
                                                variant="secondary"
                                                className="flex items-center gap-1 py-1"
                                            >
                                                {user.name}
                                                {isLeader && (
                                                    <span className="ml-1 rounded bg-blue-100 px-1 text-[10px] font-medium text-blue-700">
                                                        POC
                                                    </span>
                                                )}
                                                {isSubLeader && (
                                                    <span className="ml-1 rounded bg-purple-100 px-1 text-[10px] font-medium text-purple-700">
                                                        Sub-POC
                                                    </span>
                                                )}
                                                {!isLeader && !isSubLeader && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            toggleMember(
                                                                memberId,
                                                            )
                                                        }
                                                        className="ml-1 rounded-full hover:bg-gray-300"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                )}
                                            </Badge>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Search and Select */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <Input
                                    placeholder="Search users to add..."
                                    value={memberSearch}
                                    onChange={(e) =>
                                        setMemberSearch(e.target.value)
                                    }
                                    className="pl-9"
                                />
                            </div>

                            <div className="max-h-[300px] overflow-y-auto rounded-md border">
                                {filteredMemberUsers.length > 0 ? (
                                    filteredMemberUsers.map((user) => {
                                        const isMember =
                                            formData.memberIds.includes(
                                                user.id,
                                            );
                                        const isLeader =
                                            user.id ===
                                            parseInt(formData.leaderId);
                                        const isSubLeader =
                                            user.id ===
                                            parseInt(formData.subLeaderId);
                                        return (
                                            <button
                                                key={user.id}
                                                type="button"
                                                onClick={() =>
                                                    toggleMember(user.id)
                                                }
                                                className={`flex w-full items-center gap-3 border-b px-3 py-2.5 text-left transition-colors last:border-b-0 hover:bg-gray-50 ${
                                                    isMember ? 'bg-blue-50' : ''
                                                }`}
                                            >
                                                <div
                                                    className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border ${
                                                        isMember
                                                            ? 'border-blue-600 bg-blue-600'
                                                            : 'border-gray-300'
                                                    }`}
                                                >
                                                    {isMember && (
                                                        <Check className="h-3 w-3 text-white" />
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="truncate font-medium text-gray-900">
                                                            {user.name}
                                                        </span>
                                                        {isLeader && (
                                                            <Badge className="bg-blue-100 px-1.5 py-0 text-[10px] text-blue-700">
                                                                POC
                                                            </Badge>
                                                        )}
                                                        {isSubLeader && (
                                                            <Badge className="bg-purple-100 px-1.5 py-0 text-[10px] text-purple-700">
                                                                Sub-POC
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    {(user.position ||
                                                        user.department) && (
                                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                                            {user.position && (
                                                                <span>
                                                                    {
                                                                        user.position
                                                                    }
                                                                </span>
                                                            )}
                                                            {user.position &&
                                                                user.department && (
                                                                    <span>
                                                                        &middot;
                                                                    </span>
                                                                )}
                                                            {user.department && (
                                                                <span>
                                                                    {
                                                                        user.department
                                                                    }
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })
                                ) : (
                                    <div className="px-3 py-8 text-center text-sm text-gray-500">
                                        No users found
                                    </div>
                                )}
                            </div>

                            <p className="text-xs text-gray-500">
                                {formData.memberIds.length} member
                                {formData.memberIds.length !== 1 ? 's' : ''}{' '}
                                selected
                            </p>
                        </CardContent>
                    </Card>

                    {/* Submit */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-600">
                                    Fields marked with * are required
                                </p>
                                <div className="flex gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        asChild
                                    >
                                        <Link to="/teams">Cancel</Link>
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="mr-2 h-4 w-4" />
                                                {isEditing
                                                    ? 'Update Team'
                                                    : 'Create Team'}
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </>
    );
}
