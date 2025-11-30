"""
Example endpoints
"""
from fastapi import APIRouter, HTTPException
from typing import List, Optional
from models.schemas import ExampleResponse, ExampleCreate

router = APIRouter()


@router.get("", response_model=List[ExampleResponse])
async def get_examples(skip: int = 0, limit: int = 10):
    """Get list of examples"""
    # Example implementation
    return [
        ExampleResponse(
            id=i,
            name=f"Example {i}",
            description=f"Description for example {i}"
        )
        for i in range(skip, skip + limit)
    ]


@router.get("/{example_id}", response_model=ExampleResponse)
async def get_example(example_id: int):
    """Get a specific example by ID"""
    if example_id < 0:
        raise HTTPException(status_code=400, detail="Invalid example ID")
    
    return ExampleResponse(
        id=example_id,
        name=f"Example {example_id}",
        description=f"Description for example {example_id}"
    )


@router.post("", response_model=ExampleResponse)
async def create_example(example: ExampleCreate):
    """Create a new example"""
    # Example implementation
    return ExampleResponse(
        id=1,
        name=example.name,
        description=example.description
    )

