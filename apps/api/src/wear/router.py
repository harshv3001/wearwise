from datetime import date as date_type
from typing import Optional

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from src.database import get_db
from src.users.dependencies import get_authenticated_user
from src.users.models import User
from src.wear.dependencies import get_owned_wear_log
from src.wear.log_schemas import WearLogOut, WearLogUpdate
from src.wear.models import WearLog
from src.wear.schemas import WearCreate, WearLogListOut, WearOut
from src.wear.service import delete_wear_log, list_wear_logs, update_wear_log, wear_outfit

router = APIRouter(prefix="/wear", tags=["Wear"])


@router.post("/", status_code=status.HTTP_201_CREATED, response_model=WearOut)
def wear_outfit_route(
    payload: WearCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_authenticated_user),
):
    return wear_outfit(db=db, current_user=current_user, payload=payload)


@router.get("/", response_model=WearLogListOut)
def list_wear_logs_route(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_authenticated_user),
    date_from: Optional[date_type] = None,
    date_to: Optional[date_type] = None,
    limit: int = Query(default=30, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
):
    return list_wear_logs(
        db=db,
        current_user=current_user,
        date_from=date_from,
        date_to=date_to,
        limit=limit,
        offset=offset,
    )


@router.get("/{wear_log_id}", response_model=WearLogOut)
def get_wear_log_route(wear_log: WearLog = Depends(get_owned_wear_log)):
    return wear_log


@router.patch("/{wear_log_id}", response_model=WearLogOut)
def update_wear_log_route(
    payload: WearLogUpdate,
    db: Session = Depends(get_db),
    wear_log: WearLog = Depends(get_owned_wear_log),
):
    return update_wear_log(db=db, wear_log=wear_log, payload=payload)


@router.delete("/{wear_log_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_wear_log_route(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_authenticated_user),
    wear_log: WearLog = Depends(get_owned_wear_log),
):
    delete_wear_log(db=db, current_user=current_user, wear_log=wear_log)
    return None
