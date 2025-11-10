"use client";

import React, { useState } from "react";
import {
  Container,
  Card,
  CardHeader,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Box,
  Link as MuiLink
} from "@mui/material";
import Link from "next/link";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function RegisterPage() {
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    fullName: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // 驗證表單
    if (!form.email.trim()) {
      setError('請輸入電子郵件');
      return;
    }
    if (!form.password) {
      setError('請輸入密碼');
      return;
    }
    if (form.password.length < 6) {
      setError('密碼長度至少需要6個字元');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('密碼確認不相符');
      return;
    }
    if (!form.username.trim()) {
      setError('請輸入用戶名稱');
      return;
    }
    if (form.username.length < 3) {
      setError('用戶名稱至少需要3個字元');
      return;
    }

    setLoading(true);

    try {
      // 使用 Supabase Auth 註冊
      const { data, error: authError } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password,
        options: {
          data: {
            username: form.username.trim(),
            full_name: form.fullName.trim()
          }
        }
      });

      if (authError) {
        throw authError;
      }

      if (data.user && !data.user.email_confirmed_at) {
        setSuccess('註冊成功！請檢查您的電子郵件並點擊確認鏈接。');
      } else {
        setSuccess('註冊成功！');
      }

      // 清空表單
      setForm({
        email: '',
        password: '',
        confirmPassword: '',
        username: '',
        fullName: ''
      });

    } catch (err: unknown) {
      console.error('Registration error:', err);
      const errorMessage = err instanceof Error ? err.message : '註冊失敗，請稍後再試';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Card>
        <CardHeader
          title="用戶註冊"
          subheader="創建新帳號"
        />
        <CardContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="電子郵件"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              fullWidth
              autoComplete="email"
            />

            <TextField
              label="用戶名稱"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
              fullWidth
              autoComplete="username"
              helperText="至少3個字元"
            />

            <TextField
              label="全名"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              fullWidth
              autoComplete="name"
            />

            <TextField
              label="密碼"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              fullWidth
              autoComplete="new-password"
              helperText="至少6個字元"
            />

            <TextField
              label="確認密碼"
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              fullWidth
              autoComplete="new-password"
            />

            {error && (
              <Alert severity="error">
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success">
                {success}
              </Alert>
            )}

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 2 }}
            >
              {loading ? '註冊中...' : '註冊'}
            </Button>
          </Box>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2">
              已經有帳號了？{' '}
              <MuiLink component={Link} href="/login" underline="hover">
                登入
              </MuiLink>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}