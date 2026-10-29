export interface User {
  id: number;
  name: string;
  surname: string;
  patronymic?: string | null;
  birth_date: string;
  email?: string | null;
  phone_number: string;
  is_staff: boolean;
  is_active: boolean;
}

export interface UserPublic {
  id: number;
  name: string;
  surname: string;
}

export interface Location {
  id: number;
  country: string;
  region?: string | null;
  district?: string | null;
  name: string;
}

export interface Trip {
  id: number;
  driver_id: number;
  from_location_id: number;
  to_location_id: number;
  price: number;
  seats: number;
  departure_date: string;
  arrival_date: string;
  comment?: string | null;
  driver: UserPublic;
  from_location: Location;
  to_location: Location;
}

export interface TripRequest {
  id: number;
  requester_id: number;
  trip_id: number;
  seats_requested: number;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  requester: UserPublic;
  trip: Trip;
}

export interface AuthTokens {
  access_token: string;
  token_type: string;
}
