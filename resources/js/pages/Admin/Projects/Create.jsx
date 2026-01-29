// resources/js/Pages/Projects/Create.jsx
import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { Textarea } from '@/Components/ui/textarea';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    DollarSign,
    FolderKanban,
    Hash,
    Loader2,
    Save,
} from 'lucide-react';

export default function Create({ auth, categories, users }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        code: '',
        description: '',
        category_id: '',
        owner_id: auth.user.id,
        start_date: '',
        end_date: '',
        status: 'planning',
        priority: 'medium',
        progress: 0,
        budget: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('projects.store'));
    };

    const generateCode = () => {
        const prefix = 'PRJ';
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 100)
            .toString()
            .padStart(2, '0');
        setData('code', `${prefix}-${timestamp}-${random}`);
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button asChild variant="ghost" size="sm">
                            <Link href={route('projects.index')}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back
                            </Link>
                        </Button>
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-blue-100 p-2">
                                <FolderKanban className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900">
                                    New Project
                                </h2>
                                <p className="mt-1 text-gray-600">
                                    Create a new project
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Create Project" />

            <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
                {/* Basic Information */}
                <Card className="animate-fade-in">
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                        <CardDescription>
                            Project details and identification
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Project Name *</Label>
                            <Input
                                value={data.name}
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                                placeholder="e.g., Website Redesign 2025"
                                className={errors.name ? 'border-red-500' : ''}
                            />
                            {errors.name && (
                                <p className="flex items-center gap-1 text-sm text-red-500">
                                    <AlertCircle className="h-4 w-4" />
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Project Code *</Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={data.code}
                                        onChange={(e) =>
                                            setData('code', e.target.value)
                                        }
                                        placeholder="PRJ-001"
                                        className={
                                            errors.code ? 'border-red-500' : ''
                                        }
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={generateCode}
                                    >
                                        <Hash className="h-4 w-4" />
                                    </Button>
                                </div>
                                {errors.code && (
                                    <p className="text-sm text-red-500">
                                        {errors.code}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>Category</Label>
                                <Select
                                    value={data.category_id}
                                    onValueChange={(value) =>
                                        setData('category_id', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((cat) => (
                                            <SelectItem
                                                key={cat.id}
                                                value={cat.id.toString()}
                                            >
                                                {cat.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                                value={data.description}
                                onChange={(e) =>
                                    setData('description', e.target.value)
                                }
                                placeholder="Brief description of the project..."
                                rows={4}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Project Settings */}
                <Card className="animate-fade-in animation-delay-100">
                    <CardHeader>
                        <CardTitle>Project Settings</CardTitle>
                        <CardDescription>
                            Status, priority, and assignment
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                                <Label>Project Owner *</Label>
                                <Select
                                    value={data.owner_id.toString()}
                                    onValueChange={(value) =>
                                        setData('owner_id', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
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
                                {errors.owner_id && (
                                    <p className="text-sm text-red-500">
                                        {errors.owner_id}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>Status *</Label>
                                <Select
                                    value={data.status}
                                    onValueChange={(value) =>
                                        setData('status', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="planning">
                                            Planning
                                        </SelectItem>
                                        <SelectItem value="in_progress">
                                            In Progress
                                        </SelectItem>
                                        <SelectItem value="on_hold">
                                            On Hold
                                        </SelectItem>
                                        <SelectItem value="completed">
                                            Completed
                                        </SelectItem>
                                        <SelectItem value="cancelled">
                                            Cancelled
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Priority *</Label>
                                <Select
                                    value={data.priority}
                                    onValueChange={(value) =>
                                        setData('priority', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">
                                            Medium
                                        </SelectItem>
                                        <SelectItem value="high">
                                            High
                                        </SelectItem>
                                        <SelectItem value="urgent">
                                            Urgent
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Timeline & Budget */}
                <Card className="animate-fade-in animation-delay-200">
                    <CardHeader>
                        <CardTitle>Timeline & Budget</CardTitle>
                        <CardDescription>
                            Schedule and financial information
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                                <Label>Start Date</Label>
                                <Input
                                    type="date"
                                    value={data.start_date}
                                    onChange={(e) =>
                                        setData('start_date', e.target.value)
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>End Date</Label>
                                <Input
                                    type="date"
                                    value={data.end_date}
                                    onChange={(e) =>
                                        setData('end_date', e.target.value)
                                    }
                                    className={
                                        errors.end_date ? 'border-red-500' : ''
                                    }
                                />
                                {errors.end_date && (
                                    <p className="text-sm text-red-500">
                                        {errors.end_date}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>Budget</Label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={data.budget}
                                        onChange={(e) =>
                                            setData('budget', e.target.value)
                                        }
                                        placeholder="0.00"
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Initial Progress (%)</Label>
                            <Input
                                type="number"
                                min="0"
                                max="100"
                                value={data.progress}
                                onChange={(e) =>
                                    setData('progress', e.target.value)
                                }
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Actions */}
                <Card className="animate-fade-in animation-delay-300">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-600">
                                Fields marked with * are required
                            </p>
                            <div className="flex gap-3">
                                <Button type="button" variant="outline" asChild>
                                    <Link href={route('projects.index')}>
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
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            Create Project
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </AuthenticatedLayout>
    );
}
