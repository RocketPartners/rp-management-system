// resources/js/Pages/Tasks/Index.jsx
import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Card, CardContent } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import DeleteConfirmationModal from '@/Components/DeleteConfirmationModal';
import {
    ClipboardList,
    Plus,
    Search,
    Trash2,
    ChevronLeft,
    ChevronRight,
    X,
    User,
    Calendar,
    FolderKanban,
    LayoutGrid,
    Clock,
} from 'lucide-react';

export default function Index({ auth, tasks, projects, users, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [priority, setPriority] = useState(filters.priority || 'all');
    const [assignee, setAssignee] = useState(filters.assignee || 'all');
    const [projectFilter, setProjectFilter] = useState(filters.project || 'all');
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState(null);

    const handleSearch = (e) => {
        e.preventDefault();
        const params = { search };
        
        if (status && status !== 'all') params.status = status;
        if (priority && priority !== 'all') params.priority = priority;
        if (assignee && assignee !== 'all') params.assignee = assignee;
        if (projectFilter && projectFilter !== 'all') params.project = projectFilter;
        
        router.get(route('tasks.index'), params, {
            preserveState: true,
        });
    };

    const handleReset = () => {
        setSearch('');
        setStatus('all');
        setPriority('all');
        setAssignee('all');
        setProjectFilter('all');
        router.get(route('tasks.index'));
    };

    const handleDelete = (task) => {
        setTaskToDelete(task);
        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (taskToDelete) {
            router.delete(route('tasks.destroy', taskToDelete.id));
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            todo: 'bg-gray-100 text-gray-700 border-gray-200',
            in_progress: 'bg-blue-100 text-blue-700 border-blue-200',
            review: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            completed: 'bg-green-100 text-green-700 border-green-200',
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

    const hasFilters = search || status !== 'all' || priority !== 'all' || assignee !== 'all' || projectFilter !== 'all';

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <ClipboardList className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">Task Management</h2>
                            <p className="text-gray-600 mt-1">Manage and track all tasks</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button asChild variant="outline">
                            <Link href={route('tasks.kanban')}>
                                <LayoutGrid className="h-4 w-4 mr-2" />
                                Kanban View
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
            <Head title="Tasks" />

            <div className="space-y-6">
                {/* Filters */}
                <Card className="shadow-sm animate-fade-in">
                    <CardContent className="pt-6">
                        <form onSubmit={handleSearch} className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <Input
                                    type="text"
                                    placeholder="Search tasks..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10 h-11"
                                />
                            </div>

                            <div className="flex flex-wrap items-end gap-3">
                                <div className="flex-1 min-w-[180px] space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700">Project</label>
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

                                <div className="flex-1 min-w-[180px] space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700">Assignee</label>
                                    <Select value={assignee} onValueChange={setAssignee}>
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

                                <div className="flex-1 min-w-[150px] space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700">Status</label>
                                    <Select value={status} onValueChange={setStatus}>
                                        <SelectTrigger className="h-10">
                                            <SelectValue placeholder="All Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="todo">To Do</SelectItem>
                                            <SelectItem value="in_progress">In Progress</SelectItem>
                                            <SelectItem value="review">Review</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex-1 min-w-[150px] space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700">Priority</label>
                                    <Select value={priority} onValueChange={setPriority}>
                                        <SelectTrigger className="h-10">
                                            <SelectValue placeholder="All Priorities" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Priorities</SelectItem>
                                            <SelectItem value="low">Low</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                            <SelectItem value="urgent">Urgent</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex gap-2">
                                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700 h-10">
                                        <Search className="h-4 w-4 mr-2" />
                                        Search
                                    </Button>
                                    {hasFilters && (
                                        <Button type="button" variant="outline" onClick={handleReset} className="h-10">
                                            <X className="h-4 w-4 mr-2" />
                                            Reset
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <div className="text-sm text-gray-600 pt-2 border-t">
                                Showing <span className="font-semibold text-gray-900">{tasks.total}</span> {tasks.total === 1 ? 'task' : 'tasks'}
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Table */}
                <Card className="shadow-sm animate-fade-in animation-delay-200">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50 hover:bg-gray-50">
                                    <TableHead className="font-semibold">Task</TableHead>
                                    <TableHead className="font-semibold">Project</TableHead>
                                    <TableHead className="font-semibold">Assigned To</TableHead>
                                    <TableHead className="font-semibold">Status</TableHead>
                                    <TableHead className="font-semibold">Priority</TableHead>
                                    <TableHead className="font-semibold">Due Date</TableHead>
                                    <TableHead className="text-right font-semibold">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tasks.data.length > 0 ? (
                                    tasks.data.map((task, index) => {
                                        const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';
                                        return (
                                            <TableRow key={task.id} className={`hover:bg-gray-50 animate-fade-in-up animation-delay-${Math.min((index + 3) * 100, 900)}`}>
                                                <TableCell className="py-4">
                                                    <div>
                                                        <p className="font-medium text-gray-900">{task.title}</p>
                                                        {task.description && (
                                                            <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{task.description}</p>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <FolderKanban className="h-4 w-4 text-gray-400" />
                                                        <span className="text-sm text-gray-900">{task.project.name}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {task.assignee ? (
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-full">
                                                                <span className="text-xs font-medium text-white">
                                                                    {task.assignee.name.charAt(0).toUpperCase()}
                                                                </span>
                                                            </div>
                                                            <span className="text-sm text-gray-900">{task.assignee.name}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 text-sm">Unassigned</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={`${getStatusBadge(task.status)} border`}>
                                                        {task.status.replace('_', ' ')}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={`${getPriorityBadge(task.priority)} border`}>
                                                        {task.priority}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {task.due_date ? (
                                                        <div className={`flex items-center gap-2 text-sm ${isOverdue ? 'text-red-600' : 'text-gray-600'}`}>
                                                            <Calendar className="h-4 w-4" />
                                                            {new Date(task.due_date).toLocaleDateString()}
                                                            {isOverdue && ' (Overdue)'}
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 text-sm">-</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm"
                                                        onClick={() => handleDelete(task)}
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-16">
                                            <div className="flex flex-col items-center">
                                                <div className="p-4 bg-gray-100 rounded-full mb-4">
                                                    <ClipboardList className="h-12 w-12 text-gray-400" />
                                                </div>
                                                <p className="text-gray-900 font-medium text-lg mb-1">No tasks found</p>
                                                <p className="text-gray-500 text-sm mb-4">Create your first task</p>
                                                <Button asChild className="bg-blue-600 hover:bg-blue-700">
                                                    <Link href={route('tasks.create')}>
                                                        <Plus className="h-4 w-4 mr-2" />
                                                        New Task
                                                    </Link>
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {tasks.data.length > 0 && (
                        <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
                            <p className="text-sm text-gray-700">
                                Showing <span className="font-medium">{tasks.from}</span> to{' '}
                                <span className="font-medium">{tasks.to}</span> of{' '}
                                <span className="font-medium">{tasks.total}</span> results
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => router.get(tasks.prev_page_url)}
                                    disabled={!tasks.prev_page_url}
                                    className="h-9"
                                >
                                    <ChevronLeft className="h-4 w-4 mr-1" />
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => router.get(tasks.next_page_url)}
                                    disabled={!tasks.next_page_url}
                                    className="h-9"
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </div>
                        </div>
                    )}
                </Card>
            </div>

            {/* Delete Modal */}
            <DeleteConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Task"
                description="This will permanently delete this task. This action cannot be undone."
                itemName={taskToDelete?.title}
            />
        </AuthenticatedLayout>
    );
}