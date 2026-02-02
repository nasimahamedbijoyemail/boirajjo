import { useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { useDivisions, useDistricts, useThanas } from '@/hooks/useBDLocations';

interface AddressValue {
  division_id: string;
  district_id: string;
  thana_id: string;
  ward_id: string;
  detail_address: string;
}

interface AddressSelectorProps {
  value: AddressValue;
  onChange: (value: AddressValue) => void;
}

export const AddressSelector = ({ value, onChange }: AddressSelectorProps) => {
  const { data: divisions = [], isLoading: divisionsLoading } = useDivisions();
  const { data: districts = [], isLoading: districtsLoading } = useDistricts(value.division_id);
  const { data: thanas = [], isLoading: thanasLoading } = useThanas(value.district_id);

  const divisionOptions = useMemo(() => 
    divisions.map((d) => ({ value: d.id, label: d.name })),
    [divisions]
  );

  const districtOptions = useMemo(() => 
    districts.map((d) => ({ value: d.id, label: d.name })),
    [districts]
  );

  const thanaOptions = useMemo(() => 
    thanas.map((t) => ({ value: t.id, label: t.name })),
    [thanas]
  );

  const handleDivisionChange = (divisionId: string) => {
    onChange({
      ...value,
      division_id: divisionId,
      district_id: '',
      thana_id: '',
      ward_id: '',
    });
  };

  const handleDistrictChange = (districtId: string) => {
    onChange({
      ...value,
      district_id: districtId,
      thana_id: '',
      ward_id: '',
    });
  };

  const handleThanaChange = (thanaId: string) => {
    onChange({
      ...value,
      thana_id: thanaId,
      ward_id: '',
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Division *</Label>
          <SearchableSelect
            options={divisionOptions}
            value={value.division_id}
            onValueChange={handleDivisionChange}
            placeholder={divisionsLoading ? 'Loading...' : 'Select division'}
            searchPlaceholder="Search divisions..."
            emptyText="No divisions found"
          />
        </div>

        <div className="space-y-2">
          <Label>District *</Label>
          <SearchableSelect
            options={districtOptions}
            value={value.district_id}
            onValueChange={handleDistrictChange}
            placeholder={districtsLoading ? 'Loading...' : 'Select district'}
            searchPlaceholder="Search districts..."
            emptyText={value.division_id ? 'No districts found' : 'Select division first'}
            disabled={!value.division_id}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Thana (Optional)</Label>
        <SearchableSelect
          options={thanaOptions}
          value={value.thana_id}
          onValueChange={handleThanaChange}
          placeholder={thanasLoading ? 'Loading...' : 'Select thana'}
          searchPlaceholder="Search thanas..."
          emptyText={value.district_id ? 'No thanas found' : 'Select district first'}
          disabled={!value.district_id}
        />
      </div>

      <div className="space-y-2">
        <Label>Detail Address</Label>
        <Textarea
          placeholder="House/Road/Area details..."
          value={value.detail_address}
          onChange={(e) => onChange({ ...value, detail_address: e.target.value })}
          rows={2}
        />
      </div>
    </div>
  );
};
