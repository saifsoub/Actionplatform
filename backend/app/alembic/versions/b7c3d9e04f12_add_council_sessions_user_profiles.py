"""Add council_sessions and user_profiles tables

Revision ID: b7c3d9e04f12
Revises: a3f8e2d91c04
Create Date: 2026-03-24 08:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


# revision identifiers, used by Alembic.
revision = 'b7c3d9e04f12'
down_revision = 'a3f8e2d91c04'
branch_labels = None
depends_on = None


def upgrade():
    # CouncilSession table
    op.create_table(
        'councilsession',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('question', sqlmodel.sql.sqltypes.AutoString(length=2000), nullable=False),
        sa.Column('atlas_response', sqlmodel.sql.sqltypes.AutoString(length=3000), nullable=False),
        sa.Column('nova_response', sqlmodel.sql.sqltypes.AutoString(length=3000), nullable=False),
        sa.Column('reza_response', sqlmodel.sql.sqltypes.AutoString(length=3000), nullable=False),
        sa.Column('kai_response', sqlmodel.sql.sqltypes.AutoString(length=3000), nullable=False),
        sa.Column('synthesis', sqlmodel.sql.sqltypes.AutoString(length=1500), nullable=False),
        sa.Column('outcome', sqlmodel.sql.sqltypes.AutoString(length=20), nullable=True),
        sa.Column('outcome_note', sqlmodel.sql.sqltypes.AutoString(length=500), nullable=True),
        sa.Column('tags', sqlmodel.sql.sqltypes.AutoString(length=500), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('owner_id', sa.Uuid(), nullable=False),
        sa.ForeignKeyConstraint(['owner_id'], ['user.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )

    # UserProfile table
    op.create_table(
        'userprofile',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('role', sqlmodel.sql.sqltypes.AutoString(length=100), nullable=True),
        sa.Column('domain', sqlmodel.sql.sqltypes.AutoString(length=100), nullable=True),
        sa.Column('biggest_challenge', sqlmodel.sql.sqltypes.AutoString(length=500), nullable=True),
        sa.Column('goals', sqlmodel.sql.sqltypes.AutoString(length=500), nullable=True),
        sa.Column('timezone', sqlmodel.sql.sqltypes.AutoString(length=50), nullable=True),
        sa.Column('sage_email_digest', sa.Boolean(), nullable=False),
        sa.Column('onboarding_complete', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('user_id', sa.Uuid(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id'),
    )


def downgrade():
    op.drop_table('userprofile')
    op.drop_table('councilsession')
