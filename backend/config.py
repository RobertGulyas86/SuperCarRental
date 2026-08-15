from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str
    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def sqlalchemy_database_url(self) -> str:
        # DATABASE_URL uses the plain mysql:// scheme (shared with scripts/dump_db.sh);
        # SQLAlchemy needs the pymysql driver spelled out explicitly.
        return self.database_url.replace("mysql://", "mysql+pymysql://", 1)


settings = Settings()
