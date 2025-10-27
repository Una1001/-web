"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase, hasSupabase } from "../../lib/supabaseClient";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function CustomersPage() {
  const router = useRouter();

  // 初始資料（若有 localStorage 儲存則以其為主）
  const initialSeed = useMemo(
    () => [
      { id: 1, name: "陳魚", email: "fish@gmail.com" },
      { id: 2, name: "高情", email: "high@gmail.com" },
    ],
    []
  );

  const [customers, setCustomers] = useState(initialSeed);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [toast, setToast] = useState<{ open: boolean; msg: string; severity: "success" | "error" }>(
    { open: false, msg: "", severity: "success" }
  );

  // 控制「新增顧客」Dialog
  const [openAdd, setOpenAdd] = useState(false);
  const nameRef = useRef<HTMLInputElement | null>(null);

  // 可選：將資料暫存在 localStorage（重新整理不會不見）
  useEffect(() => {
    // If Supabase is configured, prefer loading from the remote table.
    const load = async () => {
      if (hasSupabase) {
        try {
          const { data, error } = await supabase.from("vip_customers").select("*").order("id", { ascending: true });
          if (error) throw error;
          if (Array.isArray(data)) {
            setCustomers(data as any[]);
            return;
          }
        } catch (e) {
          // fall back to localStorage on error
          // console.warn("Supabase load failed, falling back to localStorage", e);
        }
      }

      try {
        const raw = localStorage.getItem("vip_customers");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) setCustomers(parsed);
        }
      } catch {}
    };

    load();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("vip_customers", JSON.stringify(customers));
    } catch {}
  }, [customers]);

  const validate = () => {
    const nextErrors: { name?: string; email?: string } = {};
    if (!name.trim()) nextErrors.name = "請輸入姓名";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) nextErrors.email = "請輸入 Email";
    else if (!emailRegex.test(email)) nextErrors.email = "Email 格式不正確";

    // 檢查是否重複（以 email 為唯一）
    const dup = customers.some((c) => c.email.toLowerCase() === email.trim().toLowerCase());
    if (!nextErrors.email && dup) nextErrors.email = "此 Email 已存在於清單";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleAdd = () => {
    if (!validate()) return;
    const next = {
      id: customers.length ? Math.max(...customers.map((c) => c.id)) + 1 : 1,
      name: name.trim(),
      email: email.trim(),
    };
    const doAdd = async () => {
      if (hasSupabase) {
        try {
          const { data, error } = await supabase.from("vip_customers").insert({ name: next.name, email: next.email }).select();
          if (error) throw error;
          if (Array.isArray(data)) {
            setCustomers((prev) => [...prev, data[0] as any]);
          } else {
            setCustomers((prev) => [...prev, next]);
          }
        } catch (e) {
          // If insert failed, still update locally and show error toast
          setCustomers((prev) => [...prev, next]);
          setToast({ open: true, msg: "新增到 Supabase 失敗，已保留於本地", severity: "error" });
        }
      } else {
        setCustomers((prev) => [...prev, next]);
      }

      setName("");
      setEmail("");
      setErrors({});
      setOpenAdd(false);
      // success toast only when not already an error toast
      setToast((t) => (t.severity === "error" ? t : { open: true, msg: "已新增顧客", severity: "success" }));
    };

    void doAdd();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  const openAddDialog = () => {
    setName("");
    setEmail("");
    setErrors({});
    setOpenAdd(true);
    // 小延遲確保 Dialog 掛載完成後再聚焦
    setTimeout(() => nameRef.current?.focus(), 50);
  };

  return (
    <div className={styles.wrapper}>
      <Container className={styles.card}>
        <Typography variant="h4" className={styles.title} sx={{ mb: 1 }}>
          vip顧客列表
        </Typography>

        {/* 只顯示按鈕；點擊後彈出新增對話框 */}
        <div className={styles.actionsTop}>
          <Button variant="contained" className={styles.addButton} onClick={openAddDialog}>
            新增顧客
          </Button>
        </div>

        {/* 清單 */}
        <List className={styles.list}>
          {customers.map((c) => (
            <ListItem key={c.id} className={styles.listItem} divider>
              <div>
                <div>{c.name}</div>
                <div className={styles.email}>{c.email}</div>
              </div>
            </ListItem>
          ))}
        </List>

        {/* 動作按鈕 */}
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

        {/* 新增顧客 Dialog */}
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
