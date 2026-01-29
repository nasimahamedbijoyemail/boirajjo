import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useInstitutions, useDepartments } from '@/hooks/useInstitutions';
import { useAcademicDepartments } from '@/hooks/useAcademicDepartments';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BookOpen, GraduationCap, School, Building2, ArrowRight, University } from 'lucide-react';
import { toast } from 'sonner';
import { InstitutionType, COLLEGE_DIVISIONS, SCHOOL_CLASSES } from '@/types/database';

const institutionTypes = [
  { value: 'national_university', label: 'National University', icon: University },
  { value: 'university', label: 'University', icon: GraduationCap },
  { value: 'college', label: 'College', icon: Building2 },
  { value: 'school', label: 'School', icon: School },
] as const;

const OnboardingPage = () => {
  const { profile, updateProfile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [institutionType, setInstitutionType] = useState<InstitutionType | ''>('');
  const [institutionId, setInstitutionId] = useState('');
  const [subcategory, setSubcategory] = useState(''); // For NU: college, For University: institution
  const [academicDepartmentId, setAcademicDepartmentId] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch institutions based on type
  const { data: institutions, isLoading: institutionsLoading } = useInstitutions(
    institutionType || undefined
  );
  
  // For National University, fetch colleges (departments table)
  const { data: nuColleges, isLoading: nuCollegesLoading } = useDepartments(
    institutionType === 'national_university' ? institutionId : undefined
  );
  
  // For universities, fetch departments
  const { data: departments, isLoading: departmentsLoading } = useDepartments(
    institutionType === 'university' ? institutionId : undefined
  );
  
  // Fetch academic departments for NU and University
  const { data: academicDepartments, isLoading: academicDepartmentsLoading } = useAcademicDepartments();

  useEffect(() => {
    if (!authLoading && profile?.institution_id) {
      navigate('/browse');
    }
  }, [profile, authLoading, navigate]);

  const handleTypeSelect = (type: InstitutionType) => {
    setInstitutionType(type);
    setInstitutionId('');
    setSubcategory('');
    setAcademicDepartmentId('');
    setStep(2);
  };

  const handleInstitutionSelect = (id: string) => {
    setInstitutionId(id);
    setSubcategory('');
    setAcademicDepartmentId('');
    if (institutionType === 'university' || institutionType === 'national_university') {
      setStep(3);
    }
  };

  const handleSubcategorySelect = (value: string) => {
    setSubcategory(value);
    setAcademicDepartmentId('');
    if (institutionType === 'national_university' || institutionType === 'university') {
      setStep(4);
    }
  };

  // Prepare institution options for searchable select
  const institutionOptions = useMemo(() => {
    return institutions?.map((inst) => ({
      value: inst.id,
      label: inst.name,
    })) || [];
  }, [institutions]);

  // Prepare NU college options
  const nuCollegeOptions = useMemo(() => {
    return nuColleges?.map((college) => ({
      value: college.id,
      label: college.name,
    })) || [];
  }, [nuColleges]);

  // Prepare university department options
  const universityDepartmentOptions = useMemo(() => {
    return departments?.map((dept) => ({
      value: dept.name,
      label: dept.name,
    })) || [];
  }, [departments]);

  // Prepare academic department options (grouped by category)
  const academicDepartmentOptions = useMemo(() => {
    return academicDepartments?.map((dept) => ({
      value: dept.id,
      label: dept.name,
      group: dept.category,
    })) || [];
  }, [academicDepartments]);

  const handleComplete = async () => {
    if (!institutionType || !institutionId) {
      toast.error('Please select your institution');
      return;
    }

    if (institutionType === 'national_university') {
      if (!subcategory) {
        toast.error('Please select your college');
        return;
      }
      if (!academicDepartmentId) {
        toast.error('Please select your department');
        return;
      }
    }

    if (institutionType === 'university' && !academicDepartmentId) {
      toast.error('Please select your department');
      return;
    }

    if (institutionType === 'college' && !subcategory) {
      toast.error('Please select your division');
      return;
    }

    if (institutionType === 'school' && !subcategory) {
      toast.error('Please select your class');
      return;
    }

    setLoading(true);
    
    const updateData: Record<string, unknown> = {
      institution_type: institutionType,
      institution_id: institutionId,
    };

    if (institutionType === 'national_university') {
      updateData.department_id = subcategory; // College ID
      updateData.academic_department_id = academicDepartmentId;
      updateData.subcategory = academicDepartments?.find(d => d.id === academicDepartmentId)?.name || null;
    } else if (institutionType === 'university') {
      updateData.academic_department_id = academicDepartmentId;
      updateData.subcategory = academicDepartments?.find(d => d.id === academicDepartmentId)?.name || null;
    } else {
      updateData.subcategory = subcategory;
    }

    const { error } = await updateProfile(updateData);

    if (error) {
      toast.error('Failed to save your profile. Please try again.');
      setLoading(false);
      return;
    }

    toast.success('Profile complete! Start browsing books.');
    navigate('/browse');
  };

  const getSubcategoryOptions = () => {
    if (institutionType === 'college') {
      return COLLEGE_DIVISIONS.map((d) => ({ value: d, label: d }));
    }
    if (institutionType === 'school') {
      return SCHOOL_CLASSES.map((c) => ({ value: c, label: `Class ${c}` }));
    }
    return [];
  };

  const subcategoryOptions = getSubcategoryOptions();
  const subcategoryLabel =
    institutionType === 'college' ? 'Division' : 
    institutionType === 'school' ? 'Class' : '';

  const showAcademicDepartment = 
    (institutionType === 'national_university' && subcategory) ||
    (institutionType === 'university' && institutionId);

  const isComplete = () => {
    if (!institutionType || !institutionId) return false;
    if (institutionType === 'national_university') {
      return !!subcategory && !!academicDepartmentId;
    }
    if (institutionType === 'university') {
      return !!academicDepartmentId;
    }
    return !!subcategory;
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <Card className="w-full max-w-lg animate-fade-in-up shadow-card">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 gradient-primary rounded-xl p-3 w-fit">
            <BookOpen className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Select Your Institution</CardTitle>
          <CardDescription>
            This helps us show you books from your campus only
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Institution Type */}
          <div className="space-y-3">
            <Label>I am a student at a...</Label>
            <div className="grid grid-cols-2 gap-3">
              {institutionTypes.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleTypeSelect(value)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    institutionType === value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50 hover:bg-muted'
                  }`}
                >
                  <Icon className={`h-6 w-6 ${institutionType === value ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={`text-sm font-medium ${institutionType === value ? 'text-primary' : ''}`}>
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Institution Name */}
          {step >= 2 && institutionType && (
            <div className="space-y-3 animate-fade-in">
              <Label>
                {institutionType === 'national_university' 
                  ? 'Select National University' 
                  : 'Select your institution'}
              </Label>
              <SearchableSelect
                options={institutionOptions}
                value={institutionId}
                onValueChange={handleInstitutionSelect}
                placeholder={institutionsLoading ? 'Loading...' : 'Search and select...'}
                searchPlaceholder="Type to search..."
                emptyText="No institutions found"
              />
            </div>
          )}

          {/* Step 3: For NU - Select College, For University - none needed here */}
          {institutionType === 'national_university' && institutionId && (
            <div className="space-y-3 animate-fade-in">
              <Label>Select Your College</Label>
              <SearchableSelect
                options={nuCollegeOptions}
                value={subcategory}
                onValueChange={handleSubcategorySelect}
                placeholder={nuCollegesLoading ? 'Loading...' : 'Search your college...'}
                searchPlaceholder="Type to search colleges..."
                emptyText="No colleges found"
              />
            </div>
          )}

          {/* Step 4: Academic Department (for NU and University) */}
          {showAcademicDepartment && (
            <div className="space-y-3 animate-fade-in">
              <Label>Select Your Department</Label>
              <SearchableSelect
                options={academicDepartmentOptions}
                value={academicDepartmentId}
                onValueChange={setAcademicDepartmentId}
                placeholder={academicDepartmentsLoading ? 'Loading...' : 'Search your department...'}
                searchPlaceholder="Type to search departments..."
                emptyText="No departments found"
                grouped
              />
            </div>
          )}

          {/* For College/School - Subcategory */}
          {(institutionType === 'college' || institutionType === 'school') && institutionId && subcategoryOptions.length > 0 && (
            <div className="space-y-3 animate-fade-in">
              <Label>Select your {subcategoryLabel.toLowerCase()}</Label>
              <Select value={subcategory} onValueChange={setSubcategory}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder={`Choose ${subcategoryLabel.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                  {subcategoryOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Complete Button */}
          {isComplete() && (
            <Button
              onClick={handleComplete}
              className="w-full animate-fade-in"
              size="lg"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Continue'}
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingPage;
