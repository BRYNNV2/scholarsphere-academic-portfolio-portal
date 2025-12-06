import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client-fixed';
import { Course, StudentProject } from '@shared/types';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Plus, ArrowLeft, Loader2, GraduationCap, MoreHorizontal, EyeOff, Trash2, User, Pencil, Image as ImageIcon } from 'lucide-react';
import { StudentProjectCard } from '@/components/StudentProjectCard';
import { CourseCard } from '@/components/CourseCard';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const SEMESTER_COURSES: Record<string, string[]> = {
    "1": [
        "Pengantar Teknologi Informasi",
        "Dasar Pemrograman",
        "Organisasi dan Arsitektur Komputer",
        "Kalkulus",
        "Pancasila",
        "Bahasa Indonesia",
        "Bahasa Inggris"
    ],
    "2": [
        "Sistem Basis Data",
        "Pemrograman Berorientasi Objek",
        "Matematika Diskrit",
        "Agama",
        "Kewarganegaraan",
        "Pengantar Ilmu dan Teknologi Kemaritiman",
        "Tamadun dan Tunjuk Ajar Melayu*"
    ],
    "3": [
        "Sistem Operasi",
        "Struktur Data",
        "Analisis dan Perancangan Perangkat Lunak",
        "Kecerdasan Buatan",
        "Aljabar Linear",
        "Teori Bahasa Formal dan Otomata",
        "Statistika dan Probabilitas",
        "Metodologi Penelitian"
    ],
    "4": [
        "Sistem Digital",
        "Perancangan dan Analisis Algoritma",
        "Jaringan Komputer",
        "Sistem Keamanan",
        "Grafika Komputer",
        "Perancangan Web",
        "Analisis dan Desain Berorientasi Objek",
        "Interaksi Manusia dan Komputer"
    ],
    "5": [
        "Masyarakat Cerdas",
        "Pemrograman Web",
        "Penambangan Data",
        "Perancangan dan Implementasi Perangkat Lunak",
        "Sistem Terdistribusi",
        "Metode Numerik"
    ]
};

