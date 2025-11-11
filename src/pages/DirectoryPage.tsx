import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MOCK_LECTURERS } from '@shared/mock-data';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
export function DirectoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const filteredLecturers = MOCK_LECTURERS.filter(lecturer =>
    lecturer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lecturer.specializations.some(spec => spec.toLowerCase().includes(searchTerm.toLowerCase())) ||
    lecturer.university.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-16 md:py-24">
          <div className="text-center">
            <h1 className="text-4xl font-display font-bold text-foreground">Lecturer Directory</h1>
            <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
              Find and connect with academics from leading institutions around the world.
            </p>
          </div>
          <div className="mt-12 max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by name, specialization, or university..."
                className="w-full pl-10 py-3 text-base"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredLecturers.map((lecturer, index) => (
              <motion.div
                key={lecturer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <Link to={`/lecturers/${lecturer.id}`} className="block h-full">
                  <Card className="h-full transition-all hover:shadow-xl hover:-translate-y-1">
                    <CardContent className="p-6 flex flex-col items-center text-center">
                      <Avatar className="h-24 w-24 mb-4">
                        <AvatarImage src={lecturer.photoUrl} alt={lecturer.name} />
                        <AvatarFallback>{lecturer.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <h3 className="text-xl font-semibold text-foreground">{lecturer.name}</h3>
                      <p className="text-primary">{lecturer.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">{lecturer.university}</p>
                      <div className="mt-4 flex flex-wrap justify-center gap-2">
                        {lecturer.specializations.slice(0, 3).map(spec => (
                          <Badge key={spec} variant="secondary">{spec}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}