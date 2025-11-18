import axios from "axios";
import FormData from "form-data";
import fs from "fs";

export const transcribeAudio = async (filePath, lang) => {
  const form = new FormData();
  
  // audio file
  form.append("audio", fs.createReadStream(filePath));

  // *** THIS WAS MISSING ***
  form.append("lang", lang);

  const response = await axios.post(
    "http://127.0.0.1:5000/transcribe",
    form,
    { headers: form.getHeaders() }
  );

  return response.data.text;
};
