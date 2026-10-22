import { useState, type FC, type FormEvent } from 'react';
import { api } from '../api';
import { User } from '../types';
import { UserCheck, LogIn, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export const AuthModal: FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Form states
  const [phone, setPhone] = useState('79991234567');
  const [password, setPassword] = useState('Password123!');
  const [name, setName] = useState('Баир');
  const [surname, setSurname] = useState('Доржиев');
  const [patronymic, setPatronymic] = useState('Батоевич');
  const [birthDate, setBirthDate] = useState('1998-05-20');
  const [email, setEmail] = useState('bair@test.ru');

  if (!isOpen) return null;

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const formData = new URLSearchParams();
      formData.append('username', phone);
      formData.append('password', password);

      const res = await api.post('/users/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      localStorage.setItem('token', res.data.access_token);

      // Получаем профиль
      const meRes = await api.get<User>('/users/me');
      onSuccess(meRes.data);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка авторизации');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await api.post('/users/register', {
        name,
        surname,
        patronymic: patronymic || null,
        birth_date: birthDate,
        password,
        email: email || null,
        phone_number: phone,
      });

      // После успешной регистрации сразу логиним
      const formData = new URLSearchParams();
      formData.append('username', phone);
      formData.append('password', password);

      const loginRes = await api.post('/users/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      localStorage.setItem('token', loginRes.data.access_token);
      const meRes = await api.get<User>('/users/me');
      onSuccess(meRes.data);
      onClose();
    } catch (err: any) {
      if (err.response?.data?.detail) {
        if (Array.isArray(err.response.data.detail)) {
          setError(err.response.data.detail.map((d: any) => d.msg).join(', '));
        } else {
          setError(err.response.data.detail);
        }
      } else {
        setError('Ошибка при регистрации');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 text-xl font-bold"
        >
          ×
        </button>

        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {isRegister ? 'Регистрация' : 'Вход в Joloo'}
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          {isRegister ? 'Создайте аккаунт для поиска и публикации поездок' : 'Войдите по номеру телефона'}
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-xl flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isRegister ? (
          <form onSubmit={handleRegister} className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-gray-600">Имя</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600">Фамилия</label>
                <input
                  type="text"
                  required
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600">Отчество (необязательно)</label>
              <input
                type="text"
                value={patronymic}
                onChange={(e) => setPatronymic(e.target.value)}
                className="w-full mt-1 px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-gray-600">Телефон (от 11 цифр)</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600">Дата рождения</label>
                <input
                  type="date"
                  required
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600">Email (необязательно)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-1 px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600">Пароль (мин. 8 симв, цифра + спецсимвол)</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-1 px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-sky-600 hover:bg-sky-700 text-white font-medium py-2.5 rounded-xl transition flex items-center justify-center gap-2"
            >
              <UserCheck className="w-5 h-5" />
              {loading ? 'Создаем...' : 'Зарегистрироваться'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-600">Номер телефона</label>
              <input
                type="text"
                required
                placeholder="79991234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full mt-1 px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600">Пароль</label>
              <input
                type="password"
                required
                placeholder="Ваш пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-1 px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-sky-600 hover:bg-sky-700 text-white font-medium py-2.5 rounded-xl transition flex items-center justify-center gap-2"
            >
              <LogIn className="w-5 h-5" />
              {loading ? 'Входим...' : 'Войти'}
            </button>
          </form>
        )}

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError(null);
            }}
            className="text-xs text-sky-600 hover:underline"
          >
            {isRegister ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться'}
          </button>
        </div>
      </div>
    </div>
  );
};
