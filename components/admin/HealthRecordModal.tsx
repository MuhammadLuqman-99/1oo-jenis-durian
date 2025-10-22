'use client';

import { Save, X } from 'lucide-react';
import { useState } from 'react';
import { TreeInfo, TreeHealthRecord } from '@/types/tree';
import { HealthRecordSchema } from '@/lib/validation';
import Modal from '@/components/shared/Modal';
import Button from '@/components/shared/Button';
import FormInput from '@/components/shared/FormInput';
import FormSelect from '@/components/shared/FormSelect';
import FormTextarea from '@/components/shared/FormTextarea';

interface HealthRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  trees: TreeInfo[];
  formData: Partial<TreeHealthRecord>;
  onFormChange: (data: Partial<TreeHealthRecord>) => void;
  onSave: () => void;
  onTreeSelect: (treeId: string) => void;
  onPhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPhotoRemove: (index: number) => void;
  editingRecord: TreeHealthRecord | null;
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

export default function HealthRecordModal({
  isOpen,
  onClose,
  trees,
  formData,
  onFormChange,
  onSave,
  onTreeSelect,
  onPhotoUpload,
  onPhotoRemove,
  editingRecord,
}: HealthRecordModalProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSave = () => {
    // Validate form data
    const result = HealthRecordSchema.safeParse(formData);

    if (!result.success) {
      // Extract errors from Zod validation
      const newErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          newErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(newErrors);
      return;
    }

    // Clear errors and proceed with save
    setErrors({});
    onSave();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingRecord ? "Edit Health Record" : "Add New Health Record"}
      size="xl"
    >
      <div className="p-6">
        <div className="space-y-4">
          {/* Tree Selection */}
          <FormSelect
            label="Select Tree"
            value={formData.treeId || ''}
            onChange={(e) => {
              onTreeSelect(e.target.value);
              setErrors({ ...errors, treeId: '' });
            }}
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
            value={formData.inspectionDate || ''}
            onChange={(e) => {
              onFormChange({ ...formData, inspectionDate: e.target.value });
              setErrors({ ...errors, inspectionDate: '' });
            }}
            error={errors.inspectionDate}
            required
          />

          {/* Health Status */}
          <FormSelect
            label="Health Status"
            value={formData.healthStatus || 'Sihat'}
            onChange={(e) => {
              onFormChange({ ...formData, healthStatus: e.target.value as any });
              setErrors({ ...errors, healthStatus: '' });
            }}
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
            value={formData.diseaseType || ''}
            onChange={(e) => onFormChange({ ...formData, diseaseType: e.target.value })}
            options={DISEASE_TYPES}
          />

          {/* Attack Level */}
          <FormSelect
            label="Attack Severity Level"
            value={formData.attackLevel || ''}
            onChange={(e) => onFormChange({ ...formData, attackLevel: e.target.value as any })}
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
            value={formData.treatment || ''}
            onChange={(e) => onFormChange({ ...formData, treatment: e.target.value })}
            placeholder="e.g., Sembur fungisida, buang bahagian terjejas"
          />

          {/* Notes */}
          <FormTextarea
            label="Additional Notes"
            value={formData.notes || ''}
            onChange={(e) => onFormChange({ ...formData, notes: e.target.value })}
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
              onChange={onPhotoUpload}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
            />
            <p className="text-xs text-gray-500 mt-1">
              You can select multiple photos to compare before/after conditions
            </p>

            {/* Photo Preview */}
            {formData.photos && formData.photos.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-3">
                {formData.photos.map((photo, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={photo}
                      alt={`Preview ${idx + 1}`}
                      className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => onPhotoRemove(idx)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label={`Remove photo ${idx + 1}`}
                    >
                      <X size={14} />
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
            value={formData.inspectedBy || ''}
            onChange={(e) => {
              onFormChange({ ...formData, inspectedBy: e.target.value });
              setErrors({ ...errors, inspectedBy: '' });
            }}
            error={errors.inspectedBy}
            required
          />
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 pb-6 bg-gray-50 flex justify-end gap-4">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="success" icon={Save} onClick={handleSave}>
          {editingRecord ? "Update" : "Save"} Record
        </Button>
      </div>
    </Modal>
  );
}
