import QRCode from "qrcode";

export default async function handler(req, res) {

  // Only POST request allow
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: "Text is required" });
    }

    // Generate QR Code
    const qr = await QRCode.toDataURL(text);

    return res.status(200).json({
      success: true,
      qr
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
