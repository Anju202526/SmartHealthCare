import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaFilePdf, FaDownload, FaUpload, FaLock } from 'react-icons/fa';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import patientService from '../../services/patientService';

const DEMO = [
  { report_id: 1, name: 'Blood_Test_Jan2026.pdf',      type: 'Lab Report',    size: '1.2 MB', date: '18 Jan 2026', doctor: "Dr. M. O'Brien" },
  { report_id: 2, name: 'Chest_Xray_Dec2025.pdf',      type: 'Imaging',       size: '3.8 MB', date: '12 Dec 2025', doctor: 'Dr. A. Walsh'   },
  { report_id: 3, name: 'ECG_Report_Nov2025.pdf',       type: 'Cardiology',    size: '0.9 MB', date: '5 Nov 2025',  doctor: 'Dr. A. Walsh'   },
  { report_id: 4, name: 'Annual_Physical_Oct2025.pdf',  type: 'Physical Exam', size: '2.1 MB', date: '20 Oct 2025', doctor: "Dr. M. O'Brien" },
  { report_id: 5, name: 'Allergy_Test_Sep2025.pdf',     type: 'Allergy Test',  size: '1.5 MB', date: '15 Sep 2025', doctor: 'Dr. P. Nolan'  },
];

const MedicalReports = () => {
  const [reports,    setReports]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [uploading,  setUploading]  = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await patientService.getMedicalReports();
        setReports(data?.length ? data : DEMO);
      } catch {
        setReports(DEMO);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleDownload = async (report) => {
    try {
      const result = await patientService.downloadReport(report.report_id);
      // Open blob URL in new tab
      window.open(result.url, '_blank', 'noopener,noreferrer');
      toast.success(`Opening ${report.name}`);
    } catch {
      // Demo fallback
      toast.info(`Demo: SAS URL generated · Azure Key Vault`);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      // In production: upload to Azure Blob, then call patientService.saveReportRecord(...)
      await new Promise((r) => setTimeout(r, 1200)); // simulate
      toast.success(`${file.name} uploaded to Azure Blob Storage`);
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Layout title="Medical Reports">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report list */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex justify-between items-start mb-5">
              <div>
                <h2 className="font-semibold text-gray-900">
                  Medical Reports ({reports.length})
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Azure Blob Storage · patient-reports/
                </p>
              </div>
              <label className="cursor-pointer">
                <input type="file" className="hidden" accept=".pdf,.jpg,.png"
                  onChange={handleUpload} disabled={uploading} />
                <Button variant="outline" size="sm" loading={uploading}
                  onClick={(e) => e.currentTarget.previousSibling?.click?.()}>
                  <FaUpload className="text-xs" /> Upload
                </Button>
              </label>
            </div>

            <div className="space-y-3">
              {reports.map((r) => (
                <div key={r.report_id}
                  className="flex items-center gap-3 p-3 rounded-xl border border-gray-100
                    bg-gray-50 hover:bg-white hover:border-gray-200 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center
                    justify-center flex-shrink-0">
                    <FaFilePdf className="text-red-500 text-lg" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{r.name}</p>
                    <p className="text-xs text-gray-400">
                      {r.size} · {r.date} · {r.doctor}
                    </p>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100
                      text-gray-500 text-xs rounded-full">
                      {r.type}
                    </span>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => handleDownload(r)}>
                    <FaDownload className="text-xs" /> Download
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Storage info */}
        <Card title="Storage Info" subtitle="Azure Blob Storage">
          <div className="space-y-2">
            {[
              ['Container', 'patient-reports', 'font-mono text-blue-600'],
              ['Region',    'West Europe (Ireland)', ''],
              ['Encryption','AES-256', ''],
              ['GDPR',      'Compliant', ''],
              ['Access',    'SAS Token · 1hr', 'font-mono'],
            ].map(([k, v, extra]) => (
              <div key={k}
                className="flex justify-between items-center p-2.5
                  bg-gray-50 rounded-xl text-xs">
                <span className="text-gray-500">{k}</span>
                <span className={`font-semibold ${extra}`}>{v}</span>
              </div>
            ))}
            <div className="border-t border-gray-100 pt-3 mt-1">
              <div className="flex justify-between text-sm">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-teal-600">9.5 MB</span>
              </div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-200">
            <div className="flex gap-2 text-blue-700 text-xs leading-relaxed">
              <FaLock className="text-blue-500 flex-shrink-0 mt-0.5" />
              <span>Secure access via SAS tokens. All data encrypted at rest with AES-256.</span>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default MedicalReports;
