"use client";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { hasSupabase, supabase } from "../../lib/supabaseClient";
import styles from "./page.module.css";

type Customer = { id: number; name: string; email: string };

export default function CustomersPage() {
  const router = useRouter();

  // 不在一開始塞假資料，改為空陣列，使用 loaded 控制首次載入
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ open: boolean; msg: string; severity: "success" | "error" }>({ open: false, msg: "", severity: "success" });
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [fetchedCount, setFetchedCount] = useState<number | null>(null);

  function handleAdd() {
    setError(null);
    if (!name.trim()) {
      setError("請輸入姓名");
      return;
    }
    if (!email.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError("請輸入正確 Email");
      return;
    }

    const doAdd = async () => {
      const newCustomerLocal: Customer = {
        id: Date.now(),
        name: name.trim(),
        email: email.trim(),
      };

      if (editingId != null) {
        // 編輯模式
        if (hasSupabase) {
          try {
            const { data, error } = await supabase.from("customers").update({ name: newCustomerLocal.name, email: newCustomerLocal.email }).eq('id', editingId).select();
            if (error) throw error;
            if (Array.isArray(data) && data[0]) {
              setCustomers(prev => prev.map(c => c.id === editingId ? (data[0] as Customer) : c));
              setToast({ open: true, msg: "已更新顧客 (已寫入 Supabase)", severity: "success" });
            }
          } catch (err) {
            console.error('更新 customer failed, falling back to local update', err);
            setCustomers(prev => prev.map(c => c.id === editingId ? { ...c, name: newCustomerLocal.name, email: newCustomerLocal.email } : c));
            setToast({ open: true, msg: "更新 Supabase 失敗，本地已更新", severity: "error" });
          }
        } else {
          setCustomers(prev => prev.map(c => c.id === editingId ? { ...c, name: newCustomerLocal.name, email: newCustomerLocal.email } : c));
          setToast({ open: true, msg: "已更新顧客 (本地)", severity: "success" });
        }
      } else {
        // 新增模式
        if (hasSupabase) {
          try {
            const { data, error } = await supabase.from("customers").insert({ name: newCustomerLocal.name, email: newCustomerLocal.email }).select();
            if (error) throw error;
            if (Array.isArray(data) && data[0]) {
              setCustomers((prev) => [data[0] as Customer, ...prev]);
            } else {
              setCustomers((prev) => [newCustomerLocal, ...prev]);
            }
            setToast({ open: true, msg: "已新增顧客 (已寫入 Supabase)", severity: "success" });
          } catch (err) {
            console.error('新增 customer failed, falling back to local add', err);
            setCustomers((prev) => [newCustomerLocal, ...prev]);
            setToast({ open: true, msg: "新增 Supabase 失敗，已保留於本地", severity: "error" });
          }
        } else {
          setCustomers((prev) => [newCustomerLocal, ...prev]);
          setToast({ open: true, msg: "已新增顧客 (本地)", severity: "success" });
        }
      }

      setName("");
      setEmail("");
      setShowForm(false);
      setEditingId(null);
    };

    void doAdd();
  }

  // 確認使用者是否已登入，未登入會導到 /login
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

  // 新增按鈕：檢查登入後開啟表單
  async function handleAddClick() {
    const ok = await ensureAuth();
    if (!ok) return;
    setEditingId(null);
    setName("");
    setEmail("");
    setShowForm(true);
  }

  // 開始編輯
  const startEdit = async (c: Customer) => {
    const ok = await ensureAuth();
    if (!ok) return;
    setEditingId(c.id);
    setName(c.name);
    setEmail(c.email);
    setShowForm(true);
  };

  // 刪除
  const deleteCustomer = async (id: number) => {
    const ok = await ensureAuth();
    if (!ok) return;
    if (!confirm('確定要刪除這個顧客嗎？')) return;
    if (hasSupabase) {
      try {
        const { error } = await supabase.from('customers').delete().eq('id', id);
        if (error) throw error;
        setCustomers(prev => prev.filter(c => c.id !== id));
        setToast({ open: true, msg: '已刪除顧客 (已寫入 Supabase)', severity: 'success' });
      } catch (err) {
        console.error('刪除 customer failed, falling back to local delete', err);
        setCustomers(prev => prev.filter(c => c.id !== id));
        setToast({ open: true, msg: '刪除 Supabase 失敗，本地已移除', severity: 'error' });
      }
    } else {
      setCustomers(prev => prev.filter(c => c.id !== id));
      setToast({ open: true, msg: '已刪除顧客 (本地)', severity: 'success' });
    }
  };

  useEffect(() => {
    const load = async () => {
      if (hasSupabase) {
        try {
          const { data, error } = await supabase.from("customers").select("*").order("id", { ascending: false }).limit(100);
          console.log('customers load response', { data, error });
          setFetchedCount(Array.isArray(data) ? data.length : 0);
          if (!error && Array.isArray(data)) {
            setCustomers(data as Customer[]);
            setLoaded(true);
            return;
          }
          if (error) {
            setFetchError(String(error.message ?? error));
          }
        } catch (err) {
          console.error('Error loading customers from Supabase', err);
          setFetchError(String(err));
          // fallback to local
        }
      }
      try {
        const raw = localStorage.getItem("customers");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) setCustomers(parsed as Customer[]);
        }
      } catch (err) { console.error('Error reading customers from localStorage', err); }
      setLoaded(true);
    };

    void load();
  }, []);

  // 只有在載入完成後才把變動寫回 localStorage，避免覆蓋從 server 取得的資料
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem("customers", JSON.stringify(customers));
    } catch (err) { console.error('Error writing customers to localStorage', err); }
  }, [customers, loaded]);

  if (!loaded) {
    return (
      <div className={styles.wrapper}>
        <Container className={styles.card}>
          <Typography variant="h5" className={styles.title} sx={{ mb: 1 }}>
            載入中...
          </Typography>
        </Container>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <Container className={styles.card}>
        <Typography variant="h4" className={styles.title} sx={{ mb: 1 }}>
          顧客列表
        </Typography>
        <List className={styles.list}>
          {customers.map((c) => (
            <ListItem key={c.id} className={styles.listItem} divider>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                <div>
                  <div>{c.name}</div>
                  <div className={styles.email}>{c.email}</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button size="small" variant="outlined" onClick={() => startEdit(c)}>編輯</Button>
                  <Button size="small" variant="contained" color="error" onClick={() => deleteCustomer(c.id)}>刪除</Button>
                </div>
              </div>
            </ListItem>
          ))}
        </List>
        <div className={styles.actions}>
          <Link href="/">
            <Button variant="outlined" className={styles.linkButton}>
              回到首頁 (Link)
            </Button>
          </Link>
          <Button
            variant="contained"
            className={styles.primaryButton}
            onClick={() => router.push("/")}
          >
            使用 JS 跳轉回首頁
          </Button>
        </div>
        {/* 新增顧客按鈕固定在右下角 */}
        <Button
          variant="contained"
          sx={{
            position: "fixed",
            bottom: 36,
            right: 36,
            zIndex: 1200,
            borderRadius: "24px",
            minWidth: 80,
            minHeight: 48,
            fontSize: 18,
            boxShadow: "0 4px 16px rgba(0,0,0,0.13)",
            background: "#2f6fdb",
          }}
          onClick={() => setShowForm(true)}
        >
          新增
        </Button>
        {/* 彈跳視窗 */}
        {showForm && (
          <>
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                background: "rgba(0,0,0,0.18)",
                zIndex: 1300,
              }}
              onClick={() => setShowForm(false)}
            />
            <div
              style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                background: "#fff",
                borderRadius: 12,
                boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
                padding: 32,
                minWidth: 320,
                zIndex: 1400,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <Typography variant="h6" sx={{ mb: 2 }}>
                新增顧客
              </Typography>
              <Stack direction="column" spacing={2} sx={{ mb: 1 }}>
                <TextField
                  label="姓名"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  fullWidth
                />
                <TextField
                  label="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  fullWidth
                />
                {error && (
                  <Typography color="error" sx={{ mb: 1 }}>
                    {error}
                  </Typography>
                )}
                <Stack
                  direction="row"
                  spacing={2}
                  justifyContent="flex-end"
                >
                  <Button
                    variant="outlined"
                    onClick={() => setShowForm(false)}
                  >
                    取消
                  </Button>
                  <Button variant="contained" onClick={handleAdd}>
                    新增
                  </Button>
                </Stack>
              </Stack>
            </div>
          </>
        )}
      </Container>
    </div>
  );
}
