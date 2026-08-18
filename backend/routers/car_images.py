import uuid

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from config import settings
from database import get_db
from models import CarImage, User
from routers.auth import require_owner
from routers.cars import get_car_or_404, require_own_car
from schemas import CarImageCreate, CarImageOut, CarImageUpdate
from storage import ALLOWED_CONTENT_TYPES, UPLOAD_ROOT, delete_uploaded_file

router = APIRouter(prefix="/cars/{car_id}/images", tags=["car-images"])


def get_car_image_or_404(car_id: int, image_id: int, db: Session) -> CarImage:
    image = db.get(CarImage, image_id)
    if image is None or image.car_id != car_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Car image not found")
    return image


@router.get("", response_model=list[CarImageOut])
def list_car_images(car_id: int, db: Session = Depends(get_db)):
    get_car_or_404(car_id, db)
    return db.query(CarImage).filter(CarImage.car_id == car_id).order_by(CarImage.id).all()


@router.get("/{image_id}", response_model=CarImageOut)
def get_car_image(car_id: int, image_id: int, db: Session = Depends(get_db)):
    get_car_or_404(car_id, db)
    return get_car_image_or_404(car_id, image_id, db)


@router.post("", response_model=CarImageOut, status_code=status.HTTP_201_CREATED)
def create_car_image(
    car_id: int,
    payload: CarImageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_owner),
):
    car = get_car_or_404(car_id, db)
    require_own_car(car, current_user)

    if payload.is_primary:
        db.query(CarImage).filter(CarImage.car_id == car_id).update({"is_primary": False})

    image = CarImage(car_id=car_id, **payload.model_dump())
    db.add(image)
    db.commit()
    db.refresh(image)
    return image


@router.post("/upload", response_model=CarImageOut, status_code=status.HTTP_201_CREATED)
def upload_car_image(
    car_id: int,
    file: UploadFile = File(...),
    is_primary: bool = Form(False),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_owner),
):
    car = get_car_or_404(car_id, db)
    require_own_car(car, current_user)

    extension = ALLOWED_CONTENT_TYPES.get(file.content_type)
    if extension is None:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported image type: {file.content_type}",
        )

    contents = file.file.read()
    max_bytes = settings.max_upload_size_mb * 1024 * 1024
    if len(contents) > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Image exceeds the {settings.max_upload_size_mb}MB limit",
        )

    car_dir = UPLOAD_ROOT / "cars" / str(car_id)
    car_dir.mkdir(parents=True, exist_ok=True)
    filename = f"{uuid.uuid4().hex}{extension}"
    (car_dir / filename).write_bytes(contents)
    image_path = f"/uploads/cars/{car_id}/{filename}"

    if is_primary:
        db.query(CarImage).filter(CarImage.car_id == car_id).update({"is_primary": False})

    image = CarImage(car_id=car_id, image_path=image_path, is_primary=is_primary)
    db.add(image)
    db.commit()
    db.refresh(image)
    return image


@router.put("/{image_id}", response_model=CarImageOut)
def update_car_image(
    car_id: int,
    image_id: int,
    payload: CarImageUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_owner),
):
    car = get_car_or_404(car_id, db)
    require_own_car(car, current_user)
    image = get_car_image_or_404(car_id, image_id, db)

    updates = payload.model_dump(exclude_unset=True)
    if updates.get("is_primary"):
        db.query(CarImage).filter(CarImage.car_id == car_id, CarImage.id != image_id).update(
            {"is_primary": False}
        )

    for field, value in updates.items():
        setattr(image, field, value)

    db.commit()
    db.refresh(image)
    return image


@router.delete("/{image_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_car_image(
    car_id: int,
    image_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_owner),
):
    car = get_car_or_404(car_id, db)
    require_own_car(car, current_user)
    image = get_car_image_or_404(car_id, image_id, db)
    delete_uploaded_file(image.image_path)
    db.delete(image)
    db.commit()
