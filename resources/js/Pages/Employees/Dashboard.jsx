// resources/js/Pages/Employees/Dashboard.jsx
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Progress } from '@/Components/ui/progress';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import {
    LayoutDashboard,
    Calendar,
    Laptop,
    Bell,
    TrendingUp,
    Clock,
    CheckCircle2,
    AlertCircle,
    Plus,
    Eye,
    User,
    Briefcase,
    MapPin,
    Mail,
    Phone,
} from 'lucide-react';

export default function Dashboard({ 
    auth, 
    leaveBalances, 
    upcomingLeaves, 
    pendingLeaves,
    assignedAssets,
    announcements 
}) {
    const getLeaveBalanceColor = (balance) => {
        const percentage = (balance.remaining_days / balance.total_days) * 100;
        if (percentage < 25) return 'text-red-600';
        if (percentage < 50) return 'text-yellow-600';
        return 'text-green-600';
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <LayoutDashboard className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">Welcome back, {auth.user.first_name || auth.user.name}!</h2>
                            <p className="text-gray-600 mt-1">Here's what's happening with your account</p>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="space-y-6">
                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-fade-in">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Assigned Assets</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-2">
                                        {assignedAssets?.length || 0}
                                    </p>
                                </div>
                                <div className="p-3 bg-blue-100 rounded-lg">
                                    <Laptop className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Upcoming Leaves</p>
                                    <p className="text-3xl font-bold text-purple-600 mt-2">
                                        {upcomingLeaves?.length || 0}
                                    </p>
                                </div>
                                <div className="p-3 bg-purple-100 rounded-lg">
                                    <Calendar className="h-6 w-6 text-purple-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                                    <p className="text-3xl font-bold text-yellow-600 mt-2">
                                        {pendingLeaves?.length || 0}
                                    </p>
                                </div>
                                <div className="p-3 bg-yellow-100 rounded-lg">
                                    <Clock className="h-6 w-6 text-yellow-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Announcements</p>
                                    <p className="text-3xl font-bold text-red-600 mt-2">
                                        {announcements?.length || 0}
                                    </p>
                                </div>
                                <div className="p-3 bg-red-100 rounded-lg">
                                    <Bell className="h-6 w-6 text-red-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Announcements */}
                {announcements && announcements.length > 0 && (
                    <Card className="animate-fade-in animation-delay-100">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Bell className="h-5 w-5 text-red-600" />
                                    Company Announcements
                                </CardTitle>
                                <Badge className="bg-red-100 text-red-700">
                                    {announcements.length} new
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {announcements.map((announcement, index) => (
                                    <Alert key={index} className="bg-blue-50 border-blue-200">
                                        <AlertDescription className="text-blue-800">
                                            <strong>{announcement.title}</strong>
                                            <p className="text-sm mt-1">{announcement.message}</p>
                                            <p className="text-xs text-blue-600 mt-2">
                                                {new Date(announcement.created_at).toLocaleDateString()}
                                            </p>
                                        </AlertDescription>
                                    </Alert>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Leave Balances */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Leave Balances */}
                        <Card className="animate-fade-in animation-delay-200">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        <Calendar className="h-5 w-5" />
                                        My Leave Balances ({new Date().getFullYear()})
                                    </CardTitle>
                                    <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700">
                                        <Link href={route('my-leaves.apply')}>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Apply for Leave
                                        </Link>
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {leaveBalances && leaveBalances.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {leaveBalances.map((balance) => (
                                            <div 
                                                key={balance.id} 
                                                className="p-4 border-2 rounded-lg hover:shadow-md transition-shadow"
                                                style={{ borderColor: balance.leave_type.color + '40' }}
                                            >
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <div 
                                                            className="w-3 h-3 rounded-full"
                                                            style={{ backgroundColor: balance.leave_type.color }}
                                                        />
                                                        <span className="font-medium text-gray-900">
                                                            {balance.leave_type.name}
                                                        </span>
                                                    </div>
                                                    <Badge 
                                                        variant="outline" 
                                                        className="text-xs"
                                                        style={{ 
                                                            borderColor: balance.leave_type.color + '40',
                                                            color: balance.leave_type.color 
                                                        }}
                                                    >
                                                        {balance.leave_type.code}
                                                    </Badge>
                                                </div>

                                                <div className="flex items-baseline gap-2 mb-2">
                                                    <span className={`text-3xl font-bold ${getLeaveBalanceColor(balance)}`}>
                                                        {balance.remaining_days}
                                                    </span>
                                                    <span className="text-gray-500">/ {balance.total_days} days</span>
                                                </div>

                                                <Progress 
                                                    value={(balance.remaining_days / balance.total_days) * 100} 
                                                    className="h-2 mb-3"
                                                />

                                                <div className="flex justify-between text-xs text-gray-600">
                                                    <span>Used: {balance.used_days}</span>
                                                    {balance.carried_over_days > 0 && (
                                                        <span className="text-blue-600">
                                                            +{balance.carried_over_days} carried over
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <Alert className="bg-yellow-50 border-yellow-200">
                                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                                        <AlertDescription className="text-yellow-800">
                                            No leave balances found. Contact HR to initialize your balances.
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </CardContent>
                        </Card>

                        {/* Upcoming Leaves */}
                        <Card className="animate-fade-in animation-delay-300">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Upcoming Leaves
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {upcomingLeaves && upcomingLeaves.length > 0 ? (
                                    <div className="space-y-3">
                                        {upcomingLeaves.map((leave) => (
                                            <div key={leave.id} className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <div 
                                                            className="w-3 h-3 rounded-full"
                                                            style={{ backgroundColor: leave.leave_type.color }}
                                                        />
                                                        <span className="font-medium text-gray-900">
                                                            {leave.leave_type.name}
                                                        </span>
                                                    </div>
                                                    <Badge className="bg-green-100 text-green-700">
                                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                                        Approved
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                                    <span>
                                                        {new Date(leave.start_date).toLocaleDateString('en-US', { 
                                                            month: 'short', 
                                                            day: 'numeric' 
                                                        })}
                                                        {leave.start_date !== leave.end_date && 
                                                            ` - ${new Date(leave.end_date).toLocaleDateString('en-US', { 
                                                                month: 'short', 
                                                                day: 'numeric' 
                                                            })}`
                                                        }
                                                    </span>
                                                    <span>•</span>
                                                    <span>{leave.total_days} {leave.total_days === 1 ? 'day' : 'days'}</span>
                                                </div>
                                            </div>
                                        ))}
                                        <Button asChild variant="outline" className="w-full">
                                            <Link href={route('my-leaves.index')}>
                                                View All Leaves
                                            </Link>
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                                        <p>No upcoming leaves</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Pending Leave Requests */}
                        {pendingLeaves && pendingLeaves.length > 0 && (
                            <Card className="animate-fade-in animation-delay-400">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Clock className="h-5 w-5 text-yellow-600" />
                                        Pending Leave Requests
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {pendingLeaves.map((leave) => (
                                            <div key={leave.id} className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <div 
                                                            className="w-3 h-3 rounded-full"
                                                            style={{ backgroundColor: leave.leave_type.color }}
                                                        />
                                                        <span className="font-medium text-gray-900">
                                                            {leave.leave_type.name}
                                                        </span>
                                                    </div>
                                                    <Badge className="bg-yellow-100 text-yellow-700">
                                                        {leave.status === 'pending_manager' ? 'Pending Manager' : 'Pending HR'}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                                    <span>
                                                        {new Date(leave.start_date).toLocaleDateString('en-US', { 
                                                            month: 'short', 
                                                            day: 'numeric' 
                                                        })}
                                                        {leave.start_date !== leave.end_date && 
                                                            ` - ${new Date(leave.end_date).toLocaleDateString('en-US', { 
                                                                month: 'short', 
                                                                day: 'numeric' 
                                                            })}`
                                                        }
                                                    </span>
                                                    <span>•</span>
                                                    <span>{leave.total_days} {leave.total_days === 1 ? 'day' : 'days'}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Sidebar */}
                    <div className="space-y-6">
                        {/* My Profile Card */}
                        <Card className="animate-fade-in animation-delay-100">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    My Profile
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-4">
                                    {auth.user.profile_picture ? (
                                        <img
                                            src={`/storage/${auth.user.profile_picture}`}
                                            alt={auth.user.name}
                                            className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full border-2 border-gray-200">
                                            <span className="text-2xl font-medium text-white">
                                                {auth.user.name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{auth.user.name}</h3>
                                        <p className="text-sm text-gray-600">{auth.user.position}</p>
                                    </div>
                                </div>

                                <div className="space-y-2 text-sm">
                                    {auth.user.employee_id && (
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Briefcase className="h-4 w-4" />
                                            <span>ID: {auth.user.employee_id}</span>
                                        </div>
                                    )}
                                    {auth.user.department && (
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <MapPin className="h-4 w-4" />
                                            <span>{auth.user.department}</span>
                                        </div>
                                    )}
                                    {auth.user.email && (
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Mail className="h-4 w-4" />
                                            <span className="truncate">{auth.user.email}</span>
                                        </div>
                                    )}
                                    {auth.user.phone_number && (
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Phone className="h-4 w-4" />
                                            <span>{auth.user.phone_number}</span>
                                        </div>
                                    )}
                                </div>

                                <Button asChild variant="outline" className="w-full mt-4">
                                    <Link href={route('settings.index')}>
                                        View Full Profile
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>

                        {/* My Assets */}
                        <Card className="animate-fade-in animation-delay-200">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Laptop className="h-5 w-5" />
                                    My Assets
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {assignedAssets && assignedAssets.length > 0 ? (
                                    <div className="space-y-3">
                                        {assignedAssets.map((assignment) => (
                                            <div key={assignment.id} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <p className="font-medium text-gray-900 text-sm">
                                                            {assignment.asset?.inventory_item?.name || 'Unknown Asset'}
                                                        </p>
                                                        <p className="text-xs text-gray-600 mt-1 font-mono">
                                                            {assignment.asset?.asset_tag}
                                                        </p>
                                                        {assignment.asset?.serial_number && (
                                                            <p className="text-xs text-gray-500 mt-0.5">
                                                                SN: {assignment.asset.serial_number}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <Badge className="bg-green-100 text-green-700 text-xs">
                                                        Active
                                                    </Badge>
                                                </div>
                                                <div className="mt-2 pt-2 border-t border-blue-200">
                                                    <p className="text-xs text-gray-600">
                                                        Assigned: {new Date(assignment.assigned_date).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                        <Button asChild variant="outline" className="w-full">
                                            <Link href="/employees/assets">
                                                View All Assets
                                            </Link>
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <Laptop className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                                        <p className="text-sm">No assets assigned</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <Card className="animate-fade-in animation-delay-300">
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-2 gap-3">
                                <Button asChild variant="outline" className="justify-start">
                                    <Link href={route('my-leaves.apply')}>
                                        <Calendar className="h-4 w-4 mr-2" />
                                        Apply for Leave
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" className="justify-start">
                                    <Link href={route('my-leaves.index')}>
                                        <Eye className="h-4 w-4 mr-2" />
                                        My Leaves
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" className="justify-start">
                                    <Link href="/employees/assets">
                                        <Laptop className="h-4 w-4 mr-2" />
                                        My Assets
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" className="justify-start">
                                    <Link href={route('settings.index')}>
                                        <User className="h-4 w-4 mr-2" />
                                        My Profile
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}