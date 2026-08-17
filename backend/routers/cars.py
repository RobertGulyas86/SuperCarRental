from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models import Car, User
from routers.auth import require_employee
from schemas import CarCreate, CarOut, CarUpdate

router = APIRouter(prefix="/cars", tags=["cars"])


def get_car_or_404(car_id: int, db: Session) -> Car:
    car = db.get(Car, car_id)
    if car is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Car not found")
    return car


@router.get("", response_model=list[CarOut])
def list_cars(db: Session = Depends(get_db)):
    return db.query(Car).order_by(Car.id).all()


@router.get("/{car_id}", response_model=CarOut)
def get_car(car_id: int, db: Session = Depends(get_db)):
    return get_car_or_404(car_id, db)


@router.post("", response_model=CarOut, status_code=status.HTTP_201_CREATED)
def create_car(
    payload: CarCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_employee),
):
    if db.query(Car).filter(Car.license_plate == payload.license_plate).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="License plate already registered")

    car = Car(**payload.model_dump())
    db.add(car)
    db.commit()
    db.refresh(car)
    return car


@router.put("/{car_id}", response_model=CarOut)
def update_car(
    car_id: int,
    payload: CarUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_employee),
):
    car = get_car_or_404(car_id, db)

    updates = payload.model_dump(exclude_unset=True)
    if "license_plate" in updates and updates["license_plate"] != car.license_plate:
        if db.query(Car).filter(Car.license_plate == updates["license_plate"]).first():
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="License plate already registered")

    for field, value in updates.items():
        setattr(car, field, value)

    db.commit()
    db.refresh(car)
    return car


@router.delete("/{car_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_car(
    car_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_employee),
):
    car = get_car_or_404(car_id, db)
    db.delete(car)
    db.commit()
