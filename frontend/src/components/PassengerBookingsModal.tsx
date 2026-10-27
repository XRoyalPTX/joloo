import { useState, useEffect, type FC } from 'react';
import { api } from '../api';
import { TripRequest } from '../types';
import {
  Calendar,
  Clock,
  User as UserIcon,
  ArrowRight,
  XCircle,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Compass
} from 'lucide-react';

interface PassengerBookingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExploreTrips: () => void;
}

export const PassengerBookingsModal: FC<PassengerBookingsModalProps> = ({
  isOpen,
  onClose,
  onExploreTrips,
}) => {
  const [requests, setRequests] = useState<TripRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchMyRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<TripRequest[]>('/trips/requests/my');
      setRequests(res.data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || 'Не удалось загрузить ваши бронирования');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMyRequests();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCancelRequest = async (requestId: number) => {
    if (!confirm('Вы действительно хотите отменить эту заявку?')) return;

    setCancellingId(requestId);
    setError(null);
    setSuccessMsg(null);
    try {
      await api.patch(`/trips/requests/${requestId}/cancel`);
      setSuccessMsg('Заявка успешно отменена');
      // Обновляем локально статус
      setRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status: 'cancelled' } : r))
      );
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Не удалось отменить заявку');
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadge = (status: TripRequest['status']) => {
    switch (status) {
      case 'accepted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Подтверждена
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            <Clock className="w-3.5 h-3.5" />
            Ожидает ответа
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
            <XCircle className="w-3.5 h-3.5" />
            Отклонена
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
            Отменена
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

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
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
              Мои бронирования
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Поездки, в которых вы участвуете как пассажир
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchMyRequests}
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

        {/* Уведомления */}
        {error && (
          <div className="mt-3 p-3 bg-red-50 text-red-700 text-xs sm:text-sm rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mt-3 p-3 bg-green-50 text-green-700 text-xs sm:text-sm rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Тело со списком */}
        <div className="flex-1 overflow-y-auto mt-4 pr-1 space-y-3">
          {loading && requests.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              Загружаем ваши заявки...
            </div>
          ) : requests.length === 0 ? (
            <div className="py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-6">
              <Compass className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-slate-700">У вас пока нет заявок на поездки</h3>
              <p className="text-xs text-slate-400 mt-1 mb-4">
                Найдите подходящий маршрут на главной странице и забронируйте место
              </p>
              <button
                onClick={() => {
                  onClose();
                  onExploreTrips();
                }}
                className="bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition shadow-sm"
              >
                Найти поездку
              </button>
            </div>
          ) : (
            requests.map((req) => {
              const trip = req.trip;
              const canCancel = req.status === 'pending' || req.status === 'accepted';

              return (
                <div
                  key={req.id}
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      {getStatusBadge(req.status)}
                      <span className="text-xs text-slate-400 font-mono">
                        Заявка #{req.id}
                      </span>
                    </div>

                    {trip ? (
                      <>
                        <div className="flex items-center gap-2 font-bold text-slate-800 text-base">
                          <span>{trip.from_location?.name || 'Пункт отправления'}</span>
                          <ArrowRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          <span>{trip.to_location?.name || 'Пункт назначения'}</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-sky-600" />
                            <span>{formatDate(trip.date)}</span>
                          </div>

                          {trip.driver && (
                            <div className="flex items-center gap-1">
                              <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                              <span>
                                Водитель: {trip.driver.name} {trip.driver.surname}
                              </span>
                            </div>
                          )}

                          <div>
                            Запрошено мест: <strong className="text-slate-700">{req.seats_requested}</strong>
                          </div>
                        </div>

                        {trip.comment && (
                          <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                            {trip.comment}
                          </p>
                        )}
                      </>
                    ) : (
                      <div className="text-xs text-slate-400">Информация о поездке недоступна</div>
                    )}
                  </div>

                  {/* Правая часть: Цена и Кнопка отмены */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 gap-2">
                    {trip && (
                      <div className="text-right">
                        <span className="text-lg font-bold text-slate-900">
                          {trip.price * req.seats_requested} ₽
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {trip.price} ₽ × {req.seats_requested} мест
                        </span>
                      </div>
                    )}

                    {canCancel && (
                      <button
                        onClick={() => handleCancelRequest(req.id)}
                        disabled={cancellingId === req.id}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200 transition"
                      >
                        {cancellingId === req.id ? 'Отменяем...' : 'Отменить заявку'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
