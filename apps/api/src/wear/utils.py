def serialize_wear_log_summary(wear_log):
    return {
        "id": wear_log.id,
        "outfit_id": wear_log.outfit_id,
        "date_worn": wear_log.date_worn,
        "notes": wear_log.notes,
        "created_at": wear_log.created_at,
        "updated_at": wear_log.updated_at,
    }
