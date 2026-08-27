"""Add engagement monitoring workflow tables

Revision ID: 2b9c4d5e6f70
Revises: b7c3d9e04f12
Create Date: 2026-05-28 13:40:00.000000

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


# revision identifiers, used by Alembic.
revision = '2b9c4d5e6f70'
down_revision = 'b7c3d9e04f12'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'engagementpost',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('title', sqlmodel.sql.sqltypes.AutoString(length=200), nullable=False),
        sa.Column('linkedin_url', sqlmodel.sql.sqltypes.AutoString(length=500), nullable=False),
        sa.Column('published_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('monitor_until', sa.DateTime(timezone=True), nullable=True),
        sa.Column('check_interval_hours', sa.Integer(), nullable=False),
        sa.Column('status', sqlmodel.sql.sqltypes.AutoString(length=20), nullable=False),
        sa.Column('next_check_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('last_checked_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('notes', sqlmodel.sql.sqltypes.AutoString(length=1000), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('owner_id', sa.Uuid(), nullable=False),
        sa.ForeignKeyConstraint(['owner_id'], ['user.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_engagementpost_owner_id'), 'engagementpost', ['owner_id'], unique=False)

    op.create_table(
        'engagementcheck',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('checked_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('comments_count', sa.Integer(), nullable=False),
        sa.Column('comments_delta', sa.Integer(), nullable=False),
        sa.Column('reactions_count', sa.Integer(), nullable=False),
        sa.Column('reactions_delta', sa.Integer(), nullable=False),
        sa.Column('reposts_count', sa.Integer(), nullable=False),
        sa.Column('reposts_delta', sa.Integer(), nullable=False),
        sa.Column('impressions_count', sa.Integer(), nullable=False),
        sa.Column('impressions_delta', sa.Integer(), nullable=False),
        sa.Column('notes', sqlmodel.sql.sqltypes.AutoString(length=1000), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('post_id', sa.Uuid(), nullable=False),
        sa.Column('owner_id', sa.Uuid(), nullable=False),
        sa.ForeignKeyConstraint(['owner_id'], ['user.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['post_id'], ['engagementpost.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_engagementcheck_owner_id'), 'engagementcheck', ['owner_id'], unique=False)
    op.create_index(op.f('ix_engagementcheck_post_id'), 'engagementcheck', ['post_id'], unique=False)

    op.create_table(
        'followupopportunity',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('source', sqlmodel.sql.sqltypes.AutoString(length=50), nullable=False),
        sa.Column('contact_name', sqlmodel.sql.sqltypes.AutoString(length=120), nullable=True),
        sa.Column('profile_url', sqlmodel.sql.sqltypes.AutoString(length=500), nullable=True),
        sa.Column('prompt', sqlmodel.sql.sqltypes.AutoString(length=1000), nullable=False),
        sa.Column('priority', sqlmodel.sql.sqltypes.AutoString(length=20), nullable=False),
        sa.Column('status', sqlmodel.sql.sqltypes.AutoString(length=20), nullable=False),
        sa.Column('outcome_note', sqlmodel.sql.sqltypes.AutoString(length=1000), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('post_id', sa.Uuid(), nullable=False),
        sa.Column('owner_id', sa.Uuid(), nullable=False),
        sa.ForeignKeyConstraint(['owner_id'], ['user.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['post_id'], ['engagementpost.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_followupopportunity_owner_id'), 'followupopportunity', ['owner_id'], unique=False)
    op.create_index(op.f('ix_followupopportunity_post_id'), 'followupopportunity', ['post_id'], unique=False)


def downgrade():
    op.drop_index(op.f('ix_followupopportunity_post_id'), table_name='followupopportunity')
    op.drop_index(op.f('ix_followupopportunity_owner_id'), table_name='followupopportunity')
    op.drop_table('followupopportunity')
    op.drop_index(op.f('ix_engagementcheck_post_id'), table_name='engagementcheck')
    op.drop_index(op.f('ix_engagementcheck_owner_id'), table_name='engagementcheck')
    op.drop_table('engagementcheck')
    op.drop_index(op.f('ix_engagementpost_owner_id'), table_name='engagementpost')
    op.drop_table('engagementpost')
