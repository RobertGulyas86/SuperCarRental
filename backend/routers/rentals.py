from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload

from database import get_db
from models import Car, Rental, User
from routers.auth import get_current_user
from schemas import RentalOut

router = APIRouter(prefix="/rentals", tags=["rentals"])


@router.get("", response_model=list[RentalOut])
def list_rentals(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    query = db.query(Rental).options(joinedload(Rental.car), joinedload(Rental.location))
    if current_user.role == "owner":
        query = query.join(Car, Rental.car_id == Car.id).filter(Car.owner_id == current_user.id)
    else:
        query = query.filter(Rental.customer_id == current_user.id)
    return query.order_by(Rental.start_date.desc()).all()
