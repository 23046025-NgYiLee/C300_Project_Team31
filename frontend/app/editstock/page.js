export default function AddStocksPage({ flower }) {
  return (
    <div className="page">
      <main className="main">
        <div className="intro">
          <h2 style={{ fontSize: "3rem" , color: "#4e5dbdff"}}>Edit  Stocks</h2>
        </div>
        <div>
          {flower ? (
            <form action={`/editf   ower/${flower.Flowerid}`} method="POST" encType="multipart/form-data" style={{ width: "100%", maxWidth: "440px" }}>
              <div style={{ marginBottom: '16px' }}>
                <label htmlFor="name">Stock Name:</label>
                <input type="text" id="name" name="name" required />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label htmlFor="quantity">Quantity:</label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  min="0"
                  step="1"
                  required
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label htmlFor="brand">Brand:</label>
                <input type="text" id="brand" name="brand" required />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label htmlFor="class">Class:</label>
                <input
                  type="text"
                  id="class"
                  name="class"
                  required
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label htmlFor="type">Type:</label>
                <input type="text" id="type" name="type" required />
              </div>
              <div className="ctas">
                <button type="submit" className="primary ctaButton">
                  Add Stock
                </button>
              </div>
            </form>
          ) : (
            <p style={{ fontSize: "1rem" , color: "#4e5dbdff"}}>No flower found.</p>
          )}
        </div>
      </main>
    </div>
  );
}
