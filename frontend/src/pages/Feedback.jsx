import { useEffect, useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';

export default function Feedback() {
  const { stationId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const bookingFromState = location.state?.booking;

  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);

  const [selectedBooking, setSelectedBooking] = useState(
    bookingFromState?._id || ''
  );

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');

  const [loadingBookings, setLoadingBookings] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Fetch user's bookings
  const fetchBookings = async () => {
    try {
      setLoadingBookings(true);

      const response = await API.get('/bookings/my-bookings');

      const completedBookings = (response.data.data || []).filter(
        (booking) => booking.bookingStatus === 'Completed'
      );

      if (stationId) {
        const stationBookings = completedBookings.filter(
          (booking) =>
            booking.stationID?._id === stationId ||
            booking.stationID === stationId
        );

        setBookings(stationBookings);
      } else {
        setBookings(completedBookings);
      }
    } catch (error) {
      console.error(
        'Failed to load completed bookings:',
        error.response?.data || error.message
      );
    } finally {
      setLoadingBookings(false);
    }
  };

  // Fetch station reviews
  const fetchReviews = async () => {
    if (!stationId) {
      setLoadingReviews(false);
      return;
    }

    try {
      setLoadingReviews(true);

      const response = await API.get(
        `/feedback/station/${stationId}`
      );

      setReviews(response.data.data || []);
    } catch (error) {
      console.error(
        'Failed to load reviews:',
        error.response?.data || error.message
      );

      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchReviews();
  }, [stationId]);

  // Submit feedback
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedBooking) {
      alert('Please select a completed booking.');
      return;
    }

    if (rating < 1 || rating > 5) {
      alert('Please select a rating between 1 and 5 stars.');
      return;
    }

    if (!review.trim()) {
      alert('Please write your feedback.');
      return;
    }

    try {
      setSubmitting(true);

      const response = await API.post('/feedback', {
        bookingID: selectedBooking,
        rating: rating,
        review: review.trim()
      });

      alert(response.data.message || 'Feedback submitted successfully.');

      setRating(0);
      setHoverRating(0);
      setReview('');
      setSelectedBooking('');

      await fetchReviews();
      await fetchBookings();

    } catch (error) {
      alert(
        error.response?.data?.message ||
        'Failed to submit feedback.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getAverageRating = () => {
    if (reviews.length === 0) {
      return '0.0';
    }

    const total = reviews.reduce(
      (sum, item) => sum + Number(item.rating || 0),
      0
    );

    return (total / reviews.length).toFixed(1);
  };

  return (
    <div
      style={{
        maxWidth: '900px',
        margin: '30px auto',
        padding: '0 20px',
        fontFamily: 'sans-serif'
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '25px'
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              color: '#0f172a'
            }}
          >
            Station Reviews
          </h2>

          <p
            style={{
              color: '#64748b',
              marginTop: '6px'
            }}
          >
            Share your charging experience.
          </p>
        </div>

        <button
          onClick={() => navigate(-1)}
          style={{
            padding: '9px 15px',
            background: '#64748b',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Back
        </button>
      </div>

      {/* REVIEW SUMMARY */}
      <div
        style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
          padding: '20px',
          marginBottom: '25px',
          textAlign: 'center'
        }}
      >
        <div
          style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: '#0f172a'
          }}
        >
          {getAverageRating()}
        </div>

        <div
          style={{
            color: '#f59e0b',
            fontSize: '1.6rem',
            margin: '5px 0'
          }}
        >
          {'★'.repeat(Math.round(Number(getAverageRating())))}
          {'☆'.repeat(5 - Math.round(Number(getAverageRating())))}
        </div>

        <div
          style={{
            color: '#64748b'
          }}
        >
          {reviews.length} review
          {reviews.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* WRITE REVIEW */}
      <div
        style={{
          border: '1px solid #cbd5e1',
          borderRadius: '10px',
          padding: '25px',
          marginBottom: '30px',
          background: '#ffffff'
        }}
      >
        <h3
          style={{
            marginTop: 0,
            color: '#1e293b'
          }}
        >
          Write a Review
        </h3>

        {loadingBookings ? (
          <p>Loading completed bookings...</p>
        ) : bookings.length === 0 ? (
          <div
            style={{
              padding: '15px',
              background: '#f8fafc',
              borderRadius: '6px',
              color: '#64748b'
            }}
          >
            You do not have any completed bookings available for review.
          </div>
        ) : (
          <form onSubmit={handleSubmit}>

            {/* BOOKING */}
            <div style={{ marginBottom: '20px' }}>
              <label
                style={{
                  display: 'block',
                  fontWeight: '600',
                  marginBottom: '8px'
                }}
              >
                Select Completed Booking
              </label>

              <select
                value={selectedBooking}
                onChange={(e) => setSelectedBooking(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '5px',
                  fontSize: '15px'
                }}
              >
                <option value="">
                  -- Select Booking --
                </option>

                {bookings.map((booking) => (
                  <option
                    key={booking._id}
                    value={booking._id}
                  >
                    {booking.stationID?.stationName ||
                      'Charging Station'}{' '}
                    -{' '}
                    {booking.bookingDate
                      ? booking.bookingDate.split('T')[0]
                      : ''}
                    {' '}
                    ({booking.startTime} - {booking.endTime})
                  </option>
                ))}
              </select>
            </div>

            {/* STAR RATING */}
            <div style={{ marginBottom: '20px' }}>
              <label
                style={{
                  display: 'block',
                  fontWeight: '600',
                  marginBottom: '8px'
                }}
              >
                Your Rating
              </label>

              <div
                style={{
                  display: 'flex',
                  gap: '5px'
                }}
              >
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '2.2rem',
                      padding: '0',
                      color:
                        star <= (hoverRating || rating)
                          ? '#f59e0b'
                          : '#cbd5e1'
                    }}
                  >
                    ★
                  </button>
                ))}
              </div>

              <p
                style={{
                  margin: '5px 0 0',
                  color: '#64748b'
                }}
              >
                {rating === 0
                  ? 'Select a rating'
                  : `${rating} out of 5 stars`}
              </p>
            </div>

            {/* WRITTEN REVIEW */}
            <div style={{ marginBottom: '20px' }}>
              <label
                style={{
                  display: 'block',
                  fontWeight: '600',
                  marginBottom: '8px'
                }}
              >
                Your Feedback
              </label>

              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Write your experience with this charging station..."
                rows="5"
                maxLength="500"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '5px',
                  resize: 'vertical',
                  fontFamily: 'sans-serif',
                  fontSize: '15px',
                  boxSizing: 'border-box'
                }}
              />

              <div
                style={{
                  textAlign: 'right',
                  fontSize: '13px',
                  color: '#64748b',
                  marginTop: '4px'
                }}
              >
                {review.length}/500
              </div>
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={submitting}
              style={{
                width: '100%',
                padding: '12px',
                background: submitting
                  ? '#94a3b8'
                  : '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: submitting
                  ? 'not-allowed'
                  : 'pointer',
                fontWeight: 'bold',
                fontSize: '15px'
              }}
            >
              {submitting
                ? 'Submitting...'
                : 'Submit Feedback'}
            </button>
          </form>
        )}
      </div>

      {/* ALL REVIEWS */}
      <div>
        <h3
          style={{
            color: '#1e293b',
            marginBottom: '15px'
          }}
        >
          Customer Reviews
        </h3>

        {loadingReviews ? (
          <p>Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <div
            style={{
              padding: '20px',
              background: '#f8fafc',
              border: '1px dashed #cbd5e1',
              borderRadius: '8px',
              color: '#64748b',
              textAlign: 'center'
            }}
          >
            No reviews available for this station yet.
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '15px'
            }}
          >
            {reviews.map((item) => (
              <div
                key={item._id}
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '18px',
                  background: '#ffffff'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px'
                  }}
                >
                  <strong
                    style={{
                      color: '#0f172a'
                    }}
                  >
                    {item.userID?.name || 'EV User'}
                  </strong>

                  <span
                    style={{
                      color: '#64748b',
                      fontSize: '13px'
                    }}
                  >
                    {item.feedbackdate
                      ? new Date(
                          item.feedbackdate
                        ).toLocaleDateString()
                      : ''}
                  </span>
                </div>

                <div
                  style={{
                    color: '#f59e0b',
                    fontSize: '1.2rem',
                    marginBottom: '8px'
                  }}
                >
                  {'★'.repeat(Number(item.rating))}
                  {'☆'.repeat(5 - Number(item.rating))}
                </div>

                <p
                  style={{
                    margin: 0,
                    color: '#475569',
                    lineHeight: '1.5'
                  }}
                >
                  {item.review}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}