import json
from sqlalchemy import create_engine, Column, String, Text
from sqlalchemy.orm import declarative_base, sessionmaker
from pydantic import BaseModel
from typing import Optional, List

Base = declarative_base()

class Property(Base):
    __tablename__ = "properties"
    id = Column(String, primary_key=True)
    _amenities = Column("amenities", Text, nullable=True)

    @property
    def amenities(self):
        if self._amenities:
            try:
                return json.loads(self._amenities)
            except Exception:
                return []
        return []

    @amenities.setter
    def amenities(self, value):
        if value is not None:
            self._amenities = json.dumps(value)
        else:
            self._amenities = None

class PropertySchema(BaseModel):
    id: str
    amenities: Optional[List[str]] = None

    class Config:
        from_attributes = True

engine = create_engine("sqlite:///:memory:")
Base.metadata.create_all(engine)
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

# Test insert
prop = Property(id="prop-1", amenities=["Wi-Fi", "A/C"])
db.add(prop)
db.commit()

# Test query and serialize
db_prop = db.query(Property).filter(Property.id == "prop-1").first()
print("DB raw _amenities:", db_prop._amenities)
print("DB property amenities:", db_prop.amenities)

schema_prop = PropertySchema.from_orm(db_prop)
print("Pydantic schema amenities:", schema_prop.amenities)

db.close()
