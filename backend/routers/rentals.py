from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from database import get_db
from models import Car, Rental, User
from routers.auth import get_current_user
from schemas import RentalCreate, RentalOut, RentalUpdate

router = APIRouter(prefix="/rentals", tags=["rentals"])

ACTIVE_RENTAL_STATUSES = ("reserved", "ongoing")


def _can_manage_rental(db: Session, rental: Rental, current_user: User) -> bool:
    if rental.customer_id == current_user.id:
        return True
    if current_user.role == "owner":
        car = db.get(Car, rental.car_id)
        return car is not None and car.owner_id == current_user.id
    return False


def _has_overlapping_rental(
    db: Session,
    car_id: int,
    start_date: date,
    end_date: date,
    exclude_rental_id: int | None = None,
) -> bool:
    query = db.query(Rental).filter(
        Rental.car_id == car_id,
        Rental.status.in_(ACTIVE_RENTAL_STATUSES),
        Rental.start_date < end_date,
        Rental.end_date > start_date,
    )
    if exclude_rental_id is not None:
        query = query.filter(Rental.id != exclude_rental_id)
    return db.query(query.exists()).scalar()


@router.get("", response_model=list[RentalOut])
def list_rentals(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    query = db.query(Rental).options(joinedload(Rental.car))
    if current_user.role == "owner":
        query = query.join(Car, Rental.car_id == Car.id).filter(Car.owner_id == current_user.id)
    else:
        query = query.filter(Rental.customer_id == current_user.id)
    return query.order_by(Rental.start_date.desc()).all()


@router.post("", response_model=RentalOut, status_code=status.HTTP_201_CREATED)
def create_rental(
    payload: RentalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "customer":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only customers can book a car")

    car = db.get(Car, payload.car_id)
    if car is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Car not found")

    nights = (payload.end_date - payload.start_date).days
    if nights <= 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="A visszahozatal dátumának az átvétel dátuma után kell lennie",
        )

    if _has_overlapping_rental(db, car.id, payload.start_date, payload.end_date):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Az autó már foglalt a megadott időszakra",
        )

    rental = Rental(
        car_id=car.id,
        customer_id=current_user.id,
        start_date=payload.start_date,
        end_date=payload.end_date,
        total_price=nights * car.daily_price,
    )
    db.add(rental)
    db.commit()
    db.refresh(rental)
    return rental


@router.patch("/{rental_id}", response_model=RentalOut)
def update_rental(
    rental_id: int,
    payload: RentalUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rental = db.get(Rental, rental_id)
    if rental is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rental not found")

    if not _can_manage_rental(db, rental, current_user):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to modify this rental")

    nights = (payload.end_date - payload.start_date).days
    if nights <= 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="A visszahozatal dátumának az átvétel dátuma után kell lennie",
        )

    if _has_overlapping_rental(db, rental.car_id, payload.start_date, payload.end_date, exclude_rental_id=rental.id):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Az autó már foglalt a megadott időszakra",
        )

    car = db.get(Car, rental.car_id)
    rental.start_date = payload.start_date
    rental.end_date = payload.end_date
    rental.total_price = nights * car.daily_price
    db.commit()
    db.refresh(rental)
    return rental


@router.delete("/{rental_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_rental(
    rental_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rental = db.get(Rental, rental_id)
    if rental is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rental not found")

    if not _can_manage_rental(db, rental, current_user):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this rental")

    db.delete(rental)
    db.commit()
