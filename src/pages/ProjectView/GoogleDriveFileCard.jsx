import { useEffect, useState } from "react";
import { Button, Card, List, Checkbox, Divider, Space, Spin, message, Tag } from "antd";
import { GoogleDrivePickerService } from "services/api/googleDrivePickerService";
import BaseApiService from "services/api/BaseApiService";

const APP_ID = import.meta.env.VITE_GOOGLE_APP_ID || "";

export default function GoogleDriveFileCard({ projectId, onUploadSuccess }) {
  const [isConnected, setIsConnected] = useState(true);
  const [pickerApiLoaded, setPickerApiLoaded] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  const [driveFiles, setDriveFiles] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [uploading, setUploading] = useState(false);

  const isExpanded = loadingFiles || driveFiles.length > 0;

  // ---------------- LOAD PICKER SCRIPT ----------------
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://apis.google.com/js/api.js";
    script.async = true;
    script.onload = () => {
      try {
        window.gapi.load("client:picker", {
          callback: () => setPickerApiLoaded(true),
          onerror: (err) => console.error("Picker API load error:", err),
        });
      } catch (err) {
        console.error("gapi load failed", err);
      }
    };
    document.body.appendChild(script);
    return () => {
      try {
        document.body.removeChild(script);
      } catch {}
    };
  }, []);

  // ---------------- FETCH TOKEN ----------------
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const userdetails = JSON.parse(sessionStorage.getItem("userDetails") || "null");
        const userId = userdetails?.[0]?.user_id || null;
        if (!userId) return;
        const data = await GoogleDrivePickerService.getGoogleAccessToken(userId);
        const token = data?.access_token || data?.accessToken || null;
        setAccessToken(token);
      } catch (err) {
        console.warn("Could not fetch google access token", err);
      }
    };
    fetchToken();
  }, []);

  // ---------------- PICKER OPEN ----------------
  const openPicker = () => {
    if (!pickerApiLoaded) return message.error("Picker not loaded");
    if (!accessToken) return message.warning("Please connect Google Drive first");

    const view = new window.google.picker.DocsView()
      .setIncludeFolders(true)
      .setSelectFolderEnabled(true)
      .setMode(window.google.picker.DocsViewMode.FOLDERS_AND_FILES);

    const picker = new window.google.picker.PickerBuilder()
      .addView(view)
      .enableFeature(window.google.picker.Feature.MULTISELECT_ENABLED)
      .setAppId(APP_ID)
      .setOAuthToken(accessToken)
      .setCallback(async (data) => {
        if (data.action === window.google.picker.Action.PICKED) {
          const docs = data.docs || [];
          const fileDocs = docs.filter((d) => d.mimeType !== "application/vnd.google-apps.folder");
          setDriveFiles(fileDocs.map((d) => ({ id: d.id, name: d.name || d.title })));
          setSelected(new Set(fileDocs.map((f) => f.id)));
        }
      })
      .build();

    picker.setVisible(true);
  };

  // ---------------- HANDLERS ----------------
  const toggle = (id) => {
    setSelected((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  const handleUpload = async () => {
    if (!projectId) return message.error("No project selected");
    if (selected.size === 0) return message.warning("No files selected");
    setUploading(true);
    try {
      const userdetails = JSON.parse(sessionStorage.getItem("userDetails") || "null");
      const userId = userdetails?.[0]?.user_id || null;
      const fileIds = driveFiles.filter((d) => selected.has(d.id)).map((d) => d.id);
      await BaseApiService.post(`/api/v1/google/fetch-and-upload`, null, {
        file_ids: fileIds,
        user_id: userId,
        project_id: projectId,
      });
      message.success("Files uploaded successfully!");
      if (typeof onUploadSuccess === "function") onUploadSuccess();
      setDriveFiles([]);
      setSelected(new Set());
    } catch (err) {
      console.error("upload error", err);
      message.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      const userdetails = JSON.parse(sessionStorage.getItem("userDetails") || "null");
      const userId = userdetails?.[0]?.user_id || null;
      await BaseApiService.post(`/api/v1/google/disconnect`, null, { user_id: userId });
      message.success("Disconnected Google Drive");
      setAccessToken(null);
      setDriveFiles([]);
      setSelected(new Set());
      setIsConnected(false);
      if (typeof onUploadSuccess === "function") onUploadSuccess();
    } catch (err) {
      console.error("disconnect failed", err);
      message.error("Failed to disconnect");
    }
  };

  // ---------------- UI ----------------
  return (
<Card
  size="small"
  bodyStyle={{
    padding: "12px 16px",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  }}
  style={{
    width: "100%",
    borderRadius: 8,
    boxShadow: "0 0 6px rgba(0,0,0,0.08)",
    marginTop: 4,
  }}
>
  {/* Title + Pick Files + Disconnect */}
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
    {/* Left side: Title + Tag + Pick Files */}
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontWeight: 600, fontSize: 15 }}>Google Drive</span>
      {accessToken ? (
        <Tag color="green" style={{ margin: 0, padding: "0 6px", fontSize: 12 }}>
          Connected
        </Tag>
      ) : (
        <Tag style={{ margin: 0, padding: "0 6px", fontSize: 12 }}>Not connected</Tag>
      )}
      <Button
        type="primary"
        onClick={openPicker}
        disabled={!pickerApiLoaded || !accessToken}
        size="middle"
        style={{ height: 30 }}
      >
        Pick Files
      </Button>
    </div>

    {/* Right side: Disconnect */}
    <Button
      danger
      onClick={handleDisconnect}
      disabled={!accessToken}
      size="middle"
      style={{ height: 36 }}
    >
      Disconnect
    </Button>
  </div>

  {isExpanded && (
    <>
      <Divider style={{ margin: "8px 0" }} />
      {loadingFiles ? (
        <Spin size="small" />
      ) : (
        <div style={{ maxHeight: 180, overflowY: "auto" }}>
          <List
            size="small"
            dataSource={driveFiles}
            renderItem={(item) => (
              <List.Item style={{ padding: "4px 0" }}>
                <Checkbox checked={selected.has(item.id)} onChange={() => toggle(item.id)} />
                <span style={{ marginLeft: 8 }}>{item.name}</span>
              </List.Item>
            )}
          />
        </div>
      )}
      <Button
        type="primary"
        onClick={handleUpload}
        loading={uploading}
        disabled={uploading || selected.size === 0}
        size="middle"
        style={{ marginTop: 8, width: "100%" }}
      >
        Upload Selected
      </Button>
    </>
  )}
</Card>

  );
}
