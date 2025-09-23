// gen-qr.js
import { createCanvas, loadImage } from "canvas";
import QRCode from "qrcode";
import fs from "fs";

const url = "https://recepcion-consultar.vercel.app/";
const logoPath = "../../public/laboQR.png"; // tu logo en carpeta public

(async () => {
  const width = 600;
  const height = 650;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Fondo del papel (blanco, no se gasta tinta)
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, width, height);

  // ----- Marco del QR -----
  const qrSize = 420;
  const qrX = (width - qrSize) / 2;
  const qrY = 50;

  // Rectángulo blanco con borde negro y esquinas redondeadas
  ctx.fillStyle = "white";
  ctx.strokeStyle = "black";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.roundRect(qrX - 20, qrY - 20, qrSize + 40, qrSize + 40, 30);
  ctx.fill();
  ctx.stroke();

  // Generar QR
  const qrCanvas = createCanvas(qrSize, qrSize);
  await QRCode.toCanvas(qrCanvas, url, {
    width: qrSize,
    margin: 2,
    color: {
      dark: "#000000",
      light: "#ffffff",
    },
  });
  ctx.drawImage(qrCanvas, qrX, qrY);

  // Logo en el centro del QR
  try {
    const logo = await loadImage(logoPath);

    const logoSize = qrSize * 0.18; // tamaño cuadrado del logo
    const logoX = width / 2;
    const logoY = qrY + qrSize / 2;

    // Dibujar fondo blanco circular debajo del logo
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(logoX, logoY, logoSize / 2 + 8, 0, Math.PI * 2);
    ctx.fill();

    // Clip circular para el logo
    ctx.save();
    ctx.beginPath();
    ctx.arc(logoX, logoY, logoSize / 2, 0, Math.PI * 2);
    ctx.clip();

    // Dibujar el logo dentro del clip circular
    ctx.drawImage(
      logo,
      logoX - logoSize / 2.5,
      logoY - logoSize / 2,
      logoSize,
      logoSize
    );
    ctx.restore(); // restaurar contexto para no afectar otros dibujos
  } catch (err) {
    console.warn("⚠️ No se pudo cargar el logo:", err.message);
  }

  // ----- Botón independiente -----
  const buttonW = 350;
  const buttonH = 70;
  const buttonX = (width - buttonW) / 2;
  const buttonY = height - 120;

  // Fondo negro
  ctx.fillStyle = "black";
  ctx.strokeStyle = "black"; // borde también negro o podés dejar blanco si querés
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(buttonX, buttonY, buttonW, buttonH, 20);
  ctx.fill();
  ctx.stroke();

  // Texto dentro del botón en blanco
  ctx.fillStyle = "white";
  ctx.font = "bold 28px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("SOLICITAR INGRESO", width / 2, buttonY + buttonH / 2);

  // Guardar PNG
  const buffer = canvas.toBuffer("image/png");
  fs.writeFileSync("qr_solicitar_ingreso.png", buffer);

  console.log("✅ QR generado -> qr_solicitar_ingreso.png");
})();
