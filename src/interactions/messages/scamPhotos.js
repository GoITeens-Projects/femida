const suspiciousNames = ["image", "images", "img", "photo", "pic", "picture"];

const checkScamPhotos = (attachments) => {
  const array = Array.from(attachments.values());
  const names = array.map((a) => a.name);

  //? cheking for the same (or common) suspicous names
  const isTheSame = names.every((name) => name === names[0]);
  if (isTheSame && suspiciousNames.includes(names[0])) return true;

  const hasCommon = names.every((name) =>
    suspiciousNames.some((susName) => name.includes(susName))
  );
  if (hasCommon) return true;
  return false;
};

module.exports = checkScamPhotos;
