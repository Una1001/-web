"use client";

import React, { useState } from "react";
import Link from "next/link";

type Product = { desc: string; price: number };

export default function ProductList() {
	const [products, setProducts] = useState<Product[]>([
		{ desc: "iPad", price: 20000 },
		{ desc: "iPhone X", price: 30000 },
		{ desc: "MacBook Air", price: 42000 },
		{ desc: "AirPods Pro", price: 7990 },
	]);

	const [isOpen, setIsOpen] = useState(false);
	const [formDesc, setFormDesc] = useState("");
	const [formPrice, setFormPrice] = useState("");

	const openModal = () => setIsOpen(true);
	const closeModal = () => {
		setIsOpen(false);
		setFormDesc("");
		setFormPrice("");
	};

	const addProduct = () => {
		const trimmed = formDesc.trim();
		const num = Number(formPrice);
		if (!trimmed) {
			alert("請輸入產品名稱");
			return;
		}
		if (!formPrice || Number.isNaN(num) || num <= 0) {
			alert("請輸入有效價格（> 0）");
			return;
		}

		setProducts((prev: Product[]) => [...prev, { desc: trimmed, price: num }]);
		closeModal();
	};

	return (
		<main style={{ padding: "2.25rem", fontFamily: "Inter, Arial, sans-serif", color: "#111" }}>
			<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
				<h1 style={{ margin: 0 }}>產品列表</h1>
				<div style={{ display: "flex", gap: 12 }}>
					<Link href="/" style={{ textDecoration: "none", color: "#3b82f6" }}>回到首頁</Link>
					<button onClick={openModal} style={{ background: "#10b981", color: "white", border: "none", padding: "8px 12px", borderRadius: 6, cursor: "pointer" }}>
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

			{/* Modal */}
			{isOpen && (
				<div role="dialog" aria-modal="true" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
					<div style={{ width: 420, background: "#fff", borderRadius: 10, padding: 20, boxShadow: "0 10px 30px rgba(2,6,23,0.2)" }}>
						<h2 style={{ marginTop: 0 }}>新增產品</h2>
						<div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
							<label style={{ fontSize: 13, color: "#374151" }}>產品名稱</label>
							<input value={formDesc} onChange={(e) => setFormDesc(e.target.value)} placeholder="例如：Samsung S25" style={{ padding: 10, borderRadius: 6, border: "1px solid #e5e7eb" }} />

							<label style={{ fontSize: 13, color: "#374151" }}>價格 (NT$)</label>
							<input value={formPrice} onChange={(e) => setFormPrice(e.target.value)} placeholder="例如：19900" style={{ padding: 10, borderRadius: 6, border: "1px solid #e5e7eb" }} />

							<div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 6 }}>
								<button onClick={closeModal} style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid #e5e7eb", background: "white", cursor: "pointer" }}>取消</button>
								<button onClick={addProduct} style={{ padding: "8px 12px", borderRadius: 6, border: "none", background: "#2563eb", color: "white", cursor: "pointer" }}>新增</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</main>
	);
}