export function CoursesPage() {
    const { user } = useAuthStore();
    const queryClient = useQueryClient();
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
    const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
    const [isEditProjectOpen, setIsEditProjectOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<StudentProject | null>(null);
    const [semesterFilter, setSemesterFilter] = useState<string>("all");

    // Form state
    const [formSemester, setFormSemester] = useState<string>("");
    const [formTitle, setFormTitle] = useState<string>("");
    const [thumbnailData, setThumbnailData] = useState<string>("");
    const [courseVisibility, setCourseVisibility] = useState<'public' | 'private'>('public');
    const [projectVisibility, setProjectVisibility] = useState<'public' | 'private'>('public');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
        if (file.size > MAX_FILE_SIZE) {
            toast.error('File is too large. Maximum size is 2MB.');
            return;
        }

        if (!file.type.startsWith('image/')) {
            toast.error('Invalid file type. Please select an image.');
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            setThumbnailData(result);
        };
        reader.onerror = () => {
            toast.error('Failed to read file.');
        };
        reader.readAsDataURL(file);
    };

    // Queries
    const coursesQuery = useQuery({
        queryKey: ['courses', user?.id],
        queryFn: async () => {
            const res = await api.get(`/api/courses?lecturerId=${user?.id}`);
            return res as Course[];
        },
        enabled: !!user?.id,
    });

    const projectsQuery = useQuery({
        queryKey: ['student-projects', selectedCourse?.id],
        queryFn: async () => {
            if (!selectedCourse) return [];
            const res = await api.get(`/api/student-projects?courseId=${selectedCourse.id}`);
            return res as StudentProject[];
        },
        enabled: !!selectedCourse,
    });

    // Mutations
    const createCourseMutation = useMutation({
        mutationFn: async (data: Partial<Course>) => {
            const res = await api.post('/api/courses', { ...data, lecturerId: user?.id });
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courses', user?.id] });
            setIsAddCourseOpen(false);
            setFormSemester("");
            setFormTitle("");
            setCourseVisibility('public');
            toast.success('Course created successfully');
        },
    });

    const createProjectMutation = useMutation({
        mutationFn: async (data: Partial<StudentProject>) => {
            const res = await api.post('/api/student-projects', {
                ...data,
                lecturerId: user?.id,
                courseId: selectedCourse?.id
            });
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['student-projects', selectedCourse?.id] });
            setIsAddProjectOpen(false);
            setProjectVisibility('public');
            toast.success('Project added successfully');
        },
    });

    const updateProjectMutation = useMutation({
        mutationFn: async (data: Partial<StudentProject> & { id: string }) => {
            const { id, ...updateData } = data;
            const res = await api.put(`/api/student-projects/${id}`, updateData);
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['student-projects', selectedCourse?.id] });
            setIsEditProjectOpen(false);
            setEditingProject(null);
            setProjectVisibility('public');
            toast.success('Project updated successfully');
        },
    });

    const deleteProjectMutation = useMutation({
        mutationFn: async (projectId: string) => {
            await api.delete(`/api/student-projects/${projectId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['student-projects', selectedCourse?.id] });
            toast.success('Project deleted successfully');
        },
    });

    const deleteCourseMutation = useMutation({
        mutationFn: async (courseId: string) => {
            await api.delete(`/api/courses/${courseId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courses', user?.id] });
            if (selectedCourse) setSelectedCourse(null);
            toast.success('Course deleted successfully');
        },
    });

    // Form Handlers
    const handleCreateCourse = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        createCourseMutation.mutate({
            title: formTitle,
            code: formData.get('code') as string,
            semester: formSemester,
            year: new Date().getFullYear(),
            description: formData.get('description') as string,
            visibility: courseVisibility,
        });
    };

    const handleCreateProject = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        createProjectMutation.mutate({
            title: formData.get('title') as string,
            students: (formData.get('students') as string).split(',').map(s => s.trim()),
            description: formData.get('description') as string,
            url: formData.get('url') as string,
            thumbnailUrl: thumbnailData,
            visibility: projectVisibility,
        });
    };

    const handleUpdateProject = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!editingProject) return;
        const formData = new FormData(e.currentTarget);
        updateProjectMutation.mutate({
            id: editingProject.id,
            title: formData.get('title') as string,
            students: (formData.get('students') as string).split(',').map(s => s.trim()),
            description: formData.get('description') as string,
            url: formData.get('url') as string,
            thumbnailUrl: thumbnailData,
            visibility: projectVisibility,
        });
    };

    const filteredCourses = coursesQuery.data?.filter(course => {
        if (semesterFilter === "all") return true;
        return course.semester === semesterFilter;
    });

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Manage Courses</h1>
                    <p className="text-muted-foreground mt-2">Add, edit, or delete the courses you teach.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <Select value={semesterFilter} onValueChange={setSemesterFilter}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Filter by Semester" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Semesters</SelectItem>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                                <SelectItem key={sem} value={sem.toString()}>Semester {sem}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Dialog open={isAddCourseOpen} onOpenChange={setIsAddCourseOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-blue-900 hover:bg-blue-800 text-white w-full sm:w-auto">
                                <Plus className="mr-2 h-4 w-4" /> Add New Course
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Add New Course</DialogTitle>
                                <DialogDescription>
                                    Create a new course to manage student projects.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleCreateCourse} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="code">Course Code</Label>
                                        <Input id="code" name="code" placeholder="e.g. CS101" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Title</Label>
                                        <Input
                                            id="title"
                                            name="title"
                                            value={formTitle}
                                            onChange={(e) => setFormTitle(e.target.value)}
                                            placeholder="e.g. Intro to CS"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea id="description" name="description" placeholder="Brief description of the course content..." required />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="semester">Semester</Label>
                                        <Select
                                            name="semester"
                                            required
                                            value={formSemester}
                                            onValueChange={setFormSemester}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Semester" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                                                    <SelectItem key={sem} value={sem.toString()}>Semester {sem}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="subject">Subject</Label>
                                        <Select
                                            disabled={!formSemester || !SEMESTER_COURSES[formSemester]}
                                            onValueChange={(value) => setFormTitle(value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a subject" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {formSemester && SEMESTER_COURSES[formSemester]?.map((subject) => (
                                                    <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">Visibility</Label>
                                        <p className="text-sm text-muted-foreground">
                                            {courseVisibility === 'public' ? 'Visible to everyone' : 'Only visible to you'}
                                        </p>
                                    </div>
                                    <Switch
                                        checked={courseVisibility === 'public'}
                                        onCheckedChange={(checked) => setCourseVisibility(checked ? 'public' : 'private')}
                                    />
                                </div>

                                <div className="flex justify-end gap-2 pt-4">
                                    <Button type="button" variant="outline" onClick={() => setIsAddCourseOpen(false)}>Cancel</Button>
                                    <Button type="submit" disabled={createCourseMutation.isPending} className="bg-blue-900 hover:bg-blue-800">
                                        {createCourseMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Save Course
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {selectedCourse ? (
                <div className="space-y-6">
                    <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground cursor-pointer w-fit" onClick={() => setSelectedCourse(null)}>
                        <ArrowLeft className="h-4 w-4" />
                        <span>Back to Courses</span>
                    </div>

                    <Card className="p-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-4">
                                <div>
                                    <h1 className="text-3xl font-bold tracking-tight">{selectedCourse.title}</h1>
                                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                                        <span className="font-medium text-foreground">{selectedCourse.code}</span>
                                        <span>•</span>
                                        <span>Semester {selectedCourse.semester} - {selectedCourse.title}</span>
                                        <Badge className={selectedCourse.visibility === 'private' ? "bg-secondary text-secondary-foreground hover:bg-secondary/80" : "bg-blue-900 hover:bg-blue-800"}>
                                            {selectedCourse.visibility === 'private' ? <><EyeOff className="h-3 w-3 mr-1" /> Private</> : 'Public'}
                                        </Badge>
                                    </div>
                                </div>
                                <p className="text-muted-foreground max-w-4xl">
                                    {selectedCourse.description}
                                </p>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                        className="text-destructive focus:text-destructive"
                                        onClick={() => {
                                            if (confirm('Are you sure you want to delete this course?')) {
                                                deleteCourseMutation.mutate(selectedCourse.id);
                                            }
                                        }}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete Course
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </Card>

                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h2 className="text-lg font-semibold">Student Projects</h2>
                                <p className="text-sm text-muted-foreground">Manage final projects and assignments for this course.</p>
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto">
                                <Dialog open={isAddProjectOpen} onOpenChange={(open) => {
                                    setIsAddProjectOpen(open);
                                    if (open) {
                                        setThumbnailData("");
                                        setProjectVisibility('public');
                                    }
                                }}>
                                    <DialogTrigger asChild>
                                        <Button className="bg-blue-900 hover:bg-blue-800 w-full sm:w-auto">
                                            <Plus className="mr-2 h-4 w-4" /> Add Project
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Add Student Project</DialogTitle>
                                            <DialogDescription>
                                                Add a new student project to this course. Fill in the details below.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <form onSubmit={handleCreateProject} className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="title">Project Title</Label>
                                                <Input id="title" name="title" required />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="students">Students (comma separated)</Label>
                                                <Input id="students" name="students" placeholder="John Doe, Jane Smith" required />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="description">Description</Label>
                                                <Textarea id="description" name="description" required />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="url">Project URL (Optional)</Label>
                                                <Input id="url" name="url" type="url" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="thumbnailUrl">Project Thumbnail (Optional)</Label>
                                                <div className="flex items-center gap-4">
                                                    <div className="w-32">
                                                        <AspectRatio ratio={16 / 9} className="bg-muted rounded-md overflow-hidden border">
                                                            {thumbnailData ? (
                                                                <img src={thumbnailData} alt="Thumbnail preview" className="object-cover w-full h-full" />
                                                            ) : (
                                                                <div className="flex items-center justify-center h-full text-muted-foreground">
                                                                    <ImageIcon className="h-8 w-8" />
                                                                </div>
                                                            )}
                                                        </AspectRatio>
                                                    </div>
                                                    <div className="flex-grow">
                                                        <Input
                                                            type="file"
                                                            ref={fileInputRef}
                                                            className="hidden"
                                                            accept="image/png, image/jpeg, image/gif"
                                                            onChange={handleFileChange}
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={() => fileInputRef.current?.click()}
                                                        >
                                                            Upload Image
                                                        </Button>
                                                        <p className="text-xs text-muted-foreground mt-2">
                                                            Max file size: 2MB. Supported formats: PNG, JPG, GIF.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between rounded-lg border p-4">
                                                <div className="space-y-0.5">
                                                    <Label className="text-base">Visibility</Label>
                                                    <p className="text-sm text-muted-foreground">
                                                        {projectVisibility === 'public' ? 'Visible to everyone' : 'Only visible to you'}
                                                    </p>
                                                </div>
                                                <Switch
                                                    checked={projectVisibility === 'public'}
                                                    onCheckedChange={(checked) => setProjectVisibility(checked ? 'public' : 'private')}
                                                />
                                            </div>

                                            <Button type="submit" className="w-full" disabled={createProjectMutation.isPending}>
                                                {createProjectMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                Add Project
                                            </Button>
                                        </form>
                                    </DialogContent>
                                </Dialog>

                                <Dialog open={isEditProjectOpen} onOpenChange={setIsEditProjectOpen}>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Edit Student Project</DialogTitle>
                                            <DialogDescription>
                                                Update the details of the student project.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <form onSubmit={handleUpdateProject} className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="edit-title">Project Title</Label>
                                                <Input id="edit-title" name="title" defaultValue={editingProject?.title} required />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="edit-students">Students (comma separated)</Label>
                                                <Input id="edit-students" name="students" defaultValue={editingProject?.students.join(', ')} placeholder="John Doe, Jane Smith" required />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="edit-description">Description</Label>
                                                <Textarea id="edit-description" name="description" defaultValue={editingProject?.description} required />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="edit-url">Project URL (Optional)</Label>
                                                <Input id="edit-url" name="url" type="url" defaultValue={editingProject?.url} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="edit-thumbnailUrl">Project Thumbnail (Optional)</Label>
                                                <div className="flex items-center gap-4">
                                                    <div className="w-32">
                                                        <AspectRatio ratio={16 / 9} className="bg-muted rounded-md overflow-hidden border">
                                                            {thumbnailData ? (
                                                                <img src={thumbnailData} alt="Thumbnail preview" className="object-cover w-full h-full" />
                                                            ) : (
                                                                <div className="flex items-center justify-center h-full text-muted-foreground">
                                                                    <ImageIcon className="h-8 w-8" />
                                                                </div>
                                                            )}
                                                        </AspectRatio>
                                                    </div>
                                                    <div className="flex-grow">
                                                        <Input
                                                            type="file"
                                                            ref={fileInputRef}
                                                            className="hidden"
                                                            accept="image/png, image/jpeg, image/gif"
                                                            onChange={handleFileChange}
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={() => fileInputRef.current?.click()}
                                                        >
                                                            Change Image
                                                        </Button>
                                                        <p className="text-xs text-muted-foreground mt-2">
                                                            Max file size: 2MB. Supported formats: PNG, JPG, GIF.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between rounded-lg border p-4">
                                                <div className="space-y-0.5">
                                                    <Label className="text-base">Visibility</Label>
                                                    <p className="text-sm text-muted-foreground">
                                                        {projectVisibility === 'public' ? 'Visible to everyone' : 'Only visible to you'}
                                                    </p>
                                                </div>
                                                <Switch
                                                    checked={projectVisibility === 'public'}
                                                    onCheckedChange={(checked) => setProjectVisibility(checked ? 'public' : 'private')}
                                                />
                                            </div>

                                            <Button type="submit" className="w-full" disabled={updateProjectMutation.isPending}>
                                                {updateProjectMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                Update Project
                                            </Button>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>

                        {projectsQuery.isLoading ? (
                            <div className="text-center py-8">Loading projects...</div>
                        ) : projectsQuery.data && projectsQuery.data.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {projectsQuery.data.map((project) => (
                                    <div key={project.id} className="h-full relative group">
                                        <StudentProjectCard
                                            project={project}
                                            actions={
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0 bg-background/50 hover:bg-background rounded-full">
                                                            <span className="sr-only">Open menu</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => {
                                                            setEditingProject(project);
                                                            setThumbnailData(project.thumbnailUrl || "");
                                                            setProjectVisibility(project.visibility || 'public');
                                                            setIsEditProjectOpen(true);
                                                        }}>
                                                            <Pencil className="mr-2 h-4 w-4" /> Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="text-destructive focus:text-destructive"
                                                            onClick={() => {
                                                                if (confirm('Are you sure you want to delete this project?')) {
                                                                    deleteProjectMutation.mutate(project.id);
                                                                }
                                                            }}
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            }
                                        />
                                        {project.visibility === 'private' && (
                                            <div className="absolute top-2 left-2">
                                                <Badge variant="secondary" className="text-xs shadow-sm"><EyeOff className="h-3 w-3 mr-1" /> Private</Badge>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <Card className="flex flex-col items-center justify-center py-16 text-center border-dashed">
                                <div className="bg-muted/50 p-4 rounded-full mb-4">
                                    <User className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <h3 className="text-lg font-semibold">No Student Projects</h3>
                                <p className="text-muted-foreground mt-2 mb-6 max-w-sm">
                                    Add the first student project for this course.
                                </p>
                                <Button onClick={() => setIsAddProjectOpen(true)} className="bg-blue-900 hover:bg-blue-800">
                                    Add Project
                                </Button>
                            </Card>
                        )}
                    </div>
                </div>
            ) : (
                <>
                    {coursesQuery.isLoading ? (
                        <div className="p-8 text-center">Loading courses...</div>
                    ) : filteredCourses && filteredCourses.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredCourses.map((course) => (
                                <div key={course.id} className="h-full relative">
                                    <CourseCard
                                        course={course}
                                        onClick={() => setSelectedCourse(course)}
                                        actions={
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedCourse(course);
                                                        }}
                                                    >
                                                        <Pencil className="mr-2 h-4 w-4" /> Manage
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-destructive focus:text-destructive"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (confirm('Are you sure you want to delete this course?')) {
                                                                deleteCourseMutation.mutate(course.id);
                                                            }
                                                        }}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        }
                                    />
                                    {course.visibility === 'private' && (
                                        <div className="absolute top-2 left-2 z-10">
                                            <Badge variant="secondary" className="text-xs shadow-sm"><EyeOff className="h-3 w-3 mr-1" /> Private</Badge>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <Card className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="bg-muted/50 p-4 rounded-full mb-4">
                                <GraduationCap className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold">No Courses Yet</h3>
                            <p className="text-muted-foreground mt-2 mb-6 max-w-sm">
                                Get started by adding your first course to manage student projects.
                            </p>
                            <Button onClick={() => setIsAddCourseOpen(true)} className="bg-blue-900 hover:bg-blue-800">
                                Add Course
                            </Button>
                        </Card>
                    )}
                </>
            )}
        </div>
    );
}
