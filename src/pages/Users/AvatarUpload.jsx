import React from "react";
import "./style.scss";
import userPhoto from "../../assets/images/users/userPhoto.jpg";
import { API_ERROR_MESSAGE, FORM_LABEL } from "shared/constants";

const fileToDataUri = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      resolve(event.target.result);
    };
    reader.onerror = reject; // Add error handling
    reader.readAsDataURL(file);
  });

const Avatar = ({ url, onImageChange }) => {
  const [uri, setUri] = React.useState(url);

  React.useEffect(() => {
    setUri(url);
  }, [url]);

  const onChange = ({ target }) => {
    const img = target.files[0];
    if (!img) {
      alert(API_ERROR_MESSAGE.NO_FILE_SELECTED);
      return;
    }

    fileToDataUri(img)
      .then((dataUri) => {
        setUri(dataUri);
        if (onImageChange) {
          onImageChange(dataUri); // Pass the base64 string back to the parent
        }
      })
      .catch((error) => {
        console.error("Error reading file:", error);
      });
  };

  return (
    <div className="avatar__container container clearfix">
      <div className="avatar" style={{ backgroundImage: `url(${uri})` }}>
        <input id="fileUpload" type="file" onChange={onChange} />
        <CameraSvg />
        <div id="openModal">
          <span>{FORM_LABEL.DROP_HERE}</span>
        </div>
      </div>
    </div>
  );
};

const CameraSvg = () => (
  <svg
    version="1.1"
    id="camera"
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    x="0px"
    y="0px"
    viewBox="0 0 25 15"
    enableBackground="new 0 0 25 15"
    xmlSpace="preserve"
  >
    <path
      id="cameraFrame"
      fill="none"
      stroke="white"
      strokeMiterlimit={10}
      d="M23.1,14.1H1.9c-0.6,0-1-0.4-1-1V1.9c0-0.6,0.4-1,1-1h21.2
      c0.6,0,1,0.4,1,1v11.3C24.1,13.7,23.7,14.1,23.1,14.1z"
    />
    <path
      id="circle"
      fill="none"
      stroke="#ffffff"
      strokeWidth="1.4"
      strokeMiterlimit={12}
      d="M17.7,7.5c0-2.8-2.3-5.2-5.2-5.2S7.3,4.7,7.3,7.5s2.3,5.2,5.2,5.2
      S17.7,10.3,17.7,7.5z"
    />
    <g id="plus">
      <path
        fill="none"
        id="plusLine"
        className="line"
        stroke="#ffffff"
        strokeLinecap="round"
        strokeMiterlimit={10}
        d="M20.9,2.3v4.4"
      />
      <path
        fill="none"
        className="line"
        stroke="#ffffff"
        strokeLinecap="round"
        strokeMiterlimit={10}
        d="M18.7,4.6h4.4"
      />
    </g>
  </svg>
);

const Custom = ({ onUpload }) => {
  const [imageBase64, setImageBase64] = React.useState(null);

  // Callback function to handle the base64 image from the child
  const handleImageChange = (base64) => {
    setImageBase64(base64);
    onUpload(base64);
    // console.log("Base64 Image Data:", base64);
  };

  return (
    <div className="custom">
      <div>
        <link
          href="https://fonts.googleapis.com/css?family=Raleway:400,300"
          rel="stylesheet"
          type="text/css"
        />
        <Avatar
          url={userPhoto} // Default image URL
          onImageChange={handleImageChange} // Pass the callback to the Avatar component
        />
        {/* {imageBase64 && (
          <div>
            <p>Base64 Image:</p>
            <img src={imageBase64} alt="Selected Avatar" width="100" height="100" />
          </div>
        )} */}
      </div>
    </div>
  );
};

export default Custom;
