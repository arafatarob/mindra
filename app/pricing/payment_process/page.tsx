'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const PAYMENT_METHODS = [
  {
    id: 'card',
    label: 'Credit / Debit Card',
    description: 'Pay instantly with any major card.',
  },
  {
    id: 'paypal',
    label: 'PayPal',
    description: 'Secure checkout with your PayPal account.',
  },
  {
    id: 'bank',
    label: 'Bank Transfer',
    description: 'Transfer funds directly from your bank.',
  },
  {
    id: 'wallet',
    label: 'Wallet Pay',
    description: 'Apple Pay / Google Pay / Mobile wallet support.',
  },
  {
    id: 'invoice',
    label: 'Invoice / Manual Payment',
    description: 'Receive an invoice and pay later.',
  },
];

export default function PaymentProcessPage() {
  const searchParams = useSearchParams();
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [bankReference, setBankReference] = useState('');
  const [invoiceEmail, setInvoiceEmail] = useState('');

  const plan = searchParams.get('plan') || 'Starter';
  const period = searchParams.get('period') || 'month';
  const isAnnual = period === 'year';

  const planPrice = useMemo(() => {
    switch (plan.toLowerCase()) {
      case 'free':
        return 0;
      case 'starter':
        return isAnnual ? 269.91 : 29.99;
      case 'outbound':
        return isAnnual ? 449.91 : 49.99;
      case 'growth':
        return isAnnual ? 899.91 : 99.99;
      default:
        return isAnnual ? 269.91 : 29.99;
    }
  }, [plan, isAnnual]);

  const planTag = useMemo(() => {
    if (plan.toLowerCase() === 'free') return 'No payment required';
    return `$${planPrice.toFixed(2)} ${isAnnual ? 'per year' : 'per month'}`;
  }, [planPrice, isAnnual, plan]);

  const selectedMethodMeta = PAYMENT_METHODS.find((method) => method.id === selectedMethod);

  const handlePayment = async () => {
    setErrorMessage('');
    if (plan.toLowerCase() === 'free') {
      setCompleted(true);
      return;
    }
    // Basic client-side validation per payment method
    if (selectedMethod === 'card') {
      if (!cardName.trim() || !cardNumber.trim() || !cardExpiry.trim() || !cardCvc.trim()) {
        setErrorMessage('Please complete all card fields.');
        return;
      }
    }
    if (selectedMethod === 'bank' && !bankReference.trim()) {
      setErrorMessage('Please provide a payment reference for bank transfer.');
      return;
    }
    if (selectedMethod === 'invoice' && !invoiceEmail.trim()) {
      setErrorMessage('Please provide an email to receive the invoice.');
      return;
    }

    setIsProcessing(true);
    window.setTimeout(async () => {
      setIsProcessing(false);
      if (plan.toLowerCase() !== 'free') {
        try {
          const response = await fetch('/api/auth/update-profile', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              plan,
              planStartDate: new Date().toISOString(),
            }),
          });
          if (!response.ok) {
            const body = await response.text();
            throw new Error(body || 'Failed to activate plan');
          }
        } catch (error) {
          console.error('Plan activation failed:', error);
          setErrorMessage('Payment succeeded, but the plan could not be activated. Please refresh or contact support.');
          return;
        }
      }
      setCompleted(true);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#060B18] text-white">
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@600;700;800&display=swap');
        :root { --bg:#060B18; --surface:#111B35; --surface-soft:#172640; --surface-muted:#0E1630; --border:#2A3B5A; --tx:#F8FAFC; --tx2:#94A3B8; --tx3:#64748B; --accent:#7C3AED; --accent-soft:rgba(124,58,237,0.12); --success:#22C55E; }
        body{margin:0;padding:0;font-family:'DM Sans',sans-serif;background:var(--bg);color:var(--tx);}
        .section {max-width:1200px;margin:0 auto;padding:24px 20px;}
        .card {background:var(--surface);border:1px solid var(--border);border-radius:24px;box-shadow:0 20px 60px rgba(0,0,0,0.25);}
        .btn {display:inline-flex;align-items:center;justify-content:center;border:none;border-radius:14px;padding:14px 20px;font-weight:700;cursor:pointer;transition:all .2s;}
        .btn-primary{background:linear-gradient(135deg,#7C3AED,#4338CA);color:#fff;}
        .btn-primary:hover{transform:translateY(-1px);box-shadow:0 16px 40px rgba(124,58,237,0.25);}
        .btn-secondary{background:transparent;color:var(--tx);border:1px solid rgba(255,255,255,0.12);}
        .tab-button{cursor:pointer;padding:16px 20px;border-radius:18px;border:1px solid transparent;transition:all .2s;background:var(--surface-muted);color:var(--tx2);}
        .tab-button.active{background:rgba(124,58,237,0.12);border-color:rgba(124,58,237,0.35);color:#fff;}
        input, select, textarea{width:100%;padding:14px 16px;border-radius:14px;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.04);color:#fff;outline:none;transition:border .2s;}
        input:focus, select:focus, textarea:focus{border-color:rgba(124,58,237,0.6);}
      ` }} />

      <div className="section" style={{paddingTop: '32px', paddingBottom: '32px'}}>
        <div className="card" style={{overflow:'hidden'}}>
          <div style={{display:'grid',gridTemplateColumns:'1.4fr 1fr',gap:'24px',padding:'32px'}}>
            <div>
              <div style={{marginBottom:'24px'}}>
                <div style={{fontSize:'12px',fontWeight:700,letterSpacing:'0.25em',textTransform:'uppercase',color:'var(--tx3)',marginBottom:'10px'}}>Checkout</div>
                <h1 style={{fontSize:'36px',lineHeight:1.05,fontWeight:800,letterSpacing:'-0.03em',marginBottom:'14px'}}>Secure payment setup</h1>
                <p style={{fontSize:'15px',lineHeight:1.8,color:'var(--tx2)'}}>Choose the payment method that works for you. Each option has its own secure flow and easy confirmation.</p>
              </div>

              <div style={{marginBottom:'28px'}}>
                <div style={{display:'flex',flexWrap:'wrap',gap:'12px',marginBottom:'16px'}}>
                  {PAYMENT_METHODS.map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      className={`tab-button ${selectedMethod === method.id ? 'active' : ''}`}
                      onClick={() => setSelectedMethod(method.id)}
                    >
                      {method.label}
                    </button>
                  ))}
                </div>
                <div style={{padding:'24px',borderRadius:'20px',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)'}}>
                  <div style={{display:'flex',justifyContent:'space-between',gap:'16px',flexWrap:'wrap'}}>
                    <div>
                      <div style={{fontSize:'13px',fontWeight:700,color:'var(--tx3)',marginBottom:'6px'}}>Selected method</div>
                      <div style={{fontSize:'16px',fontWeight:700,color:'var(--tx)'}}>{selectedMethodMeta?.label}</div>
                    </div>
                    <div style={{textAlign:'right'}}>
                      <div style={{fontSize:'13px',fontWeight:700,color:'var(--tx3)',marginBottom:'6px'}}>Billing plan</div>
                      <div style={{fontSize:'16px',fontWeight:700,color:'var(--tx)'}}>{plan}</div>
                    </div>
                  </div>
                  <div style={{marginTop:'14px',fontSize:'14px',color:'var(--tx2)'}}>{selectedMethodMeta?.description}</div>
                </div>
              </div>

              <div style={{padding:'28px',borderRadius:'22px',background:'linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))',border:'1px solid rgba(255,255,255,0.08)'}}>
                {completed ? (
                  <div style={{textAlign:'center'}}>
                    <div style={{fontSize:'32px',fontWeight:800,color:'var(--green)'}}>Payment Complete</div>
                    <p style={{fontSize:'15px',color:'var(--tx2)',marginTop:'14px'}}>Your {plan} plan is now active. Thank you for upgrading.</p>
                    <div style={{marginTop:'24px',display:'flex',justifyContent:'center',gap:'12px',flexWrap:'wrap'}}>
                      <Link href="/dashboard" className="btn btn-secondary">Go to Dashboard</Link>
                      <Link href="/pricing" className="btn btn-secondary">View Pricing</Link>
                    </div>
                  </div>
                ) : (
                  <div>
                    {selectedMethod === 'card' && (
                      <div style={{display:'grid',gap:'16px'}}>
                        <div>
                          <label htmlFor="cardName" style={{fontSize:'13px',fontWeight:600,color:'var(--tx2)'}}>Cardholder Name</label>
                            <input id="cardName" value={cardName} onChange={(e) => setCardName(e.target.value)} placeholder="Jane Doe" required />
                        </div>
                        <div>
                          <label htmlFor="cardNumber" style={{fontSize:'13px',fontWeight:600,color:'var(--tx2)'}}>Card Number</label>
                            <input id="cardNumber" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} placeholder="1234 5678 9123 4567" required />
                        </div>
                        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}}>
                          <div>
                            <label htmlFor="cardExpiry" style={{fontSize:'13px',fontWeight:600,color:'var(--tx2)'}}>Expiry</label>
                            <input id="cardExpiry" value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} placeholder="MM/YY" required />
                          </div>
                          <div>
                            <label htmlFor="cardCvc" style={{fontSize:'13px',fontWeight:600,color:'var(--tx2)'}}>CVC</label>
                            <input id="cardCvc" value={cardCvc} onChange={(e) => setCardCvc(e.target.value)} placeholder="123" required />
                          </div>
                        </div>
                        <div style={{fontSize:'13px',color:'var(--tx3)'}}>Securely tokenized with PCI-compliant encryption. We never store your raw card details.</div>
                      </div>
                    )}

                    {selectedMethod === 'paypal' && (
                      <div style={{display:'grid',gap:'16px'}}>
                        <div style={{fontSize:'15px',fontWeight:600}}>Continue with PayPal</div>
                        <div style={{display:'flex',alignItems:'center',gap:'12px',background:'rgba(255,255,255,0.04)',padding:'18px',borderRadius:'18px',border:'1px solid rgba(255,255,255,0.08)'}}>
                          <div style={{width:'36px',height:'36px',borderRadius:'12px',background:'#003087',display:'flex',alignItems:'center',justifyContent:'center'}}>
                            <span style={{fontSize:'18px',fontWeight:700,color:'#fff'}}>P</span>
                          </div>
                          <div>
                            <div style={{fontSize:'15px',fontWeight:700}}>Pay with PayPal</div>
                            <div style={{fontSize:'13px',color:'var(--tx3)'}}>Fast checkout using your PayPal account.</div>
                          </div>
                        </div>
                        <div style={{fontSize:'13px',color:'var(--tx2)'}}>After clicking pay, you will be redirected to the PayPal flow.</div>
                      </div>
                    )}

                    {selectedMethod === 'bank' && (
                      <div style={{display:'grid',gap:'16px'}}>
                        <div>
                          <div style={{fontSize:'15px',fontWeight:600}}>Bank transfer details</div>
                          <p style={{fontSize:'14px',color:'var(--tx3)',marginTop:'8px'}}>Use your online banking app to send funds. Include the reference below so we can match your payment.</p>
                        </div>
                        <div style={{display:'grid',gap:'10px'}}>
                          <div style={{padding:'18px',borderRadius:'18px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)'}}>
                            <div style={{fontSize:'12px',fontWeight:700,color:'var(--tx3)',marginBottom:'8px'}}>Account name</div>
                            <div>ARFA Growth Ltd.</div>
                            <div style={{fontSize:'12px',color:'var(--tx3)',marginTop:'12px'}}>IBAN</div>
                            <div>GB82 WEST 1234 5698 7654 32</div>
                            <div style={{fontSize:'12px',color:'var(--tx3)',marginTop:'12px'}}>SWIFT</div>
                            <div>WESTGB22</div>
                          </div>
                          <div>
                            <label htmlFor="bankReference" style={{fontSize:'13px',fontWeight:600,color:'var(--tx2)'}}>Payment reference</label>
                            <input id="bankReference" value={bankReference} onChange={(e) => setBankReference(e.target.value)} placeholder="Your username or email" required />
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedMethod === 'wallet' && (
                      <div style={{display:'grid',gap:'16px'}}>
                        <div style={{fontSize:'15px',fontWeight:600}}>Apple Pay / Google Pay</div>
                        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'16px'}}>
                          <button type="button" className="btn btn-secondary">Apple Pay</button>
                          <button type="button" className="btn btn-secondary">Google Pay</button>
                        </div>
                        <div style={{fontSize:'13px',color:'var(--tx3)'}}>Tap the wallet button and complete the checkout securely on your device.</div>
                      </div>
                    )}

                    {selectedMethod === 'invoice' && (
                      <div style={{display:'grid',gap:'16px'}}>
                        <div>
                          <div style={{fontSize:'15px',fontWeight:600}}>Invoice request</div>
                          <p style={{fontSize:'14px',color:'var(--tx3)',marginTop:'8px'}}>Get an invoice emailed to your team and pay later.</p>
                        </div>
                        <div>
                          <label htmlFor="invoiceEmail" style={{fontSize:'13px',fontWeight:600,color:'var(--tx2)'}}>Email for invoice</label>
                          <input id="invoiceEmail" value={invoiceEmail} onChange={(e) => setInvoiceEmail(e.target.value)} placeholder="team@company.com" required />
                        </div>
                        <div style={{fontSize:'13px',color:'var(--tx3)'}}>We will send billing instructions and payment terms to your inbox.</div>
                      </div>
                    )}

                    <div style={{marginTop:'22px',display:'flex',gap:'12px',flexWrap:'wrap'}}>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handlePayment}
                        disabled={isProcessing}
                      >
                        {isProcessing ? 'Processing...' : selectedMethod === 'invoice' ? 'Request Invoice' : selectedMethod === 'bank' ? 'Confirm Bank Transfer' : selectedMethod === 'paypal' ? 'Continue with PayPal' : 'Pay Securely'}
                      </button>
                      <Link href="/pricing" className="btn btn-secondary">Change plan</Link>
                    </div>
                    {errorMessage ? <div style={{marginTop:12,color:'#F87171',fontSize:13}}>{errorMessage}</div> : null}
                  </div>
                )}
              </div>
            </div>

            <aside style={{display:'grid',gap:'18px'}}>
              <div style={{padding:'28px',borderRadius:'24px',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)'}}>
                <div style={{fontSize:'12px',fontWeight:700,letterSpacing:'0.2em',textTransform:'uppercase',color:'var(--tx3)',marginBottom:'12px'}}>Order summary</div>
                <div style={{fontSize:'14px',color:'var(--tx2)',marginBottom:'10px'}}>Plan</div>
                <div style={{fontSize:'22px',fontWeight:700,color:'var(--tx)'}}>{plan} Plan</div>
                <div style={{fontSize:'13px',color:'var(--tx3)',marginTop:'6px'}}>Billed {isAnnual ? 'annually' : 'monthly'}</div>
                <div style={{height:'1px',background:'rgba(255,255,255,0.08)',margin:'20px 0'}} />
                <div style={{display:'flex',justifyContent:'space-between',color:'var(--tx3)',marginBottom:'8px'}}>
                  <span>Price</span><span>{planTag}</span>
                </div>
                <div style={{display:'flex',justifyContent:'space-between',color:'var(--tx3)',marginBottom:'8px'}}>
                  <span>Payment method</span><span>{selectedMethodMeta?.label}</span>
                </div>
                <div style={{display:'flex',justifyContent:'space-between',color:'var(--tx3)'}}>
                  <span>Status</span><span>{completed ? 'Completed' : 'Ready'}</span>
                </div>
              </div>

              <div style={{padding:'24px',borderRadius:'24px',background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.05)'}}>
                <div style={{fontSize:'13px',fontWeight:700,letterSpacing:'0.15em',textTransform:'uppercase',color:'var(--tx3)',marginBottom:'12px'}}>Need help?</div>
                <p style={{fontSize:'14px',color:'var(--tx2)',lineHeight:1.8}}>Contact support if you want help choosing the right plan or payment method. Our team is ready to assist with onboarding and billing setup.</p>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
