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

export default function OrdersPage() {
  const router = useRouter();

  // orders 初始不放假資料；use loaded 來控制第一次載入
  type Order = { id: number; customer: string; total: number };
  const [orders, setOrders] = useState<Order[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [connStatus, setConnStatus] = useState<"ok" | "no-config" | "error" | "local">("local");
  const [connMessage, setConnMessage] = useState<string | null>(null);
  // prevent hydration mismatch by rendering content only after mount
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const [customer, setCustomer] = useState("");
  const [total, setTotal] = useState("");
  const [errors, setErrors] = useState<{ customer?: string; total?: string }>({});
  const [toast, setToast] = useState<{ open: boolean; msg: string; severity: "success" | "error" }>({ open: false, msg: "", severity: "success" });
  const [openAdd, setOpenAdd] = useState(false);
  const customerRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const load = async () => {
      if (hasSupabase) {
        try {
          // quick connectivity check + fetch (try ordering by id first)
          let data: unknown = null;
          let error: unknown = null;
          try {
            const res = await supabase.from("orders").select("*").order("id", { ascending: true }).limit(500);
            data = res.data;
            error = res.error;
          } catch (e) {
            // client-level error (will be handled below)
            error = e;
          }

          // If ordering by id failed because the table doesn't expose `id`, retry without order
          if (error && String((error as { message?: string }).message ?? error).includes("orders.id")) {
            console.warn('Retrying fetch without ordering by id due to DB schema:', error);
            try {
              const res2 = await supabase.from("orders").select("*").limit(500);
              data = res2.data;
              error = res2.error;
            } catch (e2) {
              error = e2;
            }
          }

          if (!error && Array.isArray(data)) {
            setOrders(data as Order[]);
            setConnStatus("ok");
            setConnMessage(null);
            setLoaded(true);
            return;
          }

          if (error) {
            console.error('Supabase query error', error);
            setConnStatus("error");
            setConnMessage(String((error as { message?: string }).message ?? String(error)));
          }
        } catch (err) {
          console.error('Error loading orders from Supabase', err);
          setConnStatus("error");
          setConnMessage(String(err));
          // fallback to local
        }
      }
      else {
        setConnStatus("no-config");
        setConnMessage("NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY missing or empty");
      }
      try {
        const raw = localStorage.getItem("orders");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) setOrders(parsed as Order[]);
        }
      } catch (err) {
        console.error('Error reading orders from localStorage', err);
      }
      setLoaded(true);
    };

    void load();
  }, []);

  // 只有在第一次載入完成後才把變動寫回 localStorage，避免覆蓋從 server 取得的資料
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem("orders", JSON.stringify(orders));
    } catch {}
  }, [orders, loaded]);

  const validate = () => {
    const next: { customer?: string; total?: string } = {};
    if (!customer.trim()) next.customer = "請輸入顧客姓名";
    const num = Number(total);
    if (!total.trim()) next.total = "請輸入金額";
    else if (Number.isNaN(num) || num <= 0) next.total = "金額需為大於 0 的數字";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleAdd = () => {
    if (!validate()) return;
    const nextOrder = {
      id: orders.length ? Math.max(...orders.map((o) => o.id)) + 1 : 1,
      customer: customer.trim(),
      total: Number(total),
    };

    const doAdd = async () => {
      if (hasSupabase) {
        try {
          const { data, error } = await supabase.from("orders").insert({ customer: nextOrder.customer, total: nextOrder.total }).select();
          if (error) throw error;
          if (Array.isArray(data) && data[0]) setOrders((prev) => [...prev, data[0] as Order]);
          else setOrders((prev) => [...prev, nextOrder]);
          setToast({ open: true, msg: "已新增訂單 (已寫入 Supabase)", severity: "success" });
        } catch (e) {
          console.error('Error inserting order to Supabase', e);
          setOrders((prev) => [...prev, nextOrder]);
          setToast({ open: true, msg: "新增 Supabase 失敗，已保留於本地", severity: "error" });
        }
      } else {
        setOrders((prev) => [...prev, nextOrder]);
        setToast({ open: true, msg: "已新增訂單 (本地)", severity: "success" });
      }

      setCustomer("");
      setTotal("");
      setErrors({});
      setOpenAdd(false);
    };

    void doAdd();
  };

  const openAddDialog = () => {
    setCustomer("");
    setTotal("");
    setErrors({});
    setOpenAdd(true);
    setTimeout(() => customerRef.current?.focus(), 50);
  };

  if (!mounted) return null;

  // 如果還沒載入完，顯示載入提示（避免顯示預設假的 seed 資料）
  if (!loaded) {
    return (
      <Container sx={{ padding: 3 }}>
        <Typography variant="h6">訂單列表</Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>載入中...</Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ padding: 3 }}>
      {connStatus !== "ok" && (
        <Alert severity={connStatus === "error" ? "error" : "warning"} sx={{ mb: 2 }}>
          {connStatus === "no-config"
            ? "Supabase 未設定或環境變數缺失，請檢查 .env.local"
            : connMessage ?? "無法連到 Supabase，畫面改以本地資料顯示"}
        </Alert>
      )}
      <Typography variant="h4" sx={{ mb: 2 }}>
        訂單列表
      </Typography>

      <div style={{ marginBottom: 12 }}>
        <Button variant="contained" onClick={openAddDialog} sx={{ mr: 1 }}>
          新增訂單
        </Button>
        <Link href="/">
          <Button variant="outlined">回到首頁 (Link)</Button>
        </Link>
        <Button variant="contained" onClick={() => router.push('/')} sx={{ ml: 1 }}>
          使用 JS 跳轉回首頁
        </Button>
      </div>

      <List sx={{ bgcolor: "background.paper" }}>
        {orders.map((o) => (
          <ListItem key={o.id} divider>
            訂單 #{o.id} - {o.customer} - NT${o.total}
          </ListItem>
        ))}
      </List>

      <Dialog open={openAdd} onClose={() => setOpenAdd(false)} fullWidth maxWidth="sm">
        <DialogTitle>新增訂單</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ mt: 1 }}>
            <TextField
              inputRef={customerRef}
              label="顧客"
              placeholder="顧客姓名"
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              error={Boolean(errors.customer)}
              helperText={errors.customer}
              size="small"
              fullWidth
            />
            <TextField
              label="金額"
              placeholder="請輸入金額"
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              error={Boolean(errors.total)}
              helperText={errors.total}
              size="small"
              fullWidth
              inputMode="numeric"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAdd(false)}>取消</Button>
          <Button variant="contained" onClick={handleAdd}>
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
  );
}
