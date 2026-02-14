import React, { useState, useEffect } from 'react';

function OrderTracking({ orderId, orderData = {} }) {
  const [trackingStatus, setTrackingStatus] = useState('received');
  const [elapsedTime, setElapsedTime] = useState(0);

  // Simulate order progression every 5 seconds
  useEffect(() => {
    const statuses = ['received', 'preparing', 'ready', 'completed'];
    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
      
      if (elapsedTime % 5 === 0) {
        const currentIndex = statuses.indexOf(trackingStatus);
        if (currentIndex < statuses.length - 1) {
          setTrackingStatus(statuses[currentIndex + 1]);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [elapsedTime, trackingStatus]);

  const getStatusStage = (status) => {
    const stages = {
      received: { label: 'Order Received', icon: '✅', color: 'success', description: 'Your order has been confirmed' },
      preparing: { label: 'Preparing', icon: '👨‍🍳', color: 'info', description: 'Our team is preparing your items' },
      ready: { label: 'Ready for Pickup', icon: '📦', color: 'warning', description: 'Your order is ready' },
      completed: { label: 'Completed', icon: '🎉', color: 'success', description: 'Enjoy your order!' }
    };
    return stages[status] || stages.received;
  };

  const statuses = ['received', 'preparing', 'ready', 'completed'];
  const currentIndex = statuses.indexOf(trackingStatus);
  const progressPercentage = ((currentIndex + 1) / statuses.length) * 100;

  return (
    <div className="card shadow-sm mb-4">
      <div className="card-header bg-primary text-white">
        <h5 className="mb-0">📍 Order Tracking</h5>
      </div>
      <div className="card-body">
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="d-flex justify-content-between mb-2">
            <span><strong>Order Progress</strong></span>
            <span className="text-muted">{Math.round(progressPercentage)}%</span>
          </div>
          <div className="progress" style={{ height: '8px' }}>
            <div
              className="progress-bar bg-success"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Timeline */}
        <div className="timeline mb-4">
          {statuses.map((status, idx) => {
            const isCompleted = idx <= currentIndex;
            const isCurrent = status === trackingStatus;
            const stage = getStatusStage(status);

            return (
              <div key={status} className="timeline-item">
                <div className="d-flex align-items-flex-start mb-3">
                  {/* Timeline Dot */}
                  <div className="me-3">
                    <div
                      className={`rounded-circle d-flex align-items-center justify-content-center ${
                        isCompleted ? `bg-${stage.color}` : 'bg-light border'
                      }`}
                      style={{
                        width: '50px',
                        height: '50px',
                        fontSize: '24px',
                        color: isCompleted ? 'white' : '#ccc',
                        fontWeight: 'bold',
                        boxShadow: isCurrent ? `0 0 0 4px rgba(52, 144, 220, 0.25)` : 'none',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {stage.icon}
                    </div>
                  </div>

                  {/* Timeline Content */}
                  <div className="flex-grow-1 pt-2">
                    <h6 className={`mb-1 ${isCurrent ? 'fw-bold text-primary' : ''}`}>
                      {stage.label}
                      {isCurrent && <span className="badge bg-primary ms-2">CURRENT</span>}
                    </h6>
                    <p className="text-muted mb-1 small">{stage.description}</p>
                    {isCurrent && (
                      <small className="text-success">
                        <strong>🕐 Estimated time: 10-15 minutes</strong>
                      </small>
                    )}
                  </div>

                  {/* Timeline Connector */}
                  {idx < statuses.length - 1 && (
                    <div
                      style={{
                        position: 'absolute',
                        left: '47px',
                        top: '70px',
                        width: '4px',
                        height: '60px',
                        backgroundColor: isCompleted ? '#28a745' : '#e9ecef',
                        transition: 'background-color 0.3s ease'
                      }}
                    ></div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Current Status Card */}
        <div className={`alert alert-${getStatusStage(trackingStatus).color}`}>
          <strong>{getStatusStage(trackingStatus).icon} {getStatusStage(trackingStatus).label}</strong>
          <br />
          <small>{getStatusStage(trackingStatus).description}</small>
        </div>

        {/* Order Details */}
        {orderData.id && (
          <div className="row text-center mt-4 pt-3 border-top">
            <div className="col-6">
              <small className="text-muted d-block">Order ID</small>
              <strong>#{orderData.id}</strong>
            </div>
            <div className="col-6">
              <small className="text-muted d-block">Pickup Location</small>
              <strong>Theatre Snack Counter</strong>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .timeline {
          position: relative;
        }

        .timeline-item {
          position: relative;
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .badge {
          font-size: 0.7rem;
          padding: 0.3rem 0.5rem;
        }
      `}</style>
    </div>
  );
}

export default OrderTracking;
