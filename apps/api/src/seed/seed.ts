import bcrypt from 'bcryptjs';
import {
  AuditEvent,
  Deployment,
  FeatureFlag,
  Incident,
  Organization,
  SystemMetric,
  User,
  sequelize
} from '../models/database.js';

async function seed() {
  await sequelize.sync({ force: true });

  const organization = await Organization.create({
    name: 'NovaForge Labs',
    slug: 'novaforge-labs',
    tier: 'scaleup'
  });

  const passwordHash = await bcrypt.hash('password123', 10);

  await User.bulkCreate([
    { name: 'Luis Mario', email: 'admin@launchops.dev', passwordHash, role: 'admin', organizationId: organization.id },
    { name: 'Frontend Engineer', email: 'engineer@launchops.dev', passwordHash, role: 'engineer', organizationId: organization.id },
    { name: 'Stakeholder Viewer', email: 'viewer@launchops.dev', passwordHash, role: 'viewer', organizationId: organization.id }
  ]);

  await Deployment.bulkCreate([
    { service: 'web-dashboard', version: 'v2.8.1', status: 'success', environment: 'production', commitSha: 'a91f2c7', owner: 'Luis Mario', durationMs: 153000, organizationId: organization.id },
    { service: 'auth-api', version: 'v1.17.0', status: 'success', environment: 'production', commitSha: 'b83de11', owner: 'Backend Team', durationMs: 209000, organizationId: organization.id },
    { service: 'billing-worker', version: 'v0.9.4', status: 'running', environment: 'staging', commitSha: 'c21ab43', owner: 'Platform Team', durationMs: 0, organizationId: organization.id },
    { service: 'notifications', version: 'v3.4.2', status: 'failed', environment: 'production', commitSha: 'e9f22da', owner: 'Messaging Team', durationMs: 71000, organizationId: organization.id },
    { service: 'catalog-api', version: 'v1.5.9', status: 'rolled_back', environment: 'production', commitSha: 'bb31a91', owner: 'Commerce Team', durationMs: 64000, organizationId: organization.id },
    { service: 'search-indexer', version: 'v2.0.0', status: 'queued', environment: 'staging', commitSha: 'de63ab2', owner: 'Data Team', durationMs: 0, organizationId: organization.id }
  ]);

  await Incident.bulkCreate([
    { title: 'Notification delivery latency spike', severity: 'high', status: 'investigating', service: 'notifications', summary: 'Message queue delay increased after the last production deploy. Rollback is being evaluated.', organizationId: organization.id },
    { title: 'Catalog API cache misses', severity: 'medium', status: 'open', service: 'catalog-api', summary: 'Cache hit rate dropped below target after schema changes in product metadata.', organizationId: organization.id },
    { title: 'Dashboard chart hydration warning', severity: 'low', status: 'resolved', service: 'web-dashboard', summary: 'Frontend chart labels were mismatched after timezone formatting changes.', organizationId: organization.id },
    { title: 'Auth service token refresh errors', severity: 'critical', status: 'resolved', service: 'auth-api', summary: 'Refresh-token validation failed for a subset of staging users during OAuth readiness tests.', organizationId: organization.id }
  ]);

  await FeatureFlag.bulkCreate([
    { key: 'new_checkout_flow', name: 'New Checkout Flow', description: 'Enables the redesigned checkout journey for staged user segments.', enabled: true, rollout: 35, environment: 'production', owner: 'Commerce Team', organizationId: organization.id },
    { key: 'ai_summary_cards', name: 'AI Summary Cards', description: 'Displays auto-generated operational summaries in dashboards.', enabled: false, rollout: 0, environment: 'staging', owner: 'Platform Team', organizationId: organization.id },
    { key: 'dark_mode_default', name: 'Dark Mode Default', description: 'Makes dark mode the default experience for internal users.', enabled: true, rollout: 100, environment: 'staging', owner: 'Frontend Team', organizationId: organization.id },
    { key: 'strict_role_guard', name: 'Strict Role Guard', description: 'Enforces stricter role validation across admin-only flows.', enabled: true, rollout: 80, environment: 'production', owner: 'Security Team', organizationId: organization.id }
  ]);

  await SystemMetric.bulkCreate([
    { key: 'uptime', label: 'Uptime', value: 99.94, unit: '%', trend: 0.8, organizationId: organization.id },
    { key: 'p95_latency', label: 'P95 Latency', value: 184, unit: 'ms', trend: -6.4, organizationId: organization.id },
    { key: 'deploy_frequency', label: 'Deploy Frequency', value: 18, unit: '/week', trend: 12.2, organizationId: organization.id },
    { key: 'rollback_rate', label: 'Rollback Rate', value: 4.1, unit: '%', trend: -1.7, organizationId: organization.id },
    { key: 'open_incidents', label: 'Open Incidents', value: 2, unit: '', trend: -2.0, organizationId: organization.id },
    { key: 'lead_time', label: 'Lead Time', value: 2.6, unit: 'days', trend: -9.5, organizationId: organization.id }
  ]);

  await AuditEvent.bulkCreate([
    { actor: 'admin@launchops.dev', action: 'enabled feature flag', target: 'strict_role_guard', severity: 'warning', metadata: { rollout: 80 }, organizationId: organization.id },
    { actor: 'engineer@launchops.dev', action: 'queued deployment', target: 'billing-worker@v0.9.4', severity: 'info', metadata: { environment: 'staging' }, organizationId: organization.id },
    { actor: 'admin@launchops.dev', action: 'resolved incident', target: 'Auth service token refresh errors', severity: 'info', metadata: { resolution: 'JWT clock skew corrected' }, organizationId: organization.id },
    { actor: 'system', action: 'rollback triggered', target: 'catalog-api@v1.5.9', severity: 'danger', metadata: { reason: 'cache stampede risk' }, organizationId: organization.id }
  ]);

  console.log('LaunchOps seed completed');
  await sequelize.close();
}

seed().catch(async (error) => {
  console.error(error);
  await sequelize.close();
  process.exit(1);
});
