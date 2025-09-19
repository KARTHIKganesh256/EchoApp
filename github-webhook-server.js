import express from "express";
import crypto from "crypto";

const app = express();

// Middleware to capture raw body for signature verification
app.use((req, res, next) => {
  let data = '';
  req.setEncoding('utf8');
  req.on('data', chunk => {
    data += chunk;
  });
  req.on('end', () => {
    req.rawBody = data;
    next();
  });
});

app.use(express.json());

// GitHub webhook endpoint
app.post("/github-webhook", (req, res) => {
  const signature = req.headers["x-hub-signature-256"];
  const body = req.rawBody;

  // Validate secret if set
  if (process.env.GITHUB_SECRET) {
    const hmac = crypto.createHmac("sha256", process.env.GITHUB_SECRET);
    const digest = "sha256=" + hmac.update(body).digest("hex");

    if (signature !== digest) {
      console.log("Invalid signature");
      return res.status(401).send("Invalid signature");
    }
  } else {
    console.warn("GITHUB_SECRET not set, skipping signature validation");
  }

  console.log("Received GitHub Event:", req.body);
  res.status(200).send("OK");
});

app.listen(3000, () => console.log("Listening on port 3000"));
