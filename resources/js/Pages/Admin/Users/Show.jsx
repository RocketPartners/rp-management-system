// resources/js/Pages/Users/Show.jsx
import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import DeleteConfirmationModal from '@/Components/DeleteConfirmationModal';
import {
    User as UserIcon,
    ArrowLeft,
    Edit,
    Trash2,
    Mail,
    Phone,
    MapPin,
    Briefcase,
    Calendar,
    Heart,
    Shield,
    Laptop,
    Package,
    CheckCircle2,
    FolderKanban,
    ClipboardList,
    CreditCard,
    Camera,
    UserCheck,
    UserX,
    Clock,
    XCircle,
    AlertCircle,
    Tag,
    ShieldCheck,
} from 'lucide-react';
import { usePermission } from '@/hooks/usePermission';

export default function Show({ auth, user }) {
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const { can } = usePermission();

    const handleDelete = () => {
        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        router.delete(route('users.destroy', user.id));
    };

    const handleApprove = () => {
        router.post(route('users.approve', user.id), {}, {
            preserveScroll: true,
        });
    };

    const handleReject = () => {
        router.post(route('users.reject', user.id), {}, {
            preserveScroll: true,
        });
    };

    const canDelete = user.id !== auth.user.id;
    const isPending = user.account_status === 'pending';
    
    // Check if current user can approve
    const canApprove = auth.user?.can_approve_users === true;


    const getAccountStatusBadge = (status) => {
        const styles = {
            'pending': { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200', icon: Clock },
            'active': { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200', icon: CheckCircle2 },
            'rejected': { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', icon: XCircle },
            'suspended': { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200', icon: AlertCircle },
        };
        return styles[status] || styles.active;
    };

    const statusStyle = getAccountStatusBadge(user.account_status);
    const StatusIcon = statusStyle.icon;

    const getProfileDisplay = () => {
        if (user.profile_picture) {
            return (
                <img
                    src={`/storage/${user.profile_picture}`}
                    alt={user.name}
                    className="w-12 h-12 rounded-full object-cover"
                />
            );
        }
        return (
            <div className="flex items-center justify-center w-12 h-12 bg-blue-600 rounded-full">
                <span className="text-xl font-medium text-white">
                    {user.name.charAt(0).toUpperCase()}
                </span>
            </div>
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button asChild variant="ghost" size="sm">
                            <Link href={route('users.index')}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Link>
                        </Button>
                        <div className="flex items-center gap-3">
                            {getProfileDisplay()}
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-3xl font-bold text-gray-900">{user.name}</h2>
                                    <Badge className={`${statusStyle.bg} ${statusStyle.text} ${statusStyle.border} border flex items-center gap-1.5`}>
                                        <StatusIcon className="h-3.5 w-3.5" />
                                        {user.account_status.charAt(0).toUpperCase() + user.account_status.slice(1)}
                                    </Badge>
                                </div>
                                <p className="text-gray-600 mt-1">{user.position || 'Employee'}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        {/* 🎯 APPROVAL BUTTONS (only for pending users) */}
                        {canApprove && isPending && (
                            <>
                                <Button 
                                    onClick={handleApprove}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                    <UserCheck className="h-4 w-4 mr-2" />
                                    Approve User
                                </Button>
                                <Button 
                                    onClick={handleReject}
                                    variant="outline"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
                                >
                                    <UserX className="h-4 w-4 mr-2" />
                                    Reject User
                                </Button>
                            </>
                        )}
                        
                        <Button asChild variant="outline">
                            <Link href={route('users.edit', user.id)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                            </Link>
                        </Button>

                        {/* 🔐 MANAGE PERMISSIONS BUTTON */}
                        {can('users.assign-permissions') && (
                            <Button asChild variant="outline">
                                <Link href={route('users.permissions.edit', user.id)}>
                                    <ShieldCheck className="h-4 w-4 mr-2" />
                                    Manage Permissions
                                </Link>
                            </Button>
                        )}

                        {canDelete && (
                            <Button variant="destructive" onClick={handleDelete}>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                            </Button>
                        )}
                    </div>
                </div>
            }
        >
            <Head title={user.name} />

            {/* 🎯 PENDING APPROVAL ALERT (top of page) */}
            {isPending && (
                <Alert className="mb-6 bg-yellow-50 border-yellow-300 animate-fade-in">
                    <Clock className="h-5 w-5 text-yellow-600" />
                    <AlertDescription className="text-yellow-800">
                        <strong>Account Pending Approval</strong>
                        <p className="text-sm mt-1">
                            This user registered on {new Date(user.created_at).toLocaleDateString()} and is waiting for HR approval.
                            {canApprove && " Review their information below and approve or reject their account."}
                        </p>
                    </AlertDescription>
                </Alert>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Profile Picture Card */}
                    <Card className="animate-fade-in">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Camera className="h-5 w-5" />
                                Profile Picture
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-6">
                                {user.profile_picture ? (
                                    <img
                                        src={`/storage/${user.profile_picture}`}
                                        alt={user.name}
                                        className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center w-32 h-32 bg-blue-600 rounded-full border-4 border-gray-200">
                                        <span className="text-5xl font-medium text-white">
                                            {user.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm text-gray-600 mb-2">
                                        {user.profile_picture 
                                            ? 'Profile picture uploaded' 
                                            : 'No profile picture uploaded'}
                                    </p>
                                    <Button asChild variant="outline" size="sm">
                                        <Link href={route('users.edit', user.id)}>
                                            <Camera className="h-4 w-4 mr-2" />
                                            {user.profile_picture ? 'Change Picture' : 'Upload Picture'}
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Personal Information */}
                    <Card className="animate-fade-in">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <UserIcon className="h-5 w-5" />
                                Personal Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Full Name</p>
                                    <p className="font-medium text-gray-900">{user.name}</p>
                                </div>
                                {user.gender && user.gender !== 'prefer_not_to_say' && (
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Gender</p>
                                        <p className="font-medium text-gray-900 capitalize">{user.gender}</p>
                                    </div>
                                )}
                                {user.civil_status && (
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Civil Status</p>
                                        <p className="font-medium text-gray-900 capitalize">{user.civil_status}</p>
                                    </div>
                                )}
                                {user.birthday && (
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Birthday</p>
                                        <p className="font-medium text-gray-900">
                                            {new Date(user.birthday).toLocaleDateString()}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Contact Information */}
                    <Card className="animate-fade-in animation-delay-100">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Phone className="h-5 w-5" />
                                Contact Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-600">Primary Email</p>
                                        <p className="font-medium text-gray-900">{user.email}</p>
                                    </div>
                                </div>
                                {user.work_email && (
                                    <div className="flex items-center gap-3">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm text-gray-600">Work Email</p>
                                            <p className="font-medium text-gray-900">{user.work_email}</p>
                                        </div>
                                    </div>
                                )}
                                {user.personal_email && (
                                    <div className="flex items-center gap-3">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm text-gray-600">Personal Email</p>
                                            <p className="font-medium text-gray-900">{user.personal_email}</p>
                                        </div>
                                    </div>
                                )}
                                {user.phone_number && (
                                    <div className="flex items-center gap-3">
                                        <Phone className="h-5 w-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm text-gray-600">Phone Number 1</p>
                                            <p className="font-medium text-gray-900">{user.phone_number}</p>
                                        </div>
                                    </div>
                                )}
                                {user.personal_mobile && (
                                    <div className="flex items-center gap-3">
                                        <Phone className="h-5 w-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm text-gray-600">Phone Number 2</p>
                                            <p className="font-medium text-gray-900">{user.personal_mobile}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Address */}
                    {(user.address_line_1 || user.city) && (
                        <Card className="animate-fade-in animation-delay-200">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5" />
                                    Address
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-1 text-gray-900">
                                    {user.address_line_1 && <p>{user.address_line_1}</p>}
                                    {user.address_line_2 && <p>{user.address_line_2}</p>}
                                    {(user.city || user.state || user.postal_code) && (
                                        <p>
                                            {[user.city, user.state, user.postal_code].filter(Boolean).join(', ')}
                                        </p>
                                    )}
                                    {user.country && <p>{user.country}</p>}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Emergency Contact */}
                    {(user.emergency_contact_name || user.emergency_contact_phone || user.emergency_contact_mobile) && (
                        <Card className="animate-fade-in animation-delay-300">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Heart className="h-5 w-5 text-red-600" />
                                    Emergency Contact
                                </CardTitle>
                                <CardDescription>Person to contact in case of emergency</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {user.emergency_contact_name && (
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-red-50 rounded-lg">
                                                <UserIcon className="h-5 w-5 text-red-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600 mb-1">Contact Name</p>
                                                <p className="font-medium text-gray-900">{user.emergency_contact_name}</p>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {user.emergency_contact_relationship && (
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-pink-50 rounded-lg">
                                                <Heart className="h-5 w-5 text-pink-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600 mb-1">Relationship</p>
                                                <p className="font-medium text-gray-900">{user.emergency_contact_relationship}</p>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {user.emergency_contact_phone && (
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-orange-50 rounded-lg">
                                                <Phone className="h-5 w-5 text-orange-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600 mb-1">Phone Number 1</p>
                                                <p className="font-medium text-gray-900">{user.emergency_contact_phone}</p>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {user.emergency_contact_mobile && (
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-blue-50 rounded-lg">
                                                <Phone className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600 mb-1">Phone Number 2</p>
                                                <p className="font-medium text-gray-900">{user.emergency_contact_mobile}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Government IDs */}
                    {(user.sss_number || user.tin_number || user.philhealth_number || user.hdmf_number || user.payroll_account) && (
                        <Card className="animate-fade-in animation-delay-350">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="h-5 w-5" />
                                    Government IDs & Benefits
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {user.sss_number && (
                                        <div className="p-3 bg-blue-50 rounded-lg">
                                            <p className="text-xs text-gray-600 mb-1">SSS Number</p>
                                            <p className="font-mono font-medium text-gray-900">{user.sss_number}</p>
                                        </div>
                                    )}
                                    {user.tin_number && (
                                        <div className="p-3 bg-green-50 rounded-lg">
                                            <p className="text-xs text-gray-600 mb-1">TIN Number</p>
                                            <p className="font-mono font-medium text-gray-900">{user.tin_number}</p>
                                        </div>
                                    )}
                                    {user.philhealth_number && (
                                        <div className="p-3 bg-purple-50 rounded-lg">
                                            <p className="text-xs text-gray-600 mb-1">PhilHealth Number</p>
                                            <p className="font-mono font-medium text-gray-900">{user.philhealth_number}</p>
                                        </div>
                                    )}
                                    {user.hdmf_number && (
                                        <div className="p-3 bg-yellow-50 rounded-lg">
                                            <p className="text-xs text-gray-600 mb-1">HDMF (Pag-IBIG) Number</p>
                                            <p className="font-mono font-medium text-gray-900">{user.hdmf_number}</p>
                                        </div>
                                    )}
                                    {user.payroll_account && (
                                        <div className="p-3 bg-indigo-50 rounded-lg">
                                            <p className="text-xs text-gray-600 mb-1">Union Bank Payroll Account</p>
                                            <p className="font-mono font-medium text-gray-900">{user.payroll_account}</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* 🎯 UPDATED: Assigned Individual Assets */}
                    <Card className="animate-fade-in animation-delay-400">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Laptop className="h-5 w-5" />
                                Assigned Assets
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {user.current_individual_assets && user.current_individual_assets.length > 0 ? (
                                <div className="space-y-3">
                                    {user.current_individual_assets.map((assignment) => (
                                        <div key={assignment.id} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                                            <div className="flex items-start gap-3 flex-1">
                                                <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                                                    <Package className="h-5 w-5 text-blue-600" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-medium text-gray-900">
                                                        {assignment.asset?.inventory_item?.name || 'Unknown Asset'}
                                                    </p>
                                                    <div className="flex flex-wrap items-center gap-2 mt-1">
                                                        {assignment.asset?.asset_tag && (
                                                            <Badge variant="outline" className="text-xs">
                                                                <Tag className="h-3 w-3 mr-1" />
                                                                {assignment.asset.asset_tag}
                                                            </Badge>
                                                        )}
                                                        {assignment.asset?.serial_number && (
                                                            <span className="text-xs text-gray-600 font-mono">
                                                                SN: {assignment.asset.serial_number}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {assignment.asset?.inventory_item?.sku}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right flex-shrink-0 ml-4">
                                                <Badge className="bg-green-100 text-green-700 border-green-200 border mb-1">
                                                    {assignment.status}
                                                </Badge>
                                                <p className="text-xs text-gray-600">
                                                    Since {new Date(assignment.assigned_date).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <Laptop className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                                    <p>No assets currently assigned</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Projects */}
                    {user.owned_projects && user.owned_projects.length > 0 && (
                        <Card className="animate-fade-in animation-delay-500">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FolderKanban className="h-5 w-5" />
                                    Owned Projects
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {user.owned_projects.map((project) => (
                                        <div key={project.id} className="p-4 bg-gray-50 rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium text-gray-900">{project.name}</p>
                                                    <p className="text-sm text-gray-600">{project.code}</p>
                                                </div>
                                                <Badge className="bg-blue-100 text-blue-700">
                                                    {project.status.replace('_', ' ')}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* 🎯 APPROVAL ACTIONS CARD (only for pending users) */}
                    {canApprove && isPending && (
                        <Card className="animate-fade-in border-yellow-300 border-2">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-yellow-700">
                                    <Clock className="h-5 w-5" />
                                    Approval Required
                                </CardTitle>
                                <CardDescription>
                                    Review and approve or reject this account
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button 
                                    className="w-full bg-green-600 hover:bg-green-700 text-white justify-start"
                                    onClick={handleApprove}
                                >
                                    <UserCheck className="h-5 w-5 mr-2" />
                                    Approve User
                                </Button>
                                <Button 
                                    variant="outline"
                                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300 justify-start"
                                    onClick={handleReject}
                                >
                                    <UserX className="h-5 w-5 mr-2" />
                                    Reject User
                                </Button>
                                <Alert className="bg-blue-50 border-blue-200 mt-4">
                                    <AlertDescription className="text-blue-800 text-xs">
                                        <strong>Note:</strong> User will receive an email notification after approval or rejection.
                                    </AlertDescription>
                                </Alert>
                            </CardContent>
                        </Card>

                        
                    )}

                    {/* Employment Info */}
                    <Card className="animate-fade-in animation-delay-100">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Briefcase className="h-5 w-5" />
                                Employment
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {user.employee_id && (
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Employee ID</p>
                                    <p className="font-mono font-medium text-gray-900">{user.employee_id}</p>
                                </div>
                            )}
                            {user.department && (
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Department</p>
                                    <p className="font-medium text-gray-900">{user.department}</p>
                                </div>
                            )}
                            {user.position && (
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Position</p>
                                    <p className="font-medium text-gray-900">{user.position}</p>
                                </div>
                            )}
                            {user.hire_date && (
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Hire Date</p>
                                    <p className="font-medium text-gray-900">
                                        {new Date(user.hire_date).toLocaleDateString()}
                                    </p>
                                </div>
                            )}
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Employment Status</p>
                                <Badge className={
                                    user.employment_status === 'active' ? 'bg-green-100 text-green-700' :
                                    user.employment_status === 'on_leave' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-gray-100 text-gray-700'
                                }>
                                    {user.employment_status?.replace('_', ' ') || 'Active'}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Roles */}
                    <Card className="animate-fade-in animation-delay-200">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                Roles
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {user.roles && user.roles.length > 0 ? (
                                <div className="space-y-2">
                                    {user.roles.map((role) => (
                                        <div key={role.id} className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
                                            <Shield className="h-4 w-4 text-purple-600" />
                                            <div>
                                                <p className="font-medium text-gray-900">{role.name}</p>
                                                {role.description && (
                                                    <p className="text-xs text-gray-600">{role.description}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm">No roles assigned</p>
                            )}
                        </CardContent>
                    </Card>

                                        {/* ✅ NEW: Permissions Card */}
                    <Card className="animate-fade-in animation-delay-250 border-2 border-blue-200">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5 text-blue-600" />
                                Permissions
                            </CardTitle>
                            <CardDescription>What this user can do</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {/* From Role Permissions */}
                                {user.roles && user.roles.length > 0 && (
                                    <div className="space-y-3">
                                        {user.roles.map(role => (
                                            role.permissions && role.permissions.length > 0 && (
                                                <div key={role.id}>
                                                    <p className="text-xs font-semibold text-gray-600 mb-2">
                                                        From "{role.name}":
                                                    </p>
                                                    <div className="space-y-1">
                                                        {role.permissions.map(perm => (
                                                            <div key={perm.id} className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                                                                <CheckCircle2 className="h-4 w-4 text-blue-600 flex-shrink-0" />
                                                                <span className="text-sm text-gray-900">{perm.name}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )
                                        ))}
                                    </div>
                                )}

                                {/* Direct User Permission Overrides */}
                                {user.permissions && user.permissions.length > 0 && (
                                    <div className="pt-3 border-t border-orange-200">
                                        <p className="text-xs font-semibold text-orange-600 mb-2">
                                            ⚠️ Special Overrides:
                                        </p>
                                        <div className="space-y-1">
                                            {user.permissions.map(perm => (
                                                <div 
                                                    key={perm.id} 
                                                    className={`flex items-center gap-2 p-2 rounded ${
                                                        perm.pivot.granted 
                                                            ? 'bg-green-50' 
                                                            : 'bg-red-50'
                                                    }`}
                                                >
                                                    {perm.pivot.granted ? (
                                                        <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                                                    ) : (
                                                        <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <span className={`text-sm ${
                                                            perm.pivot.granted ? 'text-green-900' : 'text-red-900'
                                                        }`}>
                                                            {perm.name}
                                                        </span>
                                                        {perm.pivot.reason && (
                                                            <p className="text-xs text-gray-600 mt-0.5">
                                                                Reason: {perm.pivot.reason}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* No permissions */}
                                {(!user.roles || user.roles.length === 0 || 
                                !user.roles.some(r => r.permissions && r.permissions.length > 0)) && 
                                (!user.permissions || user.permissions.length === 0) && (
                                    <div className="text-center py-4 text-gray-500">
                                        <Shield className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                                        <p className="text-sm">No permissions assigned</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* 🎯 UPDATED: Quick Stats */}
                    <Card className="animate-fade-in animation-delay-300">
                        <CardHeader>
                            <CardTitle>Quick Stats</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <Laptop className="h-5 w-5 text-blue-600" />
                                    <span className="text-sm font-medium text-gray-700">Assigned Assets</span>
                                </div>
                                <span className="text-xl font-bold text-gray-900">
                                    {user.current_individual_assets?.length || 0}
                                </span>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <FolderKanban className="h-5 w-5 text-purple-600" />
                                    <span className="text-sm font-medium text-gray-700">Owned Projects</span>
                                </div>
                                <span className="text-xl font-bold text-gray-900">
                                    {user.owned_projects?.length || 0}
                                </span>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <ClipboardList className="h-5 w-5 text-green-600" />
                                    <span className="text-sm font-medium text-gray-700">Assigned Tasks</span>
                                </div>
                                <span className="text-xl font-bold text-gray-900">
                                    {user.assigned_tasks?.length || 0}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Account Info */}
                    <Card className="animate-fade-in animation-delay-400">
                        <CardHeader>
                            <CardTitle>Account Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Account Status</p>
                                <Badge className={`${statusStyle.bg} ${statusStyle.text} ${statusStyle.border} border flex items-center gap-1.5 w-fit`}>
                                    <StatusIcon className="h-3.5 w-3.5" />
                                    {user.account_status.charAt(0).toUpperCase() + user.account_status.slice(1)}
                                </Badge>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Member Since</p>
                                <p className="font-medium text-gray-900">
                                    {new Date(user.created_at).toLocaleDateString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Last Updated</p>
                                <p className="font-medium text-gray-900">
                                    {new Date(user.updated_at).toLocaleDateString()}
                                </p>
                            </div>
                            {user.approved_at && user.approved_by && (
                                <div className="pt-3 border-t">
                                    <p className="text-sm text-gray-600 mb-1">Approved By</p>
                                    <p className="font-medium text-gray-900">Admin</p>
                                    <p className="text-xs text-gray-500">
                                        on {new Date(user.approved_at).toLocaleDateString()}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Delete Modal */}
            <DeleteConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete User"
                description="This will permanently delete this user account and remove all their data. Any assets assigned to them will become unassigned."
                itemName={user.name}
            />
        </AuthenticatedLayout>
    );
}