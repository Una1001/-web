"use client";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import { Box } from "@mui/material";
import React from "react";
import { supabase, hasSupabase } from "../../lib/supabaseClient";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import styles from "./page.module.css";

export default function CustomersPage() {
  const router = useRouter();

  const [customers, setCustomers] = React.useState([
    { id: 1, name: "劉書", email: "cherry@gmail.com" },
    { id: 2, name: "劉軒", email: "ivy@gmail.com" },
    { id: 3, name: "黃營", email: "humi@gmail.com" },
    { id: 4, name: "陳魚", email: "fish@gmail.com" },
    { id: 5, name: "高情", email: "high@gmail.com" },
  ]);
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [showForm, setShowForm] = React.useState(false);
  const [toast, setToast] = React.useState<{ open: boolean; msg: string; severity: "success" | "error" }>({ open: false, msg: "", severity: "success" });

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
      const newCustomerLocal = {
        id: Date.now(),
        name: name.trim(),
        email: email.trim(),
      };

      if (hasSupabase) {
        try {
          const { data, error } = await supabase.from("customers").insert({ name: newCustomerLocal.name, email: newCustomerLocal.email }).select();
          if (error) throw error;
          if (Array.isArray(data) && data[0]) {
            setCustomers((prev) => [data[0] as any, ...prev]);
          } else {
            setCustomers((prev) => [newCustomerLocal, ...prev]);
          }
          setToast({ open: true, msg: "已新增顧客 (已寫入 Supabase)", severity: "success" });
        } catch (e) {
          setCustomers((prev) => [newCustomerLocal, ...prev]);
          setToast({ open: true, msg: "新增 Supabase 失敗，已保留於本地", severity: "error" });
        }
      } else {
        setCustomers((prev) => [newCustomerLocal, ...prev]);
        setToast({ open: true, msg: "已新增顧客 (本地)", severity: "success" });
      }

      setName("");
      setEmail("");
      setShowForm(false);
    };

    void doAdd();
  }

  React.useEffect(() => {
    const load = async () => {
      if (hasSupabase) {
        try {
          const { data, error } = await supabase.from("customers").select("*").order("id", { ascending: false }).limit(100);
          if (!error && Array.isArray(data)) {
            setCustomers(data as any[]);
            return;
          }
        } catch (e) {
          // fallback to local
        }
      }
      try {
        const raw = localStorage.getItem("customers");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) setCustomers(parsed);
        }
      } catch {}
    };

    void load();
  }, []);

  React.useEffect(() => {
    try {
      localStorage.setItem("customers", JSON.stringify(customers));
    } catch {}
  }, [customers]);

  return (
    <div className={styles.wrapper}>
      <Container className={styles.card}>
        <Typography variant="h4" className={styles.title} sx={{ mb: 1 }}>
          顧客列表
        </Typography>
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
