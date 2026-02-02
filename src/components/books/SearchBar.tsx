import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { COLLEGE_DIVISIONS, SCHOOL_CLASSES } from '@/types/database';
import { useDepartments } from '@/hooks/useInstitutions';
import { useAcademicDepartments } from '@/hooks/useAcademicDepartments';

interface SearchBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  subcategory: string;
  onSubcategoryChange: (value: string) => void;
  departmentId?: string;
  onDepartmentIdChange?: (value: string) => void;
  academicDepartmentId?: string;
  onAcademicDepartmentIdChange?: (value: string) => void;
  hideFilters?: boolean;
}

export const SearchBar = ({
  search,
  onSearchChange,
  subcategory,
  onSubcategoryChange,
  departmentId,
  onDepartmentIdChange,
  academicDepartmentId,
  onAcademicDepartmentIdChange,
  hideFilters = false,
}: SearchBarProps) => {
  const [filterOpen, setFilterOpen] = useState(false);
  const { profile } = useAuth();
  const { data: departments } = useDepartments(profile?.institution_id || undefined);
  const { data: academicDepartments } = useAcademicDepartments();

  // For university: show academic departments (linked via academic_department_id)
  // For national_university: show departments (college) linked via department_id
  // For college: show divisions
  // For school: show classes
  const getFilterOptions = () => {
    if (profile?.institution_type === 'university') {
      // Universities use academic_department_id
      return {
        type: 'academic_department',
        label: 'Department',
        options: academicDepartments?.map((d) => ({ value: d.id, label: d.name })) || [],
      };
    }
    if (profile?.institution_type === 'national_university') {
      // National University uses department_id (college)
      return {
        type: 'department',
        label: 'College',
        options: departments?.map((d) => ({ value: d.id, label: d.name })) || [],
      };
    }
    if (profile?.institution_type === 'college') {
      return {
        type: 'subcategory',
        label: 'Division',
        options: COLLEGE_DIVISIONS.map((d) => ({ value: d, label: d })),
      };
    }
    if (profile?.institution_type === 'school') {
      return {
        type: 'subcategory',
        label: 'Class',
        options: SCHOOL_CLASSES.map((c) => ({ value: c, label: `Class ${c}` })),
      };
    }
    return { type: 'none', label: '', options: [] };
  };

  const filterConfig = getFilterOptions();
  const hasActiveFilters = !!subcategory || !!departmentId || !!academicDepartmentId;

  const handleFilterChange = (value: string) => {
    if (filterConfig.type === 'academic_department' && onAcademicDepartmentIdChange) {
      onAcademicDepartmentIdChange(value === 'all' ? '' : value);
    } else if (filterConfig.type === 'department' && onDepartmentIdChange) {
      onDepartmentIdChange(value === 'all' ? '' : value);
    } else {
      onSubcategoryChange(value === 'all' ? '' : value);
    }
  };

  const getCurrentFilterValue = () => {
    if (filterConfig.type === 'academic_department') {
      return academicDepartmentId || 'all';
    }
    if (filterConfig.type === 'department') {
      return departmentId || 'all';
    }
    return subcategory || 'all';
  };

  const clearFilters = () => {
    onSubcategoryChange('');
    if (onDepartmentIdChange) onDepartmentIdChange('');
    if (onAcademicDepartmentIdChange) onAcademicDepartmentIdChange('');
    setFilterOpen(false);
  };

  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by title or author..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 h-12 text-base"
        />
        {search && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
            onClick={() => onSearchChange('')}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {!hideFilters && filterConfig.options.length > 0 && (
        <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="h-12 w-12 relative">
              <SlidersHorizontal className="h-5 w-5" />
              {hasActiveFilters && (
                <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-accent" />
              )}
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
              <SheetDescription>
                Narrow down your search results
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">{filterConfig.label}</label>
                <Select value={getCurrentFilterValue()} onValueChange={handleFilterChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {filterConfig.options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {hasActiveFilters && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={clearFilters}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
};
