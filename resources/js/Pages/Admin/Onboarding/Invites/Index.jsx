// resources/js/Pages/Admin/Onboarding/Invites/Index.jsx
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import {
    UserPlus,
    Plus,
    Mail,
    Calendar,
    CheckCircle2,
    Clock,
    XCircle,
} from 'lucide-react';

export default function Index({ auth, invites, stats, filters }) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <UserPlus className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">Onboarding Invites</h2>
                            <p className="text-gray-600 mt-1">Manage pre-onboarding invitations</p>
                        </div>
                    </div>
                    <Button asChild className="bg-green-600 hover:bg-green-700">
                        <Link href={route('onboarding.invites.create')}>
                            <Plus className="h-4 w-4 mr-2" />
                            Send New Invite
                        </Link>
                    </Button>
                </div>
            }
        >
            <Head title="Onboarding Invites" />

            <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Invites</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.total || 0}</p>
                                </div>
                                <Mail className="h-8 w-8 text-gray-400" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Pending</p>
                                    <p className="text-3xl font-bold text-yellow-600 mt-2">{stats?.pending || 0}</p>
                                </div>
                                <Clock className="h-8 w-8 text-yellow-400" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Submitted</p>
                                    <p className="text-3xl font-bold text-blue-600 mt-2">{stats?.submitted || 0}</p>
                                </div>
                                <CheckCircle2 className="h-8 w-8 text-blue-400" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Completed</p>
                                    <p className="text-3xl font-bold text-green-600 mt-2">{stats?.approved || 0}</p>
                                </div>
                                <UserPlus className="h-8 w-8 text-green-400" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Invites Table */}
                <Card>
                    <CardContent className="p-0">
                        {invites.data && invites.data.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Candidate
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Position
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Sent Date
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Expires
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {invites.data.map((invite) => (
                                            <tr key={invite.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10 bg-[#2596be] rounded-full flex items-center justify-center">
                                                            <span className="text-white font-semibold">
                                                                {invite.first_name?.[0]}{invite.last_name?.[0]}
                                                            </span>
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {invite.first_name} {invite.last_name}
                                                            </div>
                                                            <div className="text-sm text-gray-500">{invite.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{invite.position || '-'}</div>
                                                    <div className="text-sm text-gray-500">{invite.department || '-'}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <Badge className={
                                                        invite.status === 'approved' ? 'bg-green-100 text-green-700 border-green-200' :
                                                        invite.status === 'submitted' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                                        invite.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                                                        'bg-gray-100 text-gray-700 border-gray-200'
                                                    }>
                                                        {invite.status}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(invite.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {invite.expires_at ? new Date(invite.expires_at).toLocaleDateString() : 'No expiration'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="py-12 text-center text-gray-500">
                                <Mail className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                                <p className="font-medium">No invites sent yet</p>
                                <p className="text-sm mt-1">Click "Send New Invite" to create your first onboarding invitation</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}