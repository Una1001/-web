"use client";

import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { hasSupabase, supabase } from "../../lib/supabaseClient";

type Order = { orders_id: number; customer_id: number; total: number };

export default function OrdersPage() {
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]); // 初始設為空陣列

  const [isOpen, setIsOpen] = useState(false);
  const [formCustomerId, setFormCustomerId] = useState("");
  const [formTotal, setFormTotal] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  const closeModal = () => {
    setIsOpen(false);
    setFormCustomerId("");
    setFormTotal("");
  };

  // 確認使用者是否已登入，未登入會導到 /login
  async function ensureAuth(): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
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

  const addOrder = () => {
    const customer_id = parseInt(formCustomerId.trim(), 10);
    const total = parseFloat(formTotal.trim());
    if (isNaN(customer_id)) {
      alert("請輸入有效的客戶 ID");
      return;
    }
    if (isNaN(total)) {
      alert("請輸入有效的總金額");
      return;
    }

    const doAdd = async () => {
      const { data: customer, error: customerError } = await supabase
        .from("customers")
        .select("id")
        .eq("id", customer_id)
        .maybeSingle();

      if (customerError || !customer) {
        alert("這個客戶 ID 不存在，請先建立顧客或輸入正確的 ID");
        return;
      }

      const newOrderLocal = { orders_id: Math.floor(Math.random() * 1000000), customer_id, total }; // Replace Date.now() with a deterministic value

      const { data, error } = await supabase
        .from("orders")
        .insert({ customer_id, total })
        .select();

      if (error) {
        alert("新增失敗：" + error.message);
        return;
      }

      if (Array.isArray(data) && data[0]) {
        setOrders(prev => [data[0] as any, ...prev]);
      } else {
        setOrders(prev => [newOrderLocal, ...prev]); // Fallback for local addition
      }

      closeModal();
    };

    void doAdd();
  };

  const startEdit = async (o: Order) => {
    const ok = await ensureAuth();
    if (!ok) return;
    setEditingId(o.orders_id);
    setFormCustomerId(o.customer_id.toString());
    setFormTotal(o.total.toString());
    setIsOpen(true);
  };

  // 處理新增按鈕點擊：先檢查是否已登入，未登入則導向 /login
  async function handleAddClick() {
    try {
      const ok = await ensureAuth();
      if (!ok) return;
      setIsOpen(true);
    } catch (err) {
      console.error('Error checking auth before add:', err);
      router.push('/login');
    }
  }

  const saveEdit = () => {
    const customer_id = parseInt(formCustomerId.trim(), 10);
    const total = parseFloat(formTotal.trim());
    if (isNaN(customer_id)) return alert("請輸入有效的客戶 ID");
    if (isNaN(total)) return alert("請輸入有效的總金額");

    const doSave = async () => {
      if (editingId == null) return closeModal();
      if (hasSupabase) {
        try {
          const { data, error } = await supabase.from('orders').update({ customer_id, total }).eq('orders_id', editingId).select();
          if (error) throw error;
          if (Array.isArray(data) && data[0]) {
            setOrders(prev => prev.map(item => item.orders_id === editingId ? (data[0] as any) : item));
          }
        } catch (e) {
          setOrders(prev => prev.map(item => item.orders_id === editingId ? { ...item, customer_id, total } : item));
          alert('更新 Supabase 失敗，本地已更新');
        }
      } else {
        setOrders(prev => prev.map(item => item.orders_id === editingId ? { ...item, customer_id, total } : item));
      }

      closeModal();
      setEditingId(null);
    };

    void doSave();
  };

  const deleteOrder = async (id: number) => {
    const ok = await ensureAuth();
    if (!ok) return;
    if (!confirm('確定要刪除這個訂單嗎？')) return;
    const doDelete = async () => {
      if (hasSupabase) {
        try {
          const { error } = await supabase.from('orders').delete().eq('orders_id', id);
          if (error) throw error;
          setOrders(prev => prev.filter(o => o.orders_id !== id));
        } catch (e) {
          setOrders(prev => prev.filter(o => o.orders_id !== id));
          alert('刪除 Supabase 失敗，本地已移除');
        }
      } else {
        setOrders(prev => prev.filter(o => o.orders_id !== id));
      }
    };

    void doDelete();
  };

  useEffect(() => {
    const load = async () => {
      if (hasSupabase) {
        try {
          const { data, error } = await supabase.from("orders").select("*").order("orders_id", { ascending: false }).limit(100);
          if (!error && Array.isArray(data)) {
            setOrders(data as any[]);
            return;
          }
        } catch (e) {
          console.error("Failed to fetch orders from Supabase:", e);
        }
      }

      try {
        const raw = localStorage.getItem("orders");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) setOrders(parsed);
        }
      } catch (e) {
        console.error("Failed to load orders from localStorage:", e);
      }
    };

    void load();
  }, []);

  useEffect(() => {
    try {
      if (orders.length > 0) { // 確保只有在有資料時才更新 localStorage
        localStorage.setItem("orders", JSON.stringify(orders));
      }
    } catch (e) {
      console.error("Failed to save orders to localStorage:", e);
    }
  }, [orders]);

  return (
    <Container sx={{ padding: 3 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        訂單列表
      </Typography>

      <List sx={{ bgcolor: "background.paper" }}>
        {orders.map((o) => (
          <ListItem key={o.orders_id} divider>
            <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700 }}>訂單 ID: {o.orders_id}</div>
                <div style={{ color: "#555", fontSize: 13 }}>客戶 ID: {o.customer_id}</div>
                <div style={{ color: "#555", fontSize: 13 }}>總金額: {o.total}</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Button size="small" variant="outlined" onClick={() => startEdit(o)}>編輯</Button>
                <Button size="small" variant="contained" color="error" onClick={() => deleteOrder(o.orders_id)}>刪除</Button>
              </div>
            </div>
          </ListItem>
        ))}
      </List>

      <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
        <Link href="/">
          <Button variant="outlined">回到首頁 (Link)</Button>
        </Link>

        <Button variant="contained" onClick={() => router.push('/')}>使用 JS 跳轉回首頁</Button>

        <div style={{ marginLeft: "auto" }}>
          <Button variant="contained" color="success" onClick={() => { void handleAddClick(); }}>
            新增訂單
          </Button>
        </div>
      </div>

      {/* Modal */}
      {isOpen && (
        <div role="dialog" aria-modal="true" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ width: 420, background: "#fff", borderRadius: 10, padding: 20, boxShadow: "0 10px 30px rgba(2,6,23,0.2)" }}>
            <h2 style={{ marginTop: 0 }}>{editingId ? '編輯訂單' : '新增訂單'}</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <label style={{ fontSize: 13, color: "#374151" }}>客戶 ID</label>
              <input value={formCustomerId} onChange={(e) => setFormCustomerId(e.target.value)} placeholder="例如：1" style={{ padding: 10, borderRadius: 6, border: "1px solid #e5e7eb" }} />

              <label style={{ fontSize: 13, color: "#374151" }}>總金額</label>
              <input value={formTotal} onChange={(e) => setFormTotal(e.target.value)} placeholder="例如：5000" style={{ padding: 10, borderRadius: 6, border: "1px solid #e5e7eb" }} />

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 6 }}>
                <Button variant="outlined" onClick={() => { closeModal(); setEditingId(null); }}>取消</Button>
                {editingId ? (
                  <Button variant="contained" onClick={saveEdit}>儲存</Button>
                ) : (
                  <Button variant="contained" onClick={addOrder}>新增</Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}
