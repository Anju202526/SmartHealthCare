import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { FaShieldAlt, FaEnvelope, FaPhone, FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/forms/Input';
import Select from '../../components/forms/Select';
import { useAuth } from '../../context/AuthContext';
import patientService from '../../services/patientService';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const GENDERS     = ['Male', 'Female', 'Other', 'Prefer not to say'];

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    first_name: 'Sarah',
    last_name:  'Murphy',
    email:      'sarah.murphy@gmail.com',
    phone:      '0871234567',
    dob:        '1990-03-15',
    gender:     'Female',
    blood_type: 'A+',
    address:    '14 Oak Street, Dublin 4',
    allergies:  'Penicillin, Pollen',
  });

  const set = (field) => (e) => setProfile((p) => ({ ...p, [field]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await patientService.updateProfile(profile);
      updateUser({ ...user, name: `${profile.first_name} ${profile.last_name}` });
      toast.success('Profile saved to Azure SQL');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="My Profile">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <form onSubmit={handleSave} className="lg:col-span-2">
          <Card>
            <h2 className="font-semibold mb-1">Personal Information</h2>
            <p className="text-xs text-gray-400 mb-5">PUT /api/patients/profile · Azure SQL</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="First Name" name="first_name" value={profile.first_name}
                onChange={set('first_name')} required />
              <Input label="Last Name"  name="last_name"  value={profile.last_name}
                onChange={set('last_name')} required />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <Input label="Email" name="email" type="email" value={profile.email}
                onChange={set('email')} icon={<FaEnvelope />} required />
              <Input label="Phone" name="phone" value={profile.phone}
                onChange={set('phone')} icon={<FaPhone />} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <Input label="Date of Birth" name="dob" type="date" value={profile.dob}
                onChange={set('dob')} icon={<FaCalendarAlt />} />
              <Select label="Gender" name="gender" value={profile.gender}
                onChange={set('gender')} options={GENDERS} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <Select label="Blood Type" name="blood_type" value={profile.blood_type}
                onChange={set('blood_type')} options={BLOOD_TYPES} />
              <Input label="Address" name="address" value={profile.address}
                onChange={set('address')} icon={<FaMapMarkerAlt />} />
            </div>

            <div className="mt-4">
              <Input label="Allergies" name="allergies" value={profile.allergies}
                onChange={set('allergies')} placeholder="e.g. Penicillin, Pollen" />
            </div>

            <Button type="submit" fullWidth className="mt-6" loading={loading}>
              Save Changes
            </Button>
          </Card>
        </form>

        {/* Right column */}
        <div className="space-y-6">
          {/* Security */}
          <Card title="Account Security" subtitle="Azure AD B2C">
            <div className="space-y-2">
              {[
                ['Azure AD B2C',  'Connected', true],
                ['Two-Factor Auth','Enabled',  true],
                ['GDPR Consent',  'Granted',   true],
                ['Plan',          'Premium',   false],
              ].map(([k, v, green]) => (
                <div key={k}
                  className="flex justify-between items-center p-2.5 bg-gray-50 rounded-xl text-sm">
                  <span>{k}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    green ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                    {v}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 p-3 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex gap-2 text-blue-700 text-xs leading-relaxed">
                <FaShieldAlt className="flex-shrink-0 mt-0.5" />
                <span>Multi-factor authentication enabled. Your account is secure.</span>
              </div>
            </div>
          </Card>

          {/* Stats */}
          <Card title="Statistics">
            <div className="grid grid-cols-2 gap-3">
              {[['12','Total Visits'],['3','Doctors'],['7','Reports'],['4','Prescriptions']].map(
                ([val, lbl]) => (
                  <div key={lbl} className="text-center p-3 bg-gray-50 rounded-xl">
                    <p className="font-serif text-2xl font-bold text-teal-600">{val}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{lbl}</p>
                  </div>
                )
              )}
            </div>
          </Card>

          {/* Avatar card */}
          <Card>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700
                flex items-center justify-center text-white text-lg font-bold">
                {profile.first_name[0]}{profile.last_name[0]}
              </div>
              <div>
                <p className="font-semibold">{profile.first_name} {profile.last_name}</p>
                <p className="text-xs text-gray-400">Patient ID: SC-10482</p>
                <p className="text-xs text-gray-400">Member since: Jan 2024</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
