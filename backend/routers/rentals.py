from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from database import get_db
from models import Car, Rental, User
from routers.auth import get_current_user
from schemas import RentalCreate, RentalOut

router = APIRouter(prefix="/rentals", tags=["rentals"])


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


@router.delete("/{rental_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_rental(
    rental_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rental = db.get(Rental, rental_id)
    if rental is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rental not found")

    is_customer = rental.customer_id == current_user.id
    is_owning_car = False
    if current_user.role == "owner":
        car = db.get(Car, rental.car_id)
        is_owning_car = car is not None and car.owner_id == current_user.id

    if not (is_customer or is_owning_car):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this rental")

    db.delete(rental)
    db.commit()
