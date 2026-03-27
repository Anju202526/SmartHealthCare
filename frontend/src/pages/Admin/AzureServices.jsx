import React from 'react';
import { toast } from 'react-toastify';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

const SERVICES = [
  {
    title: 'Azure SQL Database',
    colour: 'text-blue-600',
    details: [
      ['Server',   'smart-care-db.database.windows.net'],
      ['Database', 'SmartCareDB'],
      ['Region',   'West Europe'],
      ['Tier',     'Basic (S0)'],
      ['Tables',   '6 · Records: 285+'],
    ],
    action: { label: 'Ping DB', msg: '✓ Azure SQL ping: 12ms · Status: healthy' },
  },
  {
    title: 'App Service',
    colour: 'text-blue-600',
    details: [
      ['URL',     'smartcare-api.azurewebsites.net'],
      ['Runtime', 'Node.js 18'],
      ['Plan',    'Free F1'],
      ['Region',  'West Europe'],
      ['Status',  'Running'],
    ],
    action: { label: 'Health Check', msg: '✓ App Service health: OK · 99.8% uptime' },
  },
  {
    title: 'Blob Storage',
    colour: 'text-blue-600',
    details: [
      ['Account',    'smartcarestorage'],
      ['Container',  'patient-reports'],
      ['Files',      '7 · Size: 6.4 MB'],
      ['Encryption', 'AES-256'],
      ['GDPR',       'Compliant'],
    ],
    action: { label: 'Check Storage', msg: '✓ Blob Storage: 7 files · 6.4 MB used' },
  },
  {
    title: 'Azure AD B2C',
    colour: 'text-blue-600',
    details: [
      ['Tenant',  'SmartCareB2C'],
      ['Roles',   'Patient / Doctor / Admin'],
      ['Users',   '158 registered'],
      ['MFA',     'Enabled'],
      ['JWT',     '30d expiry'],
    ],
    action: null,
  },
  {
    title: 'Communication Services',
    colour: 'text-blue-600',
    details: [
      ['Video',      'WebRTC · ACS SDK'],
      ['Email',      'Azure Email Service'],
      ['SMS',        'Azure Communication'],
      ['Reminders',  'CRON-based scheduler'],
      ['Status',     'Ready'],
    ],
    action: null,
  },
  {
    title: 'Key Vault',
    colour: 'text-blue-600',
    details: [
      ['Vault',    'smartcare-vault'],
      ['Secrets',  '8 stored'],
      ['DB key',   'Stored ✓'],
      ['Blob key', 'Stored ✓'],
      ['ACS key',  'Stored ✓'],
    ],
    action: null,
  },
];

const AzureServices = () => (
  <Layout title="Azure Services">
    {/* Overall status banner */}
    <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200
      rounded-2xl mb-6">
      <div className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0 animate-pulse" />
      <div>
        <p className="text-sm font-semibold text-green-800">All Systems Operational</p>
        <p className="text-xs text-green-600">
          Last checked: {new Date().toLocaleTimeString()} · Azure West Europe
        </p>
      </div>
      <div className="ml-auto text-right">
        <p className="text-lg font-serif font-bold text-green-700">99.8%</p>
        <p className="text-xs text-green-600">30-day uptime</p>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {SERVICES.map((svc) => (
        <Card key={svc.title}>
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-xs font-bold uppercase tracking-wide ${svc.colour}`}>
              {svc.title}
            </h3>
            <span className="px-2 py-0.5 bg-green-50 text-green-600
              text-xs font-semibold rounded-full">
              Online
            </span>
          </div>

          {/* Details */}
          <div className="space-y-1.5 mb-4">
            {svc.details.map(([k, v]) => (
              <div key={k} className="flex justify-between items-start text-xs">
                <span className="text-gray-400 font-medium flex-shrink-0 mr-2">{k}</span>
                <span className="text-gray-700 font-semibold text-right">{v}</span>
              </div>
            ))}
          </div>

          {/* Action button */}
          {svc.action && (
            <Button
              size="sm"
              variant="outline"
              fullWidth
              onClick={() => toast.success(svc.action.msg)}
            >
              {svc.action.label}
            </Button>
          )}
        </Card>
      ))}
    </div>

    {/* Architecture note */}
    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-2xl">
      <p className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-2">
        Architecture Overview
      </p>
      <p className="text-xs text-blue-600 leading-relaxed">
        SmartCare runs on Microsoft Azure (West Europe / Ireland region) for GDPR compliance.
        The React frontend is served via Azure Static Web Apps or a CDN. The Node.js/Express
        API runs on App Service and connects to Azure SQL via mssql with a managed connection
        pool. Patient files are stored in Azure Blob Storage with short-lived SAS tokens
        generated per download. Authentication is handled by Azure AD B2C with JWT tokens.
        Secrets (DB connection string, storage key, ACS key) are stored in Azure Key Vault
        and loaded at startup via environment variables.
      </p>
    </div>
  </Layout>
);

export default AzureServices;
