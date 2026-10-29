import { useState, useEffect, type FC, type FormEvent } from 'react';
import { api } from '../api';
import { Location } from '../types';
import { PlusCircle, AlertCircle, CheckCircle } from 'lucide-react';

interface CreateTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  locations: Location[];
  onTripCreated: () => void;
}

export const CreateTripModal: FC<CreateTripModalProps> = ({
  isOpen,
  onClose,
  locations,
  onTripCreated,
}) => {
  const [fromLocationId, setFromLocationId] = useState<number>(0);
  const [toLocationId, setToLocationId] = useState<number>(0);
  const [price, setPrice] = useState<number>(500);
  const [seats, setSeats] = useState<number>(3);
  const [departureDate, setDepartureDate] = useState<string>('2026-06-15T10:00');
  const [arrivalDate, setArrivalDate] = useState<string>('2026-06-15T13:00');
  const [comment, setComment] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Синхронизируем дефолтные ID локаций, когда список загружен
  useEffect(() => {
    if (locations.length > 0) {
      if (!fromLocationId) setFromLocationId(locations[0].id);
      if (!toLocationId) setToLocationId(locations[1]?.id || locations[0].id);
    }
  }, [locations, fromLocationId, toLocationId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!fromLocationId || !toLocationId) {
      setError('Пожалуйста, выберите пункты отправления и назначения');
      setLoading(false);
      return;
    }

    if (fromLocationId === toLocationId) {
      setError('Место отправления и прибытия не могут совпадать');
      setLoading(false);
      return;
    }

    const depTime = new Date(departureDate).getTime();
    const arrTime = new Date(arrivalDate).getTime();

    if (arrTime <= depTime) {
      setError('Время прибытия должно быть позже времени выезда');
      setLoading(false);
      return;
    }

    try {
      await api.post('/trips/', {
        from_location_id: Number(fromLocationId),
        to_location_id: Number(toLocationId),
        price: Number(price),
        seats: Number(seats),
        departure_date: new Date(departureDate).toISOString(),
        arrival_date: new Date(arrivalDate).toISOString(),
        comment: comment || null,
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onTripCreated();
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка создания поездки');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 text-xl font-bold"
        >
          ×
        </button>

        <h2 className="text-2xl font-bold text-gray-800 mb-2">Создать поездку</h2>
        <p className="text-sm text-gray-500 mb-6">Опубликуйте маршрут для попутчиков</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-xl flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-xl flex items-center gap-2">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span>Поездка успешно создана!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600">Откуда</label>
              <select
                value={fromLocationId}
                onChange={(e) => setFromLocationId(Number(e.target.value))}
                className="w-full mt-1 px-3 py-2 border rounded-xl bg-white text-sm outline-none focus:ring-2 focus:ring-sky-500"
              >
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} {loc.district ? `(${loc.district})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600">Куда</label>
              <select
                value={toLocationId}
                onChange={(e) => setToLocationId(Number(e.target.value))}
                className="w-full mt-1 px-3 py-2 border rounded-xl bg-white text-sm outline-none focus:ring-2 focus:ring-sky-500"
              >
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} {loc.district ? `(${loc.district})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600">Стоимость (₽)</label>
              <input
                type="number"
                min="0"
                step="50"
                required
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full mt-1 px-3 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600">Свободных мест</label>
              <input
                type="number"
                min="1"
                max="8"
                required
                value={seats}
                onChange={(e) => setSeats(Number(e.target.value))}
                className="w-full mt-1 px-3 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600">Время выезда</label>
              <input
                type="datetime-local"
                required
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                className="w-full mt-1 px-3 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600">Примерное прибытие</label>
              <input
                type="datetime-local"
                required
                value={arrivalDate}
                onChange={(e) => setArrivalDate(e.target.value)}
                className="w-full mt-1 px-3 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600">Комментарий / Детали</label>
            <textarea
              rows={2}
              placeholder="Где встречаемся, сколько багажа можно взять..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full mt-1 px-3 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 bg-sky-600 hover:bg-sky-700 text-white font-medium py-2.5 rounded-xl transition flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-5 h-5" />
            {loading ? 'Публикация...' : 'Опубликовать поездку'}
          </button>
        </form>
      </div>
    </div>
  );
};
