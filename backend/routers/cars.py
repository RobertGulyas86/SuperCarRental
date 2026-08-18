from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload, selectinload

from database import get_db
from models import Car, User
from routers.auth import require_owner
from schemas import CarCreate, CarOut, CarUpdate
from storage import delete_uploaded_file

router = APIRouter(prefix="/cars", tags=["cars"])


def get_car_or_404(car_id: int, db: Session) -> Car:
    car = db.get(Car, car_id)
    if car is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Car not found")
    return car


def require_own_car(car: Car, current_user: User) -> None:
    if car.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not the owner of this car")


@router.get("", response_model=list[CarOut])
def list_cars(db: Session = Depends(get_db)):
    return (
        db.query(Car)
        .options(selectinload(Car.images), joinedload(Car.owner))
        .order_by(Car.id)
        .all()
    )


@router.get("/mine", response_model=list[CarOut])
def list_my_cars(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_owner),
):
    return (
        db.query(Car)
        .options(selectinload(Car.images), joinedload(Car.owner))
        .filter(Car.owner_id == current_user.id)
        .order_by(Car.id)
        .all()
    )


@router.get("/{car_id}", response_model=CarOut)
def get_car(car_id: int, db: Session = Depends(get_db)):
    return get_car_or_404(car_id, db)


@router.post("", response_model=CarOut, status_code=status.HTTP_201_CREATED)
def create_car(
    payload: CarCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_owner),
):
    if db.query(Car).filter(Car.license_plate == payload.license_plate).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="License plate already registered")

    car = Car(**payload.model_dump(), owner_id=current_user.id)
    db.add(car)
    db.commit()
    db.refresh(car)
    return car


@router.put("/{car_id}", response_model=CarOut)
def update_car(
    car_id: int,
    payload: CarUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_owner),
):
    car = get_car_or_404(car_id, db)
    require_own_car(car, current_user)

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
    current_user: User = Depends(require_owner),
):
    car = get_car_or_404(car_id, db)
    require_own_car(car, current_user)
    for image in car.images:
        delete_uploaded_file(image.image_path)
    db.delete(car)
    db.commit()
