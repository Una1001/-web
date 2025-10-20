"use client";

import React, { useState } from "react";
import Link from "next/link";

type Product = { desc: string; price: number };

export default function ProductList() {
	const [products, setProducts] = useState<Product[]>([
		{ desc: "找小偷", price: 20000 },
		{ desc: "惡搞朋友", price: 30000 },
		{ desc: "假中獎影片", price: 42000 },
		{ desc: "假髮幫貼服務", price: 7990 },
	]);
	const [showForm, setShowForm] = useState(false);
	const [newProduct, setNewProduct] = useState({ desc: "", price: "" });

	const handleClick = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setNewProduct((prev) => ({ ...prev, [name]: value }));
	};

	const update = () => {
		if (!newProduct.desc || !newProduct.price) {
			alert("請填寫完整資訊");
			return;
		}
		setProducts((prev) => [...prev, { desc: newProduct.desc, price: Number(newProduct.price) }]);
		setNewProduct({ desc: "", price: "" });
		setShowForm(false);
	};

	return (
		<main style={{ padding: "2.25rem", fontFamily: "Inter, Arial, sans-serif", color: "#111" }}>
			<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
				<h1 style={{ margin: 0 }}>產品列表</h1>
				<div style={{ display: "flex", gap: 12 }}>
					<Link href="/" style={{ textDecoration: "none", color: "#3b82f6" }}>回到首頁</Link>
					<button onClick={() => setShowForm(true)} style={{ background: "#10b981", color: "white", border: "none", padding: "8px 12px", borderRadius: 6, cursor: "pointer" }}>
						新增產品
					</button>
				</div>
			</div>

			<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
				{products.map((p, i) => (
					<div key={i} style={{ background: "white", borderRadius: 8, padding: 12, boxShadow: "0 6px 18px rgba(15,23,42,0.06)", display: "flex", flexDirection: "column", gap: 8 }}>
						<div style={{ fontSize: 16, fontWeight: 600 }}>{p.desc}</div>
						<div style={{ color: "#374151", fontWeight: 700 }}>NT$ {p.price.toLocaleString()}</div>
					</div>
				))}
			</div>

			{showForm && (
				<div style={{ border: "1px solid #ccc", padding: 16, borderRadius: 8, background: "#fff", marginTop: 16 }}>
					<div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
						<label style={{ fontSize: 13, color: "#374151" }}>產品名稱</label>
						<input type="text" name="desc" value={newProduct.desc} onChange={handleClick} placeholder="例如：幫忙吃飯服務" style={{ padding: 10, borderRadius: 6, border: "1px solid #e5e7eb" }} />

						<label style={{ fontSize: 13, color: "#374151" }}>價格 (NT$)</label>
						<input type="number" name="price" value={newProduct.price} onChange={handleClick} placeholder="例如：19900" style={{ padding: 10, borderRadius: 6, border: "1px solid #e5e7eb" }} />

						<div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 6 }}>
							<button onClick={() => setShowForm(false)} style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid #e5e7eb", background: "white", cursor: "pointer" }}>取消</button>
							<button onClick={update} style={{ padding: "8px 12px", borderRadius: 6, border: "none", background: "#2563eb", color: "white", cursor: "pointer" }}>新增</button>
						</div>
					</div>
				</div>
			)}
		</main>
	);
}

