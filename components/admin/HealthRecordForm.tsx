'use client';

import { Save } from 'lucide-react';
import { useAdmin } from '@/contexts/AdminContext';
import { HealthRecordSchema } from '@/lib/validation';
import { useFormValidation } from '@/hooks/useFormValidation';
import { TreeHealthRecord } from '@/types/tree';
import Button from '@/components/shared/Button';
import FormInput from '@/components/shared/FormInput';
import FormSelect from '@/components/shared/FormSelect';
import FormTextarea from '@/components/shared/FormTextarea';

interface HealthRecordFormProps {
  record?: TreeHealthRecord;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const DISEASE_TYPES = [
  { value: "Tiada", label: "Tiada" },
  { value: "Phytophthora (Busuk akar)", label: "Phytophthora (Busuk akar)" },
  { value: "Stem Canker", label: "Stem Canker" },
  { value: "Patch Canker", label: "Patch Canker" },
  { value: "Serangan Penggerek Batang", label: "Serangan Penggerek Batang" },
  { value: "Serangan Ulat", label: "Serangan Ulat" },
  { value: "Serangan Kumbang", label: "Serangan Kumbang" },
  { value: "Penyakit Daun", label: "Penyakit Daun" },
  { value: "Lain-lain", label: "Lain-lain" },
];

export default function HealthRecordForm({
  record,
  onSuccess,
  onCancel,
}: HealthRecordFormProps) {
  const { trees, adminUser, saveHealthRecord } = useAdmin();

  const initialValues: Partial<TreeHealthRecord> = record || {
    treeId: "",
    inspectionDate: new Date().toISOString().split('T')[0],
    healthStatus: "Sihat",
    diseaseType: "",
    treatment: "",
    notes: "",
    photos: [],
    inspectedBy: adminUser || "",
  };

  const { values, errors, handleChange, validate, reset } = useFormValidation(initialValues);

  const handleTreeSelect = (treeId: string) => {
    const selectedTree = trees.find(t => t.id === treeId);
    if (selectedTree) {
      handleChange('treeId', treeId);
      handleChange('treeNo', selectedTree.no || selectedTree.id);
      handleChange('variety', selectedTree.variety);
      handleChange('location', selectedTree.location);
      handleChange('zone', selectedTree.zone || '');
      handleChange('row', selectedTree.row || '');
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const readFiles = Array.from(files).map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          resolve(event.target?.result as string);
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readFiles).then(newPhotos => {
      handleChange('photos', [...(values.photos || []), ...newPhotos]);
    });
  };

  const handleRemovePhoto = (index: number) => {
    const newPhotos = (values.photos || []).filter((_, i) => i !== index);
    handleChange('photos', newPhotos);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate(HealthRecordSchema)) {
      return;
    }

    const success = await saveHealthRecord(values, record?.id);

    if (success) {
      reset();
      onSuccess?.();
    } else {
      alert("Failed to save health record. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Tree Selection */}
      <FormSelect
        label="Select Tree"
        value={values.treeId || ''}
        onChange={(e) => handleTreeSelect(e.target.value)}
        options={[
          { value: '', label: 'Choose a tree...' },
          ...trees.map((tree) => ({
            value: tree.id,
            label: `${tree.no || tree.id} - ${tree.variety} (${tree.location})`
          }))
        ]}
        error={errors.treeId}
        required
      />

      {/* Inspection Date */}
      <FormInput
        label="Inspection Date"
        type="date"
        value={values.inspectionDate || ''}
        onChange={(e) => handleChange('inspectionDate', e.target.value)}
        error={errors.inspectionDate}
        required
      />

      {/* Health Status */}
      <FormSelect
        label="Health Status"
        value={values.healthStatus || 'Sihat'}
        onChange={(e) => handleChange('healthStatus', e.target.value)}
        options={[
          { value: 'Sihat', label: 'Sihat (Healthy)' },
          { value: 'Sederhana', label: 'Sederhana (Moderate)' },
          { value: 'Sakit', label: 'Sakit (Sick)' },
        ]}
        error={errors.healthStatus}
        required
      />

      {/* Disease Type */}
      <FormSelect
        label="Disease/Attack Type"
        value={values.diseaseType || ''}
        onChange={(e) => handleChange('diseaseType', e.target.value)}
        options={DISEASE_TYPES}
      />

      {/* Attack Level */}
      <FormSelect
        label="Attack Severity Level"
        value={values.attackLevel || ''}
        onChange={(e) => handleChange('attackLevel', e.target.value)}
        options={[
          { value: '', label: 'None' },
          { value: 'Ringan', label: 'Ringan (Light < 25%)' },
          { value: 'Sederhana', label: 'Sederhana (Moderate 25-50%)' },
          { value: 'Teruk', label: 'Teruk (Severe > 50%)' },
        ]}
      />

      {/* Treatment */}
      <FormInput
        label="Treatment / Action Taken"
        type="text"
        value={values.treatment || ''}
        onChange={(e) => handleChange('treatment', e.target.value)}
        placeholder="e.g., Sembur fungisida, buang bahagian terjejas"
      />

      {/* Notes */}
      <FormTextarea
        label="Additional Notes"
        value={values.notes || ''}
        onChange={(e) => handleChange('notes', e.target.value)}
        rows={4}
        placeholder="Enter detailed observations, symptoms, etc..."
      />

      {/* Photo Upload */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Upload Photos 📷
        </label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handlePhotoUpload}
          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
        />
        <p className="text-xs text-gray-500 mt-1">
          You can select multiple photos to compare before/after conditions
        </p>

        {/* Photo Preview */}
        {values.photos && values.photos.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-3">
            {values.photos.map((photo, idx) => (
              <div key={idx} className="relative group">
                <img
                  src={photo}
                  alt={`Preview ${idx + 1}`}
                  className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => handleRemovePhoto(idx)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Inspected By */}
      <FormInput
        label="Inspected By"
        type="text"
        value={values.inspectedBy || ''}
        onChange={(e) => handleChange('inspectedBy', e.target.value)}
        error={errors.inspectedBy}
        required
      />

      {/* Actions */}
      <div className="flex justify-end gap-4 pt-4">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="success" icon={Save}>
          {record ? "Update" : "Save"} Record
        </Button>
      </div>
    </form>
  );
}
