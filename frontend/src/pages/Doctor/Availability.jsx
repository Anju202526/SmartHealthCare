import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/forms/Input';
import Select from '../../components/forms/Select';
import doctorService from '../../services/doctorService';

const WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const Availability = () => {
  const [loading, setLoading]   = useState(false);
  const [saving,  setSaving]    = useState(false);
  const [settings, setSettings] = useState({
    start_time:          '09:00',
    end_time:            '17:00',
    slot_duration_mins:  '45',
    max_patients:        8,
    days_available:      ['Mon', 'Tue', 'Wed', 'Thu'],
  });

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await doctorService.getAvailability();
        if (data && Object.keys(data).length) {
          setSettings({
            start_time:         data.start_time         || '09:00',
            end_time:           data.end_time           || '17:00',
            slot_duration_mins: String(data.slot_duration_mins || 45),
            max_patients:       data.max_patients       || 8,
            days_available:     data.days_available
              ? JSON.parse(data.days_available)
              : ['Mon', 'Tue', 'Wed', 'Thu'],
          });
        }
      } catch {
        // keep defaults
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggleDay = (day) => {
    setSettings((s) => ({
      ...s,
      days_available: s.days_available.includes(day)
        ? s.days_available.filter((d) => d !== day)
        : [...s.days_available, day],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await doctorService.updateAvailability({
        ...settings,
        slot_duration_mins: parseInt(settings.slot_duration_mins),
        max_patients:       parseInt(settings.max_patients),
      });
      toast.success('✓ Availability saved to Azure SQL');
    } catch {
      toast.error('Failed to save availability');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout title="Set Availability">
      <Card>
        <h2 className="font-semibold mb-1">Set My Availability</h2>
        <p className="text-xs text-gray-400 mb-5">
          PATCH /api/doctors/availability · Azure SQL · DoctorAvailability table
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <Input label="Working Hours — Start" name="start_time" type="time"
            value={settings.start_time}
            onChange={(e) => setSettings((s) => ({ ...s, start_time: e.target.value }))} />
          <Input label="Working Hours — End" name="end_time" type="time"
            value={settings.end_time}
            onChange={(e) => setSettings((s) => ({ ...s, end_time: e.target.value }))} />
        </div>

        <div className="mb-4">
          <Select label="Consultation Duration" name="slot_duration_mins"
            value={settings.slot_duration_mins}
            onChange={(e) => setSettings((s) => ({ ...s, slot_duration_mins: e.target.value }))}
            options={[
              { value: '30', label: '30 minutes' },
              { value: '45', label: '45 minutes' },
              { value: '60', label: '60 minutes' },
            ]} />
        </div>

        <div className="mb-4">
          <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">
            Days Available
          </label>
          <div className="flex gap-2 flex-wrap">
            {WEEK.map((day) => {
              const active = settings.days_available.includes(day);
              return (
                <button key={day} type="button"
                  onClick={() => toggleDay(day)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    active
                      ? 'bg-ink text-white'
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mb-5">
          <Input label="Max Patients Per Day" name="max_patients" type="number"
            value={String(settings.max_patients)}
            onChange={(e) => setSettings((s) => ({ ...s, max_patients: e.target.value }))} />
        </div>

        <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 mb-5
          text-xs text-blue-700 leading-relaxed">
          ⚡ PATCH /api/doctors/availability → Azure SQL · DoctorAvailability table ·
          Triggers slot recalculation for future bookings
        </div>

        <Button onClick={handleSave} loading={saving} disabled={loading}>
          Save Availability
        </Button>
      </Card>
    </Layout>
  );
};

export default Availability;
