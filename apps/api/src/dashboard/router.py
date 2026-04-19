from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.dashboard.schemas import DashboardSummaryOut
from src.dashboard.service import get_dashboard_summary
from src.database import get_db
from src.users.dependencies import get_authenticated_user
from src.users.models import User

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/summary", response_model=DashboardSummaryOut)
def get_dashboard_summary_route(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_authenticated_user),
):
    return get_dashboard_summary(db=db, current_user=current_user)
