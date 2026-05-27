from pydantic import BaseSettings

class Settings(BaseSettings):
    postgres_dsn: str = "postgresql://user:pass@localhost:5432/atlas"
    audit_hmac_key: str = "changeme"
    fleet_state_store_url: str = "http://localhost:8000"
    replay_capacity: int = 1000000
    state_dim: int = 32
    action_dim: int = 8
    evaluation_interval_s: int = 3600
    audit_client: object = None  # To be set at runtime

    class Config:
        env_file = ".env"
