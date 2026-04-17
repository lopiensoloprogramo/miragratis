const crypto = require("crypto");
const functions = require("firebase-functions");

const securityKey = "326de59c-3e8a-4e8c-8fb2-b8562e14eeba";
const CDN_BASE = "https://miragratis-movies.b-cdn.net";

function generateBunnyToken(path, expirationTime = 120) {
  const expires = Math.floor(Date.now() / 1000) + expirationTime;

  const cleanPath = "/" + path.replace(/^\/+/, "");
  const encodedPath = encodeURI(cleanPath);

  // 🔥 token_path = directorio (IMPORTANTE)
  const tokenPath = encodeURIComponent("/");

  // 🔥 string para hash (orden EXACTO)
  const hashable = securityKey + cleanPath + expires + `token_path=/`;

  const hash = crypto
    .createHash("sha256")
    .update(hashable)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  return {
    url: `${CDN_BASE}${encodedPath}?token=${hash}&expires=${expires}&token_path=${tokenPath}`,
    expires,
  };
}

exports.getVideoUrl = functions.https.onRequest((req, res) => {
  res.set("Access-Control-Allow-Origin", "*");

  const item = req.query.item;

  if (!item) {
    return res.status(400).json({ error: "Missing item param" });
  }

  try {
    const result = generateBunnyToken(item);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error generating token" });
  }
});