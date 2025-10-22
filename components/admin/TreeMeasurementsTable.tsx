'use client';

import { Save } from 'lucide-react';
import { TreeInfo } from '@/types/tree';
import Button from '@/components/shared/Button';

interface TreeMeasurementsTableProps {
  trees: TreeInfo[];
  onTreeUpdate: (id: string, data: Partial<TreeInfo>) => void;
  onSave: () => void;
}

export default function TreeMeasurementsTable({
  trees,
  onTreeUpdate,
  onSave,
}: TreeMeasurementsTableProps) {
  const handleFieldChange = (treeId: string, field: string, value: string) => {
    onTreeUpdate(treeId, { [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Annual Measurements Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-b-2 border-green-200">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            📏 Ukuran Tahunan Pokok (Annual Tree Measurements)
          </h3>
          <p className="text-gray-700 text-sm">Update setahun sekali - Saiz kanopi dan ukur lilit</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs" style={{ fontSize: '0.7rem' }}>
            <thead className="bg-tropical-green text-white sticky top-0">
              <tr>
                <th className="px-2 py-2 text-left font-semibold border-r border-white/20" style={{ minWidth: '40px' }}>Bil</th>
                <th className="px-2 py-2 text-left font-semibold border-r border-white/20" style={{ minWidth: '90px' }}>No</th>
                <th className="px-2 py-2 text-left font-semibold border-r border-white/20" style={{ minWidth: '80px' }}>Zone</th>
                <th className="px-2 py-2 text-left font-semibold border-r border-white/20" style={{ minWidth: '60px' }}>Bilau</th>
                <th className="px-2 py-2 text-left font-semibold border-r border-white/20" style={{ minWidth: '120px' }}>Variety</th>
                <th className="px-2 py-2 text-left font-semibold border-r border-white/20 bg-green-700" style={{ minWidth: '100px' }}>Tarikh Baru</th>
                <th className="px-2 py-2 text-left font-semibold border-r border-white/20 bg-green-700" style={{ minWidth: '80px' }}>Kanopi Baru (m)</th>
                <th className="px-2 py-2 text-left font-semibold border-r border-white/20 bg-green-700" style={{ minWidth: '80px' }}>Lilit Baru (cm)</th>
                <th className="px-2 py-2 text-left font-semibold border-r border-white/20 bg-green-600" style={{ minWidth: '100px' }}>Tarikh Lama</th>
                <th className="px-2 py-2 text-left font-semibold border-r border-white/20 bg-green-600" style={{ minWidth: '80px' }}>Kanopi Lama (m)</th>
                <th className="px-2 py-2 text-left font-semibold bg-green-600" style={{ minWidth: '80px' }}>Lilit Lama (mm)</th>
              </tr>
            </thead>
            <tbody>
              {trees.map((tree, index) => (
                <tr key={tree.id} className="border-b border-gray-200 hover:bg-green-50 transition-colors">
                  <td className="px-2 py-2 border-r border-gray-200 font-semibold">{tree.bil || index + 1}</td>
                  <td className="px-2 py-2 border-r border-gray-200">{tree.no || tree.id}</td>
                  <td className="px-2 py-2 border-r border-gray-200">{tree.zone || "-"}</td>
                  <td className="px-2 py-2 border-r border-gray-200">{tree.row || "-"}</td>
                  <td className="px-2 py-2 border-r border-gray-200 font-medium">{tree.variety}</td>
                  <td className="px-2 py-2 border-r border-gray-200 bg-green-50">
                    <input
                      type="date"
                      value={tree.tarikhBaru || ""}
                      onChange={(e) => handleFieldChange(tree.id, 'tarikhBaru', e.target.value)}
                      className="w-full px-1 py-1 border border-gray-300 rounded focus:border-tropical-lime focus:outline-none"
                      style={{ fontSize: '0.7rem' }}
                    />
                  </td>
                  <td className="px-2 py-2 border-r border-gray-200 bg-green-50">
                    <input
                      type="text"
                      value={tree.saizKanopiBaru || ""}
                      onChange={(e) => handleFieldChange(tree.id, 'saizKanopiBaru', e.target.value)}
                      placeholder="0.0"
                      className="w-full px-1 py-1 border border-gray-300 rounded focus:border-tropical-lime focus:outline-none"
                      style={{ fontSize: '0.7rem' }}
                    />
                  </td>
                  <td className="px-2 py-2 border-r border-gray-200 bg-green-50">
                    <input
                      type="text"
                      value={tree.saizUkurLilitBaru || ""}
                      onChange={(e) => handleFieldChange(tree.id, 'saizUkurLilitBaru', e.target.value)}
                      placeholder="0.0"
                      className="w-full px-1 py-1 border border-gray-300 rounded focus:border-tropical-lime focus:outline-none"
                      style={{ fontSize: '0.7rem' }}
                    />
                  </td>
                  <td className="px-2 py-2 border-r border-gray-200 bg-yellow-50">
                    <input
                      type="date"
                      value={tree.tarikhLama || ""}
                      onChange={(e) => handleFieldChange(tree.id, 'tarikhLama', e.target.value)}
                      className="w-full px-1 py-1 border border-gray-300 rounded focus:border-tropical-lime focus:outline-none"
                      style={{ fontSize: '0.7rem' }}
                    />
                  </td>
                  <td className="px-2 py-2 border-r border-gray-200 bg-yellow-50">
                    <input
                      type="text"
                      value={tree.saizKanopiLama || ""}
                      onChange={(e) => handleFieldChange(tree.id, 'saizKanopiLama', e.target.value)}
                      placeholder="0.0"
                      className="w-full px-1 py-1 border border-gray-300 rounded focus:border-tropical-lime focus:outline-none"
                      style={{ fontSize: '0.7rem' }}
                    />
                  </td>
                  <td className="px-2 py-2 bg-yellow-50">
                    <input
                      type="text"
                      value={tree.saizUkurLilitLama || ""}
                      onChange={(e) => handleFieldChange(tree.id, 'saizUkurLilitLama', e.target.value)}
                      placeholder="0.0"
                      className="w-full px-1 py-1 border border-gray-300 rounded focus:border-tropical-lime focus:outline-none"
                      style={{ fontSize: '0.7rem' }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <Button variant="success" icon={Save} onClick={onSave}>
            Save Ukuran Tahunan
          </Button>
        </div>
      </div>
    </div>
  );
}
