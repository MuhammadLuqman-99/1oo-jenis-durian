'use client';

import { Plus, Edit, Trash2 } from 'lucide-react';
import { TreeHealthRecord } from '@/types/tree';
import Button from '@/components/shared/Button';

interface HealthRecordsTableProps {
  records: TreeHealthRecord[];
  onAdd: () => void;
  onEdit: (record: TreeHealthRecord) => void;
  onDelete: (id: string) => void;
  onViewPhoto: (photo: string) => void;
}

function getStatusBadgeClass(status: string) {
  switch (status) {
    case "Sihat": return "bg-green-100 text-green-800";
    case "Sederhana": return "bg-yellow-100 text-yellow-800";
    case "Sakit": return "bg-red-100 text-red-800";
    default: return "bg-gray-100 text-gray-800";
  }
}

function getHealthStats(records: TreeHealthRecord[]) {
  return {
    total: records.length,
    healthy: records.filter(r => r.healthStatus === "Sihat").length,
    moderate: records.filter(r => r.healthStatus === "Sederhana").length,
    sick: records.filter(r => r.healthStatus === "Sakit").length,
  };
}

export default function HealthRecordsTable({
  records,
  onAdd,
  onEdit,
  onDelete,
  onViewPhoto,
}: HealthRecordsTableProps) {
  const stats = getHealthStats(records);

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this health record?")) {
      onDelete(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <h3 className="text-4xl font-bold text-gray-900 mb-2">{stats.total}</h3>
          <p className="text-gray-600">Total Records</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <h3 className="text-4xl font-bold text-green-600 mb-2">{stats.healthy}</h3>
          <p className="text-gray-600">Sihat (Healthy)</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <h3 className="text-4xl font-bold text-yellow-600 mb-2">{stats.moderate}</h3>
          <p className="text-gray-600">Sederhana (Moderate)</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <h3 className="text-4xl font-bold text-red-600 mb-2">{stats.sick}</h3>
          <p className="text-gray-600">Sakit (Sick)</p>
        </div>
      </div>

      {/* Add Button */}
      <div>
        <Button
          variant="success"
          icon={Plus}
          onClick={onAdd}
          className="shadow-lg"
        >
          Add Health Record
        </Button>
      </div>

      {/* Health Records Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Date</th>
                <th className="px-4 py-3 text-left font-semibold">Tree No</th>
                <th className="px-4 py-3 text-left font-semibold">Variety</th>
                <th className="px-4 py-3 text-left font-semibold">Location</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-left font-semibold">Disease/Attack</th>
                <th className="px-4 py-3 text-left font-semibold">Severity</th>
                <th className="px-4 py-3 text-left font-semibold">Treatment</th>
                <th className="px-4 py-3 text-left font-semibold">Photos</th>
                <th className="px-4 py-3 text-left font-semibold">Inspector</th>
                <th className="px-4 py-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-8 text-center text-gray-500">
                    No health records yet. Click "Add Health Record" to create your first record.
                  </td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm">
                      {new Date(record.inspectionDate).toLocaleDateString('en-MY')}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold">{record.treeNo}</td>
                    <td className="px-4 py-3 text-sm">{record.variety}</td>
                    <td className="px-4 py-3 text-sm">{record.location}</td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(record.healthStatus)}`}>
                        {record.healthStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{record.diseaseType || "-"}</td>
                    <td className="px-4 py-3 text-sm">{record.attackLevel || "-"}</td>
                    <td className="px-4 py-3 text-sm">{record.treatment || "-"}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {record.photos && record.photos.length > 0 ? (
                          <>
                            {record.photos.slice(0, 3).map((photo, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => onViewPhoto(photo)}
                                className="w-12 h-12 rounded border-2 border-gray-200 hover:border-green-500 transition-colors focus-ring overflow-hidden"
                                aria-label={`View photo ${idx + 1} of ${record.treeNo}`}
                              >
                                <img
                                  src={photo}
                                  alt=""
                                  className="w-full h-full object-cover"
                                  aria-hidden="true"
                                />
                              </button>
                            ))}
                            {record.photos.length > 3 && (
                              <div className="w-12 h-12 bg-gray-100 rounded border-2 border-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600" aria-label={`${record.photos.length - 3} more photos`}>
                                +{record.photos.length - 3}
                              </div>
                            )}
                          </>
                        ) : (
                          <span className="text-gray-400 text-sm">No photos</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">{record.inspectedBy}</td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => onEdit(record)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors focus-ring"
                          title="Edit"
                          aria-label={`Edit record for ${record.treeNo}`}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(record.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors focus-ring"
                          title="Delete"
                          aria-label={`Delete record for ${record.treeNo}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
