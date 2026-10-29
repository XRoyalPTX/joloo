import { useState, useEffect, type FC } from 'react';
import { api } from '../api';
import { Trip } from '../types';
import {
  Calendar,
  Users,
  ArrowRight,
  RefreshCw,
  PlusCircle,
  Car,
  AlertCircle
} from 'lucide-react';

interface DriverTripsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateNewTrip: () => void;
}

export const DriverTripsModal: FC<DriverTripsModalProps> = ({
  isOpen,
  onClose,
  onCreateNewTrip,
}) => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMyTrips = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<Trip[]>('/trips/my');
      setTrips(res.data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || 'Не удалось загрузить ваши поездки водителя');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMyTrips();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString('ru-RU', {
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 relative max-h-[90vh] flex flex-col">
        {/* Заголовок */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
              <span>Мои поездки (водитель)</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Поездки, где вы являетесь водителем
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchMyTrips}
              disabled={loading}
              title="Обновить"
              className="p-2 text-slate-400 hover:text-sky-600 rounded-lg hover:bg-slate-50 transition"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-sky-600' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none p-1"
            >
              ×
            </button>
          </div>
        </div>

        {/* Ошибки */}
        {error && (
          <div className="mt-3 p-3 bg-red-50 text-red-700 text-xs sm:text-sm rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Список поездок водителя */}
        <div className="flex-1 overflow-y-auto mt-4 pr-1 space-y-3">
          {loading && trips.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              Загружаем ваши поездки...
            </div>
          ) : trips.length === 0 ? (
            <div className="py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-6">
              <Car className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-slate-700">Вы ещё не создали ни одной поездки</h3>
              <p className="text-xs text-slate-400 mt-1 mb-4">
                Опубликуйте маршрут, чтобы попутчики могли бронировать места
              </p>
              <button
                onClick={() => {
                  onClose();
                  onCreateNewTrip();
                }}
                className="bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition shadow-sm inline-flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Создать поездку</span>
              </button>
            </div>
          ) : (
            trips.map((trip) => (
              <div
                key={trip.id}
                className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-base">
                    <span>{trip.from_location?.name || 'Пункт отправления'}</span>
                    <ArrowRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span>{trip.to_location?.name || 'Пункт назначения'}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-sky-600" />
                      <span>{formatDate(trip.date)}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        Свободных мест: <strong className="text-slate-800">{trip.seats}</strong>
                      </span>
                    </div>

                    <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                      ID: #{trip.id}
                    </span>
                  </div>

                  {trip.comment && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      {trip.comment}
                    </p>
                  )}
                </div>

                {/* Правая часть: Цена */}
                <div className="text-right border-t sm:border-t-0 pt-2 sm:pt-0">
                  <span className="text-xl font-bold text-slate-900">
                    {trip.price} ₽
                  </span>
                  <span className="text-[11px] text-slate-400 block">
                    за 1 место
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
