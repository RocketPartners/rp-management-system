// resources/js/Pages/Tasks/Kanban.jsx
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import {
    Calendar,
    ClipboardList,
    FolderKanban,
    List,
    Plus,
} from 'lucide-react';
import { useState } from 'react';

export default function Kanban({
    auth,
    kanbanTasks,
    projects,
    users,
    filters,
}) {
    const [projectFilter, setProjectFilter] = useState(
        filters.project || 'all',
    );
    const [assigneeFilter, setAssigneeFilter] = useState(
        filters.assignee || 'all',
    );

    const handleFilter = () => {
        const params = {};
        if (projectFilter && projectFilter !== 'all')
            params.project = projectFilter;
        if (assigneeFilter && assigneeFilter !== 'all')
            params.assignee = assigneeFilter;

        router.get(route('tasks.kanban'), params, {
            preserveState: true,
        });
    };

    const handleStatusChange = (taskId, newStatus) => {
        router.patch(
            route('tasks.updateStatus', taskId),
            {
                status: newStatus,
            },
            {
                preserveState: true,
            },
        );
    };

    const columns = [
        {
            id: 'todo',
            title: 'To Do',
            color: 'bg-gray-100',
            borderColor: 'border-gray-300',
        },
        {
            id: 'in_progress',
            title: 'In Progress',
            color: 'bg-blue-100',
            borderColor: 'border-blue-300',
        },
        {
            id: 'review',
            title: 'Review',
            color: 'bg-yellow-100',
            borderColor: 'border-yellow-300',
        },
        {
            id: 'completed',
            title: 'Completed',
            color: 'bg-green-100',
            borderColor: 'border-green-300',
        },
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
                        <div className="rounded-lg bg-blue-100 p-2">
                            <ClipboardList className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">
                                Kanban Board
                            </h2>
                            <p className="mt-1 text-gray-600">
                                Visualize and manage tasks
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button asChild variant="outline">
                            <Link href={route('tasks.index')}>
                                <List className="mr-2 h-4 w-4" />
                                List View
                            </Link>
                        </Button>
                        <Button
                            asChild
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            <Link href={route('tasks.create')}>
                                <Plus className="mr-2 h-4 w-4" />
                                New Task
                            </Link>
                        </Button>
                    </div>
                </div>
            }
        >
            <Head title="Kanban Board" />

            {/* Filters */}
            <Card className="animate-fade-in mb-6">
                <CardContent className="pt-6">
                    <div className="flex flex-wrap items-end gap-3">
                        <div className="min-w-[200px] flex-1 space-y-1.5">
                            <label className="text-sm font-medium text-gray-700">
                                Filter by Project
                            </label>
                            <Select
                                value={projectFilter}
                                onValueChange={setProjectFilter}
                            >
                                <SelectTrigger className="h-10">
                                    <SelectValue placeholder="All Projects" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Projects
                                    </SelectItem>
                                    {projects.map((project) => (
                                        <SelectItem
                                            key={project.id}
                                            value={project.id.toString()}
                                        >
                                            {project.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="min-w-[200px] flex-1 space-y-1.5">
                            <label className="text-sm font-medium text-gray-700">
                                Filter by Assignee
                            </label>
                            <Select
                                value={assigneeFilter}
                                onValueChange={setAssigneeFilter}
                            >
                                <SelectTrigger className="h-10">
                                    <SelectValue placeholder="All Users" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Users
                                    </SelectItem>
                                    {users.map((user) => (
                                        <SelectItem
                                            key={user.id}
                                            value={user.id.toString()}
                                        >
                                            {user.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <Button
                            onClick={handleFilter}
                            className="h-10 bg-blue-600 hover:bg-blue-700"
                        >
                            Apply Filters
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Kanban Board */}
            <div className="animate-fade-in animation-delay-200 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                {columns.map((column, columnIndex) => (
                    <div
                        key={column.id}
                        className={`animate-fade-in-up animation-delay-${(columnIndex + 3) * 100}`}
                    >
                        <Card
                            className={`${column.color} border-t-4 ${column.borderColor}`}
                        >
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center justify-between text-lg">
                                    <span>{column.title}</span>
                                    <Badge
                                        variant="secondary"
                                        className="bg-white"
                                    >
                                        {kanbanTasks[column.id]?.length || 0}
                                    </Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="min-h-[500px] space-y-3">
                                {kanbanTasks[column.id] &&
                                kanbanTasks[column.id].length > 0 ? (
                                    kanbanTasks[column.id].map((task) => {
                                        const isOverdue =
                                            task.due_date &&
                                            new Date(task.due_date) <
                                                new Date() &&
                                            task.status !== 'completed';
                                        return (
                                            <Card
                                                key={task.id}
                                                className="cursor-move bg-white transition-shadow hover:shadow-md"
                                            >
                                                <CardContent className="p-4">
                                                    <div className="space-y-3">
                                                        <div>
                                                            <p className="mb-1 font-medium text-gray-900">
                                                                {task.title}
                                                            </p>
                                                            {task.description && (
                                                                <p className="line-clamp-2 text-sm text-gray-600">
                                                                    {
                                                                        task.description
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>

                                                        <div className="flex items-center gap-2 text-xs">
                                                            <FolderKanban className="h-3 w-3 text-gray-400" />
                                                            <span className="text-gray-600">
                                                                {
                                                                    task.project
                                                                        .name
                                                                }
                                                            </span>
                                                        </div>

                                                        {task.assignee && (
                                                            <div className="flex items-center gap-2">
                                                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600">
                                                                    <span className="text-xs font-medium text-white">
                                                                        {task.assignee.name
                                                                            .charAt(
                                                                                0,
                                                                            )
                                                                            .toUpperCase()}
                                                                    </span>
                                                                </div>
                                                                <span className="text-xs text-gray-600">
                                                                    {
                                                                        task
                                                                            .assignee
                                                                            .name
                                                                    }
                                                                </span>
                                                            </div>
                                                        )}

                                                        <div className="flex items-center justify-between border-t pt-2">
                                                            <Badge
                                                                className={`text-xs ${getPriorityColor(task.priority)}`}
                                                                variant="outline"
                                                            >
                                                                {task.priority}
                                                            </Badge>
                                                            {task.due_date && (
                                                                <div
                                                                    className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}
                                                                >
                                                                    <Calendar className="h-3 w-3" />
                                                                    {new Date(
                                                                        task.due_date,
                                                                    ).toLocaleDateString(
                                                                        'en-US',
                                                                        {
                                                                            month: 'short',
                                                                            day: 'numeric',
                                                                        },
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Move Task Buttons */}
                                                        <div className="border-t pt-2">
                                                            <Select
                                                                value={
                                                                    task.status
                                                                }
                                                                onValueChange={(
                                                                    newStatus,
                                                                ) =>
                                                                    handleStatusChange(
                                                                        task.id,
                                                                        newStatus,
                                                                    )
                                                                }
                                                            >
                                                                <SelectTrigger className="h-8 text-xs">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="todo">
                                                                        To Do
                                                                    </SelectItem>
                                                                    <SelectItem value="in_progress">
                                                                        In
                                                                        Progress
                                                                    </SelectItem>
                                                                    <SelectItem value="review">
                                                                        Review
                                                                    </SelectItem>
                                                                    <SelectItem value="completed">
                                                                        Completed
                                                                    </SelectItem>
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
                                        <ClipboardList className="mb-2 h-8 w-8" />
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
