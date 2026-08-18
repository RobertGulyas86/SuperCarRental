from pathlib import Path

from config import settings

UPLOAD_ROOT = Path(settings.upload_dir)
ALLOWED_CONTENT_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
}


def delete_uploaded_file(image_path: str) -> None:
    if not image_path.startswith("/uploads/"):
        return
    file_path = UPLOAD_ROOT / Path(image_path).relative_to("/uploads")
    file_path.unlink(missing_ok=True)
