"""
Helper utility functions
"""
from typing import Any, Dict
from datetime import datetime


def format_response(data: Any, message: str = "Success") -> Dict[str, Any]:
    """
    Format API response
    """
    return {
        "message": message,
        "data": data,
        "timestamp": datetime.utcnow().isoformat()
    }


def validate_input(data: Any) -> bool:
    """
    Validate input data
    """
    if data is None:
        return False
    return True

