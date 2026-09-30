import { Link, useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    const token = localStorage.getItem('token');

    if (token) {
      const role = localStorage.getItem('role');

      if (role === 'StationOwner') {
        navigate('/owner-dashboard');
      } else if (role === 'Admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/dashboard');
      }
    } else {
      navigate('/register');
    }
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 70px)',
        fontFamily: 'Arial, sans-serif',
        background: 'linear-gradient(135deg, #ecfdf5, #eff6ff)',
        color: '#1e293b'
      }}
    >
      {/* Hero Section */}
      <section
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '80px 30px 60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '50px',
          flexWrap: 'wrap'
        }}
      >
        {/* Left Content */}
        <div style={{ flex: '1 1 500px' }}>
          <div
            style={{
              display: 'inline-block',
              padding: '8px 15px',
              background: '#dcfce7',
              color: '#15803d',
              borderRadius: '30px',
              fontWeight: 'bold',
              fontSize: '14px',
              marginBottom: '20px'
            }}
          >
            ⚡ Smart EV Charging Platform
          </div>

          <h1
            style={{
              fontSize: 'clamp(3rem, 6vw, 5rem)',
              lineHeight: '1.05',
              margin: '0 0 20px',
              fontWeight: '800'
            }}
          >
            Power Your
            <br />
            <span style={{ color: '#16a34a' }}>
              Journey.
            </span>
          </h1>

          <p
            style={{
              fontSize: '1.2rem',
              lineHeight: '1.7',
              color: '#64748b',
              maxWidth: '600px',
              marginBottom: '30px'
            }}
          >
            Discover nearby EV charging stations, check charger
            availability, reserve your charging slot, and keep your
            electric journey moving with VoltFlow.
          </p>

          {/* Buttons */}
          <div
            style={{
              display: 'flex',
              gap: '15px',
              flexWrap: 'wrap'
            }}
          >
            <Link
              to="/stations"
              style={{
                padding: '14px 28px',
                background: '#16a34a',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '10px',
                fontWeight: 'bold',
                fontSize: '16px',
                boxShadow:
                  '0 8px 20px rgba(22, 163, 74, 0.25)'
              }}
            >
              ⚡ Find Chargers
            </Link>

            <button
              onClick={handleGetStarted}
              style={{
                padding: '14px 28px',
                background: 'white',
                color: '#1e293b',
                border: '1px solid #cbd5e1',
                borderRadius: '10px',
                fontWeight: 'bold',
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              Get Started →
            </button>
          </div>
        </div>

        {/* Right EV Illustration */}
        <div
          style={{
            flex: '1 1 400px',
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          <div
            style={{
              width: '360px',
              height: '360px',
              borderRadius: '50%',
              background:
                'linear-gradient(135deg, #bbf7d0, #bfdbfe)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow:
                '0 25px 60px rgba(15, 23, 42, 0.12)'
            }}
          >
            <div
              style={{
                width: '280px',
                height: '210px',
                borderRadius: '35px',
                background: 'white',
                boxShadow:
                  '0 20px 40px rgba(15, 23, 42, 0.15)',
                position: 'relative',
                padding: '25px',
                boxSizing: 'border-box'
              }}
            >
              {/* Car Windows */}
              <div
                style={{
                  width: '150px',
                  height: '55px',
                  background: '#dbeafe',
                  borderRadius:
                    '50px 50px 10px 10px',
                  margin: '0 auto 20px'
                }}
              />

              {/* Car Body */}
              <div
                style={{
                  height: '55px',
                  background: '#16a34a',
                  borderRadius: '20px'
                }}
              />

              {/* Wheels */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0 25px'
                }}
              >
                <div
                  style={{
                    width: '35px',
                    height: '35px',
                    background: '#1e293b',
                    borderRadius: '50%',
                    marginTop: '-5px'
                  }}
                />

                <div
                  style={{
                    width: '35px',
                    height: '35px',
                    background: '#1e293b',
                    borderRadius: '50%',
                    marginTop: '-5px'
                  }}
                />
              </div>

              {/* Lightning */}
              <div
                style={{
                  position: 'absolute',
                  right: '-30px',
                  top: '65px',
                  fontSize: '45px'
                }}
              >
                ⚡
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '30px 30px 70px'
        }}
      >
        <h2
          style={{
            textAlign: 'center',
            fontSize: '2rem',
            marginBottom: '35px'
          }}
        >
          Everything You Need for Smarter Charging
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px'
          }}
        >
          {/* Card 1 */}
          <div
            style={{
              background: 'white',
              padding: '25px',
              borderRadius: '15px',
              boxShadow:
                '0 10px 30px rgba(15, 23, 42, 0.08)'
            }}
          >
            <div style={{ fontSize: '35px' }}>📍</div>

            <h3>Find Stations</h3>

            <p
              style={{
                color: '#64748b',
                lineHeight: '1.6'
              }}
            >
              Discover EV charging stations and view available
              chargers.
            </p>
          </div>

          {/* Card 2 */}
          <div
            style={{
              background: 'white',
              padding: '25px',
              borderRadius: '15px',
              boxShadow:
                '0 10px 30px rgba(15, 23, 42, 0.08)'
            }}
          >
            <div style={{ fontSize: '35px' }}>🔋</div>

            <h3>Check Chargers</h3>

            <p
              style={{
                color: '#64748b',
                lineHeight: '1.6'
              }}
            >
              Check charger type, charging speed, and availability
              before booking.
            </p>
          </div>

          {/* Card 3 */}
          <div
            style={{
              background: 'white',
              padding: '25px',
              borderRadius: '15px',
              boxShadow:
                '0 10px 30px rgba(15, 23, 42, 0.08)'
            }}
          >
            <div style={{ fontSize: '35px' }}>📅</div>

            <h3>Reserve a Slot</h3>

            <p
              style={{
                color: '#64748b',
                lineHeight: '1.6'
              }}
            >
              Select your preferred date and time and reserve a
              charging slot.
            </p>
          </div>

          {/* Card 4 */}
          <div
            style={{
              background: 'white',
              padding: '25px',
              borderRadius: '15px',
              boxShadow:
                '0 10px 30px rgba(15, 23, 42, 0.08)'
            }}
          >
            <div style={{ fontSize: '35px' }}>🔐</div>

            <h3>Secure Booking</h3>

            <p
              style={{
                color: '#64748b',
                lineHeight: '1.6'
              }}
            >
              JWT-based authentication and role-based access keep
              your account secure.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section
        style={{
          background: '#0f172a',
          color: 'white',
          textAlign: 'center',
          padding: '55px 20px'
        }}
      >
        <h2
          style={{
            fontSize: '2rem',
            marginBottom: '10px'
          }}
        >
          Ready to charge smarter?
        </h2>

        <p
          style={{
            color: '#cbd5e1',
            marginBottom: '25px'
          }}
        >
          Find your charging station and reserve your slot with
          VoltFlow.
        </p>

        <button
          onClick={handleGetStarted}
          style={{
            display: 'inline-block',
            padding: '13px 28px',
            background: '#22c55e',
            color: '#052e16',
            border: 'none',
            textDecoration: 'none',
            borderRadius: '9px',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '15px'
          }}
        >
          Get Started →
        </button>
      </section>
    </div>
  );
}