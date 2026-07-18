from sqlalchemy import String, Integer, Boolean, Date, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
import datetime


class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(50), nullable=False)
    surname: Mapped[str] = mapped_column(String(50), nullable=False)
    patronymic: Mapped[str] = mapped_column(String(50), nullable=True)
    birth_date: Mapped[datetime.date] = mapped_column(Date, nullable=False)
    password: Mapped[str] = mapped_column(String, nullable=False)
    email: Mapped[str | None] = mapped_column(String(50), nullable=True, unique=True)
    phone_number: Mapped[str] = mapped_column(String(20), nullable=False, unique=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=False)
    is_staff: Mapped[bool] = mapped_column(Boolean, default=False)


class Location(Base):
    __tablename__ = "locations"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    country: Mapped[str] = mapped_column(String(50), nullable=False)
    region: Mapped[str | None] = mapped_column(String(100), nullable=True)
    district: Mapped[str | None] = mapped_column(String(100), nullable=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)

class Trip(Base):
    __tablename__ = "trips"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    price: Mapped[int] = mapped_column(Integer, nullable=False)
    seats: Mapped[int] = mapped_column(Integer, nullable=False)
    date: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    comment: Mapped[str | None] = mapped_column(String, nullable=True)

    driver_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    from_location_id: Mapped[int] = mapped_column(ForeignKey("locations.id"), nullable=False)
    to_location_id: Mapped[int] = mapped_column(ForeignKey("locations.id"), nullable=False)

    driver: Mapped["User"] = relationship(foreign_keys=[driver_id])
    from_location: Mapped["Location"] = relationship(foreign_keys=[from_location_id])
    to_location: Mapped["Location"] = relationship(foreign_keys=[to_location_id])

class TripRequest(Base):
    __tablename__ = "triprequests"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    seats_requested: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    status: Mapped[str] = mapped_column(String(25), nullable=False)

    requester_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    trip_id: Mapped[int] = mapped_column(ForeignKey("trips.id"), nullable=False)

    requester: Mapped["User"] = relationship(foreign_keys=[requester_id])
    trip: Mapped["Trip"] = relationship(foreign_keys=[trip_id])