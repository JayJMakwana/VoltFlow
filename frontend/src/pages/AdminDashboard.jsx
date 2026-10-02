import { useEffect, useState } from 'react';
import API from '../api/axios';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [stations, setStations] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [report, setReport] = useState(null);
  const [chargers, setChargers] = useState([]);

  const [editingUser, setEditingUser] = useState(null);
  const [editingStation, setEditingStation] = useState(null);
  const [editingCharger, setEditingCharger] = useState(null);

  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    vehicleType: '',
    businessName: '',
    businessAddress: ''
  });

  const [stationForm, setStationForm] = useState({
    stationName: '',
    address: '',
    latitude: '',
    longitude: '',
    openingTime: '09:00',
    closingTime: '21:00'
  });

  const [chargerForm, setChargerForm] = useState({
    vehicleType: '',
    chargingSpeed: '',
    pricePerKwh: '',
    quantity: '',
    chargingDuration: '',
    status: 'Available'
  });

  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);

      const [
        statsResponse,
        usersResponse,
        stationsResponse,
        bookingsResponse,
        reportResponse,
        chargersResponse
      ] = await Promise.all([
        API.get('/admin/dashboard'),
        API.get('/admin/users'),
        API.get('/admin/stations'),
        API.get('/admin/bookings'),
        API.get('/admin/reports'),
        API.get('/admin/chargers')
      ]);

      setStats(statsResponse.data.data || {});
      setUsers(usersResponse.data.data || []);
      setStations(stationsResponse.data.data || []);
      setBookings(bookingsResponse.data.data || []);
      setReport(reportResponse.data.data || {});
      setChargers(chargersResponse.data.data || []);
    } catch (error) {
      console.error(
        'Admin dashboard error:',
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
          'Failed to load admin dashboard'
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // DELETE STATION
  // =====================================================

  const handleDeleteStation = async (stationID) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to permanently delete this station?'
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await API.delete(`/admin/stations/${stationID}`);

      alert('Station deleted successfully');

      loadAdminData();
    } catch (error) {
      console.error(
        'Delete station error:',
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
          'Failed to delete station'
      );
    }
  };

  // =====================================================
  // USER EDIT
  // =====================================================

  const handleEditUser = (user) => {
    setEditingUser(user);

    setUserForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || 'EVUser',
      vehicleType: user.vehicleType || '',
      businessName: user.businessName || '',
      businessAddress: user.businessAddress || ''
    });
  };

  const handleUpdateUser = async () => {
    try {
      if (!userForm.name.trim()) {
        alert('Name is required');
        return;
      }

      if (!userForm.email.trim()) {
        alert('Email is required');
        return;
      }

      if (!userForm.phone.trim()) {
        alert('Phone is required');
        return;
      }

      await API.put(
        `/admin/users/${editingUser._id}`,
        {
          name: userForm.name.trim(),
          email: userForm.email.trim(),
          phone: userForm.phone.trim(),
          role: userForm.role,
          vehicleType:
            userForm.role === 'EVUser'
              ? userForm.vehicleType.trim()
              : '',
          businessName:
            userForm.role === 'StationOwner'
              ? userForm.businessName.trim()
              : '',
          businessAddress:
            userForm.role === 'StationOwner'
              ? userForm.businessAddress.trim()
              : ''
        }
      );

      alert('User updated successfully');

      setEditingUser(null);

      loadAdminData();
    } catch (error) {
      console.error(
        'Update user error:',
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
          'Failed to update user'
      );
    }
  };

  // =====================================================
  // STATION EDIT
  // =====================================================

  const handleEditStation = (station) => {
    setEditingStation(station);

    setStationForm({
      stationName: station.stationName || '',
      address: station.address || '',
      latitude:
        station.latitude !== undefined
          ? station.latitude
          : '',
      longitude:
        station.longitude !== undefined
          ? station.longitude
          : '',
      openingTime: station.openingTime || '09:00',
      closingTime: station.closingTime || '21:00'
    });
  };

  const handleUpdateStation = async () => {
    try {
      if (!stationForm.stationName.trim()) {
        alert('Station name is required');
        return;
      }

      if (!stationForm.address.trim()) {
        alert('Address is required');
        return;
      }

      if (
        stationForm.latitude === '' ||
        isNaN(Number(stationForm.latitude))
      ) {
        alert('Valid latitude is required');
        return;
      }

      if (
        stationForm.longitude === '' ||
        isNaN(Number(stationForm.longitude))
      ) {
        alert('Valid longitude is required');
        return;
      }

      await API.put(
        `/admin/stations/${editingStation._id}`,
        {
          stationName: stationForm.stationName.trim(),
          address: stationForm.address.trim(),
          latitude: Number(stationForm.latitude),
          longitude: Number(stationForm.longitude),
          openingTime: stationForm.openingTime,
          closingTime: stationForm.closingTime
        }
      );

      alert('Station updated successfully');

      setEditingStation(null);

      loadAdminData();
    } catch (error) {
      console.error(
        'Update station error:',
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
          'Failed to update station'
      );
    }
  };

  // =====================================================
  // CHARGER EDIT
  // =====================================================

  const handleEditCharger = (charger) => {
    setEditingCharger(charger);

    setChargerForm({
      vehicleType: charger.vehicleType || '',
      chargingSpeed: charger.chargingSpeed || '',
      pricePerKwh:
        charger.pricePerKwh !== undefined
          ? charger.pricePerKwh
          : '',
      quantity:
        charger.quantity !== undefined
          ? charger.quantity
          : '',
      chargingDuration:
        charger.chargingDuration !== undefined
          ? charger.chargingDuration
          : '',
      status: charger.status || 'Available'
    });
  };

  const handleUpdateCharger = async () => {
    try {
      if (!chargerForm.vehicleType.trim()) {
        alert('Vehicle type is required');
        return;
      }

      if (!chargerForm.chargingSpeed.trim()) {
        alert('Charging speed is required');
        return;
      }

      if (
        chargerForm.pricePerKwh === '' ||
        Number(chargerForm.pricePerKwh) <= 0
      ) {
        alert('Price per kWh must be greater than 0');
        return;
      }

      if (
        chargerForm.quantity === '' ||
        Number(chargerForm.quantity) <= 0
      ) {
        alert('Quantity must be greater than 0');
        return;
      }

      if (
        chargerForm.chargingDuration === '' ||
        Number(chargerForm.chargingDuration) <= 0
      ) {
        alert('Charging duration must be greater than 0');
        return;
      }

      await API.put(
        `/admin/chargers/${editingCharger._id}`,
        {
          vehicleType:
            chargerForm.vehicleType.trim(),
          chargingSpeed:
            chargerForm.chargingSpeed.trim(),
          pricePerKwh:
            Number(chargerForm.pricePerKwh),
          quantity:
            Number(chargerForm.quantity),
          chargingDuration:
            Number(chargerForm.chargingDuration),
          status: chargerForm.status
        }
      );

      alert('Charger updated successfully');

      setEditingCharger(null);

      loadAdminData();
    } catch (error) {
      console.error(
        'Update charger error:',
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
          'Failed to update charger'
      );
    }
  };

  // =====================================================
  // DELETE CHARGER
  // =====================================================

  const handleDeleteCharger = async (chargerID) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to permanently delete this charger?'
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await API.delete(
        `/admin/chargers/${chargerID}`
      );

      alert('Charger deleted successfully');

      loadAdminData();
    } catch (error) {
      console.error(
        'Delete charger error:',
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
          'Failed to delete charger'
      );
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div
        style={{
          padding: '40px',
          textAlign: 'center'
        }}
      >
        <h2>Loading Admin Dashboard...</h2>
      </div>
    );
  }

  // =====================================================
  // MAIN
  // =====================================================

  return (
    <div
      style={{
        maxWidth: '1400px',
        margin: '0 auto',
        fontFamily: 'Arial, sans-serif'
      }}
    >
      <h1
        style={{
          marginBottom: '10px'
        }}
      >
        Admin Dashboard
      </h1>

      <p
        style={{
          color: '#64748b',
          marginBottom: '25px'
        }}
      >
        VOLTFLOW system administration and monitoring
      </p>

      {/* ================================================= */}
      {/* NAVIGATION */}
      {/* ================================================= */}

      <div
        style={{
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap',
          marginBottom: '25px'
        }}
      >
        <button
          onClick={() => setActiveTab('overview')}
          style={tabStyle(
            activeTab === 'overview'
          )}
        >
          Overview
        </button>

        <button
          onClick={() => setActiveTab('users')}
          style={tabStyle(
            activeTab === 'users'
          )}
        >
          Users
        </button>

        <button
          onClick={() => setActiveTab('stations')}
          style={tabStyle(
            activeTab === 'stations'
          )}
        >
          Stations
        </button>

        <button
          onClick={() => setActiveTab('chargers')}
          style={tabStyle(
            activeTab === 'chargers'
          )}
        >
          Chargers
        </button>

        <button
          onClick={() => setActiveTab('bookings')}
          style={tabStyle(
            activeTab === 'bookings'
          )}
        >
          Bookings
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          style={tabStyle(
            activeTab === 'reports'
          )}
        >
          Reports
        </button>
      </div>

      {/* ================================================= */}
      {/* OVERVIEW */}
      {/* ================================================= */}

      {activeTab === 'overview' && stats && (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '15px',
              marginBottom: '25px'
            }}
          >
            <StatCard
              title="Total Users"
              value={stats.users?.total || 0}
            />

            <StatCard
              title="EV Users"
              value={stats.users?.evUsers || 0}
            />

            <StatCard
              title="Station Owners"
              value={stats.users?.owners || 0}
            />

            <StatCard
              title="Stations"
              value={stats.stations || 0}
            />

            <StatCard
              title="Chargers"
              value={stats.chargers || 0}
            />

            <StatCard
              title="Total Bookings"
              value={stats.bookings?.total || 0}
            />

            <StatCard
              title="Completed Bookings"
              value={
                stats.bookings?.completed || 0
              }
            />

            <StatCard
              title="Revenue"
              value={`₹${
                stats.payments?.revenue || 0
              }`}
            />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px'
            }}
          >
            <InfoCard title="Booking Status">
              <p>
                Pending:{' '}
                {stats.bookings?.pending || 0}
              </p>

              <p>
                Confirmed:{' '}
                {stats.bookings?.confirmed || 0}
              </p>

              <p>
                In Progress:{' '}
                {stats.bookings?.inProgress || 0}
              </p>

              <p>
                Completed:{' '}
                {stats.bookings?.completed || 0}
              </p>

              <p>
                Cancelled:{' '}
                {stats.bookings?.cancelled || 0}
              </p>
            </InfoCard>

            <InfoCard title="Payment Information">
              <p>
                Total Payments:{' '}
                {stats.payments?.total || 0}
              </p>

              <p>
                Completed Payments:{' '}
                {stats.payments?.completed || 0}
              </p>

              <p>
                Revenue: ₹
                {stats.payments?.revenue || 0}
              </p>
            </InfoCard>

            <InfoCard title="Feedback">
              <p>
                Total Feedback:{' '}
                {stats.feedback?.total || 0}
              </p>

              <p>
                Average Rating:{' '}
                {stats.feedback?.averageRating || 0}
                {' / 5'}
              </p>
            </InfoCard>
          </div>
        </>
      )}

      {/* ================================================= */}
      {/* USERS */}
      {/* ================================================= */}

      {activeTab === 'users' && (
        <InfoCard title="All Users">
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse'
              }}
            >
              <thead>
                <tr>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Phone</th>
                  <th style={thStyle}>Role</th>
                  <th style={thStyle}>Created</th>
                  <th style={thStyle}>Action</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td style={tdStyle}>
                      {user.name}
                    </td>

                    <td style={tdStyle}>
                      {user.email}
                    </td>

                    <td style={tdStyle}>
                      {user.phone}
                    </td>

                    <td style={tdStyle}>
                      {user.role}
                    </td>

                    <td style={tdStyle}>
                      {user.createdAt
                        ? new Date(
                            user.createdAt
                          ).toLocaleDateString()
                        : '-'}
                    </td>

                    <td style={tdStyle}>
                      <button
                        onClick={() =>
                          handleEditUser(user)
                        }
                        style={editButtonStyle}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </InfoCard>
      )}

      {/* ================================================= */}
      {/* STATIONS */}
      {/* ================================================= */}

      {activeTab === 'stations' && (
        <InfoCard title="All Charging Stations">
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse'
              }}
            >
              <thead>
                <tr>
                  <th style={thStyle}>
                    Station
                  </th>

                  <th style={thStyle}>
                    Address
                  </th>

                  <th style={thStyle}>
                    Owner
                  </th>

                  <th style={thStyle}>
                    Email
                  </th>

                  <th style={thStyle}>
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {stations.map((station) => (
                  <tr key={station._id}>
                    <td style={tdStyle}>
                      {station.stationName}
                    </td>

                    <td style={tdStyle}>
                      {station.address}
                    </td>

                    <td style={tdStyle}>
                      {station.ownerID?.name ||
                        'Unknown'}
                    </td>

                    <td style={tdStyle}>
                      {station.ownerID?.email ||
                        '-'}
                    </td>

                    <td style={tdStyle}>
                      <button
                        onClick={() =>
                          handleEditStation(
                            station
                          )
                        }
                        style={editButtonStyle}
                      >
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          handleDeleteStation(
                            station._id
                          )
                        }
                        style={deleteButtonStyle}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </InfoCard>
      )}

      {/* ================================================= */}
      {/* CHARGERS */}
      {/* ================================================= */}

      {activeTab === 'chargers' && (
        <InfoCard title="All Chargers">
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse'
              }}
            >
              <thead>
                <tr>
                  <th style={thStyle}>
                    Station
                  </th>

                  <th style={thStyle}>
                    Vehicle
                  </th>

                  <th style={thStyle}>
                    Speed
                  </th>

                  <th style={thStyle}>
                    Price/kWh
                  </th>

                  <th style={thStyle}>
                    Quantity
                  </th>

                  <th style={thStyle}>
                    Duration
                  </th>

                  <th style={thStyle}>
                    Status
                  </th>

                  <th style={thStyle}>
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {chargers.map((charger) => (
                  <tr key={charger._id}>
                    <td style={tdStyle}>
                      {charger.stationID
                        ?.stationName ||
                        'Unknown'}
                    </td>

                    <td style={tdStyle}>
                      {charger.vehicleType}
                    </td>

                    <td style={tdStyle}>
                      {charger.chargingSpeed}
                    </td>

                    <td style={tdStyle}>
                      ₹{charger.pricePerKwh}
                    </td>

                    <td style={tdStyle}>
                      {charger.quantity}
                    </td>

                    <td style={tdStyle}>
                      {charger.chargingDuration} min
                    </td>

                    <td style={tdStyle}>
                      {charger.status}
                    </td>

                    <td style={tdStyle}>
                      <button
                        onClick={() =>
                          handleEditCharger(
                            charger
                          )
                        }
                        style={editButtonStyle}
                      >
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          handleDeleteCharger(
                            charger._id
                          )
                        }
                        style={deleteButtonStyle}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </InfoCard>
      )}

      {/* ================================================= */}
      {/* BOOKINGS */}
      {/* ================================================= */}

      {activeTab === 'bookings' && (
        <InfoCard title="All Bookings">
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse'
              }}
            >
              <thead>
                <tr>
                  <th style={thStyle}>User</th>
                  <th style={thStyle}>Station</th>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Time</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Payment</th>
                </tr>
              </thead>

              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking._id}>
                    <td style={tdStyle}>
                      {booking.userID?.name ||
                        'Unknown'}
                    </td>

                    <td style={tdStyle}>
                      {booking.stationID
                        ?.stationName ||
                        'Unknown'}
                    </td>

                    <td style={tdStyle}>
                      {booking.bookingDate}
                    </td>

                    <td style={tdStyle}>
                      {booking.startTime}
                      {' - '}
                      {booking.endTime}
                    </td>

                    <td style={tdStyle}>
                      {booking.bookingStatus}
                    </td>

                    <td style={tdStyle}>
                      {booking.paymentID
                        ?.paymentStatus ||
                        'Pending'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </InfoCard>
      )}

      {/* ================================================= */}
      {/* REPORTS */}
      {/* ================================================= */}

      {activeTab === 'reports' && report && (
        <>
          <InfoCard title="System-wide Reports">
            <h3>Total Revenue</h3>

            <p
              style={{
                fontSize: '28px',
                fontWeight: 'bold'
              }}
            >
              ₹{report.totalRevenue || 0}
            </p>
          </InfoCard>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px',
              marginTop: '20px'
            }}
          >
            <InfoCard title="Users By Role">
              {report.usersByRole?.length === 0 ? (
                <p>No data available.</p>
              ) : (
                report.usersByRole?.map(
                  (item) => (
                    <p key={item._id}>
                      <strong>
                        {item._id}
                      </strong>
                      : {item.count}
                    </p>
                  )
                )
              )}
            </InfoCard>

            <InfoCard title="Bookings By Status">
              {report.bookingsByStatus?.length ===
              0 ? (
                <p>No data available.</p>
              ) : (
                report.bookingsByStatus?.map(
                  (item) => (
                    <p key={item._id}>
                      <strong>
                        {item._id}
                      </strong>
                      : {item.count}
                    </p>
                  )
                )
              )}
            </InfoCard>
          </div>

          <InfoCard title="Last 7 Days Booking Report">
            {!report.bookingTrend ||
            report.bookingTrend.length === 0 ? (
              <p>
                No booking data available.
              </p>
            ) : (
              report.bookingTrend.map((item) => (
                <div
                  key={item._id}
                  style={{
                    display: 'flex',
                    justifyContent:
                      'space-between',
                    padding: '10px',
                    borderBottom:
                      '1px solid #e2e8f0'
                  }}
                >
                  <span>{item._id}</span>

                  <strong>
                    {item.count} bookings
                  </strong>
                </div>
              ))
            )}
          </InfoCard>

          <InfoCard title="Last 7 Days Revenue Report">
            {!report.revenueTrend ||
            report.revenueTrend.length === 0 ? (
              <p>
                No revenue data available.
              </p>
            ) : (
              report.revenueTrend.map((item) => (
                <div
                  key={item._id}
                  style={{
                    display: 'flex',
                    justifyContent:
                      'space-between',
                    padding: '10px',
                    borderBottom:
                      '1px solid #e2e8f0'
                  }}
                >
                  <span>{item._id}</span>

                  <strong>
                    ₹
                    {Number(
                      item.revenue || 0
                    ).toFixed(2)}
                  </strong>
                </div>
              ))
            )}
          </InfoCard>
        </>
      )}

      {/* ================================================= */}
      {/* EDIT USER MODAL */}
      {/* ================================================= */}

      {editingUser && (
        <div style={modalOverlayStyle}>
          <div style={modalStyle}>
            <h2>Edit User</h2>

            <label>Name</label>

            <input
              style={modalInputStyle}
              value={userForm.name}
              onChange={(e) =>
                setUserForm({
                  ...userForm,
                  name: e.target.value
                })
              }
            />

            <label>Email</label>

            <input
              type="email"
              style={modalInputStyle}
              value={userForm.email}
              onChange={(e) =>
                setUserForm({
                  ...userForm,
                  email: e.target.value
                })
              }
            />

            <label>Phone</label>

            <input
              style={modalInputStyle}
              value={userForm.phone}
              onChange={(e) =>
                setUserForm({
                  ...userForm,
                  phone: e.target.value
                })
              }
            />

            <label>Role</label>

            <select
              style={modalInputStyle}
              value={userForm.role}
              onChange={(e) =>
                setUserForm({
                  ...userForm,
                  role: e.target.value
                })
              }
            >
              <option value="EVUser">
                EV User
              </option>

              <option value="StationOwner">
                Station Owner
              </option>

              <option value="Admin">
                Admin
              </option>
            </select>

            {userForm.role === 'EVUser' && (
              <>
                <label>Vehicle Type</label>

                <input
                  style={modalInputStyle}
                  value={userForm.vehicleType}
                  onChange={(e) =>
                    setUserForm({
                      ...userForm,
                      vehicleType:
                        e.target.value
                    })
                  }
                />
              </>
            )}

            {userForm.role ===
              'StationOwner' && (
              <>
                <label>
                  Business Name
                </label>

                <input
                  style={modalInputStyle}
                  value={
                    userForm.businessName
                  }
                  onChange={(e) =>
                    setUserForm({
                      ...userForm,
                      businessName:
                        e.target.value
                    })
                  }
                />

                <label>
                  Business Address
                </label>

                <textarea
                  style={modalInputStyle}
                  value={
                    userForm.businessAddress
                  }
                  onChange={(e) =>
                    setUserForm({
                      ...userForm,
                      businessAddress:
                        e.target.value
                    })
                  }
                />
              </>
            )}

            <div
              style={
                modalButtonContainerStyle
              }
            >
              <button
                onClick={handleUpdateUser}
                style={saveButtonStyle}
              >
                Save Changes
              </button>

              <button
                onClick={() =>
                  setEditingUser(null)
                }
                style={cancelButtonStyle}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================= */}
      {/* EDIT STATION MODAL */}
      {/* ================================================= */}

      {editingStation && (
        <div style={modalOverlayStyle}>
          <div style={modalStyle}>
            <h2>
              Edit Charging Station
            </h2>

            <label>Station Name</label>

            <input
              style={modalInputStyle}
              value={
                stationForm.stationName
              }
              onChange={(e) =>
                setStationForm({
                  ...stationForm,
                  stationName:
                    e.target.value
                })
              }
            />

            <label>Address</label>

            <textarea
              style={modalInputStyle}
              value={stationForm.address}
              onChange={(e) =>
                setStationForm({
                  ...stationForm,
                  address: e.target.value
                })
              }
            />

            <label>Latitude</label>

            <input
              type="number"
              step="any"
              style={modalInputStyle}
              value={stationForm.latitude}
              onChange={(e) =>
                setStationForm({
                  ...stationForm,
                  latitude:
                    e.target.value
                })
              }
            />

            <label>Longitude</label>

            <input
              type="number"
              step="any"
              style={modalInputStyle}
              value={
                stationForm.longitude
              }
              onChange={(e) =>
                setStationForm({
                  ...stationForm,
                  longitude:
                    e.target.value
                })
              }
            />

            <label>Opening Time</label>

            <input
              type="time"
              style={modalInputStyle}
              value={
                stationForm.openingTime
              }
              onChange={(e) =>
                setStationForm({
                  ...stationForm,
                  openingTime:
                    e.target.value
                })
              }
            />

            <label>Closing Time</label>

            <input
              type="time"
              style={modalInputStyle}
              value={
                stationForm.closingTime
              }
              onChange={(e) =>
                setStationForm({
                  ...stationForm,
                  closingTime:
                    e.target.value
                })
              }
            />

            <div
              style={
                modalButtonContainerStyle
              }
            >
              <button
                onClick={
                  handleUpdateStation
                }
                style={saveButtonStyle}
              >
                Save Changes
              </button>

              <button
                onClick={() =>
                  setEditingStation(null)
                }
                style={cancelButtonStyle}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================= */}
      {/* EDIT CHARGER MODAL */}
      {/* ================================================= */}

      {editingCharger && (
        <div style={modalOverlayStyle}>
          <div style={modalStyle}>
            <h2>Edit Charger</h2>

            <label>Vehicle Type</label>

            <input
              style={modalInputStyle}
              value={
                chargerForm.vehicleType
              }
              onChange={(e) =>
                setChargerForm({
                  ...chargerForm,
                  vehicleType:
                    e.target.value
                })
              }
            />

            <label>
              Charging Speed
            </label>

            <input
              style={modalInputStyle}
              value={
                chargerForm.chargingSpeed
              }
              onChange={(e) =>
                setChargerForm({
                  ...chargerForm,
                  chargingSpeed:
                    e.target.value
                })
              }
            />

            <label>
              Price Per kWh
            </label>

            <input
              type="number"
              step="any"
              style={modalInputStyle}
              value={
                chargerForm.pricePerKwh
              }
              onChange={(e) =>
                setChargerForm({
                  ...chargerForm,
                  pricePerKwh:
                    e.target.value
                })
              }
            />

            <label>Quantity</label>

            <input
              type="number"
              min="1"
              style={modalInputStyle}
              value={
                chargerForm.quantity
              }
              onChange={(e) =>
                setChargerForm({
                  ...chargerForm,
                  quantity:
                    e.target.value
                })
              }
            />

            <label>
              Charging Duration
              (minutes)
            </label>

            <input
              type="number"
              min="1"
              style={modalInputStyle}
              value={
                chargerForm.chargingDuration
              }
              onChange={(e) =>
                setChargerForm({
                  ...chargerForm,
                  chargingDuration:
                    e.target.value
                })
              }
            />

            <label>Status</label>

            <select
              style={modalInputStyle}
              value={chargerForm.status}
              onChange={(e) =>
                setChargerForm({
                  ...chargerForm,
                  status: e.target.value
                })
              }
            >
              <option value="Available">
                Available
              </option>

              <option value="Unavailable">
                Unavailable
              </option>

              <option value="Maintenance">
                Maintenance
              </option>
            </select>

            <div
              style={
                modalButtonContainerStyle
              }
            >
              <button
                onClick={
                  handleUpdateCharger
                }
                style={saveButtonStyle}
              >
                Save Changes
              </button>

              <button
                onClick={() =>
                  setEditingCharger(null)
                }
                style={cancelButtonStyle}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =====================================================
// STAT CARD
// =====================================================

function StatCard({ title, value }) {
  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
        padding: '20px',
        boxShadow:
          '0 2px 5px rgba(0,0,0,0.05)'
      }}
    >
      <p
        style={{
          margin: 0,
          color: '#64748b'
        }}
      >
        {title}
      </p>

      <h2
        style={{
          margin: '10px 0 0',
          color: '#0f172a'
        }}
      >
        {value}
      </h2>
    </div>
  );
}

// =====================================================
// INFO CARD
// =====================================================

function InfoCard({
  title,
  children
}) {
  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
        padding: '20px',
        marginBottom: '20px',
        boxShadow:
          '0 2px 5px rgba(0,0,0,0.05)'
      }}
    >
      <h2
        style={{
          marginTop: 0
        }}
      >
        {title}
      </h2>

      {children}
    </div>
  );
}

