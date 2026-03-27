import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import doctorService from '../../services/doctorService';
import { statusClasses } from '../../utils/helpers';

const DAY_NAMES = {
  Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday',
  Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday',
};

const DAYS = [
  { day: 'Mon', date: 3,  iso: '2026-03-03', count: 5 },
  { day: 'Tue', date: 4,  iso: '2026-03-04', count: 3 },
  { day: 'Wed', date: 5,  iso: '2026-03-05', count: 4 },
  { day: 'Thu', date: 6,  iso: '2026-03-06', count: 2 },
  { day: 'Fri', date: 7,  iso: '2026-03-07', count: 6 },
  { day: 'Mon', date: 10, iso: '2026-03-10', count: 4 },
  { day: 'Tue', date: 11, iso: '2026-03-11', count: 5 },
];

const DEMO = [
  { id: 1, time: '09:30', patient: 'Sarah Murphy', reason: 'Recurring headaches',  type: 'Video Call', status: 'upcoming'  },
  { id: 2, time: '11:00', patient: 'James Foley',  reason: 'Annual checkup',       type: 'In-Person',  status: 'upcoming'  },
  { id: 3, time: '14:00', patient: 'Aoife Burke',  reason: 'Follow-up blood test', type: 'Video Call', status: 'upcoming'  },
  { id: 4, time: '15:30', patient: 'Ciara Daly',   reason: 'Blood results review', type: 'In-Person',  status: 'completed' },
];

const MySchedule = () => {
  const [selectedDay, setSelectedDay] = useState(0);
  const [schedule,    setSchedule]    = useState(DEMO);
  const [loading,     setLoading]     = useState(false);

  const loadSchedule = async (dayIndex) => {
    setSelectedDay(dayIndex);
    setLoading(true);
    try {
      const data = await doctorService.getSchedule(DAYS[dayIndex].iso);
      setSchedule(data?.length ? data : DEMO);
    } catch {
      setSchedule(DEMO);
    } finally {
      setLoading(false);
    }
  };

  // Load today on mount
  useEffect(() => { loadSchedule(0); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const selected = DAYS[selectedDay];

  return (
    <Layout title="My Schedule">
      {/* Day strip */}
      <div className="flex gap-3 overflow-x-auto pb-2 mb-6">
        {DAYS.map((d, i) => (
          <div
            key={d.iso}
            onClick={() => loadSchedule(i)}
            className={`flex-shrink-0 w-20 py-3 rounded-xl text-center cursor-pointer
              transition-all ${
                i === selectedDay
                  ? 'bg-ink text-white'
                  : 'border-2 border-gray-200 hover:border-gray-400 bg-white'
              }`}
          >
            <p className={`text-xs font-bold uppercase ${i === selectedDay ? 'text-gray-300' : 'text-gray-400'}`}>
              {d.day}
            </p>
            <p className={`font-serif text-xl font-semibold ${i === selectedDay ? 'text-white' : 'text-ink'}`}>
              {d.date}
            </p>
            <p className="text-xs mt-0.5 text-teal-400 font-semibold">{d.count} appts</p>
          </div>
        ))}
      </div>

      <Card
        title={`${DAY_NAMES[selected.day] || selected.day} ${selected.date} March 2026`}
        subtitle={`GET /api/doctors/schedule?date=${selected.iso} · Azure SQL`}
      >
        {loading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner inline size="md" />
          </div>
        ) : (
          <div className="space-y-3">
            {schedule.map((appt) => (
              <div
                key={appt.id}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  appt.status === 'completed'
                    ? 'opacity-60 bg-gray-50 border-gray-100'
                    : 'bg-gray-50 border-gray-100 hover:bg-white hover:border-gray-200'
                }`}
              >
                {/* Time */}
                <span className="w-12 text-center text-xs font-bold text-gray-500 flex-shrink-0">
                  {appt.time}
                </span>

                {/* Divider */}
                <div className="w-px h-10 bg-gray-200 flex-shrink-0" />

                {/* Avatar */}
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700
                  flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {(appt.patient || 'X').charAt(0)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{appt.patient}</p>
                  <p className="text-xs text-gray-400 truncate">{appt.reason} · {appt.type}</p>
                </div>

                {/* Status badge */}
                <span className={`px-2 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${statusClasses(appt.status)}`}>
                  {appt.status}
                </span>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toast.info('Record loaded · Azure SQL')}
                  >
                    Record
                  </Button>
                  {appt.type?.toLowerCase().includes('video') && appt.status !== 'completed' && (
                    <Button
                      size="sm"
                      onClick={() => toast.success('✓ ACS call started')}
                    >
                      Call
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {schedule.length === 0 && (
              <p className="text-center text-sm text-gray-400 py-8">
                No appointments scheduled for this day.
              </p>
            )}
          </div>
        )}
      </Card>
    </Layout>
  );
};

export default MySchedule;
