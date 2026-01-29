// resources/js/Pages/Tasks/Kanban.jsx
import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import {
    ClipboardList,
    Plus,
    List,
    User,
    Calendar,
    Clock,
    AlertCircle,
    FolderKanban,
} from 'lucide-react';

export default function Kanban({ auth, kanbanTasks, projects, users, filters }) {
    const [projectFilter, setProjectFilter] = useState(filters.project || 'all');
    const [assigneeFilter, setAssigneeFilter] = useState(filters.assignee || 'all');

    const handleFilter = () => {
        const params = {};
        if (projectFilter && projectFilter !== 'all') params.project = projectFilter;
        if (assigneeFilter && assigneeFilter !== 'all') params.assignee = assigneeFilter;
        
        router.get(route('tasks.kanban'), params, {
            preserveState: true,
        });
    };

    const handleStatusChange = (taskId, newStatus) => {
        router.patch(route('tasks.updateStatus', taskId), {
            status: newStatus
        }, {
            preserveState: true,
        });
    };

    const columns = [
        { id: 'todo', title: 'To Do', color: 'bg-gray-100', borderColor: 'border-gray-300' },
        { id: 'in_progress', title: 'In Progress', color: 'bg-blue-100', borderColor: 'border-blue-300' },
        { id: 'review', title: 'Review', color: 'bg-yellow-100', borderColor: 'border-yellow-300' },
        { id: 'completed', title: 'Completed', color: 'bg-green-100', borderColor: 'border-green-300' },
    ];

    const getPriorityColor = (priority) => {
        const colors = {
            low: 'text-gray-600',
            medium: 'text-blue-600',
            high: 'text-orange-600',
            urgent: 'text-red-600',
        };
        return colors[priority] || 'text-gray-600';
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <ClipboardList className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">Kanban Board</h2>
                            <p className="text-gray-600 mt-1">Visualize and manage tasks</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button asChild variant="outline">
                            <Link href={route('tasks.index')}>
                                <List className="h-4 w-4 mr-2" />
                                List View
                            </Link>
                        </Button>
                        <Button asChild className="bg-blue-600 hover:bg-blue-700">
                            <Link href={route('tasks.create')}>
                                <Plus className="h-4 w-4 mr-2" />
                                New Task
                            </Link>
                        </Button>
                    </div>
                </div>
            }
        >
            <Head title="Kanban Board" />

            {/* Filters */}
            <Card className="mb-6 animate-fade-in">
                <CardContent className="pt-6">
                    <div className="flex flex-wrap items-end gap-3">
                        <div className="flex-1 min-w-[200px] space-y-1.5">
                            <label className="text-sm font-medium text-gray-700">Filter by Project</label>
                            <Select value={projectFilter} onValueChange={setProjectFilter}>
                                <SelectTrigger className="h-10">
                                    <SelectValue placeholder="All Projects" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Projects</SelectItem>
                                    {projects.map((project) => (
                                        <SelectItem key={project.id} value={project.id.toString()}>
                                            {project.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex-1 min-w-[200px] space-y-1.5">
                            <label className="text-sm font-medium text-gray-700">Filter by Assignee</label>
                            <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                                <SelectTrigger className="h-10">
                                    <SelectValue placeholder="All Users" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Users</SelectItem>
                                    {users.map((user) => (
                                        <SelectItem key={user.id} value={user.id.toString()}>
                                            {user.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <Button onClick={handleFilter} className="bg-blue-600 hover:bg-blue-700 h-10">
                            Apply Filters
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Kanban Board */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in animation-delay-200">
                {columns.map((column, columnIndex) => (
                    <div key={column.id} className={`animate-fade-in-up animation-delay-${(columnIndex + 3) * 100}`}>
                        <Card className={`${column.color} border-t-4 ${column.borderColor}`}>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center justify-between">
                                    <span>{column.title}</span>
                                    <Badge variant="secondary" className="bg-white">
                                        {kanbanTasks[column.id]?.length || 0}
                                    </Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 min-h-[500px]">
                                {kanbanTasks[column.id] && kanbanTasks[column.id].length > 0 ? (
                                    kanbanTasks[column.id].map((task) => {
                                        const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';
                                        return (
                                            <Card 
                                                key={task.id} 
                                                className="bg-white hover:shadow-md transition-shadow cursor-move"
                                            >
                                                <CardContent className="p-4">
                                                    <div className="space-y-3">
                                                        <div>
                                                            <p className="font-medium text-gray-900 mb-1">{task.title}</p>
                                                            {task.description && (
                                                                <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>
                                                            )}
                                                        </div>

                                                        <div className="flex items-center gap-2 text-xs">
                                                            <FolderKanban className="h-3 w-3 text-gray-400" />
                                                            <span className="text-gray-600">{task.project.name}</span>
                                                        </div>

                                                        {task.assignee && (
                                                            <div className="flex items-center gap-2">
                                                                <div className="flex items-center justify-center w-6 h-6 bg-blue-600 rounded-full">
                                                                    <span className="text-xs font-medium text-white">
                                                                        {task.assignee.name.charAt(0).toUpperCase()}
                                                                    </span>
                                                                </div>
                                                                <span className="text-xs text-gray-600">{task.assignee.name}</span>
                                                            </div>
                                                        )}

                                                        <div className="flex items-center justify-between pt-2 border-t">
                                                            <Badge className={`text-xs ${getPriorityColor(task.priority)}`} variant="outline">
                                                                {task.priority}
                                                            </Badge>
                                                            {task.due_date && (
                                                                <div className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
                                                                    <Calendar className="h-3 w-3" />
                                                                    {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Move Task Buttons */}
                                                        <div className="pt-2 border-t">
                                                            <Select 
                                                                value={task.status} 
                                                                onValueChange={(newStatus) => handleStatusChange(task.id, newStatus)}
                                                            >
                                                                <SelectTrigger className="h-8 text-xs">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="todo">To Do</SelectItem>
                                                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                                                    <SelectItem value="review">Review</SelectItem>
                                                                    <SelectItem value="completed">Completed</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                                        <ClipboardList className="h-8 w-8 mb-2" />
                                        <p className="text-sm">No tasks</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                ))}
            </div>
        </AuthenticatedLayout>
    );
}