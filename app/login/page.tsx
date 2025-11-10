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

export default function LoginPage() {
  const [form, setForm] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState<string | null>(null);
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

    // 驗證表單
    if (!form.email.trim()) {
      setError('請輸入電子郵件');
      return;
    }
    if (!form.password) {
      setError('請輸入密碼');
      return;
    }

    setLoading(true);

    try {
      // 使用 Supabase Auth 登入
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: form.email.trim(),
        password: form.password
      });

      if (authError) {
        throw authError;
      }

      if (data.user) {
        // 登入成功，重定向到首頁
        window.location.href = '/';
      }

    } catch (err: unknown) {
      console.error('Login error:', err);
      const errorMessage = err instanceof Error ? err.message : '登入失敗，請稍後再試';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Card>
        <CardHeader
          title="用戶登入"
          subheader="登入您的帳號"
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
              label="密碼"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              fullWidth
              autoComplete="current-password"
            />

            {error && (
              <Alert severity="error">
                {error}
              </Alert>
            )}

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 2 }}
            >
              {loading ? '登入中...' : '登入'}
            </Button>
          </Box>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2">
              還沒有帳號？{' '}
              <MuiLink component={Link} href="/register" underline="hover">
                註冊
              </MuiLink>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}