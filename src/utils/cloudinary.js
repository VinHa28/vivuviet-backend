export const getPublicIdFromUrl = (url) => {
  if (!url) return null;
  const parts = url.split("/");
  const fileNameWithExtension = parts.pop();
  const fileName = fileNameWithExtension.split(".")[0];

  const uploadIndex = parts.indexOf("upload");
  const folderPath = parts.slice(uploadIndex + 2).join("/");

  return folderPath ? `${folderPath}/${fileName}` : fileName;
};
