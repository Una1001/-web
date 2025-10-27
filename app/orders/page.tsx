"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase, hasSupabase } from "../../lib/supabaseClient";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";

export default function OrdersPage() {
  const router = useRouter();

  const seed = useMemo(
    () => [
      { id: 1001, customer: "張三", total: 1200 },
      { id: 1002, customer: "李四", total: 450 },
    ],
    []
  );

  const [orders, setOrders] = useState(seed);
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
          const { data, error } = await supabase.from("orders").select("*").order("id", { ascending: true }).limit(500);
          if (!error && Array.isArray(data)) {
            setOrders(data as any[]);
            return;
          }
        } catch (e) {
          // fallback
        }
      }
      try {
        const raw = localStorage.getItem("orders");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) setOrders(parsed);
        }
      } catch {}
    };

    void load();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("orders", JSON.stringify(orders));
    } catch {}
  }, [orders]);

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
          if (Array.isArray(data) && data[0]) setOrders((prev) => [...prev, data[0] as any]);
          else setOrders((prev) => [...prev, nextOrder]);
          setToast({ open: true, msg: "已新增訂單 (已寫入 Supabase)", severity: "success" });
        } catch (e) {
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

  return (
    <Container sx={{ padding: 3 }}>
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
