from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload, selectinload

from database import get_db
from models import Car, Rental, User
from routers.auth import require_owner
from schemas import BookedRangeOut, CarCreate, CarOut, CarSearchResult, CarUpdate
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


@router.get("/search", response_model=CarSearchResult)
def search_cars(
    city: str | None = None,
    start_date: date | None = None,
    end_date: date | None = None,
    db: Session = Depends(get_db),
):
    if (start_date is None) != (end_date is None):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Az átvétel és a visszahozatal dátumát is meg kell adni",
        )
    if start_date and end_date and end_date <= start_date:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="A visszahozatal dátumának az átvétel dátuma után kell lennie",
        )

    query = db.query(Car).options(selectinload(Car.images), joinedload(Car.owner)).filter(
        Car.status == "available"
    )

    if start_date and end_date:
        conflicting_car_ids = db.query(Rental.car_id).filter(
            Rental.status.in_(("reserved", "ongoing")),
            Rental.start_date < end_date,
            Rental.end_date > start_date,
        )
        query = query.filter(~Car.id.in_(conflicting_car_ids))

    cars = query.order_by(Car.id).all()

    city_query = city.strip().lower() if city else None
    if not city_query:
        return {"matching": cars, "other": []}

    matching = [car for car in cars if car.city and city_query in car.city.lower()]
    other = [car for car in cars if not (car.city and city_query in car.city.lower())]
    return {"matching": matching, "other": other}


@router.get("/{car_id}", response_model=CarOut)
def get_car(car_id: int, db: Session = Depends(get_db)):
    return get_car_or_404(car_id, db)


@router.get("/{car_id}/availability", response_model=list[BookedRangeOut])
def car_availability(
    car_id: int,
    exclude_rental_id: int | None = None,
    db: Session = Depends(get_db),
):
    get_car_or_404(car_id, db)
    query = db.query(Rental).filter(
        Rental.car_id == car_id,
        Rental.status.in_(("reserved", "ongoing")),
    )
    if exclude_rental_id is not None:
        query = query.filter(Rental.id != exclude_rental_id)
    return query.order_by(Rental.start_date).all()


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
