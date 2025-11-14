"use client";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { hasSupabase, supabase } from "../../lib/supabaseClient";
import styles from "./page.module.css";

type VipCustomer = { id: number; name: string; email: string };

export default function VipPage() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [customers, setCustomers] = useState<VipCustomer[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [toast, setToast] = useState<{ open: boolean; msg: string; severity: "success" | "error" }>({ open: false, msg: "", severity: "success" });

  const [openAdd, setOpenAdd] = useState(false);
  const nameRef = useRef<HTMLInputElement | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

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

  useEffect(() => {
    const load = async () => {
      if (hasSupabase) {
        try {
          const { data, error } = await supabase.from("vip_customers").select("*").order("created_at", { ascending: true }).limit(500);
          if (!error && Array.isArray(data)) {
            setCustomers(data as VipCustomer[]);
            setLoaded(true);
            return;
          }
          if (error) {
            console.error("Supabase vip_customers load error", error);
            setToast({ open: true, msg: String(error.message ?? error), severity: "error" });
          }
        } catch (e) {
          console.error("Supabase vip_customers load exception", e);
          setToast({ open: true, msg: "載入 vip_customers 發生錯誤，請稍後再試", severity: "error" });
        }
      } else {
        setToast({ open: true, msg: "Supabase 未設定，vip 資料無法載入", severity: "error" });
      }
      setLoaded(true);
    };

    void load();
  }, []);

  const validate = () => {
    const nextErrors: { name?: string; email?: string } = {};
    if (!name.trim()) nextErrors.name = "請輸入姓名";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) nextErrors.email = "請輸入 Email";
    else if (!emailRegex.test(email)) nextErrors.email = "Email 格式不正確";
    const dup = customers.some((c) => c.email.toLowerCase() === email.trim().toLowerCase());
    if (!nextErrors.email && dup) nextErrors.email = "此 Email 已存在於清單";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleAdd = () => {
    if (!validate()) return;
    const payload = { name: name.trim(), email: email.trim() };

    const doSave = async () => {
      const ok = await ensureAuth();
      if (!ok) return;

      if (editingId != null) {
        // update
        if (hasSupabase) {
          try {
            const { data, error } = await supabase.from('vip_customers').update(payload).eq('id', editingId).select();
            if (error) throw error;
            if (Array.isArray(data) && data[0]) {
              setCustomers((prev) => prev.map((c) => (c.id === editingId ? (data[0] as VipCustomer) : c)));
            }
            setToast({ open: true, msg: '已更新顧客資料', severity: 'success' });
          } catch (e) {
            console.error('Supabase update vip_customers failed', e);
            setToast({ open: true, msg: '更新到 Supabase 失敗', severity: 'error' });
          }
        } else {
          setCustomers((prev) => prev.map((c) => (c.id === editingId ? { ...c, ...payload } : c)));
        }
      } else {
        // insert
        if (hasSupabase) {
          try {
            const { data, error } = await supabase.from('vip_customers').insert(payload).select();
            if (error) throw error;
            if (Array.isArray(data) && data[0]) setCustomers((prev) => [...prev, data[0] as VipCustomer]);
            else setCustomers((prev) => [...prev, { id: Date.now(), ...payload } as VipCustomer]);
            setToast({ open: true, msg: '已新增顧客到 Supabase', severity: 'success' });
          } catch (e) {
            console.error('Supabase insert vip_customers failed', e);
            setToast({ open: true, msg: '新增到 Supabase 失敗', severity: 'error' });
          }
        } else {
          setCustomers((prev) => [...prev, { id: Date.now(), ...payload } as VipCustomer]);
        }
      }

      setName('');
      setEmail('');
      setErrors({});
      setOpenAdd(false);
      setEditingId(null);
    };

    void doSave();
  };

  const startEdit = async (c: VipCustomer) => {
    const ok = await ensureAuth();
    if (!ok) return;
    setEditingId(c.id);
    setName(c.name);
    setEmail(c.email);
    setOpenAdd(true);
  };

  const deleteVip = async (id: number) => {
    const ok = await ensureAuth();
    if (!ok) return;
    if (!confirm('確定要刪除這個 VIP 顧客嗎？')) return;
    if (hasSupabase) {
      try {
        const { error } = await supabase.from('vip_customers').delete().eq('id', id);
        if (error) throw error;
        setCustomers((prev) => prev.filter((x) => x.id !== id));
        setToast({ open: true, msg: '已從 Supabase 刪除', severity: 'success' });
      } catch (e) {
        console.error('刪除 vip_customers failed', e);
        setCustomers((prev) => prev.filter((x) => x.id !== id));
        setToast({ open: true, msg: '刪除 Supabase 失敗，本地已移除', severity: 'error' });
      }
    } else {
      setCustomers((prev) => prev.filter((x) => x.id !== id));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  const openAddDialog = () => {
    const check = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }
      } catch (e) {
        console.error('Auth check failed before opening vip add dialog', e);
        router.push('/login');
        return;
      }
      setName("");
      setEmail("");
      setErrors({});
      setOpenAdd(true);
      setTimeout(() => nameRef.current?.focus(), 50);
    };

    void check();
  };

  if (!mounted) return null;
  if (!loaded) {
    return (
      <div className={styles.wrapper}>
        <Container className={styles.card}>
          <Typography variant="h6">載入中...</Typography>
        </Container>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <Container className={styles.card}>
        <Typography variant="h4" className={styles.title} sx={{ mb: 1 }}>
          vip顧客列表
        </Typography>

        <div className={styles.actionsTop}>
          <Button variant="contained" className={styles.addButton} onClick={() => { setEditingId(null); void openAddDialog(); }}>
            新增顧客
          </Button>
        </div>

        <List className={styles.list}>
          {customers.map((c) => (
            <ListItem key={c.id} className={styles.listItem} divider>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                <div>
                  <div>{c.name}</div>
                  <div className={styles.email}>{c.email}</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button size="small" variant="outlined" onClick={() => void startEdit(c)}>編輯</Button>
                  <Button size="small" variant="contained" color="error" onClick={() => void deleteVip(c.id)}>刪除</Button>
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

          <Button variant="contained" className={styles.primaryButton} onClick={() => router.push("/")}>
            使用 JS 跳轉回首頁
          </Button>
        </div>

        <Dialog open={openAdd} onClose={() => setOpenAdd(false)} fullWidth maxWidth="sm">
          <DialogTitle>新增顧客</DialogTitle>
          <DialogContent>
            <Stack spacing={1.5} className={styles.fieldRow} sx={{ mt: 0.5 }}>
              <TextField
                inputRef={nameRef}
                label="姓名"
                placeholder="請輸入姓名"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleKeyDown}
                error={Boolean(errors.name)}
                helperText={errors.name}
                size="small"
                fullWidth
              />
              <TextField
                label="Email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                error={Boolean(errors.email)}
                helperText={errors.email}
                size="small"
                fullWidth
                type="email"
                inputMode="email"
                autoComplete="email"
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenAdd(false)}>取消</Button>
            <Button variant="contained" onClick={handleAdd} className={styles.addButton}>
              確認新增
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={toast.open}
          autoHideDuration={2200}
          onClose={() => setToast((t) => ({ ...t, open: false }))}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert severity={toast.severity} variant="filled" sx={{ width: "100%" }}>
            {toast.msg}
          </Alert>
        </Snackbar>
      </Container>
    </div>
  );
}
