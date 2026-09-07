"""support editable profile images and payment-gated completion

Revision ID: 4a1b2c3d4e5f
Revises: 33c24d8e8dd1
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "4a1b2c3d4e5f"
down_revision: Union[str, Sequence[str], None] = "33c24d8e8dd1"
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.alter_column("customer_profiles", "profile_image", existing_type=sa.String(length=500), type_=sa.Text(), existing_nullable=True)
    op.alter_column("worker_profiles", "profile_image", existing_type=sa.String(length=500), type_=sa.Text(), existing_nullable=True)

def downgrade() -> None:
    op.alter_column("customer_profiles", "profile_image", existing_type=sa.Text(), type_=sa.String(length=500), existing_nullable=True)
    op.alter_column("worker_profiles", "profile_image", existing_type=sa.Text(), type_=sa.String(length=500), existing_nullable=True)
