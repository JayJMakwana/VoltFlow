import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';

export default function Bill() {

  const { bookingID } = useParams();
  const navigate = useNavigate();

  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const fetchBill = async () => {

      try {

        const response = await API.get(
          `/payments/bill/${bookingID}`
        );

        setBill(response.data.data);

      } catch (error) {

        alert(
          error.response?.data?.message ||
          'Failed to load bill'
        );

      } finally {

        setLoading(false);

      }
    };

    fetchBill();

  }, [bookingID]);


  if (loading) {
    return (
      <div style={{ padding: '30px' }}>
        Loading bill...
      </div>
    );
  }


  if (!bill) {
    return (
      <div style={{ padding: '30px' }}>
        Bill not found.
      </div>
    );
  }


  const booking = bill.bookingID;


  return (
    <div
      style={{
        maxWidth: '700px',
        margin: '30px auto',
        padding: '25px',
        fontFamily: 'sans-serif',
        border: '1px solid #cbd5e1',
        borderRadius: '10px',
        background: '#ffffff'
      }}
    >

      <h2
        style={{
          textAlign: 'center',
          color: '#0f172a'
        }}
      >
        VOLTFLOW
      </h2>

      <h3
        style={{
          textAlign: 'center',
          color: '#2563eb'
        }}
      >
        Charging Bill
      </h3>


      <hr />


      <div style={{ lineHeight: '1.8' }}>

        <p>
          <strong>Station:</strong>{' '}
          {booking.stationID?.stationName}
        </p>

        <p>
          <strong>Address:</strong>{' '}
          {booking.stationID?.address}
        </p>

        <p>
          <strong>Date:</strong>{' '}
          {booking.bookingDate}
        </p>

        <p>
          <strong>Time:</strong>{' '}
          {booking.startTime} - {booking.endTime}
        </p>

        <p>
          <strong>Vehicle:</strong>{' '}
          {booking.chargerID?.vehicleType}
        </p>

        <p>
          <strong>Charging Speed:</strong>{' '}
          {booking.chargerID?.chargingSpeed}
        </p>

      </div>


      <hr />


      <div style={{ lineHeight: '2' }}>

        <p>
          <strong>Base Amount:</strong>{' '}
          ₹{bill.amount.toFixed(2)}
        </p>

        <p>
          <strong>Tax ({bill.taxRate}%):</strong>{' '}
          ₹{bill.taxAmount.toFixed(2)}
        </p>

        <hr />

        <p
          style={{
            fontSize: '20px',
            fontWeight: 'bold'
          }}
        >
          Total Amount:{' '}
          ₹{bill.totalAmount.toFixed(2)}
        </p>

      </div>


      <p
        style={{
          color: '#16a34a',
          fontWeight: 'bold'
        }}
      >
        Payment: {bill.paymentStatus}
      </p>


      <p>
        <strong>Transaction ID:</strong>{' '}
        {bill.transactionID}
      </p>


      <p
        style={{
          color: '#16a34a',
          fontWeight: '600'
        }}
      >
        ✓ Bill Generated
      </p>


      <div
        style={{
          display: 'flex',
          gap: '10px',
          marginTop: '25px'
        }}
      >

        <button
          onClick={() => navigate(-1)}
          style={{
            flex: 1,
            padding: '10px',
            background: '#64748b',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Back
        </button>

        <button
          onClick={() =>
            navigate(
              `/feedback/${booking.stationID?._id}`,
              {
                state: {
                  booking: booking
                }
              }
            )
          }
          style={{
            flex: 1,
            padding: '10px',
            background: '#f59e0b',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Give Feedback
        </button>

      </div>

    </div>
  );
}