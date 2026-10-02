import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

export default function OwnerEarnings() {
  const navigate = useNavigate();

  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await API.get('/payments/owner/earnings');

      setEarnings(response.data.data);
    } catch (error) {
      console.error('Failed to load earnings:', error);

      setError(
        error.response?.data?.message ||
        'Failed to load earnings'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, []);

  if (loading) {
    return (
      <div
        style={{
          maxWidth: '900px',
          margin: '50px auto',
          padding: '20px',
          textAlign: 'center',
          fontFamily: 'sans-serif'
        }}
      >
        <h2>Loading Earnings...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          maxWidth: '900px',
          margin: '50px auto',
          padding: '20px',
          fontFamily: 'sans-serif'
        }}
      >
        <h2
          style={{
            color: '#dc2626'
          }}
        >
          Unable to Load Earnings
        </h2>

        <p>{error}</p>

        <button
          onClick={fetchEarnings}
          style={{
            padding: '10px 18px',
            background: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600',
            marginRight: '10px'
          }}
        >
          Try Again
        </button>

        <button
          onClick={() => navigate('/owner-dashboard')}
          style={{
            padding: '10px 18px',
            background: '#64748b',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const payments = earnings?.payments || [];

  return (
    <div
      style={{
        maxWidth: '1000px',
        margin: '30px auto',
        fontFamily: 'sans-serif',
        padding: '0 20px'
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px',
          flexWrap: 'wrap',
          gap: '15px'
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              color: '#0f172a'
            }}
          >
            Owner Earnings
          </h2>

          <p
            style={{
              color: '#64748b',
              marginTop: '8px'
            }}
          >
            View your paid booking earnings and payment history.
          </p>
        </div>

        <button
          onClick={() => navigate('/owner-dashboard')}
          style={{
            padding: '10px 18px',
            background: '#64748b',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}
      >
        {/* Total Earnings */}
        <div
          style={{
            padding: '25px',
            borderRadius: '10px',
            background: '#eff6ff',
            border: '1px solid #bfdbfe'
          }}
        >
          <p
            style={{
              margin: 0,
              color: '#475569',
              fontSize: '0.9rem'
            }}
          >
            Total Earnings
          </p>

          <h2
            style={{
              margin: '10px 0 0 0',
              color: '#2563eb',
              fontSize: '2rem'
            }}
          >
            ₹{Number(earnings?.totalEarnings || 0).toFixed(2)}
          </h2>
        </div>

        {/* Completed Bookings */}
        <div
          style={{
            padding: '25px',
            borderRadius: '10px',
            background: '#f0fdf4',
            border: '1px solid #bbf7d0'
          }}
        >
          <p
            style={{
              margin: 0,
              color: '#475569',
              fontSize: '0.9rem'
            }}
          >
            Completed Bookings
          </p>

          <h2
            style={{
              margin: '10px 0 0 0',
              color: '#16a34a',
              fontSize: '2rem'
            }}
          >
            {earnings?.totalCompletedBookings || 0}
          </h2>
        </div>

        {/* Completed Payments */}
        <div
          style={{
            padding: '25px',
            borderRadius: '10px',
            background: '#fefce8',
            border: '1px solid #fde68a'
          }}
        >
          <p
            style={{
              margin: 0,
              color: '#475569',
              fontSize: '0.9rem'
            }}
          >
            Completed Payments
          </p>

          <h2
            style={{
              margin: '10px 0 0 0',
              color: '#ca8a04',
              fontSize: '2rem'
            }}
          >
            {payments.length}
          </h2>
        </div>
      </div>

      {/* Payment History */}
      <div
        style={{
          border: '1px solid #cbd5e1',
          borderRadius: '10px',
          overflow: 'hidden',
          background: '#ffffff'
        }}
      >
        <div
          style={{
            padding: '20px',
            background: '#f8fafc',
            borderBottom: '1px solid #cbd5e1'
          }}
        >
          <h3
            style={{
              margin: 0,
              color: '#0f172a'
            }}
          >
            Completed Payment History
          </h3>
        </div>

        {payments.length === 0 ? (
          <div
            style={{
              padding: '40px',
              textAlign: 'center',
              color: '#64748b'
            }}
          >
            <p>No completed payments found.</p>
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {payments.map((payment) => (
              <div
                key={payment._id}
                style={{
                  padding: '20px',
                  borderBottom: '1px solid #e2e8f0'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '20px',
                    flexWrap: 'wrap'
                  }}
                >
                  <div>
                    <h4
                      style={{
                        margin: '0 0 8px 0',
                        color: '#1e293b'
                      }}
                    >
                      Transaction
                    </h4>

                    <p
                      style={{
                        margin: '5px 0',
                        color: '#475569'
                      }}
                    >
                      <strong>Transaction ID:</strong>{' '}
                      {payment.transactionID}
                    </p>

                    <p
                      style={{
                        margin: '5px 0',
                        color: '#475569'
                      }}
                    >
                      <strong>Payment Status:</strong>{' '}
                      <span
                        style={{
                          color: '#16a34a',
                          fontWeight: '600'
                        }}
                      >
                        {payment.paymentStatus}
                      </span>
                    </p>

                    {payment.createdAt && (
                      <p
                        style={{
                          margin: '5px 0',
                          color: '#64748b',
                          fontSize: '0.9rem'
                        }}
                      >
                        <strong>Date:</strong>{' '}
                        {new Date(
                          payment.createdAt
                        ).toLocaleString()}
                      </p>
                    )}
                  </div>

                  <div
                    style={{
                      textAlign: 'right'
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        color: '#64748b',
                        fontSize: '0.85rem'
                      }}
                    >
                      Total Amount
                    </p>

                    <h3
                      style={{
                        margin: '5px 0',
                        color: '#2563eb'
                      }}
                    >
                      ₹
                      {Number(
                        payment.totalAmount ||
                        payment.amount ||
                        0
                      ).toFixed(2)}
                    </h3>
                  </div>
                </div>

                {/* Amount Breakdown */}
                <div
                  style={{
                    marginTop: '15px',
                    padding: '15px',
                    background: '#f8fafc',
                    borderRadius: '6px'
                  }}
                >
                  <p
                    style={{
                      margin: '5px 0',
                      color: '#475569'
                    }}
                  >
                    <strong>Base Amount:</strong> ₹
                    {Number(
                      payment.amount || 0
                    ).toFixed(2)}
                  </p>

                  <p
                    style={{
                      margin: '5px 0',
                      color: '#475569'
                    }}
                  >
                    <strong>
                      Tax ({payment.taxRate || 18}%):
                    </strong>{' '}
                    ₹
                    {Number(
                      payment.taxAmount || 0
                    ).toFixed(2)}
                  </p>

                  <p
                    style={{
                      margin: '5px 0',
                      color: '#0f172a',
                      fontWeight: 'bold'
                    }}
                  >
                    <strong>Total:</strong> ₹
                    {Number(
                      payment.totalAmount ||
                      payment.amount ||
                      0
                    ).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Refresh Button */}
      <div
        style={{
          marginTop: '25px',
          textAlign: 'center'
        }}
      >
        <button
          onClick={fetchEarnings}
          style={{
            padding: '10px 20px',
            background: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          🔄 Refresh Earnings
        </button>
      </div>
    </div>
  );
}