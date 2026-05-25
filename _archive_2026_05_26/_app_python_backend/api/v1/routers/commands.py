from fastapi import APIRouter
from app.schemas.commands import Command, CommandCreate
from app.core.demo_store import demo_commands

router = APIRouter()

@router.get("/", response_model=list[Command])
def list_commands():
    return demo_commands

@router.post("/", response_model=Command)
def create_command(command: CommandCreate):
    new_command = Command(id=len(demo_commands)+1, **command.dict())
    demo_commands.append(new_command)
    return new_command
