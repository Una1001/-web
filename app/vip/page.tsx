"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
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
  const nameRef = useRef<HTMLInputElement | null>(null);

  // 可選：將資料暫存在 localStorage（重新整理不會不見）
  useEffect(() => {
    try {
      const raw = localStorage.getItem("vip_customers");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setCustomers(parsed);
      }
    } catch {}
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
    setCustomers((prev) => [...prev, next]);
    setName("");
    setEmail("");
    setToast({ open: true, msg: "已新增顧客", severity: "success" });
    nameRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className={styles.wrapper}>
      <Container className={styles.card}>
        <Typography variant="h4" className={styles.title} sx={{ mb: 1 }}>
          vip顧客列表
        </Typography>

        {/* 新增區塊 */}
        <div className={styles.form}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} className={styles.fieldRow}>
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
            <Button
              variant="contained"
              className={styles.addButton}
              onClick={handleAdd}
              sx={{ whiteSpace: "nowrap" }}
            >
              新增顧客
            </Button>
          </Stack>
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


