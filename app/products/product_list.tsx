"use client";


import React, { useEffect, useState } from "react";
import Link from "next/link";
import { supabase, hasSupabase } from "../../lib/supabaseClient";


type Product = { id?: number; description: string; price: number };

export default function ProductList() {
	const [products, setProducts] = useState<Product[]>([
		{ description: "找小偷", price: 20000 },
		{ description: "惡搞朋友", price: 30000 },
		{ description: "假中獎影片", price: 42000 },
		{ description: "假髮幫貼服務", price: 7990 },
	]);
	const [showForm, setShowForm] = useState(false);
	const [newProduct, setNewProduct] = useState({ description: "", price: "" });

	const handleClick = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setNewProduct((prev) => ({ ...prev, [name]: value }));
	};

	const update = async () => {
		if (!newProduct.description || !newProduct.price) {
			alert("請填寫完整資訊");
			return;
		}
			const item = { description: newProduct.description, price: Number(newProduct.price) };

			if (hasSupabase) {
				try {
					const { data, error } = await supabase.from("products").insert(item).select();
					if (error) throw error;
					if (Array.isArray(data) && data[0]) setProducts((prev) => [...prev, data[0] as Product]);
					else setProducts((prev) => [...prev, item]);
				} catch (e) {
					console.warn("Supabase insert failed, saving locally", e);
					setProducts((prev) => [...prev, item]);
				}
			} else {
				setProducts((prev) => [...prev, item]);
			}

			setNewProduct({ description: "", price: "" });
			setShowForm(false);
	};

		useEffect(() => {
			const load = async () => {
				if (hasSupabase) {
					try {
						const { data, error } = await supabase.from("products").select("*").order("id", { ascending: true }).limit(500);
						if (!error && Array.isArray(data)) {
							setProducts(data as Product[]);
							return;
						}
					} catch (e) {
						// fallback to local
					}
				}
				try { const raw = localStorage.getItem("products"); if (raw) { const parsed = JSON.parse(raw); if (Array.isArray(parsed)) setProducts(parsed); } } catch {}
			};

			void load();
		}, []);

		useEffect(() => { try { localStorage.setItem("products", JSON.stringify(products)); } catch {} }, [products]);

	return (
		<main style={{ padding: "2.25rem", fontFamily: "Inter, Arial, sans-serif", color: "#111" }}>
			<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
				<h1 style={{ margin: 0 }}>產品列表</h1>
				<div style={{ display: "flex", gap: 12 }}>
					<Link href="/" style={{ textDecoration: "none", color: "#3b82f6" }}>回到首頁</Link>
					<button onClick={() => setShowForm(true)} style={{ background: "#2563eb", color: "white", border: "none", padding: "8px 12px", borderRadius: 6, cursor: "pointer" }}>
						新增產品
					</button>
				</div>
			</div>

			<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
				{products.map((p, i) => (
					<div key={i} style={{ background: "white", borderRadius: 8, padding: 12, boxShadow: "0 6px 18px rgba(15,23,42,0.06)", display: "flex", flexDirection: "column", gap: 8 }}>
						<div style={{ fontSize: 16, fontWeight: 600 }}>{p.description}</div>
						<div style={{ color: "#374151", fontWeight: 700 }}>NT$ {p.price.toLocaleString()}</div>
					</div>
				))}
			</div>

			{showForm && (
				<>
					<div style={{
						position: "fixed",
						top: 0,
						left: 0,
						width: "100vw",
						height: "100vh",
						background: "rgba(0,0,0,0.25)",
						zIndex: 1000
					}} onClick={() => setShowForm(false)} />
					<div style={{
						position: "fixed",
						top: "50%",
						left: "50%",
						transform: "translate(-50%, -50%)",
						background: "#fff",
						borderRadius: 10,
						boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
						padding: 28,
						minWidth: 320,
						zIndex: 1001
					}}>
						<div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
							<label style={{ fontSize: 13, color: "#374151" }}>產品名稱</label>
							<input type="text" name="description" value={newProduct.description} onChange={handleClick} placeholder="例如：幫忙吃飯服務" style={{ padding: 10, borderRadius: 6, border: "1px solid #e5e7eb" }} />

							<label style={{ fontSize: 13, color: "#374151" }}>價格 (NT$)</label>
							<input type="number" name="price" value={newProduct.price} onChange={handleClick} placeholder="例如：19900" style={{ padding: 10, borderRadius: 6, border: "1px solid #e5e7eb" }} />

							<div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 6 }}>
								<button onClick={() => setShowForm(false)} style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid #e5e7eb", background: "white", cursor: "pointer" }}>取消</button>
								<button onClick={update} style={{ padding: "8px 12px", borderRadius: 6, border: "none", background: "#2563eb", color: "white", cursor: "pointer" }}>新增</button>
							</div>
						</div>
					</div>
				</>
			)}
		</main>
	);
}

