// This is a reusable "brick" to display one product.
// We can use this on the homepage, product pages, etc.

export default function ProductCard() {
  return (
    <div style={{ border: '1px solid #ddd', padding: '1rem', textAlign: 'center' }}>
      <p>[Product Image Goes Here]</p>
      <h3>Product Name</h3>
      <p>$99.99</p>
    </div>
  );
}
