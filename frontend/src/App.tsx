import { useState, useEffect } from 'react';
import { api } from './api';
import { Location, Trip, User } from './types';
import { AuthModal } from './components/AuthModal';
import { CreateTripModal } from './components/CreateTripModal';
import { ManageLocationsModal } from './components/ManageLocationsModal';
import { PassengerBookingsModal } from './components/PassengerBookingsModal';
import { DriverTripsModal } from './components/DriverTripsModal';
import {
  Car,
  Search,
  PlusCircle,
  MapPin,
  Calendar,
  Users,
  User as UserIcon,
  LogOut,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Ticket
} from 'lucide-react';

export function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);

  // Search filters
  const [fromLocId, setFromLocId] = useState<string>('');
  const [toLocId, setToLocId] = useState<string>('');

  // Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCreateTripOpen, setIsCreateTripOpen] = useState(false);
  const [isLocationsOpen, setIsLocationsOpen] = useState(false);
  const [isBookingsOpen, setIsBookingsOpen] = useState(false);
  const [isDriverTripsOpen, setIsDriverTripsOpen] = useState(false);

  // Booking action feedback
  const [bookingStatus, setBookingStatus] = useState<{ tripId: number; message: string; isError?: boolean } | null>(null);

  // 1. Initial Load: Check Auth & Get Locations
  useEffect(() => {
    checkAuth();
    fetchLocations();
    fetchTrips();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await api.get<User>('/users/me');
      setCurrentUser(res.data);
    } catch {
      localStorage.removeItem('token');
      setCurrentUser(null);
    }
  };

  const fetchLocations = async () => {
    try {
      const res = await api.get<Location[]>('/locations/');
      setLocations(res.data);
    } catch (err) {
      console.error('Ошибка загрузки локаций', err);
    }
  };

  const fetchTrips = async (overrideFrom?: string, overrideTo?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      const f = overrideFrom !== undefined ? overrideFrom : fromLocId;
      const t = overrideTo !== undefined ? overrideTo : toLocId;

      if (f) params.append('from_location_id', f);
      if (t) params.append('to_location_id', t);

      const res = await api.get<Trip[]>(`/trips/?${params.toString()}`);
      setTrips(res.data);
    } catch (err) {
      console.error('Ошибка загрузки поездок', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
  };

  const handleRequestBooking = async (tripId: number) => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }

    try {
      await api.post('/trips/requests', {
        trip_id: tripId,
        seats_requested: 1,
      });

      setBookingStatus({
        tripId,
        message: 'Заявка успешно отправлена водителю!',
      });
      setTimeout(() => setBookingStatus(null), 3000);
    } catch (err: any) {
      setBookingStatus({
        tripId,
        message: err.response?.data?.detail || 'Не удалось забронировать поездку',
        isError: true,
      });
      setTimeout(() => setBookingStatus(null), 4000);
    }
  };

  const formatTripTime = (depIso: string, arrIso?: string) => {
    try {
      const dep = new Date(depIso);
      const depDateStr = dep.toLocaleString('ru-RU', {
        day: 'numeric',
        month: 'long',
      });
      const depTimeStr = dep.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
      });

      if (!arrIso) return `${depDateStr}, ${depTimeStr}`;

      const arr = new Date(arrIso);
      const arrTimeStr = arr.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
      });

      return `${depDateStr} • ${depTimeStr} → ~${arrTimeStr}`;
    } catch {
      return depIso;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-sky-600 flex items-center justify-center text-white shadow-md shadow-sky-200">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">
                Joloo
              </span>
              <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 font-semibold">
                Бурятия
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsLocationsOpen(true)}
              className="text-xs font-medium text-slate-600 hover:text-sky-600 px-3 py-2 rounded-lg hover:bg-slate-100 transition hidden sm:inline-flex items-center gap-1"
            >
              <MapPin className="w-3.5 h-3.5" />
              Локации ({locations.length})
            </button>

            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsBookingsOpen(true)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-medium px-3 py-2 rounded-xl flex items-center gap-1.5 transition border border-slate-200"
                >
                  <Ticket className="w-4 h-4 text-sky-600" />
                  <span className="hidden sm:inline">Бронирования</span>
                </button>

                <button
                  onClick={() => setIsDriverTripsOpen(true)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-medium px-3 py-2 rounded-xl flex items-center gap-1.5 transition border border-slate-200"
                >
                  <Car className="w-4 h-4 text-emerald-600" />
                  <span className="hidden sm:inline">Мои поездки</span>
                </button>

                <button
                  onClick={() => setIsCreateTripOpen(true)}
                  className="bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">Создать поездку</span>
                </button>

                <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                  <UserIcon className="w-4 h-4 text-slate-600" />
                  <span className="text-xs font-semibold text-slate-700">
                    {currentUser.name} {currentUser.surname}
                  </span>
                  <button
                    onClick={handleLogout}
                    title="Выйти"
                    className="text-slate-400 hover:text-red-600 transition ml-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium px-4 py-2 rounded-xl shadow-sm transition"
              >
                Войти / Регистрация
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6">
        {/* Поисковая панель */}
        <section className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200 mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
            Поездки с попутчиками по Бурятии
          </h1>
          <p className="text-sm text-slate-500 mb-6">
            Быстрый и удобный способ добраться до районов и Байкала
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            <div className="sm:col-span-5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Откуда
              </label>
              <select
                value={fromLocId}
                onChange={(e) => setFromLocId(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-sky-500 outline-none text-sm"
              >
                <option value="">Все пункты отправления</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} {loc.district ? `(${loc.district})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Куда
              </label>
              <select
                value={toLocId}
                onChange={(e) => setToLocId(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-sky-500 outline-none text-sm"
              >
                <option value="">Все пункты назначения</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} {loc.district ? `(${loc.district})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <button
                onClick={() => fetchTrips()}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition"
              >
                <Search className="w-4 h-4" />
                <span>Найти</span>
              </button>
            </div>
          </div>
        </section>

        {/* Список поездок */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">
              Доступные поездки ({trips.length})
            </h2>
            <button
              onClick={() => {
                setFromLocId('');
                setToLocId('');
                fetchTrips('', '');
              }}
              className="text-xs text-sky-600 hover:underline"
            >
              Сбросить фильтры
            </button>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400">Загрузка поездок...</div>
          ) : trips.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-slate-300">
              <Car className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-700">Поездок не найдено</h3>
              <p className="text-sm text-slate-400 mt-1 mb-4">
                Попробуйте выбрать другие населенные пункты или создайте свою поездку первым!
              </p>
              {currentUser ? (
                <button
                  onClick={() => setIsCreateTripOpen(true)}
                  className="bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition inline-flex items-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  Создать поездку
                </button>
              ) : (
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium px-4 py-2 rounded-xl transition"
                >
                  Войти, чтобы опубликовать поездку
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {trips.map((trip) => {
                const status = bookingStatus?.tripId === trip.id ? bookingStatus : null;

                return (
                  <div
                    key={trip.id}
                    className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-2 flex-1">
                      {/* Маршрут */}
                      <div className="flex items-center gap-2 text-lg font-bold text-slate-900">
                        <span>{trip.from_location.name}</span>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                        <span>{trip.to_location.name}</span>
                      </div>

                      {/* Детали: Дата, Водитель, Места */}
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-sky-600" />
                          <span>{formatTripTime(trip.departure_date, trip.arrival_date)}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            Водитель: {trip.driver.name} {trip.driver.surname}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            Мест свободно:{' '}
                            <strong className="text-slate-800">{trip.seats}</strong>
                          </span>
                        </div>
                      </div>

                      {trip.comment && (
                        <p className="text-xs bg-slate-50 text-slate-600 p-2.5 rounded-lg border border-slate-100">
                          {trip.comment}
                        </p>
                      )}

                      {/* Сообщение о статусе бронирования */}
                      {status && (
                        <div
                          className={`text-xs p-2 rounded-lg flex items-center gap-2 ${
                            status.isError
                              ? 'bg-red-50 text-red-700'
                              : 'bg-green-50 text-green-700'
                          }`}
                        >
                          {status.isError ? (
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                          )}
                          <span>{status.message}</span>
                        </div>
                      )}
                    </div>

                    {/* Правая колонка: Цена и Кнопка */}
                    <div className="flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-3 md:pt-0 gap-3">
                      <div>
                        <span className="text-2xl font-black text-slate-900">
                          {trip.price} ₽
                        </span>
                        <span className="text-xs text-slate-400 block md:text-right">
                          за 1 место
                        </span>
                      </div>

                      <button
                        onClick={() => handleRequestBooking(trip.id)}
                        disabled={trip.seats <= 0}
                        className={`px-5 py-2.5 rounded-xl font-medium text-sm transition shadow-sm ${
                          trip.seats <= 0
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            : 'bg-sky-600 hover:bg-sky-700 text-white'
                        }`}
                      >
                        {trip.seats <= 0 ? 'Мест нет' : 'Забронировать'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-center text-xs text-slate-400">
        <p>Joloo (Жолоо) — сервис совместных поездок по Бурятии. Разработано в паре Frontend & Backend.</p>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
          fetchTrips();
        }}
      />

      <CreateTripModal
        isOpen={isCreateTripOpen}
        onClose={() => setIsCreateTripOpen(false)}
        locations={locations}
        onTripCreated={() => {
          fetchTrips();
        }}
      />

      <ManageLocationsModal
        isOpen={isLocationsOpen}
        onClose={() => setIsLocationsOpen(false)}
        locations={locations}
        currentUser={currentUser}
        onLocationsUpdated={() => {
          fetchLocations();
        }}
      />

      <PassengerBookingsModal
        isOpen={isBookingsOpen}
        onClose={() => setIsBookingsOpen(false)}
        onExploreTrips={() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      <DriverTripsModal
        isOpen={isDriverTripsOpen}
        onClose={() => setIsDriverTripsOpen(false)}
        onCreateNewTrip={() => setIsCreateTripOpen(true)}
      />
    </div>
  );
}

export default App;
