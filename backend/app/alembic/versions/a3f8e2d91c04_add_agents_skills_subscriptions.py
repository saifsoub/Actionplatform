"""Add agents, skills, and subscriptions tables

Revision ID: a3f8e2d91c04
Revises: fe56fa70289e
Create Date: 2026-03-22 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


# revision identifiers, used by Alembic.
revision = 'a3f8e2d91c04'
down_revision = 'fe56fa70289e'
branch_labels = None
depends_on = None


def upgrade():
    # Agent table
    op.create_table(
        'agent',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('name', sqlmodel.sql.sqltypes.AutoString(length=100), nullable=False),
        sa.Column('persona', sqlmodel.sql.sqltypes.AutoString(length=100), nullable=False),
        sa.Column('emoji', sqlmodel.sql.sqltypes.AutoString(length=10), nullable=False),
        sa.Column('role', sqlmodel.sql.sqltypes.AutoString(length=100), nullable=False),
        sa.Column('instructions', sqlmodel.sql.sqltypes.AutoString(length=4000), nullable=False),
        sa.Column('color', sqlmodel.sql.sqltypes.AutoString(length=20), nullable=False),
        sa.Column('is_public', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('owner_id', sa.Uuid(), nullable=False),
        sa.ForeignKeyConstraint(['owner_id'], ['user.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )

    # Skill table
    op.create_table(
        'skill',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('name', sqlmodel.sql.sqltypes.AutoString(length=100), nullable=False),
        sa.Column('description', sqlmodel.sql.sqltypes.AutoString(length=500), nullable=False),
        sa.Column('instructions', sqlmodel.sql.sqltypes.AutoString(length=4000), nullable=False),
        sa.Column('tags', sqlmodel.sql.sqltypes.AutoString(length=500), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('owner_id', sa.Uuid(), nullable=False),
        sa.ForeignKeyConstraint(['owner_id'], ['user.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )

    # AgentSkillLink join table
    op.create_table(
        'agentskilllink',
        sa.Column('agent_id', sa.Uuid(), nullable=False),
        sa.Column('skill_id', sa.Uuid(), nullable=False),
        sa.ForeignKeyConstraint(['agent_id'], ['agent.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['skill_id'], ['skill.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('agent_id', 'skill_id'),
    )

    # Subscription table
    op.create_table(
        'subscription',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('tier', sqlmodel.sql.sqltypes.AutoString(length=20), nullable=False),
        sa.Column('currency', sqlmodel.sql.sqltypes.AutoString(length=3), nullable=False),
        sa.Column('sessions_used', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('user_id', sa.Uuid(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id'),
    )


def downgrade():
    op.drop_table('subscription')
    op.drop_table('agentskilllink')
    op.drop_table('skill')
    op.drop_table('agent')
