import { API_ERROR_MESSAGE } from "./constants";

export const updateObject = (oldObject, updatedProps) => {
  return {
    ...oldObject,
    ...updatedProps,
  };
};

export const formatDate = (value) => {
  const date = value ? new Date(value) : new Date();
  // Format the date as needed
  let formattedDate = date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
  if (!value) {
    const day = String(date.getDate()).padStart(2, "0");
    const month = date.toLocaleString("en-US", { month: "short" }); // "Mar"
    const year = date.getFullYear();
    formattedDate = `${day}-${month}-${year}`;
  }
  return formattedDate;
};

export const formatDateTime = (value) => {
  if (!value) return "";

  const isoString = value.replace(" ", "T").replace(/\.\d+$/, "") + "Z";
  const date = new Date(isoString);

  const formattedDateTime = date.toLocaleString(undefined, {
    year: "numeric",
    month: "short", // e.g., Jan, Feb
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true, // for AM/PM format
  });

  return formattedDateTime;
};

export const formatDateToCustomFormat = (dateString) => {
  const date = new Date(dateString); // Parse the date string

  // Get the individual components
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based, so we add 1
  const day = String(date.getDate()).padStart(2, "0");

  // Return formatted date as "YYYY-MM-DD 00:00:00"
  return `${year}-${month}-${day} 00:00:00`;
};

export const getStatusChipProps = (status) => {
  let color;
  let borderColor;
  let title;

  switch (status) {
    case "In Progress":
      color = "#fffbe6";
      borderColor = "warning";
      title = "In Progress";
      break;
    case "Processing":
      color = "#e6f7ff";
      borderColor = "primary";
      title = "Processing";
      break;
    case "Draft":
      color = "#e6f7ff";
      borderColor = "primary";
      title = "Draft";
      break;
    case "Success":
    case "Completed":
    case "Active":
      color = "#f6ffed";
      borderColor = "success";
      title = "Success";
      break;
    case "Valid":
      color = "#f6ffed";
      borderColor = "success";
      title = "Valid";
      break;
    case "Failed":
      color = "#fff1f0";
      borderColor = "error";
      title = "Failed";
      break;
    case "Expired":
      color = "#fff1f0";
      borderColor = "error";
      title = "Expired";
      break;
    default:
      color = "#e6f7ff";
      borderColor = "primary";
      title = "None";
  }

  return { title, color, borderColor };
};

export const extractApiError = (errResponse) => {
  return (
    errResponse?.response?.data?.message ||
    errResponse?.error?.message ||
    API_ERROR_MESSAGE.INTERNAL_SERVER_ERROR
  );
};

export function generateFileName(filePath, projectName) {
  if (!filePath || !projectName) return "";

  const fileName = filePath.split("/").pop();
  if (!fileName) return "";

  const extIndex = fileName.lastIndexOf(".");
  const extension = extIndex !== -1 ? fileName.slice(extIndex) : "";
  const nameWithoutExt =
    extIndex !== -1 ? fileName.slice(0, extIndex) : fileName;

  const parts = nameWithoutExt.split("_");
  if (parts.length < 2) return fileName; // fallback safety

  parts.pop();

  return `${parts.join("_")}_${projectName}${extension}`;
}
