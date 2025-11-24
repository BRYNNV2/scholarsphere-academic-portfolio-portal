import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client-fixed';
import { Course, StudentProject } from '@shared/types';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Plus, ArrowLeft, Loader2, GraduationCap, MoreHorizontal, Eye, Trash2, User, Pencil } from 'lucide-react';
import { StudentProjectCard } from '@/components/StudentProjectCard';
import { toast } from 'sonner';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
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
            thumbnailUrl: formData.get('thumbnailUrl') as string,
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
            thumbnailUrl: formData.get('thumbnailUrl') as string,
        });
    };

    const filteredCourses = coursesQuery.data?.filter(course => {
        if (semesterFilter === "all") return true;
        return course.semester === semesterFilter;
    });

    if (selectedCourse) {
        return (
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
                                    <Badge className="bg-blue-900 hover:bg-blue-800">Public</Badge>
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

                <Card className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-lg font-semibold">Student Projects</h2>
                            <p className="text-sm text-muted-foreground">Manage final projects and assignments for this course.</p>
                        </div>
                        <div className="flex gap-2">
                            <Dialog open={isAddProjectOpen} onOpenChange={setIsAddProjectOpen}>
                                <DialogTrigger asChild>
                                    <Button className="bg-blue-900 hover:bg-blue-800">
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
                                            <label htmlFor="title">Project Title</label>
                                            <Input id="title" name="title" required />
                                        </div>
                                        <div className="space-y-2">
                                            <label htmlFor="students">Students (comma separated)</label>
                                            <Input id="students" name="students" placeholder="John Doe, Jane Smith" required />
                                        </div>
                                        <div className="space-y-2">
                                            <label htmlFor="description">Description</label>
                                            <Textarea id="description" name="description" required />
                                        </div>
                                        <div className="space-y-2">
                                            <label htmlFor="url">Project URL (Optional)</label>
                                            <Input id="url" name="url" type="url" />
                                        </div>
                                        <div className="space-y-2">
                                            <label htmlFor="thumbnailUrl">Thumbnail URL (Optional)</label>
                                            <Input id="thumbnailUrl" name="thumbnailUrl" type="url" />
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
                                            <label htmlFor="edit-title">Project Title</label>
                                            <Input id="edit-title" name="title" defaultValue={editingProject?.title} required />
                                        </div>
                                        <div className="space-y-2">
                                            <label htmlFor="edit-students">Students (comma separated)</label>
                                            <Input id="edit-students" name="students" defaultValue={editingProject?.students.join(', ')} placeholder="John Doe, Jane Smith" required />
                                        </div>
                                        <div className="space-y-2">
                                            <label htmlFor="edit-description">Description</label>
                                            <Textarea id="edit-description" name="description" defaultValue={editingProject?.description} required />
                                        </div>
                                        <div className="space-y-2">
                                            <label htmlFor="edit-url">Project URL (Optional)</label>
                                            <Input id="edit-url" name="url" type="url" defaultValue={editingProject?.url} />
                                        </div>
                                        <div className="space-y-2">
                                            <label htmlFor="edit-thumbnailUrl">Thumbnail URL (Optional)</label>
                                            <Input id="edit-thumbnailUrl" name="thumbnailUrl" type="url" defaultValue={editingProject?.thumbnailUrl} />
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
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Project Title</TableHead>
                                    <TableHead>Year</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {projectsQuery.data.map((project) => (
                                    <TableRow key={project.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                                    <span className="text-xs font-medium">{project.students[0]?.charAt(0)}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{project.students.join(', ')}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{project.title}</TableCell>
                                        <TableCell>{selectedCourse.year}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => {
                                                        setEditingProject(project);
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
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-center border rounded-lg border-dashed">
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
                        </div>
                    )}
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Manage Courses</h1>
                    <p className="text-muted-foreground mt-2">Add, edit, or delete the courses you teach.</p>
                </div>
                <div className="flex gap-2">
                    <Select value={semesterFilter} onValueChange={setSemesterFilter}>
                        <SelectTrigger className="w-[180px]">
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
                            <Button className="bg-blue-900 hover:bg-blue-800 text-white">
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
                                        <label htmlFor="code">Course Code</label>
                                        <Input id="code" name="code" placeholder="e.g. CS101" required />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="title">Title</label>
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
                                    <label htmlFor="description">Description</label>
                                    <Textarea id="description" name="description" placeholder="Brief description of the course content..." required />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label htmlFor="semester">Semester</label>
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
                                        <label htmlFor="subject">Subject</label>
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

            <Card>
                {coursesQuery.isLoading ? (
                    <div className="p-8 text-center">Loading courses...</div>
                ) : filteredCourses && filteredCourses.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Code</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Semester</TableHead>
                                <TableHead className="text-center">Projects</TableHead>
                                <TableHead>Visibility</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredCourses.map((course) => (
                                <TableRow key={course.id}>
                                    <TableCell className="font-medium">{course.code}</TableCell>
                                    <TableCell className="font-medium">{course.title}</TableCell>
                                    <TableCell>Semester {course.semester}</TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="secondary" className="font-normal">
                                            {course.studentProjectIds?.length || 0}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className="bg-blue-900 hover:bg-blue-800">Public</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            className="bg-yellow-400 hover:bg-yellow-500 text-black font-medium h-8"
                                            onClick={() => setSelectedCourse(course)}
                                        >
                                            Manage
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
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
                    </div>
                )}
            </Card>
        </div>
    );
}
