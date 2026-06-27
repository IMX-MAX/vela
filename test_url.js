try {
  const url = new URL('/api/stripe/checkout');
  console.log(url.origin);
} catch (err) {
  console.log("Error:", err.message);
}
