import { useState, useMemo, type FC, type FormEvent } from 'react';
import { api } from '../api';
import { Location, User } from '../types';
import { MapPin, Plus, CheckCircle, AlertCircle, Search } from 'lucide-react';

interface ManageLocationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  locations: Location[];
  currentUser: User | null;
  onLocationsUpdated: () => void;
}

export const ManageLocationsModal: FC<ManageLocationsModalProps> = ({
  isOpen,
  onClose,
  locations,
  currentUser,
  onLocationsUpdated,
}) => {
  const [name, setName] = useState('');
  const [district, setDistrict] = useState('');
  const [region] = useState('Республика Бурятия');
  const [country] = useState('Россия');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const filteredLocations = useMemo(() => {
    if (!searchQuery.trim()) return locations;
    const q = searchQuery.toLowerCase();
    return locations.filter(
      (loc) =>
        loc.name.toLowerCase().includes(q) ||
        (loc.district && loc.district.toLowerCase().includes(q))
    );
  }, [locations, searchQuery]);

  if (!isOpen) return null;

  const handleAddLocation = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await api.post('/locations/', {
        country,
        region: region || null,
        district: district || null,
        name,
      });

      setSuccess(true);
      setName('');
      setDistrict('');
      onLocationsUpdated();
      setTimeout(() => setSuccess(false), 2000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка добавления локации (нужны права администратора/staff)');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 relative max-h-[90vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 text-xl font-bold"
        >
          ×
        </button>

        <h2 className="text-2xl font-bold text-gray-800 mb-2">Локации и населенные пункты</h2>
        <p className="text-sm text-gray-500 mb-4">
          Список городов, сел и улусов Бурятии для поездок
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-xl flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-xl flex items-center gap-2">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span>Населенный пункт добавлен!</span>
          </div>
        )}

        {/* Форма добавления доступна только администраторам (is_staff) */}
        {currentUser?.is_staff && (
          <form onSubmit={handleAddLocation} className="p-4 bg-sky-50/50 rounded-xl border border-sky-100 mb-4 space-y-3">
            <h3 className="text-xs font-bold text-sky-800 uppercase tracking-wider">Добавить локацию (Admin)</h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-600">Название села/города</label>
                <input
                  type="text"
                  required
                  placeholder="напр. Кяхта"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full mt-1 px-3 py-1.5 border rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600">Район / Аймак</label>
                <input
                  type="text"
                  placeholder="напр. Кяхтинский район"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full mt-1 px-3 py-1.5 border rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 transition"
              >
                <Plus className="w-4 h-4" />
                {loading ? 'Добавляем...' : 'Добавить локацию'}
              </button>
            </div>
          </form>
        )}

        {/* Быстрый поиск по населенным пунктам */}
        <div className="relative mb-3">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Поиск по названию или району..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        {/* Список текущих локаций */}
        <div className="flex-1 overflow-y-auto pr-1">
          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
            Найдено локаций: {filteredLocations.length} (всего {locations.length})
          </h4>
          <div className="divide-y divide-gray-100">
            {filteredLocations.slice(0, 100).map((loc) => (
              <div key={loc.id} className="py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-sky-500 flex-shrink-0" />
                  <div>
                    <span className="font-medium text-sm text-gray-800">{loc.name}</span>
                    {(loc.district || loc.region) && (
                      <span className="text-xs text-gray-400 ml-2">
                        {[loc.district, loc.region].filter(Boolean).join(', ')}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded font-mono">
                  ID: {loc.id}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
