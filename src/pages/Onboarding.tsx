import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useInstitutions, useDepartments } from '@/hooks/useInstitutions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BookOpen, GraduationCap, School, Building2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { InstitutionType, COLLEGE_DIVISIONS, SCHOOL_CLASSES } from '@/types/database';

const institutionTypes = [
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
  const [subcategory, setSubcategory] = useState('');
  const [loading, setLoading] = useState(false);

  const { data: institutions, isLoading: institutionsLoading } = useInstitutions(
    institutionType || undefined
  );
  const { data: departments, isLoading: departmentsLoading } = useDepartments(
    institutionType === 'university' ? institutionId : undefined
  );

  useEffect(() => {
    if (!authLoading && profile?.institution_id) {
      navigate('/browse');
    }
  }, [profile, authLoading, navigate]);

  const handleTypeSelect = (type: InstitutionType) => {
    setInstitutionType(type);
    setInstitutionId('');
    setSubcategory('');
    setStep(2);
  };

  const handleInstitutionSelect = (id: string) => {
    setInstitutionId(id);
    setSubcategory('');
    if (institutionType === 'university') {
      setStep(3);
    }
  };

  const handleComplete = async () => {
    if (!institutionType || !institutionId) {
      toast.error('Please select your institution');
      return;
    }

    if (institutionType === 'university' && !subcategory) {
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
    const { error } = await updateProfile({
      institution_type: institutionType,
      institution_id: institutionId,
      subcategory,
    });

    if (error) {
      toast.error('Failed to save your profile. Please try again.');
      setLoading(false);
      return;
    }

    toast.success('Profile complete! Start browsing books.');
    navigate('/browse');
  };

  const getSubcategoryOptions = () => {
    if (institutionType === 'university') {
      return departments?.map((d) => ({ value: d.name, label: d.name })) || [];
    }
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
    institutionType === 'university' ? 'Department' :
    institutionType === 'college' ? 'Division' : 'Class';

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
            <div className="grid grid-cols-3 gap-3">
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
              <Label>Select your institution</Label>
              <Select value={institutionId} onValueChange={handleInstitutionSelect}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder={institutionsLoading ? 'Loading...' : 'Choose institution'} />
                </SelectTrigger>
                <SelectContent>
                  {institutions?.map((inst) => (
                    <SelectItem key={inst.id} value={inst.id}>
                      {inst.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Step 3: Subcategory */}
          {institutionId && subcategoryOptions.length > 0 && (
            <div className="space-y-3 animate-fade-in">
              <Label>Select your {subcategoryLabel.toLowerCase()}</Label>
              <Select value={subcategory} onValueChange={setSubcategory}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder={departmentsLoading ? 'Loading...' : `Choose ${subcategoryLabel.toLowerCase()}`} />
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
          {institutionId && subcategory && (
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
