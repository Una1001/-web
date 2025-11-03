"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Button from "@mui/material/Button";
import { supabase, hasSupabase } from "../../lib/supabaseClient";

type Vendor = { id: number; name: string; contact: string };

export default function VendorsPage() {
  const router = useRouter();

  const [vendors, setVendors] = useState<Vendor[]>([
  
  ]);

  const [isOpen, setIsOpen] = useState(false);
  const [formName, setFormName] = useState("");
  const [formContact, setFormContact] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  const openModal = () => setIsOpen(true);
  const closeModal = () => {
    setIsOpen(false);
    setFormName("");
    setFormContact("");
  };

  const addVendor = () => {
    const name = formName.trim();
    const contact = formContact.trim();
    if (!name) {
      alert("請輸入廠商名稱");
      return;
    }
    if (!contact) {
      alert("請輸入聯絡資訊");
      return;
    }

    const doAdd = async () => {
      const newVendorLocal = { id: Date.now(), name, contact };

      if (hasSupabase) {
        try {
          const { data, error } = await supabase.from("vendors").insert({ name: newVendorLocal.name, contact: newVendorLocal.contact }).select();
          if (error) throw error;
          if (Array.isArray(data) && data[0]) {
            setVendors((prev) => [data[0] as any, ...prev]);
          } else {
            setVendors((prev) => [newVendorLocal, ...prev]);
          }
        } catch (e) {
          setVendors((prev) => [newVendorLocal, ...prev]);
          alert("新增 Supabase 失敗，已保留於本地");
        }
      } else {
        setVendors((prev) => [newVendorLocal, ...prev]);
      }

      closeModal();
    };

    void doAdd();
  };

  const startEdit = (v: Vendor) => {
    setEditingId(v.id);
    setFormName(v.name);
    setFormContact(v.contact);
    setIsOpen(true);
  };

  const saveEdit = () => {
    const name = formName.trim();
    const contact = formContact.trim();
    if (!name) return alert("請輸入廠商名稱");
    if (!contact) return alert("請輸入聯絡資訊");

    const doSave = async () => {
      if (editingId == null) return closeModal();
      if (hasSupabase) {
        try {
          const { data, error } = await supabase.from('vendors').update({ name, contact }).eq('id', editingId).select();
          if (error) throw error;
          if (Array.isArray(data) && data[0]) {
            setVendors(prev => prev.map(item => item.id === editingId ? (data[0] as any) : item));
          }
        } catch (e) {
          setVendors(prev => prev.map(item => item.id === editingId ? { ...item, name, contact } : item));
          alert('更新 Supabase 失敗，本地已更新');
        }
      } else {
        setVendors(prev => prev.map(item => item.id === editingId ? { ...item, name, contact } : item));
      }

      closeModal();
      setEditingId(null);
    };

    void doSave();
  };

  const deleteVendor = (id: number) => {
    if (!confirm('確定要刪除這個廠商嗎？')) return;
    const doDelete = async () => {
      if (hasSupabase) {
        try {
          const { error } = await supabase.from('vendors').delete().eq('id', id);
          if (error) throw error;
          setVendors(prev => prev.filter(v => v.id !== id));
        } catch (e) {
          setVendors(prev => prev.filter(v => v.id !== id));
          alert('刪除 Supabase 失敗，本地已移除');
        }
      } else {
        setVendors(prev => prev.filter(v => v.id !== id));
      }
    };

    void doDelete();
  };

  useEffect(() => {
    const load = async () => {
      if (hasSupabase) {
        try {
          const { data, error } = await supabase.from("vendors").select("*").order("id", { ascending: false }).limit(100);
          if (!error && Array.isArray(data)) {
            setVendors(data as any[]);
            return;
          }
        } catch (e) {
          // fallback to local
        }
      }

      try {
        const raw = localStorage.getItem("vendors");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) setVendors(parsed);
        }
      } catch {}
    };

    void load();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("vendors", JSON.stringify(vendors));
    } catch {}
  }, [vendors]);

  return (
    <Container sx={{ padding: 3 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        廠商列表
      </Typography>

      <List sx={{ bgcolor: "background.paper" }}>
        {vendors.map((v) => (
          <ListItem key={v.id} divider>
            <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700 }}>{v.name}</div>
                <div style={{ color: "#555", fontSize: 13 }}>{v.contact}</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Button size="small" variant="outlined" onClick={() => startEdit(v)}>編輯</Button>
                <Button size="small" variant="contained" color="error" onClick={() => deleteVendor(v.id)}>刪除</Button>
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
          <Button variant="contained" color="success" onClick={openModal}>
            新增廠商
          </Button>
        </div>
      </div>

      {/* Modal */}
      {isOpen && (
        <div role="dialog" aria-modal="true" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ width: 420, background: "#fff", borderRadius: 10, padding: 20, boxShadow: "0 10px 30px rgba(2,6,23,0.2)" }}>
            <h2 style={{ marginTop: 0 }}>{editingId ? '編輯廠商' : '新增廠商'}</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <label style={{ fontSize: 13, color: "#374151" }}>廠商名稱</label>
              <input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="例如：CCC 貿易" style={{ padding: 10, borderRadius: 6, border: "1px solid #e5e7eb" }} />

              <label style={{ fontSize: 13, color: "#374151" }}>聯絡資訊</label>
              <input value={formContact} onChange={(e) => setFormContact(e.target.value)} placeholder="例如：admin@example.com 或 0912-345678" style={{ padding: 10, borderRadius: 6, border: "1px solid #e5e7eb" }} />

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 6 }}>
                <Button variant="outlined" onClick={() => { closeModal(); setEditingId(null); }}>取消</Button>
                {editingId ? (
                  <Button variant="contained" onClick={saveEdit}>儲存</Button>
                ) : (
                  <Button variant="contained" onClick={addVendor}>新增</Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}
