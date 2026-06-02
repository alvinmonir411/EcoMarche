async function main() {
  try {
    const res = await fetch("http://localhost:4000/api/products");
    console.log("Status:", res.status);
    const data = await res.json();
    console.log("Returned products in backend response:");
    for (const p of data.data.products) {
      console.log(`- ID: ${p.id} | Title: ${p.name || p.title} | SKU: ${p.sku}`);
    }
  } catch (err: any) {
    console.error("Fetch failed:", err.message);
  }
}

main();
