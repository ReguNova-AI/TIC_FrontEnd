import { useState, useCallback } from "react";

export const useModalManager = () => {
  const [openModal, setOpenModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [uploadedDocument, setUploadedDocument] = useState([]);

  const handleModalOpen = useCallback((type) => {
    setModalType(type);
    setIsModalVisible(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setIsModalVisible(false);
  }, []);

  const handleFileModalOpen = useCallback(() => {
    setOpenModal(true);
  }, []);

  const handleFileModalClose = useCallback(() => {
    setOpenModal(false);
  }, []);

  const handleFileChange = useCallback((file) => {
    setUploadedDocument(file);
  }, []);

  return {
    openModal,
    modalType,
    isModalVisible,
    uploadedDocument,
    handleModalOpen,
    handleModalClose,
    handleFileModalOpen,
    handleFileModalClose,
    handleFileChange,
    setUploadedDocument,
  };
};

export const useSnackbarManager = () => {
  const [snackData, setSnackData] = useState({
    show: false,
    message: "",
    type: "error",
  });

  const showSnackbar = useCallback((message, type = "success") => {
    setSnackData({
      show: true,
      message,
      type,
    });
  }, []);

  const hideSnackbar = useCallback(() => {
    setSnackData((prev) => ({ ...prev, show: false }));
  }, []);

  return {
    snackData,
    setSnackData,
    showSnackbar,
    hideSnackbar,
  };
};
