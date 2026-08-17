from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserRegister(BaseModel):
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    phone_number: str = Field(min_length=1, max_length=30)
    password: str = Field(min_length=8, max_length=72)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    first_name: str
    last_name: str
    email: EmailStr
    phone_number: str
    role: str
    created_at: datetime


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


Transmission = Literal["manual", "automatic"]
FuelType = Literal["petrol", "diesel", "electric", "hybrid", "lpg"]
InsuranceType = Literal["basic", "full"]
CarStatus = Literal["available", "rented", "maintenance"]


class CarBase(BaseModel):
    brand: str = Field(min_length=1, max_length=100)
    model: str = Field(min_length=1, max_length=100)
    year: int = Field(ge=1900, le=2100)
    transmission: Transmission
    fuel_type: FuelType
    fuel_consumption: float | None = Field(default=None, ge=0)
    seats: int = Field(default=5, ge=1, le=255)
    color: str | None = Field(default=None, max_length=50)
    license_plate: str = Field(min_length=1, max_length=20)
    daily_price: float = Field(ge=0)
    insurance_type: InsuranceType = "basic"
    has_highway_vignette: bool = False
    status: CarStatus = "available"


class CarCreate(CarBase):
    pass


class CarUpdate(BaseModel):
    brand: str | None = Field(default=None, min_length=1, max_length=100)
    model: str | None = Field(default=None, min_length=1, max_length=100)
    year: int | None = Field(default=None, ge=1900, le=2100)
    transmission: Transmission | None = None
    fuel_type: FuelType | None = None
    fuel_consumption: float | None = Field(default=None, ge=0)
    seats: int | None = Field(default=None, ge=1, le=255)
    color: str | None = Field(default=None, max_length=50)
    license_plate: str | None = Field(default=None, min_length=1, max_length=20)
    daily_price: float | None = Field(default=None, ge=0)
    insurance_type: InsuranceType | None = None
    has_highway_vignette: bool | None = None
    status: CarStatus | None = None


class CarOut(CarBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime


class CarImageBase(BaseModel):
    image_path: str = Field(min_length=1, max_length=255)
    is_primary: bool = False


class CarImageCreate(CarImageBase):
    pass


class CarImageUpdate(BaseModel):
    image_path: str | None = Field(default=None, min_length=1, max_length=255)
    is_primary: bool | None = None


class CarImageOut(CarImageBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    car_id: int
    created_at: datetime