// =====================================================
// TAB STYLE
// =====================================================

function tabStyle(active) {
  return {
    padding: '10px 18px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    background: active
      ? '#2563eb'
      : '#e2e8f0',
    color: active
      ? 'white'
      : '#0f172a',
    fontWeight: 'bold'
  };
}

// =====================================================
// TABLE STYLES
// =====================================================

const thStyle = {
  textAlign: 'left',
  padding: '12px',
  background: '#f1f5f9',
  borderBottom:
    '1px solid #cbd5e1'
};

const tdStyle = {
  padding: '12px',
  borderBottom:
    '1px solid #e2e8f0'
};

// =====================================================
// BUTTON STYLES
// =====================================================

const editButtonStyle = {
  background: '#2563eb',
  color: 'white',
  border: 'none',
  padding: '8px 12px',
  borderRadius: '5px',
  cursor: 'pointer',
  marginRight: '8px'
};

const deleteButtonStyle = {
  background: '#dc2626',
  color: 'white',
  border: 'none',
  padding: '8px 12px',
  borderRadius: '5px',
  cursor: 'pointer'
};

// =====================================================
// MODAL STYLES
// =====================================================

const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
  padding: '20px'
};

const modalStyle = {
  background: 'white',
  width: '100%',
  maxWidth: '550px',
  maxHeight: '90vh',
  overflowY: 'auto',
  borderRadius: '10px',
  padding: '25px',
  boxSizing: 'border-box'
};

const modalInputStyle = {
  width: '100%',
  padding: '10px',
  marginTop: '6px',
  marginBottom: '15px',
  border:
    '1px solid #cbd5e1',
  borderRadius: '5px',
  boxSizing: 'border-box'
};

const modalButtonContainerStyle = {
  display: 'flex',
  gap: '10px',
  marginTop: '10px'
};

const saveButtonStyle = {
  background: '#16a34a',
  color: 'white',
  border: 'none',
  padding: '10px 18px',
  borderRadius: '5px',
  cursor: 'pointer',
  fontWeight: 'bold'
};

const cancelButtonStyle = {
  background: '#64748b',
  color: 'white',
  border: 'none',
  padding: '10px 18px',
  borderRadius: '5px',
  cursor: 'pointer'
};