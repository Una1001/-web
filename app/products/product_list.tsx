"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { hasSupabase, supabase } from "../../lib/supabaseClient";

type Product = { id?: number; description: string; price: number };

export default function ProductList() {
  const router = useRouter();

  // auth guard
  async function ensureAuth(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return false;
      }
      return true;
    } catch (err) {
      console.error('Auth check failed', err);
      router.push('/login');
      return false;
    }
  }

  const [products, setProducts] = useState<Product[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [newProduct, setNewProduct] = useState({ description: "", price: "" });
  const [editingId, setEditingId] = useState<number | null>(null);

  // 開啟新增表單（先檢查登入）
  async function handleAddClick() {
    const ok = await ensureAuth();
    if (!ok) return;
    setEditingId(null);
    setNewProduct({ description: "", price: "" });
    setShowForm(true);
  }

  // 點編輯：填入表單並開啟（受權）
  const startEdit = async (p: Product) => {
    const ok = await ensureAuth();
    if (!ok) return;
    setEditingId(p.id ?? null);
    setNewProduct({ description: p.description, price: String(p.price) });
    setShowForm(true);
  };

  // 刪除
  const deleteProduct = async (id?: number) => {
    if (id == null) return;
    const ok = await ensureAuth();
    if (!ok) return;
    if (!confirm('確定要刪除這個產品嗎？')) return;
    if (hasSupabase) {
      try {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) throw error;
        setProducts(prev => prev.filter(p => p.id !== id));
      } catch (err) {
        console.error('刪除 product failed, falling back to local delete', err);
        setProducts(prev => prev.filter(p => p.id !== id));
      }
    } else {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleClick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({ ...prev, [name]: value }));
  };

  // 新增或更新
  const update = async () => {
    if (!newProduct.description || !newProduct.price) {
      alert("請填寫完整資訊");
      return;
    }

    const ok = await ensureAuth();
    if (!ok) return;

    const item = { description: newProduct.description, price: Number(newProduct.price) };

    if (editingId != null) {
      // update
      if (hasSupabase) {
        try {
          const { data, error } = await supabase.from('products').update(item).eq('id', editingId).select();
          if (error) throw error;
          if (Array.isArray(data) && data[0]) {
            setProducts(prev => prev.map(p => p.id === editingId ? (data[0] as Product) : p));
          }
        } catch (err) {
          console.error('更新 product failed, falling back to local update', err);
          setProducts(prev => prev.map(p => p.id === editingId ? { ...p, ...item } : p));
        }
      } else {
        setProducts(prev => prev.map(p => p.id === editingId ? { ...p, ...item } : p));
      }
    } else {
      // insert
      if (hasSupabase) {
        try {
          const { data, error } = await supabase.from("products").insert(item).select();
          if (error) throw error;
          if (Array.isArray(data) && data[0]) setProducts((prev) => [...prev, data[0] as Product]);
          else setProducts((prev) => [...prev, item]);
        } catch (err) {
          console.warn("Supabase insert failed, saving locally", err);
          setProducts((prev) => [...prev, item]);
        }
      } else {
        setProducts((prev) => [...prev, item]);
      }
    }

    setNewProduct({ description: "", price: "" });
    setShowForm(false);
    setEditingId(null);
  };

  useEffect(() => {
    const load = async () => {
      if (hasSupabase) {
        try {
          const { data, error } = await supabase.from("products").select("*").order("id", { ascending: true }).limit(500);
          if (!error && Array.isArray(data)) {
            setProducts(data as Product[]);
            setLoaded(true);
            return;
          }
        } catch (err) {
          console.error('Error loading products from Supabase', err);
          // fallback to local
        }
      }

      try {
        const raw = localStorage.getItem("products");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) setProducts(parsed as Product[]);
        }
      } catch (err) {
        console.error('Error reading products from localStorage', err);
      }

      setLoaded(true);
    };

    void load();
  }, []);

  // 只有在第一次載入完成後才把變動寫回 localStorage，避免覆蓋從 server 取得的資料
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem("products", JSON.stringify(products));
    } catch (err) {
      console.error('Error writing products to localStorage', err);
    }
  }, [products, loaded]);

  if (!loaded) {
    return (
      <main style={{ padding: "2.25rem", fontFamily: "Inter, Arial, sans-serif", color: "#111" }}>
        <h2>載入中...</h2>
      </main>
    );
  }

  return (
    <main style={{ padding: "2.25rem", fontFamily: "Inter, Arial, sans-serif", color: "#111" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <h1 style={{ margin: 0 }}>產品列表</h1>
        <div style={{ display: "flex", gap: 12 }}>
          <Link href="/" style={{ textDecoration: "none", color: "#3b82f6" }}>回到首頁</Link>
          <button onClick={() => { void handleAddClick(); }} style={{ background: "#2563eb", color: "white", border: "none", padding: "8px 12px", borderRadius: 6, cursor: "pointer" }}>
            新增產品
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
        {products.map((p, i) => (
          <div key={p.id ?? i} style={{ background: "white", borderRadius: 8, padding: 12, boxShadow: "0 6px 18px rgba(15,23,42,0.06)", display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 16, fontWeight: 600 }}>{p.description}</div>
            <div style={{ color: "#374151", fontWeight: 700 }}>NT$ {p.price.toLocaleString()}</div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
              <button onClick={() => startEdit(p)} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer' }}>編輯</button>
              <button onClick={() => deleteProduct(p.id)} style={{ padding: '6px 10px', borderRadius: 6, border: 'none', background: '#ef4444', color: 'white', cursor: 'pointer' }}>刪除</button>
            </div>
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
          }} onClick={() => { setShowForm(false); setEditingId(null); }} />
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
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <h3 style={{ margin: 0 }}>{editingId != null ? '編輯產品' : '新增產品'}</h3>

              <label style={{ fontSize: 13, color: "#374151" }}>產品名稱</label>
              <input type="text" name="description" value={newProduct.description} onChange={handleClick} placeholder="例如：幫忙吃飯服務" style={{ padding: 10, borderRadius: 6, border: "1px solid #e5e7eb" }} />

              <label style={{ fontSize: 13, color: "#374151" }}>價格 (NT$)</label>
              <input type="number" name="price" value={newProduct.price} onChange={handleClick} placeholder="例如：19900" style={{ padding: 10, borderRadius: 6, border: "1px solid #e5e7eb" }} />

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 6 }}>
                <button onClick={() => { setShowForm(false); setEditingId(null); }} style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid #e5e7eb", background: "white", cursor: "pointer" }}>取消</button>
                <button onClick={update} style={{ padding: "8px 12px", borderRadius: 6, border: "none", background: "#2563eb", color: "white", cursor: "pointer" }}>{editingId != null ? '儲存' : '新增'}</button>
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
}

