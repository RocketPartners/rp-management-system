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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { usePermission } from '@/hooks/usePermission';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    CheckCircle2,
    Crown,
    Edit,
    Mail,
    Shield,
    Star,
    User,
    UsersRound,
} from 'lucide-react';

const statusConfig = {
    active: { label: 'Active', className: 'bg-green-100 text-green-800' },
    inactive: { label: 'Inactive', className: 'bg-gray-100 text-gray-800' },
    archived: { label: 'Archived', className: 'bg-red-100 text-red-800' },
};

const roleConfig = {
    lead: {
        label: 'Leader (POC)',
        className: 'bg-blue-100 text-blue-800',
        icon: Crown,
    },
    'sub-lead': {
        label: 'Sub-Leader',
        className: 'bg-purple-100 text-purple-800',
        icon: Shield,
    },
    member: {
        label: 'Member',
        className: 'bg-gray-100 text-gray-700',
        icon: User,
    },
};

function LeaderCard({ title, user, icon: Icon, badgeColor }) {
    if (!user) {
        return (
            <Card>
                <CardContent className="flex items-center gap-4 pt-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                        <Icon className="h-6 w-6 text-gray-400" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">
                            {title}
                        </p>
                        <p className="text-sm text-gray-400">No one assigned</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardContent className="flex items-center gap-4 pt-6">
                <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full ${badgeColor}`}
                >
                    <span className="text-lg font-bold text-white">
                        {user.name.charAt(0).toUpperCase()}
                    </span>
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <p className="truncate text-lg font-semibold text-gray-900">
                        {user.name}
                    </p>
                    {user.position && (
                        <p className="truncate text-sm text-gray-500">
                            {user.position}
                        </p>
                    )}
                    {user.email && (
                        <div className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                            <Mail className="h-3 w-3" />
                            {user.email}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

export default function Show({ auth, team }) {
    const { flash } = usePage().props;
    const { can } = usePermission();

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
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
                                    {team.name}
                                </h2>
                                <p className="mt-1 text-gray-600">
                                    Team details and members
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {can('teams.edit') && (
                            <Button asChild variant="outline">
                                <Link href={route('teams.edit', team.id)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>
            }
        >
            <Head title={team.name} />

            <div className="space-y-6">
                {flash?.success && (
                    <Alert className="animate-fade-in border-green-200 bg-green-50">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertDescription className="font-medium text-green-800">
                            {flash.success}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Team Info */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Team Information</CardTitle>
                            <Badge
                                className={statusConfig[team.status]?.className}
                            >
                                {statusConfig[team.status]?.label}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {team.description && (
                            <div>
                                <p className="text-sm font-medium text-gray-500">
                                    Description
                                </p>
                                <p className="mt-1 text-gray-900">
                                    {team.description}
                                </p>
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                            <div>
                                <p className="text-sm font-medium text-gray-500">
                                    Members
                                </p>
                                <p className="mt-1 text-2xl font-bold text-gray-900">
                                    {team.members?.length || 0}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">
                                    Created
                                </p>
                                <div className="mt-1 flex items-center gap-1 text-gray-900">
                                    <Calendar className="h-4 w-4 text-gray-400" />
                                    {new Date(
                                        team.created_at,
                                    ).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Leadership */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <LeaderCard
                        title="Team Leader (POC)"
                        user={team.leader}
                        icon={Crown}
                        badgeColor="bg-blue-600"
                    />
                    <LeaderCard
                        title="Sub-Leader (Sub-POC)"
                        user={team.sub_leader}
                        icon={Shield}
                        badgeColor="bg-purple-600"
                    />
                </div>

                {/* Members Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Team Members</CardTitle>
                        <CardDescription>
                            All members of this team
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Position</TableHead>
                                    <TableHead>Department</TableHead>
                                    <TableHead>Primary</TableHead>
                                    <TableHead>Added</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {team.members && team.members.length > 0 ? (
                                    team.members.map((member) => {
                                        const role =
                                            roleConfig[
                                                member.pivot?.role_in_team
                                            ] || roleConfig.member;
                                        const RoleIcon = role.icon;
                                        return (
                                            <TableRow key={member.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-600">
                                                            <span className="text-sm font-medium text-white">
                                                                {member.name
                                                                    .charAt(0)
                                                                    .toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900">
                                                                {member.name}
                                                            </p>
                                                            {member.email && (
                                                                <p className="text-xs text-gray-500">
                                                                    {
                                                                        member.email
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        className={
                                                            role.className
                                                        }
                                                    >
                                                        <RoleIcon className="mr-1 h-3 w-3" />
                                                        {role.label}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {member.position || (
                                                        <span className="text-gray-400">
                                                            -
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {member.department || (
                                                        <span className="text-gray-400">
                                                            -
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {member.pivot
                                                        ?.is_primary ? (
                                                        <Badge className="bg-yellow-100 text-yellow-800">
                                                            <Star className="mr-1 h-3 w-3" />
                                                            Primary
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-gray-400">
                                                            -
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-sm text-gray-500">
                                                    {member.pivot?.created_at
                                                        ? new Date(
                                                              member.pivot.created_at,
                                                          ).toLocaleDateString()
                                                        : '-'}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="py-12 text-center"
                                        >
                                            <UsersRound className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                                            <p className="text-lg font-medium text-gray-500">
                                                No members yet
                                            </p>
                                            <p className="text-sm text-gray-400">
                                                Edit this team to add members
                                            </p>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
