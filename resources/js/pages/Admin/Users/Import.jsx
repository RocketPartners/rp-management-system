// resources/js/Pages/Users/Import.jsx
import { Alert, AlertDescription } from '@/Components/ui/alert';
import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    CheckCircle2,
    Download,
    FileSpreadsheet,
    Info,
    Upload,
    X,
} from 'lucide-react';
import { useState } from 'react';

export default function Import({ auth }) {
    const [dragActive, setDragActive] = useState(false);
    const { data, setData, post, processing, errors, progress } = useForm({
        file: null,
    });

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setData('file', e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setData('file', e.target.files[0]);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('users.import.store'));
    };

    const removeFile = () => {
        setData('file', null);
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button asChild variant="ghost" size="sm">
                            <Link href={route('users.index')}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Users
                            </Link>
                        </Button>
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-blue-100 p-2">
                                <Upload className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900">
                                    Import Users
                                </h2>
                                <p className="mt-1 text-gray-600">
                                    Bulk upload users from Excel file
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Import Users" />

            <div className="max-w-4xl space-y-6">
                {/* Instructions Card */}
                <Card className="animate-fade-in">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Info className="h-5 w-5 text-blue-600" />
                            How to Import
                        </CardTitle>
                        <CardDescription>
                            Follow these steps to successfully import users
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ol className="space-y-3 text-sm text-gray-700">
                            <li className="flex items-start gap-3">
                                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                                    1
                                </span>
                                <div>
                                    <p className="font-medium">
                                        Download the template
                                    </p>
                                    <p className="text-gray-600">
                                        Use our Excel template with the correct
                                        column headers
                                    </p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                                    2
                                </span>
                                <div>
                                    <p className="font-medium">
                                        Fill in employee data
                                    </p>
                                    <p className="text-gray-600">
                                        Enter employee information in the
                                        template (required: First Name, Last
                                        Name, Work Email)
                                    </p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                                    3
                                </span>
                                <div>
                                    <p className="font-medium">
                                        Upload the file
                                    </p>
                                    <p className="text-gray-600">
                                        Drag and drop or click to upload your
                                        completed Excel file
                                    </p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                                    4
                                </span>
                                <div>
                                    <p className="font-medium">
                                        Import complete!
                                    </p>
                                    <p className="text-gray-600">
                                        All users will be created with default
                                        password:{' '}
                                        <code className="rounded bg-gray-100 px-2 py-1">
                                            password123
                                        </code>
                                    </p>
                                </div>
                            </li>
                        </ol>

                        <Alert className="mt-6 border-yellow-200 bg-yellow-50">
                            <AlertCircle className="h-4 w-4 text-yellow-600" />
                            <AlertDescription className="text-yellow-800">
                                <strong>Important:</strong> Make sure the Excel
                                column headers match exactly (case-insensitive).
                                Default password will be "password123" for all
                                imported users.
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>

                {/* Download Template */}
                <Card className="animate-fade-in animation-delay-100">
                    <CardHeader>
                        <CardTitle>Download Template</CardTitle>
                        <CardDescription>
                            Get the Excel template with correct headers
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button className="bg-green-600 hover:bg-green-700">
                            <Download className="mr-2 h-4 w-4" />
                            Download Excel Template
                        </Button>
                        <p className="mt-3 text-sm text-gray-600">
                            The template includes all required columns with
                            sample data
                        </p>
                    </CardContent>
                </Card>

                {/* Upload Form */}
                <form onSubmit={handleSubmit}>
                    <Card className="animate-fade-in animation-delay-200">
                        <CardHeader>
                            <CardTitle>Upload File</CardTitle>
                            <CardDescription>
                                Upload your Excel file with employee data
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {!data.file ? (
                                <div
                                    className={`rounded-lg border-2 border-dashed p-12 text-center transition-colors ${
                                        dragActive
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-300 hover:border-gray-400'
                                    }`}
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                >
                                    <input
                                        type="file"
                                        id="file-upload"
                                        className="hidden"
                                        accept=".xlsx,.xls,.csv"
                                        onChange={handleFileChange}
                                    />
                                    <label
                                        htmlFor="file-upload"
                                        className="cursor-pointer"
                                    >
                                        <div className="flex flex-col items-center">
                                            <div className="mb-4 rounded-full bg-blue-100 p-4">
                                                <Upload className="h-12 w-12 text-blue-600" />
                                            </div>
                                            <p className="mb-2 text-lg font-medium text-gray-900">
                                                Drop your Excel file here
                                            </p>
                                            <p className="mb-4 text-sm text-gray-600">
                                                or click to browse
                                            </p>
                                            <Button
                                                type="button"
                                                className="bg-blue-600 hover:bg-blue-700"
                                            >
                                                Select File
                                            </Button>
                                            <p className="mt-4 text-xs text-gray-500">
                                                Supported formats: .xlsx, .xls,
                                                .csv (Max 10MB)
                                            </p>
                                        </div>
                                    </label>
                                </div>
                            ) : (
                                <div className="rounded-lg border-2 border-green-300 bg-green-50 p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-lg bg-green-100 p-3">
                                                <FileSpreadsheet className="h-8 w-8 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {data.file.name}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {(
                                                        data.file.size / 1024
                                                    ).toFixed(2)}{' '}
                                                    KB
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={removeFile}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            <X className="h-5 w-5" />
                                        </Button>
                                    </div>

                                    {progress && (
                                        <div className="mt-4">
                                            <div className="h-2 w-full rounded-full bg-gray-200">
                                                <div
                                                    className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                                                    style={{
                                                        width: `${progress.percentage}%`,
                                                    }}
                                                />
                                            </div>
                                            <p className="mt-2 text-sm text-gray-600">
                                                Uploading...{' '}
                                                {progress.percentage}%
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {errors.file && (
                                <Alert className="mt-4 border-red-200 bg-red-50">
                                    <AlertCircle className="h-4 w-4 text-red-600" />
                                    <AlertDescription className="text-red-800">
                                        {errors.file}
                                    </AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>

                    {/* Submit Button */}
                    {data.file && (
                        <Card className="animate-fade-in animation-delay-300">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-gray-600">
                                        Ready to import users from this file
                                    </p>
                                    <div className="flex gap-3">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={removeFile}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="bg-blue-600 hover:bg-blue-700"
                                        >
                                            {processing ? (
                                                <>
                                                    <Upload className="mr-2 h-4 w-4 animate-pulse" />
                                                    Importing...
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                                    Import Users
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </form>

                {/* Column Reference */}
                <Card className="animate-fade-in animation-delay-300">
                    <CardHeader>
                        <CardTitle>Required Excel Columns</CardTitle>
                        <CardDescription>
                            Your Excel file should have these column headers
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-3">
                            {[
                                'Employee No.',
                                'First Name *',
                                'Middle Name',
                                'Last Name *',
                                'Gender',
                                'Date of Birth',
                                'Status',
                                'Home Address',
                                'Mobile Number',
                                'SSS Number',
                                'TIN Number',
                                'HDMF (PAGIBIG) Number',
                                'PhilHealth Number',
                                'Job Title',
                                'Union Bank Payroll Account',
                                'Hire Date',
                                'Employment Type',
                                'Work Email *',
                                'PersonalEmail',
                                'Contact Person in Case of emergency',
                                'Relationship',
                                'Mobile Number (Emergency)',
                            ].map((column, index) => (
                                <div
                                    key={index}
                                    className="rounded border bg-gray-50 p-2"
                                >
                                    <code className="text-xs text-gray-700">
                                        {column}
                                    </code>
                                </div>
                            ))}
                        </div>
                        <p className="mt-4 text-xs text-gray-600">
                            * = Required fields
                        </p>
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
