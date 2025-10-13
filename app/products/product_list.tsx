"use client";

import Link from "next/link";

export default function ProductList() {
	let products = [
		{ desc: "iPad", price: 20000 },
		{ desc: "iPhone X", price: 30000 }
	];

	return (
		<main style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
			<h1 style={{ marginBottom: "1rem" }}>產品列表</h1>

			<ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
				{products.map((p, i) => (
					<li
						key={i}
						style={{
							padding: "0.75rem 0",
							borderBottom: "1px solid #eee",
							display: "flex",
							justifyContent: "space-between",
						}}
					>
						<span>{p.desc}</span>
						<span style={{ color: "#333", fontWeight: 600 }}>NT$ {p.price.toLocaleString()}</span>
					</li>
				))}
			</ul>

			<div style={{ marginTop: "1.25rem", display: "flex", gap: "1rem" }}>
				<Link href="/">回到首頁</Link>
				<button
					onClick={() => {
						// 簡單的 JS 跳轉示範
						window.location.href = "/";
					}}
				>
					JS 跳回首頁
				</button>
			</div>
		</main>
	);
}
