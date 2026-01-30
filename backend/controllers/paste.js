const mongoose = require("mongoose");
const PasteModel = require("../model/PasteSchema");

const getCurrentTime = (req) => {
  if (process.env.TEST_MODE === "1" && req.headers["x-test-now-ms"]) {
    return new Date(parseInt(req.headers["x-test-now-ms"]));
  }
  return new Date();
};

const CreatePaste = async (req, res) => {
  const { content, ttl_seconds, max_views } = req.body;
  try {
    if (!content || typeof content !== "string" || content.trim() === "") {
      return res
        .status(400)
        .json({ error: "Content is required and must be a non-empty string" });
    }
    if (ttl_seconds !== undefined) {
      if (!Number.isInteger(ttl_seconds) || ttl_seconds < 1) {
        return res.status(400).json({
          error: "ttl_seconds must be an integer >= 1",
        });
      }
    }

    if (max_views !== undefined) {
      if (!Number.isInteger(max_views) || max_views < 1) {
        return res.status(400).json({
          error: "max_views must be an integer >= 1",
        });
      }
    }

    let expiresAt = null;
    if (ttl_seconds && ttl_seconds > 0) {
      const now = getCurrentTime(req);
      expiresAt = new Date(now.getTime() + ttl_seconds * 1000);
    }

    const paste = await PasteModel.create({
      content: content,
      expiresAt,
      remainingViews: max_views || null,
    });
    return res.status(200).json({
      id: paste._id.toString(),
      url: `${req.protocol}://${req.get("host")}/p/${paste._id}`,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const FetchPaste = async (req, res) => {
  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        error: "Paste not found",
      });
    }

    const paste = await PasteModel.findById(id);

    if (!paste) {
      return res.status(404).json({
        error: "Paste not found",
      });
    }

    const now = getCurrentTime(req);
    if (paste.expiresAt && paste.expiresAt <= now) {
      return res.status(404).json({
        error: "Paste expired",
      });
    }

    if (paste.remainingViews !== null && paste.remainingViews <= 0) {
      return res.status(404).json({
        error: "Paste view limit reached",
      });
    }

    if (paste.remainingViews !== null) {
      paste.remainingViews -= 1;
      await paste.save();
    }

    return res.status(200).json({
      content: paste.content,
      remaining_views: paste.remainingViews,
      expires_at: paste.expiresAt ? paste.expiresAt.toISOString() : null,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Server error",
    });
  }
};

const escapeHTML = (text) => {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const ViewPasteHTML = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).send("Paste not found");
    }

    const paste = await PasteModel.findById(id);
    if (!paste) {
      return res.status(404).send("Paste not found");
    }

    // Expiry check
    const now = getCurrentTime(req);
    if (paste.expiresAt && paste.expiresAt <= now) {
      return res.status(404).send("Paste expired");
    }

    // View limit check
    if (paste.remainingViews !== null) {
      if (paste.remainingViews <= 0) {
        return res.status(404).send("View limit exceeded");
      }
      paste.remainingViews -= 1;
      await paste.save();
    }

    const safeContent = escapeHTML(paste.content);

    res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Paste</title>
          <style>
            body { font-family: monospace; padding: 20px; }
            pre { white-space: pre-wrap; }
          </style>
        </head>
        <body>
          <pre>${safeContent}</pre>
        </body>
      </html>
    `);
  } catch (err) {
    res.status(404).send("Paste unavailable");
  }
};

module.exports = { CreatePaste, FetchPaste, ViewPasteHTML };