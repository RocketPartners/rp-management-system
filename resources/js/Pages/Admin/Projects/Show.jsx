// resources/js/Pages/Projects/Show.jsx
import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Progress } from '@/Components/ui/progress';
import DeleteConfirmationModal from '@/Components/DeleteConfirmationModal';
import {
    FolderKanban,
    ArrowLeft,
    Edit,
    Trash2,
    Plus,
    Calendar,
    DollarSign,
    User,
    TrendingUp,
    ClipboardList,
    Clock,
    AlertCircle,
    CheckCircle2,
} from 'lucide-react';

export default function Show({ auth, project }) {
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    const handleDelete = () => {
        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        router.delete(route('projects.destroy', project.id));
    };

    const getStatusBadge = (status) => {
        const styles = {
            planning: 'bg-purple-100 text-purple-700 border-purple-200',
            in_progress: 'bg-blue-100 text-blue-700 border-blue-200',
            on_hold: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            completed: 'bg-green-100 text-green-700 border-green-200',
            cancelled: 'bg-red-100 text-red-700 border-red-200',
        };
        return styles[status] || 'bg-gray-100 text-gray-700 border-gray-200';
    };

    const getPriorityBadge = (priority) => {
        const styles = {
            low: 'bg-gray-100 text-gray-700 border-gray-200',
            medium: 'bg-blue-100 text-blue-700 border-blue-200',
            high: 'bg-orange-100 text-orange-700 border-orange-200',
            urgent: 'bg-red-100 text-red-700 border-red-200',
        };
        return styles[priority] || 'bg-gray-100 text-gray-700 border-gray-200';
    };

    const getTaskStatusBadge = (status) => {
        const styles = {
            todo: 'bg-gray-100 text-gray-700',
            in_progress: 'bg-blue-100 text-blue-700',
            review: 'bg-yellow-100 text-yellow-700',
            completed: 'bg-green-100 text-green-700',
        };
        return styles[status] || 'bg-gray-100 text-gray-700';
    };

    const isOverdue = project.end_date && new Date(project.end_date) < new Date() && project.status !== 'completed';

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button asChild variant="ghost" size="sm">
                            <Link href={route('projects.index')}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Link>
                        </Button>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <FolderKanban className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900">{project.name}</h2>
                                <p className="text-gray-600 mt-1">{project.code}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button asChild variant="outline">
                            <Link href={route('projects.edit', project.id)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                            </Link>
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </Button>
                    </div>
                </div>
            }
        >
            <Head title={project.name} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Overview */}
                    <Card className="animate-fade-in">
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle className="text-2xl">{project.name}</CardTitle>
                                    <CardDescription className="text-base mt-1">{project.code}</CardDescription>
                                </div>
                                <div className="flex gap-2">
                                    <Badge className={`${getStatusBadge(project.status)} border`}>
                                        {project.status.replace('_', ' ')}
                                    </Badge>
                                    <Badge className={`${getPriorityBadge(project.priority)} border`}>
                                        {project.priority}
                                    </Badge>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {project.description && (
                                <p className="text-gray-700">{project.description}</p>
                            )}

                            {project.category && (
                                <div className="pt-4 border-t">
                                    <p className="text-sm text-gray-600 mb-2">Category</p>
                                    <Badge
                                        className="border"
                                        style={{
                                            backgroundColor: project.category.color + '15',
                                            color: project.category.color,
                                            borderColor: project.category.color + '40'
                                        }}
                                    >
                                        {project.category.name}
                                    </Badge>
                                </div>
                            )}

                            <div className="pt-4 border-t">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm text-gray-600">Overall Progress</p>
                                    <span className="text-2xl font-bold text-gray-900">{project.progress}%</span>
                                </div>
                                <Progress value={project.progress} className="h-3" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tasks */}
                    <Card className="animate-fade-in animation-delay-100">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <ClipboardList className="h-5 w-5" />
                                    Tasks
                                </CardTitle>
                                <span className="text-sm text-gray-600">
                                    {project.tasks?.length || 0} {project.tasks?.length === 1 ? 'task' : 'tasks'}
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {project.tasks && project.tasks.length > 0 ? (
                                <div className="space-y-3">
                                    {project.tasks.map((task) => (
                                        <div key={task.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-900">{task.title}</p>
                                                    {task.description && (
                                                        <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                                                    )}
                                                </div>
                                                <Badge className={getTaskStatusBadge(task.status)}>
                                                    {task.status.replace('_', ' ')}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-gray-600 mt-3">
                                                {task.assignee && (
                                                    <div className="flex items-center gap-1">
                                                        <User className="h-4 w-4" />
                                                        {task.assignee.name}
                                                    </div>
                                                )}
                                                {task.due_date && (
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-4 w-4" />
                                                        {new Date(task.due_date).toLocaleDateString()}
                                                    </div>
                                                )}
                                                <Badge className={getPriorityBadge(task.priority)}>
                                                    {task.priority}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <ClipboardList className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                                    <p>No tasks yet</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Project Info */}
                    <Card className="animate-fade-in animation-delay-200">
                        <CardHeader>
                            <CardTitle>Project Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 rounded-lg">
                                    <User className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Project Owner</p>
                                    <p className="font-medium text-gray-900">{project.owner.name}</p>
                                </div>
                            </div>

                            {project.start_date && (
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-50 rounded-lg">
                                        <Calendar className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Start Date</p>
                                        <p className="font-medium text-gray-900">
                                            {new Date(project.start_date).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {project.end_date && (
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${isOverdue ? 'bg-red-50' : 'bg-purple-50'}`}>
                                        <Calendar className={`h-5 w-5 ${isOverdue ? 'text-red-600' : 'text-purple-600'}`} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">End Date</p>
                                        <p className={`font-medium ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                                            {new Date(project.end_date).toLocaleDateString()}
                                            {isOverdue && ' (Overdue)'}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {project.budget && (
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-yellow-50 rounded-lg">
                                        <DollarSign className="h-5 w-5 text-yellow-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Budget</p>
                                        <p className="font-medium text-gray-900">
                                            ${parseFloat(project.budget).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Task Stats */}
                    <Card className="animate-fade-in animation-delay-300">
                        <CardHeader>
                            <CardTitle>Task Statistics</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="text-sm font-medium text-gray-700">To Do</span>
                                <span className="text-xl font-bold text-gray-900">
                                    {project.tasks?.filter(t => t.status === 'todo').length || 0}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                <span className="text-sm font-medium text-gray-700">In Progress</span>
                                <span className="text-xl font-bold text-blue-900">
                                    {project.tasks?.filter(t => t.status === 'in_progress').length || 0}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                <span className="text-sm font-medium text-gray-700">Completed</span>
                                <span className="text-xl font-bold text-green-900">
                                    {project.tasks?.filter(t => t.status === 'completed').length || 0}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card className="animate-fade-in animation-delay-400">
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button className="w-full justify-start" variant="outline" asChild>
                                <Link href={route('projects.edit', project.id)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Project
                                </Link>
                            </Button>
                            <Button className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" variant="outline" onClick={handleDelete}>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Project
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Delete Modal */}
            <DeleteConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Project"
                description="This will permanently delete this project and all its tasks. This action cannot be undone."
                itemName={project.name}
            />
        </AuthenticatedLayout>
    );
}