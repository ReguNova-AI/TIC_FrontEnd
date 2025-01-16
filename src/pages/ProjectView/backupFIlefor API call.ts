 const runChecklistAPI = async () => {
    // const checklistfile = document.getElementById('fileInput').files[0];
    // const payload = new FormData();
    // payload.append("file", checklistfile);
    // window.open(checklistfile);

    // if (checklistfile) {
    //   // Convert file to binary (ArrayBuffer)
    //   const reader = new FileReader();

    //   reader.onloadend = () => {
    //     const binaryData = reader.result; // This will be an ArrayBuffer
    //     setFileBinary(binaryData); // Store the binary data in state
    //     console.log(binaryData); // Log or send to backend as needed
    //   };

    //   // Read the file as an ArrayBuffer (binary)
    //   reader.readAsArrayBuffer(checklistfile);
    // }

    // const headers = {
    //   'Content-Type': 'multipart/form-data',
    //   "Accept":"application/json",
    //   // "Access-Control-Allow-Origin":"*",
    //   // "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
    //   // "Access-Control-Allow-Headers": "Content-Type"
    // };

    // try {
    //   const response = await axios.post('http://54.158.101.113:8000/uploadstd_chat/', payload, {
    //     headers
    //   });
    //  console.log("response",response)
    // } catch (err) {
    //   console.log(err)
    //  }
    const payload = {};
    setChatloading(true);
    ProjectApiService.projectUploadStandardChat(payload)
      .then((response) => {
        // console.log("response",response)
        // setSnackData({
        //   show: true,
        //   message: response?.data?.message || API_SUCCESS_MESSAGE.FETCHED_SUCCESSFULLY,
        //   type: "success",
        // });
        // SetProjectData(response?.data?.details[0]);
        setChatloading(false);
      })
      .catch((errResponse) => {
        // setSnackData({
        //   show: true,
        //   message: errResponse?.error?.message || API_ERROR_MESSAGE.INTERNAL_SERVER_ERROR,
        //   type: "error",
        // });
        setChatloading(false);
      });
  };