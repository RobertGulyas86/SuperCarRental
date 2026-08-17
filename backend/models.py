from datetime import datetime

from sqlalchemy import Boolean, Enum, ForeignKey, Numeric, SmallInteger, String
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    first_name: Mapped[str] = mapped_column(String(100))
    last_name: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(255), unique=True)
    phone_number: Mapped[str] = mapped_column(String(30))
    password: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(Enum("employee", "customer"), default="customer")
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(server_default=func.now(), onupdate=func.now())


class Car(Base):
    __tablename__ = "cars"

    id: Mapped[int] = mapped_column(primary_key=True)
    brand: Mapped[str] = mapped_column(String(100))
    model: Mapped[str] = mapped_column(String(100))
    year: Mapped[int] = mapped_column(SmallInteger)
    transmission: Mapped[str] = mapped_column(Enum("manual", "automatic"))
    fuel_type: Mapped[str] = mapped_column(Enum("petrol", "diesel", "electric", "hybrid", "lpg"))
    fuel_consumption: Mapped[float | None] = mapped_column(Numeric(4, 1))
    seats: Mapped[int] = mapped_column(default=5)
    color: Mapped[str | None] = mapped_column(String(50))
    license_plate: Mapped[str] = mapped_column(String(20), unique=True)
    daily_price: Mapped[float] = mapped_column(Numeric(10, 2))
    insurance_type: Mapped[str] = mapped_column(Enum("basic", "full"), default="basic")
    has_highway_vignette: Mapped[bool] = mapped_column(Boolean, default=False)
    status: Mapped[str] = mapped_column(
        Enum("available", "rented", "maintenance"), default="available"
    )
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(server_default=func.now(), onupdate=func.now())


class CarImage(Base):
    __tablename__ = "car_images"

    id: Mapped[int] = mapped_column(primary_key=True)
    car_id: Mapped[int] = mapped_column(ForeignKey("cars.id", ondelete="CASCADE"))
    image_path: Mapped[str] = mapped_column(String(255))
    is_primary: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
