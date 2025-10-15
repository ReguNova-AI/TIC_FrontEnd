import { Button } from "antd";
import { GoogleDrivePickerService } from "services/api/googleDrivePickerService";
import { apiPath } from "config";

export default function GoogleDriveButton({ projectId }) {
  const handlePick = async () => {
    try {

      const userdetails = JSON.parse(sessionStorage.getItem('userDetails') || 'null');
      const userId = userdetails?.[0]?.user_id || null;
      console.log("userId:", userId);

      const res = await GoogleDrivePickerService.openGoogleDrivePicker({ user_id: userId, project_id: projectId });
      console.log('openGoogleDrivePicker response:', res);

      const url = res?.url || (res?.data && res.data.url) || res;
      if (typeof url === 'string' && url.length) {
        
        window.location.href = url;
        return;
      }
      const base = typeof apiPath === 'string' ? apiPath.replace(/\/$/, '') : '';
      window.location.href = `${base}/api/v1/google/authorize`;
    } catch (err) {
      console.error(err);
      alert("Failed to start Google Drive authorization.");
    }
  };

  return (
    <Button
      type="primary"
      onClick={handlePick}
      style={{
        borderRadius: 8,
        height: 40,
        fontSize: 14,
        fontWeight: 500,
        background: "linear-gradient(135deg, #34a853 0%, #4285f4 100%)",
        border: "none",
        color: "#fff",
      }}
    >
      Connect Google Drive
    </Button>
  );
}
