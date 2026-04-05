import { useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { motion, AnimatePresence } from 'framer-motion';
import { InstitutionType, COLLEGE_DIVISIONS, SCHOOL_CLASSES } from '@/types/database';

export interface ProfileEditData {
  name: string;
  phone_number: string;
  whatsapp_number: string;
  institution_type: InstitutionType | '';
  institution_id: string;
  subcategory: string;
  department_id: string;
  academic_department_id: string;
}

interface ProfileEditFormProps {
  editData: ProfileEditData;
  setEditData: React.Dispatch<React.SetStateAction<ProfileEditData>>;
  institutions: { id: string; name: string }[] | undefined;
  nuColleges: { id: string; name: string }[] | undefined;
  academicDepartments: { id: string; name: string; category: string }[] | undefined;
}

export const ProfileEditForm = ({
  editData,
  setEditData,
  institutions,
  nuColleges,
  academicDepartments,
}: ProfileEditFormProps) => {
  const institutionOptions = useMemo(
    () => [{ value: 'none', label: 'None' }, ...(institutions?.map((inst) => ({ value: inst.id, label: inst.name })) || [])],
    [institutions]
  );

  const nuCollegeOptions = useMemo(
    () => [{ value: 'none', label: 'None' }, ...(nuColleges?.map((c) => ({ value: c.id, label: c.name })) || [])],
    [nuColleges]
  );

  const academicDepartmentOptions = useMemo(
    () => [{ value: 'none', label: 'None' }, ...(academicDepartments?.map((d) => ({ value: d.id, label: d.name, group: d.category })) || [])],
    [academicDepartments]
  );

  const getSubcategoryOptions = () => {
    if (editData.institution_type === 'college') return COLLEGE_DIVISIONS.map((d) => ({ value: d, label: d }));
    if (editData.institution_type === 'school') return SCHOOL_CLASSES.map((c) => ({ value: c, label: `Class ${c}` }));
    return [];
  };

  return (
    <motion.div
      key="editing"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Full Name *</Label>
        <Input
          value={editData.name}
          onChange={(e) => setEditData((prev) => ({ ...prev, name: e.target.value }))}
          placeholder="Your full name"
          className="rounded-xl"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Contact Number *</Label>
        <Input
          value={editData.phone_number}
          onChange={(e) => setEditData((prev) => ({ ...prev, phone_number: e.target.value }))}
          placeholder="01XXXXXXXXX"
          className="rounded-xl"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-sm font-semibold">
          WhatsApp Number <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <Input
          value={editData.whatsapp_number}
          onChange={(e) => setEditData((prev) => ({ ...prev, whatsapp_number: e.target.value }))}
          placeholder="01XXXXXXXXX"
          className="rounded-xl"
        />
        <p className="text-xs text-muted-foreground">Leave empty if same as contact number</p>
      </div>
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Institution Type</Label>
        <Select
          value={editData.institution_type || 'none'}
          onValueChange={(value) =>
            setEditData((prev) => ({
              ...prev,
              institution_type: value === 'none' ? '' : value as InstitutionType,
              institution_id: '',
              subcategory: '',
              department_id: '',
              academic_department_id: '',
            }))
          }
        >
          <SelectTrigger className="rounded-xl">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="national_university">National University</SelectItem>
            <SelectItem value="university">University</SelectItem>
            <SelectItem value="college">College</SelectItem>
            <SelectItem value="school">School</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <AnimatePresence>
        {editData.institution_type && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Institution</Label>
              <SearchableSelect
                options={institutionOptions}
                value={editData.institution_id}
                onValueChange={(value) =>
                  setEditData((prev) => ({
                    ...prev,
                    institution_id: value === 'none' ? '' : value,
                    subcategory: '',
                    department_id: '',
                    academic_department_id: '',
                  }))
                }
                placeholder="Search institution..."
              />
            </div>

            {editData.institution_type === 'national_university' && editData.institution_id && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                <Label className="text-sm font-semibold">College</Label>
                <SearchableSelect
                  options={nuCollegeOptions}
                  value={editData.department_id}
                  onValueChange={(value) => setEditData((prev) => ({ ...prev, department_id: value }))}
                  placeholder="Search college..."
                />
              </motion.div>
            )}

            {(editData.institution_type === 'university' || editData.institution_type === 'national_university') &&
              editData.institution_id && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                  <Label className="text-sm font-semibold">Academic Department</Label>
                  <SearchableSelect
                    options={academicDepartmentOptions}
                    value={editData.academic_department_id}
                    onValueChange={(value) => setEditData((prev) => ({ ...prev, academic_department_id: value }))}
                    placeholder="Search department..."
                  />
                </motion.div>
              )}

            {(editData.institution_type === 'college' || editData.institution_type === 'school') &&
              editData.institution_id && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                  <Label className="text-sm font-semibold">
                    {editData.institution_type === 'college' ? 'Division' : 'Class'}
                  </Label>
                  <Select
                    value={editData.subcategory}
                    onValueChange={(value) => setEditData((prev) => ({ ...prev, subcategory: value }))}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue
                        placeholder={`Select ${editData.institution_type === 'college' ? 'division' : 'class'}`}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {getSubcategoryOptions().map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </motion.div>
              )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
