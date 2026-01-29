// resources/js/Pages/Projects/Index.jsx
import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Card, CardContent } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Progress } from '@/Components/ui/progress';
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
    FolderKanban,
    Plus,
    Search,
    Edit,
    Trash2,
    Eye,
    ChevronLeft,
    ChevronRight,
    X,
    User,
    Calendar,
    DollarSign,
    AlertCircle,
} from 'lucide-react';

export default function Index({ auth, projects, categories, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [category, setCategory] = useState(filters.category || 'all');
    const [status, setStatus] = useState(filters.status || 'all');
    const [priority, setPriority] = useState(filters.priority || 'all');
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState(null);

    const handleSearch = (e) => {
        e.preventDefault();
        const params = { search };
        
        if (category && category !== 'all') params.category = category;
        if (status && status !== 'all') params.status = status;
        if (priority && priority !== 'all') params.priority = priority;
        
        router.get(route('projects.index'), params, {
            preserveState: true,
        });
    };

    const handleReset = () => {
        setSearch('');
        setCategory('all');
        setStatus('all');
        setPriority('all');
        router.get(route('projects.index'));
    };

    const handleDelete = (project) => {
        setProjectToDelete(project);
        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (projectToDelete) {
            router.delete(route('projects.destroy', projectToDelete.id));
        }
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

    const hasFilters = search || category !== 'all' || status !== 'all' || priority !== 'all';

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <FolderKanban className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">Project Management</h2>
                            <p className="text-gray-600 mt-1">Manage projects and track progress</p>
                        </div>
                    </div>
                    <Button asChild className="bg-blue-600 hover:bg-blue-700">
                        <Link href={route('projects.create')}>
                            <Plus className="h-4 w-4 mr-2" />
                            New Project
                        </Link>
                    </Button>
                </div>
            }
        >
            <Head title="Projects" />

            <div className="space-y-6">
                {/* Filters */}
                <Card className="shadow-sm animate-fade-in">
                    <CardContent className="pt-6">
                        <form onSubmit={handleSearch} className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <Input
                                    type="text"
                                    placeholder="Search by name, code, or description..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10 h-11"
                                />
                            </div>

                            <div className="flex flex-wrap items-end gap-3">
                                <div className="flex-1 min-w-[200px] space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700">Category</label>
                                    <Select value={category} onValueChange={setCategory}>
                                        <SelectTrigger className="h-10">
                                            <SelectValue placeholder="All Categories" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Categories</SelectItem>
                                            {categories.map((cat) => (
                                                <SelectItem key={cat.id} value={cat.id.toString()}>
                                                    {cat.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex-1 min-w-[200px] space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700">Status</label>
                                    <Select value={status} onValueChange={setStatus}>
                                        <SelectTrigger className="h-10">
                                            <SelectValue placeholder="All Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="planning">Planning</SelectItem>
                                            <SelectItem value="in_progress">In Progress</SelectItem>
                                            <SelectItem value="on_hold">On Hold</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex-1 min-w-[200px] space-y-1.5">
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
                                Showing <span className="font-semibold text-gray-900">{projects.total}</span> {projects.total === 1 ? 'project' : 'projects'}
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
                                    <TableHead className="font-semibold">Project</TableHead>
                                    <TableHead className="font-semibold">Owner</TableHead>
                                    <TableHead className="font-semibold">Progress</TableHead>
                                    <TableHead className="font-semibold">Status</TableHead>
                                    <TableHead className="font-semibold">Priority</TableHead>
                                    <TableHead className="font-semibold">Dates</TableHead>
                                    <TableHead className="text-right font-semibold">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {projects.data.length > 0 ? (
                                    projects.data.map((project, index) => (
                                        <TableRow key={project.id} className={`hover:bg-gray-50 animate-fade-in-up animation-delay-${Math.min((index + 3) * 100, 900)}`}>
                                            <TableCell className="py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-blue-50 rounded-lg">
                                                        <FolderKanban className="h-5 w-5 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{project.name}</p>
                                                        <p className="text-sm text-gray-500">{project.code}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-full">
                                                        <span className="text-xs font-medium text-white">
                                                            {project.owner.name.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <span className="text-sm text-gray-900">{project.owner.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-gray-600">Progress</span>
                                                        <span className="font-medium text-gray-900">{project.progress}%</span>
                                                    </div>
                                                    <Progress value={project.progress} className="h-2" />
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={`${getStatusBadge(project.status)} border`}>
                                                    {project.status.replace('_', ' ')}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={`${getPriorityBadge(project.priority)} border`}>
                                                    {project.priority}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm space-y-1">
                                                    {project.start_date && (
                                                        <p className="text-gray-600">
                                                            Start: {new Date(project.start_date).toLocaleDateString()}
                                                        </p>
                                                    )}
                                                    {project.end_date && (
                                                        <p className="text-gray-600">
                                                            End: {new Date(project.end_date).toLocaleDateString()}
                                                        </p>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link href={route('projects.show', project.id)}>
                                                            <Eye className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link href={route('projects.edit', project.id)}>
                                                            <Edit className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm"
                                                        onClick={() => handleDelete(project)}
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-16">
                                            <div className="flex flex-col items-center">
                                                <div className="p-4 bg-gray-100 rounded-full mb-4">
                                                    <FolderKanban className="h-12 w-12 text-gray-400" />
                                                </div>
                                                <p className="text-gray-900 font-medium text-lg mb-1">No projects found</p>
                                                <p className="text-gray-500 text-sm mb-4">Create your first project</p>
                                                <Button asChild className="bg-blue-600 hover:bg-blue-700">
                                                    <Link href={route('projects.create')}>
                                                        <Plus className="h-4 w-4 mr-2" />
                                                        New Project
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
                    {projects.data.length > 0 && (
                        <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
                            <p className="text-sm text-gray-700">
                                Showing <span className="font-medium">{projects.from}</span> to{' '}
                                <span className="font-medium">{projects.to}</span> of{' '}
                                <span className="font-medium">{projects.total}</span> results
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => router.get(projects.prev_page_url)}
                                    disabled={!projects.prev_page_url}
                                    className="h-9"
                                >
                                    <ChevronLeft className="h-4 w-4 mr-1" />
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => router.get(projects.next_page_url)}
                                    disabled={!projects.next_page_url}
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
                title="Delete Project"
                description="This will permanently delete this project and all its tasks. This action cannot be undone."
                itemName={projectToDelete?.name}
            />
        </AuthenticatedLayout>
    );
}