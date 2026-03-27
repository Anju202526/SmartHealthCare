import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import appointmentService from '../../services/appointmentService';
import patientService from '../../services/patientService';

const DEMO_DOCTORS = [
  { id: 1, name: "Dr. M. O'Brien", specialty: 'General Practice', consultation_fee: 65 },
  { id: 2, name: 'Dr. A. Walsh',   specialty: 'Cardiology',        consultation_fee: 90 },
  { id: 3, name: 'Dr. P. Nolan',   specialty: 'Pediatrics',        consultation_fee: 55 },
  { id: 4, name: 'Dr. J. Connell', specialty: 'Neurology',         consultation_fee: 110 },
];

const DATES = [
  { day: 'Mon', date: 3,  full: 'Mon 3 Mar',  iso: '2026-03-03' },
  { day: 'Tue', date: 4,  full: 'Tue 4 Mar',  iso: '2026-03-04' },
  { day: 'Wed', date: 5,  full: 'Wed 5 Mar',  iso: '2026-03-05' },
  { day: 'Thu', date: 6,  full: 'Thu 6 Mar',  iso: '2026-03-06' },
  { day: 'Fri', date: 7,  full: 'Fri 7 Mar',  iso: '2026-03-07' },
  { day: 'Mon', date: 10, full: 'Mon 10 Mar', iso: '2026-03-10' },
];

const DEMO_SLOTS = [
  { time: '09:00', booked: true  },
  { time: '09:30', booked: false },
  { time: '10:30', booked: false },
  { time: '11:00', booked: false },
  { time: '11:30', booked: false },
  { time: '12:00', booked: true  },
  { time: '14:00', booked: false },
  { time: '14:30', booked: false },
  { time: '15:30', booked: false },
];

const STEP_LABELS = ['Doctor', 'Date & Time', 'Details', 'Confirm'];

