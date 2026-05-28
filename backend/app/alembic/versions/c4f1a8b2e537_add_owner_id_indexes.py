"""Add indexes on owner_id columns for query performance

Revision ID: c4f1a8b2e537
Revises: b7c3d9e04f12
Create Date: 2026-03-28 00:00:00.000000

"""

from alembic import op

# revision identifiers, used by Alembic.
revision = 'c4f1a8b2e537'
down_revision = 'b7c3d9e04f12'
branch_labels = None
depends_on = None


def upgrade():
    op.create_index('ix_item_owner_id', 'item', ['owner_id'])
    op.create_index('ix_agent_owner_id', 'agent', ['owner_id'])
    op.create_index('ix_skill_owner_id', 'skill', ['owner_id'])
    op.create_index('ix_councilsession_owner_id', 'councilsession', ['owner_id'])


def downgrade():
    op.drop_index('ix_councilsession_owner_id', table_name='councilsession')
    op.drop_index('ix_skill_owner_id', table_name='skill')
    op.drop_index('ix_agent_owner_id', table_name='agent')
    op.drop_index('ix_item_owner_id', table_name='item')
