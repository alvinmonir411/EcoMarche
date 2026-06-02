async function main() {
  try {
    const res = await fetch("http://127.0.0.1:3000/api/products");
    console.log("Status:", res.status);
    const data = await res.json();
    console.log("Success:", data.success);
    if (data.success) {
      console.log("rawCount:", data.data?.rawCount);
      console.log("dbUrl:", data.data?.dbUrl);
      console.log("whereObj:", JSON.stringify(data.data?.whereObj, null, 2));
      console.log("Returned Products count:", data.data?.products?.length || data.data?.length || 0);
      const items = data.data?.products || data.data;
      if (Array.isArray(items)) {
        for (const p of items) {
          console.log(`- ${p.title} (ID: ${p.id})`);
        }
      }
    } else {
      console.log("Error:", data.error);
    }
  } catch (err: any) {
    console.error("Fetch failed:", err.message);
  }
}

main();