const BookAppointment = () => {
  const navigate = useNavigate();

  const [step,            setStep]           = useState(1);
  const [loading,         setLoading]        = useState(false);
  const [doctors,         setDoctors]        = useState([]);
  const [slots,           setSlots]          = useState(DEMO_SLOTS);
  const [slotsLoading,    setSlotsLoading]   = useState(false);
  const [selectedDoctor,  setSelectedDoctor] = useState(null);
  const [selectedDate,    setSelectedDate]   = useState(DATES[1]);
  const [selectedTime,    setSelectedTime]   = useState(null);
  const [selectedType,    setSelectedType]   = useState('Video Call');
  const [notes,           setNotes]          = useState('');
  const [confirmed,       setConfirmed]      = useState(false);

  // Load doctors
  useEffect(() => {
    (async () => {
      try {
        const data = await appointmentService.getAllDoctors();
        const list = data?.length ? data : DEMO_DOCTORS;
        setDoctors(list);
        setSelectedDoctor(list[0]);
      } catch {
        setDoctors(DEMO_DOCTORS);
        setSelectedDoctor(DEMO_DOCTORS[0]);
      }
    })();
  }, []);

  // Reload slots when doctor or date changes
  useEffect(() => {
    if (!selectedDoctor || !selectedDate) return;
    setSlotsLoading(true);
    appointmentService
      .getAvailableSlots(selectedDoctor.id || selectedDoctor.doctor_id, selectedDate.iso)
      .then((data) => setSlots(data?.length ? data : DEMO_SLOTS))
      .catch(() => setSlots(DEMO_SLOTS))
      .finally(() => setSlotsLoading(false));
  }, [selectedDoctor, selectedDate]);

  const handleConfirm = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTime) {
      toast.error('Please complete all booking details');
      return;
    }
    setLoading(true);
    try {
      await patientService.bookAppointment({
        doctorId: selectedDoctor.id || selectedDoctor.doctor_id,
        date:     selectedDate.iso,
        time:     selectedTime,
        consultationType: selectedType,
        notes,
        fee: selectedDoctor.consultation_fee,
      });
      setConfirmed(true);
      toast.success('Appointment booked successfully!');
    } catch (err) {
      toast.error(err?.error || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  // ── Success screen ───────────────────────────────────────
  if (confirmed) {
    return (
      <Layout title="Book Appointment">
        <div className="max-w-md mx-auto mt-20 text-center">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="font-serif text-2xl font-semibold mb-2">Appointment Booked!</h2>
          <p className="text-sm text-gray-400 mb-6">
            Your appointment has been saved to Azure SQL and a confirmation email
            will be sent via Azure Communication Services.
          </p>
          <Button fullWidth onClick={() => navigate('/patient/appointments')}>
            View My Appointments
          </Button>
        </div>
      </Layout>
    );
  }

  // ── Step indicator ───────────────────────────────────────
  const StepBar = () => (
    <div className="flex items-center gap-1 mb-8">
      {STEP_LABELS.map((label, i) => {
        const n       = i + 1;
        const done    = step > n;
        const active  = step === n;
        return (
          <React.Fragment key={n}>
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center
                text-xs font-bold transition-all ${
                  done   ? 'bg-teal-500 text-white' :
                  active ? 'bg-ink text-white'       :
                           'bg-gray-100 text-gray-400'}`}>
                {done ? '✓' : n}
              </div>
              <span className={`text-xs font-semibold hidden sm:block ${
                done ? 'text-teal-500' : active ? 'text-ink' : 'text-gray-400'}`}>
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div className={`flex-1 h-px mx-1 ${step > n ? 'bg-teal-500' : 'bg-gray-200'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );

  // ── Summary sidebar ──────────────────────────────────────
  const Summary = () => (
    <div className="bg-ink rounded-2xl p-6 text-white sticky top-20">
      <h3 className="font-serif text-lg font-semibold mb-4">Booking Summary</h3>
      {[
        ['Doctor',    selectedDoctor?.name     || '—'],
        ['Specialty', selectedDoctor?.specialty || '—'],
        ['Date',      selectedDate?.full        || '—'],
        ['Time',      selectedTime              || '—'],
        ['Type',      selectedType],
      ].map(([k, v]) => (
        <div key={k} className="flex justify-between text-sm py-2
          border-b border-white/10 last:border-0">
          <span className="text-white/50">{k}</span>
          <span className="font-medium">{v}</span>
        </div>
      ))}
      <div className="flex justify-between mt-4 pt-3 border-t border-white/10">
        <span className="text-white/60 text-sm">Fee</span>
        <span className="font-serif text-2xl font-semibold text-teal-400">
          €{selectedDoctor?.consultation_fee ?? '—'}
        </span>
      </div>
      <div className="mt-4 p-3 bg-teal-900/40 rounded-xl border border-teal-800 text-xs text-teal-300 leading-relaxed">
        ⚡ <strong>Azure Services:</strong><br />
        POST /api/appointments/book → Azure SQL<br />
        Email → Azure Communication Services
      </div>
      {step === 4 && (
        <Button variant="secondary" fullWidth className="mt-4"
          loading={loading} onClick={handleConfirm}>
          Confirm Appointment
        </Button>
      )}
    </div>
  );

  return (
    <Layout title="Book Appointment">
      <StepBar />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left / centre column ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* STEP 1 — choose doctor */}
          {step === 1 && (
            <Card title="Select Doctor" subtitle="GET /api/doctors">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {doctors.map((doc) => {
                  const id = doc.id || doc.doctor_id;
                  const selId = selectedDoctor?.id || selectedDoctor?.doctor_id;
                  return (
                    <div key={id}
                      onClick={() => setSelectedDoctor(doc)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        selId === id
                          ? 'border-ink bg-gray-50'
                          : 'border-gray-200 hover:border-gray-400'}`}>
                      <p className="font-semibold text-sm">{doc.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{doc.specialty}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm font-bold text-teal-600">
                          €{doc.consultation_fee}
                        </span>
                        <span className="px-2 py-0.5 bg-green-50 text-green-600 text-xs rounded-full font-semibold">
                          Available
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <Button fullWidth className="mt-5"
                disabled={!selectedDoctor} onClick={() => setStep(2)}>
                Continue →
              </Button>
            </Card>
          )}

          {/* STEP 2 — date + time */}
          {step === 2 && (
            <>
              <Card title="Select Date" subtitle="GET /api/doctors/:id/slots">
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {DATES.map((d) => (
                    <div key={d.iso}
                      onClick={() => { setSelectedDate(d); setSelectedTime(null); }}
                      className={`flex-shrink-0 w-16 py-3 rounded-xl text-center border-2
                        cursor-pointer transition-all ${
                          selectedDate?.iso === d.iso
                            ? 'border-ink bg-ink text-white'
                            : 'border-gray-200 hover:border-gray-400'}`}>
                      <p className={`text-xs font-bold uppercase ${
                        selectedDate?.iso === d.iso ? 'text-gray-300' : 'text-gray-400'}`}>
                        {d.day}
                      </p>
                      <p className={`font-serif text-lg font-semibold ${
                        selectedDate?.iso === d.iso ? 'text-white' : 'text-ink'}`}>
                        {d.date}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>

              <Card title="Available Time Slots">
                {slotsLoading ? (
                  <div className="flex justify-center py-6">
                    <LoadingSpinner inline size="md" />
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {slots.map((s) => (
                      <div key={s.time}
                        onClick={() => !s.booked && setSelectedTime(s.time)}
                        className={`py-3 rounded-xl text-center text-sm font-semibold
                          transition-all ${
                            s.booked
                              ? 'bg-gray-100 text-gray-300 cursor-not-allowed line-through'
                              : selectedTime === s.time
                                ? 'bg-ink text-white'
                                : 'border-2 border-gray-200 hover:border-gray-400 cursor-pointer'}`}>
                        {s.time}
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)}>← Back</Button>
                <Button disabled={!selectedDate || !selectedTime}
                  onClick={() => setStep(3)}>
                  Continue →
                </Button>
              </div>
            </>
          )}

          {/* STEP 3 — consultation type + notes */}
          {step === 3 && (
            <>
              <Card title="Consultation Type">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {['Video Call', 'In-Person Visit'].map((t) => (
                    <div key={t}
                      onClick={() => setSelectedType(t)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedType === t
                          ? 'border-ink bg-gray-50'
                          : 'border-gray-200 hover:border-gray-400'}`}>
                      <p className="font-semibold text-sm">{t}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {t === 'Video Call'
                          ? 'Secure call via Azure Communication Services'
                          : 'In-clinic consultation'}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>

              <Card title="Notes (optional)">
                <textarea
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Describe your symptoms or reason for visit…"
                  className="w-full p-3 border-2 border-gray-200 rounded-xl
                    focus:border-teal-500 outline-none resize-y text-sm"
                />
              </Card>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)}>← Back</Button>
                <Button onClick={() => setStep(4)}>Review Booking →</Button>
              </div>
            </>
          )}

          {/* STEP 4 — review (BUG FIX: this was missing, causing blank left column) */}
          {step === 4 && (
            <Card title="Review Your Booking">
              <p className="text-sm text-gray-500 mb-5">
                Please review the booking details in the summary panel. When you're
                ready, click <strong>Confirm Appointment</strong>.
              </p>

              <div className="space-y-3 mb-6">
                {[
                  ['Doctor',   selectedDoctor?.name    || '—'],
                  ['Date',     selectedDate?.full       || '—'],
                  ['Time',     selectedTime             || '—'],
                  ['Type',     selectedType],
                  ['Fee',      `€${selectedDoctor?.consultation_fee ?? '—'}`],
                  ['Notes',    notes || 'None provided'],
                ].map(([k, v]) => (
                  <div key={k}
                    className="flex justify-between items-start p-3 bg-gray-50
                      rounded-xl border border-gray-100 text-sm">
                    <span className="text-gray-400 font-medium">{k}</span>
                    <span className="font-semibold text-ink text-right max-w-[60%]">{v}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(3)}>← Back</Button>
                <Button loading={loading} onClick={handleConfirm}>
                  Confirm Appointment
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* ── Right column — summary ── */}
        <div>
          <Summary />
        </div>
      </div>
    </Layout>
  );
};

export default BookAppointment;
