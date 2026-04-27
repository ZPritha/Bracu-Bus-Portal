function ChoosePlan({ setActive, fare, setPlan, currentUser, setCurrentUser, bookingInfo }) {
  const [plans, setPlans] = React.useState([]);
  const [selected, setSelected] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [paying, setPaying] = React.useState(false);

  React.useEffect(() => {
    fetch("http://localhost:9255/api/plans")
      .then(res => res.json())
      .then(data => { setPlans(data); setSelected(data[0]?.name); setLoading(false); })
      .catch(err => { console.log(err); setLoading(false); });
  }, []);

  const getPrice = (plan) => {
    if (plan.discount_percent === 0) return `৳${fare}/ride`;
    const monthly = fare * plan.rides_per_day * 30;
    return `৳${monthly}/mo`;
  };

  const getSave = (plan) => {
    if (plan.discount_percent === 0) return null;
    const monthly = fare * plan.rides_per_day * 30;
    return `Save ৳${Math.round(monthly * plan.discount_percent / 100)}`;
  };

  const getAmount = () => {
    const planObj = plans.find(p => p.name === selected);
    if (!planObj) return 0;
    if (planObj.discount_percent === 0) return fare;
    return fare * planObj.rides_per_day * 30;
  };

  const handlePayment = async () => {
    const planObj = plans.find(p => p.name === selected);
    if (!planObj) return;
    setPaying(true);

    try {
      const res = await fetch('http://localhost:9255/api/payment/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: currentUser.studentId,
          name: currentUser.name,
          email: currentUser.email,
          plan_name: planObj.name,
          plan_fare: fare,
          plan_route_id: bookingInfo.route_id,
          plan_route_name: bookingInfo.route_name,
          plan_stoppage_id: bookingInfo.stoppage_id,
          plan_stoppage_name: bookingInfo.stoppage_name,
          plan_expires_at: planObj.discount_percent === 0
            ? null
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          amount: getAmount()
        })
      });
      const data = await res.json();
      if (data.url) {
        // ← Save tran_id to sessionStorage so we can verify after redirect
        sessionStorage.setItem('tran_id', data.tran_id);
        sessionStorage.setItem('studentId', currentUser.studentId);
        sessionStorage.setItem('plan_name', planObj.name);
        sessionStorage.setItem('plan_fare', fare.toString());
        sessionStorage.setItem('route_id', bookingInfo.route_id || '');
        sessionStorage.setItem('route_name', bookingInfo.route_name || '');
        sessionStorage.setItem('stoppage_id', bookingInfo.stoppage_id || '');
        sessionStorage.setItem('stoppage_name', bookingInfo.stoppage_name || '');
        window.location.href = data.url;
      } else {
        alert('Failed to initiate payment.');
        setPaying(false);
      }
    } catch (err) {
      alert('Payment error. Is server running?');
      setPaying(false);
    }
  };

  if (loading) return <div className="content"><p style={{padding:"20px"}}>Loading plans...</p></div>;

  return (
    <div className="content">
      <div className="section-label">Step 3 — Choose a Plan</div>

      {plans.map((plan) => (
        <div
          key={plan._id}
          className={`plan-card ${selected === plan.name ? "plan-selected" : ""}`}
          onClick={() => setSelected(plan.name)}
        >
          <div className="plan-top">
            <div>
              <div className="plan-name">
                {plan.name}
                {plan.badge && (
                  <span className={`plan-badge ${plan.badge_class}`}>{plan.badge}</span>
                )}
              </div>
              <div className="plan-desc">{plan.desc}</div>
              <div className="plan-sub">{plan.sub}</div>
            </div>
            <div className="plan-right">
              <div className="plan-price">{getPrice(plan)}</div>
              {getSave(plan) && <div className="plan-save">{getSave(plan)}</div>}
            </div>
          </div>
          {selected === plan.name && (
            <div className="plan-selected-msg">✓ Selected — click Pay to continue</div>
          )}
        </div>
      ))}

      <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
        <button
          className="proceed-btn"
          disabled={!selected || paying}
          onClick={handlePayment}
          style={{ flex: 1 }}
        >
          {paying ? 'Redirecting to payment...' : `Pay ৳${getAmount()} via bKash/Nagad/Card`}
        </button>
      </div>

      <p style={{ textAlign: 'center', fontSize: '12px', color: '#888', marginTop: '10px' }}>
        🔒 Secured by SSLCommerz — supports bKash, Nagad, Card & more
      </p>
    </div>
  );
}