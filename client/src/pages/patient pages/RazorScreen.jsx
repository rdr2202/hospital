import React from "react";

const RazorScreen = () => {
  const handlePayment = () => {
    const options = {
      key: process.env.RAZOR_PAY_KEY, // Replace with your Razorpay key
      amount: 10000, // Amount in paise (10000 paise = 100 INR)
      currency: 'INR',
      name: 'Maaaaarsss',
      description: 'Order Payment',
      image: 'https://your-logo-url.com/logo.png',
      prefill: {
        name: 'Aravinth',
        email: 'dayaaravinth@gmail.com',
        contact: '6382786758',
      },
      theme: {
        color: '#F37254',
      },
      handler: function (response) {
        alert(`Payment Successful: ${response.razorpay_payment_id}`);
      },
      modal: {
        ondismiss: function () {
          alert('Payment popup closed');
        },
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Razorpay Payment</h1>
      <button style={styles.button} onClick={handlePayment}>
        Pay Now
      </button>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
  },
  title: {
    fontSize: '24px',
    marginBottom: '20px',
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#F37254',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};

export default RazorScreen;
