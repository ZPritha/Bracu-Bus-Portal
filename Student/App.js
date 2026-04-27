function App() {
  const [currentUser, setCurrentUser]     = React.useState(null);
  const [active, setActive]               = React.useState("Dashboard");
  const [fare, setFare]                   = React.useState(0);
  const [plan, setPlan]                   = React.useState("No Plan");
  const [announcements, setAnnouncements] = React.useState([]);
  const [notifications, setNotifications] = React.useState([]);
  const [bookingInfo, setBookingInfo]     = React.useState({});
  const [showReport, setShowReport]       = React.useState(false);

  React.useEffect(() => {
    fetch('http://localhost:9255/api/announcements')
      .then(res => res.json())
      .then(data => setAnnouncements(data))
      .catch(err => console.log(err));
  }, []);

  React.useEffect(() => {
    if (!currentUser) return;
    window.history.pushState(null, '', window.location.href);
    function handlePop() {
      window.history.pushState(null, '', window.location.href);
    }
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, [currentUser]);

  React.useEffect(() => {
    if (!currentUser) return;
    function fetchNotifications() {
      fetch(`http://localhost:9255/api/notifications/${currentUser.studentId}`)
        .then(res => res.json())
        .then(data => setNotifications(data))
        .catch(err => console.log(err));
    }
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [currentUser]);

  React.useEffect(() => {
    if (!currentUser) return;
    const params = new URLSearchParams(window.location.search);
    const payment = params.get('payment');
    if (!payment) return;

    const tran_id = params.get('tran_id') || sessionStorage.getItem('tran_id');
    const studentId = params.get('studentId') || sessionStorage.getItem('studentId') || currentUser.studentId;
    const fallbackPlan = sessionStorage.getItem('plan_name');

    const clearPaymentSession = () => {
      sessionStorage.removeItem('tran_id');
      sessionStorage.removeItem('studentId');
      sessionStorage.removeItem('plan_name');
      sessionStorage.removeItem('plan_fare');
      sessionStorage.removeItem('route_id');
      sessionStorage.removeItem('route_name');
      sessionStorage.removeItem('stoppage_id');
      sessionStorage.removeItem('stoppage_name');
    };

    const handleFailure = () => {
      if (payment === 'cancel') {
        alert('Payment cancelled.');
      } else {
        alert('❌ Payment failed. Please try again.');
      }
      clearPaymentSession();
      window.history.replaceState({}, '', window.location.pathname);
    };

    if (!tran_id || !studentId) {
      if (payment === 'success') {
        alert('Payment return received, but transaction info is missing. Please check My Bookings.');
      } else {
        handleFailure();
      }
      return;
    }

    fetch(`http://localhost:9255/api/payment/verify/${encodeURIComponent(tran_id)}?studentId=${encodeURIComponent(studentId)}`)
      .then(res => res.json())
      .then(result => {
        if (result?.success && result?.booking) {
          const paidPlan = result.booking.plan_name || fallbackPlan || 'No Plan';
          setPlan(paidPlan);
          clearPaymentSession();
          window.history.replaceState({}, '', window.location.pathname);
          alert(`✅ Payment successful! ${paidPlan} plan activated.`);
          setActive('payment');
          return;
        }

        if (payment === 'success') {
          alert('Payment callback received but booking is not confirmed yet. Please refresh My Bookings in a few seconds.');
          window.history.replaceState({}, '', window.location.pathname);
          return;
        }

        handleFailure();
      })
      .catch(err => {
        console.log('Payment verify error:', err);
        if (payment === 'success') {
          alert('Could not verify payment right now. Please check My Bookings shortly.');
          window.history.replaceState({}, '', window.location.pathname);
          return;
        }
        handleFailure();
      });
  }, [currentUser]);

  function handleMarkAllRead() {
    if (!currentUser) return;
    fetch(
      `http://localhost:9255/api/notifications/${currentUser.studentId}/read-all`,
      { method: 'PATCH' }
    )
      .then(() => setNotifications(prev => prev.map(n => ({ ...n, isRead: true }))))
      .catch(err => console.log(err));
  }

  function handleLogout() {
    setCurrentUser(null);
    setActive("Dashboard");
    setNotifications([]);
  }

  if (!currentUser) {
    return <Login onLogin={setCurrentUser} />;
  }

  return (
    <div className="app">
      <Sidebar active={active} setActive={setActive} />
      <div className="main">
        <Topbar
          user={currentUser}
          onLogout={handleLogout}
          notifications={notifications}
          onMarkAllRead={handleMarkAllRead}
          setActive={setActive}
        />
        {active === "Dashboard" && (
          <Dashboard
            setActive={setActive}
            announcements={announcements}
            currentUser={currentUser}
            setShowReport={setShowReport}
          />
        )}
        {active === "Lost & Found" && (
          <LostFound currentUser={currentUser} setActive={setActive} />
        )}
        {active === "Book Seat" && (
          <BookSeat setActive={setActive} setFare={setFare} setBookingInfo={setBookingInfo} />
        )}
        {active === "Choose Plan" && (
          <ChoosePlan
            setActive={setActive}
            fare={fare}
            setPlan={setPlan}
            currentUser={currentUser}
            setCurrentUser={setCurrentUser}
            bookingInfo={bookingInfo}
          />
        )}
        {active === "Booking" && (
          <Booking setActive={setActive} fare={fare} plan={plan} currentUser={currentUser} />
        )}

        {active === "payment" && (
          <MyBookings currentUser={currentUser} setActive={setActive} />
        )}

        {active === "Feedback" && (
          <Feedback setActive={setActive} currentUser={currentUser} />
        )}
        {active === "My Reports" && (
          <MyReports currentUser={currentUser} setActive={setActive} />
        )}

        {showReport && (
          <ReportModal
            onClose={() => setShowReport(false)}
            currentUser={currentUser}
            setActive={setActive}
          />
        )}
      </div>
      <button className="chat-fab">💬</button>
    </div>
  );
}

const container = document.querySelector('.js-container');
ReactDOM.createRoot(container).render(<App />);