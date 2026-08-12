import { DataTypes, Model, Sequelize } from 'sequelize';
import { env } from '../config/env.js';

export const sequelize = new Sequelize(env.DATABASE_URL, {
  logging: env.NODE_ENV === 'development' ? console.log : false,
  define: {
    underscored: true,
    timestamps: true
  }
});

export class Organization extends Model {
  declare id: number;
  declare name: string;
  declare slug: string;
  declare tier: string;
}

Organization.init(
  {
    name: { type: DataTypes.STRING(120), allowNull: false },
    slug: { type: DataTypes.STRING(80), allowNull: false, unique: true },
    tier: { type: DataTypes.ENUM('startup', 'scaleup', 'enterprise'), allowNull: false, defaultValue: 'startup' }
  },
  { sequelize, modelName: 'organization' }
);

export class User extends Model {
  declare id: number;
  declare name: string;
  declare email: string;
  declare passwordHash: string;
  declare role: 'admin' | 'engineer' | 'viewer';
  declare organizationId: number;
}

User.init(
  {
    name: { type: DataTypes.STRING(120), allowNull: false },
    email: { type: DataTypes.STRING(160), allowNull: false, unique: true, validate: { isEmail: true } },
    passwordHash: { type: DataTypes.STRING(255), allowNull: false },
    role: { type: DataTypes.ENUM('admin', 'engineer', 'viewer'), allowNull: false, defaultValue: 'viewer' }
  },
  { sequelize, modelName: 'user' }
);

export class Deployment extends Model {
  declare id: number;
  declare service: string;
  declare version: string;
  declare status: 'queued' | 'running' | 'success' | 'failed' | 'rolled_back';
  declare environment: 'staging' | 'production';
  declare commitSha: string;
  declare owner: string;
  declare durationMs: number;
  declare organizationId: number;
  declare createdAt: Date;
}

Deployment.init(
  {
    service: { type: DataTypes.STRING(120), allowNull: false },
    version: { type: DataTypes.STRING(40), allowNull: false },
    status: { type: DataTypes.ENUM('queued', 'running', 'success', 'failed', 'rolled_back'), allowNull: false },
    environment: { type: DataTypes.ENUM('staging', 'production'), allowNull: false },
    commitSha: { type: DataTypes.STRING(12), allowNull: false },
    owner: { type: DataTypes.STRING(120), allowNull: false },
    durationMs: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }
  },
  { sequelize, modelName: 'deployment' }
);

export class Incident extends Model {
  declare id: number;
  declare title: string;
  declare severity: 'low' | 'medium' | 'high' | 'critical';
  declare status: 'open' | 'investigating' | 'resolved';
  declare service: string;
  declare summary: string;
  declare organizationId: number;
  declare createdAt: Date;
}

Incident.init(
  {
    title: { type: DataTypes.STRING(180), allowNull: false },
    severity: { type: DataTypes.ENUM('low', 'medium', 'high', 'critical'), allowNull: false },
    status: { type: DataTypes.ENUM('open', 'investigating', 'resolved'), allowNull: false, defaultValue: 'open' },
    service: { type: DataTypes.STRING(120), allowNull: false },
    summary: { type: DataTypes.TEXT, allowNull: false }
  },
  { sequelize, modelName: 'incident' }
);

export class FeatureFlag extends Model {
  declare id: number;
  declare key: string;
  declare name: string;
  declare description: string;
  declare enabled: boolean;
  declare rollout: number;
  declare environment: 'staging' | 'production';
  declare owner: string;
  declare organizationId: number;
}

FeatureFlag.init(
  {
    key: { type: DataTypes.STRING(100), allowNull: false },
    name: { type: DataTypes.STRING(120), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    enabled: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    rollout: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, validate: { min: 0, max: 100 } },
    environment: { type: DataTypes.ENUM('staging', 'production'), allowNull: false },
    owner: { type: DataTypes.STRING(120), allowNull: false }
  },
  {
    sequelize,
    modelName: 'feature_flag',
    indexes: [{ unique: true, fields: ['organization_id', 'key', 'environment'] }]
  }
);

export class AuditEvent extends Model {
  declare id: number;
  declare actor: string;
  declare action: string;
  declare target: string;
  declare severity: 'info' | 'warning' | 'danger';
  declare metadata: Record<string, unknown>;
  declare organizationId: number;
}

AuditEvent.init(
  {
    actor: { type: DataTypes.STRING(120), allowNull: false },
    action: { type: DataTypes.STRING(160), allowNull: false },
    target: { type: DataTypes.STRING(160), allowNull: false },
    severity: { type: DataTypes.ENUM('info', 'warning', 'danger'), allowNull: false, defaultValue: 'info' },
    metadata: { type: DataTypes.JSON, allowNull: false, defaultValue: {} }
  },
  { sequelize, modelName: 'audit_event' }
);

export class SystemMetric extends Model {
  declare id: number;
  declare key: string;
  declare label: string;
  declare value: number;
  declare unit: string;
  declare trend: number;
  declare organizationId: number;
}

SystemMetric.init(
  {
    key: { type: DataTypes.STRING(80), allowNull: false },
    label: { type: DataTypes.STRING(120), allowNull: false },
    value: { type: DataTypes.FLOAT, allowNull: false },
    unit: { type: DataTypes.STRING(20), allowNull: false },
    trend: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 }
  },
  {
    sequelize,
    modelName: 'system_metric',
    indexes: [{ unique: true, fields: ['organization_id', 'key'] }]
  }
);

Organization.hasMany(User, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
User.belongsTo(Organization);

Organization.hasMany(Deployment, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
Deployment.belongsTo(Organization);

Organization.hasMany(Incident, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
Incident.belongsTo(Organization);

Organization.hasMany(FeatureFlag, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
FeatureFlag.belongsTo(Organization);

Organization.hasMany(AuditEvent, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
AuditEvent.belongsTo(Organization);

Organization.hasMany(SystemMetric, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
SystemMetric.belongsTo(Organization);

export const models = {
  Organization,
  User,
  Deployment,
  Incident,
  FeatureFlag,
  AuditEvent,
  SystemMetric
};

export async function connectDatabase() {
  await sequelize.authenticate();
  if (env.DB_SYNC) {
    await sequelize.sync();
  }
}
