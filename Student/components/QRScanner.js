function QRScanner({ onScanSuccess, onClose }) {
  React.useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", { 
      fps: 20, 
      qrbox: { width: 280, height: 280 },
      aspectRatio: 1.0
    }, false);

    scanner.render((decodedText) => {
      console.log("Scanned QR Text:", decodedText);
      onScanSuccess(decodedText);
      scanner.clear().then(() => onClose()).catch(() => onClose());
    }, (error) => {
      // Handle scan error, ignore most noise
    });

    return () => {
      scanner.clear().catch(err => console.error("Error clearing scanner", err));
    };
  }, []);

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '450px', textAlign: 'center' }}>
        <h2 className="modal-title">Scan Bus QR Code</h2>
        <p className="modal-subtitle">Point your camera at the QR code on the bus</p>
        <div id="reader" style={{ width: '100%', marginBottom: '20px', borderRadius: '12px', overflow: 'hidden' }}></div>
        <button className="proceed-btn" style={{ background: '#ef4444', width: 'auto', padding: '10px 30px' }} onClick={onClose}>
          Close Scanner
        </button>
      </div>
    </div>
  );
}
