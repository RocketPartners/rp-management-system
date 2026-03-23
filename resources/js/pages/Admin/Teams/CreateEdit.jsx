import { Alert, AlertDescription } from '@/components/ui/alert';
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
import { Textarea } from '@/components/ui/textarea';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    Check,
    Loader2,
    Save,
    Search,
    UsersRound,
    X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

function UserSearchSelect({
    users,
    value,
    onChange,
    excludeIds = [],
    error,
    placeholder = 'Select user...',
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const dropdownRef = useRef(null);
    const searchInputRef = useRef(null);

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
        function handleClickOutside(event) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
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
                                                        <span>·</span>
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

export default function CreateEdit({ auth, team = null, users = [] }) {
    const isEditing = !!team;
    const { flash } = usePage().props;

    const { data, setData, post, put, processing, errors } = useForm({
        name: team?.name || '',
        description: team?.description || '',
        leader_id: team?.leader_id ? String(team.leader_id) : '',
        sub_leader_id: team?.sub_leader_id ? String(team.sub_leader_id) : '',
        status: team?.status || 'active',
        members: team?.members?.map((m) => m.id) || [],
    });

    const [memberSearch, setMemberSearch] = useState('');

    // Auto-add leader and sub-leader to members list
    useEffect(() => {
        const newMembers = [...data.members];
        let changed = false;

        if (data.leader_id && !newMembers.includes(parseInt(data.leader_id))) {
            newMembers.push(parseInt(data.leader_id));
            changed = true;
        }
        if (
            data.sub_leader_id &&
            !newMembers.includes(parseInt(data.sub_leader_id))
        ) {
            newMembers.push(parseInt(data.sub_leader_id));
            changed = true;
        }

        if (changed) {
            setData('members', newMembers);
        }
    }, [data.leader_id, data.sub_leader_id]);

    const handleSubmit = (e) => {
        e.preventDefault();

        const payload = {
            ...data,
            leader_id: data.leader_id || null,
            sub_leader_id: data.sub_leader_id || null,
        };

        if (isEditing) {
            put(route('teams.update', team.id), {
                data: payload,
                preserveScroll: true,
            });
        } else {
            post(route('teams.store'), {
                data: payload,
                preserveScroll: true,
            });
        }
    };

    const toggleMember = (userId) => {
        const leaderId = parseInt(data.leader_id);
        const subLeaderId = parseInt(data.sub_leader_id);

        // Don't allow removing leader or sub-leader from members
        if (userId === leaderId || userId === subLeaderId) return;

        if (data.members.includes(userId)) {
            setData(
                'members',
                data.members.filter((id) => id !== userId),
            );
        } else {
            setData('members', [...data.members, userId]);
        }
    };

    const filteredMemberUsers = users.filter((user) => {
        const query = memberSearch.toLowerCase();
        return (
            user.name.toLowerCase().includes(query) ||
            user.position?.toLowerCase().includes(query) ||
            user.department?.toLowerCase().includes(query)
        );
    });

    const excludeLeaderIds = [
        data.leader_id ? parseInt(data.leader_id) : null,
        data.sub_leader_id ? parseInt(data.sub_leader_id) : null,
    ].filter(Boolean);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-3">
                    <Button asChild variant="ghost" size="sm">
                        <Link href={route('teams.index')}>
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
                                    ? `Editing "${team.name}"`
                                    : 'Set up a new team with leader and members'}
                            </p>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title={isEditing ? `Edit ${team.name}` : 'Create Team'} />

            <div className="space-y-6">
                {flash?.error && (
                    <Alert className="border-red-200 bg-red-50">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="font-medium text-red-800">
                            {flash.error}
                        </AlertDescription>
                    </Alert>
                )}

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
                                        value={data.name}
                                        onChange={(e) =>
                                            setData('name', e.target.value)
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
                                        value={data.status}
                                        onValueChange={(value) =>
                                            setData('status', value)
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
                                            <SelectItem value="active">
                                                Active
                                            </SelectItem>
                                            <SelectItem value="inactive">
                                                Inactive
                                            </SelectItem>
                                            <SelectItem value="archived">
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
                                    value={data.description}
                                    onChange={(e) =>
                                        setData('description', e.target.value)
                                    }
                                    placeholder="Brief description of the team's purpose..."
                                    rows={3}
                                    className={
                                        errors.description
                                            ? 'border-red-500'
                                            : ''
                                    }
                                />
                                {errors.description && (
                                    <p className="text-sm text-red-500">
                                        {errors.description}
                                    </p>
                                )}
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
                                        users={users}
                                        value={data.leader_id}
                                        onChange={(val) =>
                                            setData('leader_id', val)
                                        }
                                        excludeIds={
                                            data.sub_leader_id
                                                ? [parseInt(data.sub_leader_id)]
                                                : []
                                        }
                                        error={errors.leader_id}
                                        placeholder="Select team leader..."
                                    />
                                    {errors.leader_id && (
                                        <p className="text-sm text-red-500">
                                            {errors.leader_id}
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
                                        users={users}
                                        value={data.sub_leader_id}
                                        onChange={(val) =>
                                            setData('sub_leader_id', val)
                                        }
                                        excludeIds={
                                            data.leader_id
                                                ? [parseInt(data.leader_id)]
                                                : []
                                        }
                                        error={errors.sub_leader_id}
                                        placeholder="Select sub-leader (optional)..."
                                    />
                                    {errors.sub_leader_id && (
                                        <p className="text-sm text-red-500">
                                            {errors.sub_leader_id}
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
                            {data.members.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {data.members.map((memberId) => {
                                        const user = users.find(
                                            (u) => u.id === memberId,
                                        );
                                        if (!user) return null;
                                        const isLeader =
                                            memberId ===
                                            parseInt(data.leader_id);
                                        const isSubLeader =
                                            memberId ===
                                            parseInt(data.sub_leader_id);
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
                                        const isMember = data.members.includes(
                                            user.id,
                                        );
                                        const isLeader =
                                            user.id ===
                                            parseInt(data.leader_id);
                                        const isSubLeader =
                                            user.id ===
                                            parseInt(data.sub_leader_id);
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
                                                                        ·
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
                                {data.members.length} member
                                {data.members.length !== 1 ? 's' : ''} selected
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
                                        <Link href={route('teams.index')}>
                                            Cancel
                                        </Link>
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        {processing ? (
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
        </AuthenticatedLayout>
    );
}
