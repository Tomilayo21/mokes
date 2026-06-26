// // utils/generateReceipt.js

// import dayjs from "@/lib/dayjs";

// /**
//  * Generate and download a professional receipt PDF
//  */
// export const generateReceipt = async ({
//   order,
//   session,
//   paymentMethods = [],
//   currency = "₦",
//   company = {
//     name: "Cusceda Store",
//     tagline: "Your Trusted Online Marketplace",
//     logo: null, // optional: "/logo.png"
//   },
// }) => {
//   const { default: jsPDF } = await import("jspdf");
//   const autoTable = (await import("jspdf-autotable")).default;

//   const doc = new jsPDF();

//   // =========================
//   // 🧠 Helpers
//   // =========================
//   const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

//   const formatDate = (date) =>
//     dayjs(date)
//       .tz(tz)
//       .format("dddd, DD MMM YYYY, hh:mm A");

//     const invoiceNumber = `INV-${(order.orderId || order._id)
//     .toString()
//     .slice(-6)
//     .toUpperCase()}`;

//     const vatRate = 0.075; // 7.5% Nigeria VAT
//     const subtotal = order.amount / (1 + vatRate);
//     const vat = order.amount - subtotal;

//   const method = paymentMethods.find(
//     (m) => m.id === order.paymentMethod
//   );

//   const items = order.items.map((i) => [
//     i.product?.name || "Item",
//     i.quantity,
//     `${currency}${i.product?.price?.toLocaleString() || 0}`,
//   ]);

//   const total = `${currency}${order.amount?.toLocaleString(undefined, {
//     minimumFractionDigits: 2,
//   })}`;

//   // 🎨 Colors
//   const primary = [255, 165, 0]; // orange
//   const gray = [80, 80, 80];

//   // =========================
//   // 🧾 HEADER
//   // =========================
//   if (company.logo) {
//     try {
//       doc.addImage(company.logo, "PNG", 14, 10, 20, 20);
//     } catch (e) {
//       // ignore if logo fails
//     }
//   }

//   doc.setFont("helvetica", "bold");
//   doc.setFontSize(18);
//   doc.setTextColor(...primary);
//   doc.text(company.name, 14, 20);

//   doc.setFont("helvetica", "normal");
//   doc.setFontSize(10);
//   doc.setTextColor(120);
//   doc.text(company.tagline, 14, 26);

//   // Right-side summary
//   doc.setFont("helvetica", "bold");
//   doc.setFontSize(11);
//   doc.setTextColor(0);
//   doc.text("Order Summary", 150, 20);

//   doc.setFont("helvetica", "normal");
//   doc.setFontSize(10);
// //   doc.text(
// //     `Order ID: ${order.orderId || order._id}`,
// //     150,
// //     26,
// //     { maxWidth: 45 }
// //     );
//   doc.text(`Invoice No: ${invoiceNumber}`, 150, 26, { maxWidth: 45 });
//   doc.text(
//     `Order Date: ${formatDate(order.createdAt)}`,
//     150,
//     32,
//     { maxWidth: 45 } // 👈 prevents overflow
//     );

//   // 🟢 Status badge
//   const status = order.paymentStatus || "Pending";
//   const statusColor =
//     status === "Paid" || status === "Completed"
//       ? [0, 128, 0]
//       : [255, 140, 0];

//   doc.setTextColor(...statusColor);
//   doc.setFont("helvetica", "bold");
//   doc.text(status.toUpperCase(), 150, 38);

//   // Divider
//   doc.setDrawColor(...primary);
//   doc.line(14, 42, 196, 42);

//   // =========================
//   // 👤 CUSTOMER
//   // =========================
//   doc.setFont("helvetica", "bold");
//   doc.setTextColor(0);
//   doc.text("Billed To", 14, 52);

//   doc.setFont("helvetica", "normal");
//   doc.setFontSize(10);
//   doc.text(order.address?.fullName || "Customer", 14, 58);
//   doc.text(session?.user?.email || "", 14, 64);

//   // =========================
//   // 🚚 SHIPPING
//   // =========================
//   doc.setFont("helvetica", "bold");
//   doc.text("Shipping Details", 14, 76);

//   doc.setFont("helvetica", "normal");
//   doc.text(
//     `${order.address?.state || ""}, ${order.address?.city || ""}`,
//     14,
//     82
//   );
//   doc.text(`${order.address?.country || ""}`, 14, 88);
//   doc.text(`Phone: ${order.address?.phoneNumber || ""}`, 14, 94);

//   // =========================
//   // 💳 PAYMENT
//   // =========================
//   doc.setFont("helvetica", "bold");
//   doc.text("Payment Information", 150, 52);

//   doc.setFont("helvetica", "normal");
//   doc.text(`Method: ${method?.label || "N/A"}`, 150, 58);
//   doc.text(`Status: ${status}`, 150, 64);

//   // Divider
//   doc.setDrawColor(200);
//   doc.line(14, 102, 196, 102);

//   // =========================
//   // 🛒 ITEMS TABLE
//   // =========================
//   autoTable(doc, {
//     startY: 108,
//     head: [["Item", "Qty", "Unit Price"]],
//     body: items,
//     theme: "grid",
//     styles: {
//       fontSize: 10,
//       halign: "center",
//       textColor: 50,
//     },
//     headStyles: {
//       fillColor: primary,
//       textColor: [255, 255, 255],
//     },
//     alternateRowStyles: {
//       fillColor: [245, 245, 245],
//     },
//   });

//     doc.text(
//     `Subtotal: ${currency}${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
//     196,
//     finalY + 10,
//     { align: "right" }
//     );

//     doc.text(
//     `VAT (7.5%): ${currency}${vat.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
//     196,
//     finalY + 16,
//     { align: "right" }
//     );
//   // =========================
//   // 💰 TOTAL
//   // =========================
//   doc.setFont("helvetica", "bold");
//   doc.setFontSize(14);
//   doc.setTextColor(...primary);
//   doc.text(`Order Total: ${total}`, 196, finalY + 26, {
//     align: "right",
//     });

//   // =========================
//   // 💬 FOOTER
//   // =========================
//   doc.setFont("helvetica", "normal");
//   doc.setFontSize(9);
//   doc.setTextColor(120);

//   doc.text(
//     "Thank you for your order. We appreciate your business.",
//     105,
//     finalY + 26,
//     { align: "center" }
//   );

//   doc.text(
//     "If you have any questions, please contact our support team.",
//     105,
//     finalY + 32,
//     { align: "center" }
//   );

//   // =========================
//   // 💾 SAVE
//   // =========================
//   doc.save(`Receipt-${order.orderId || order._id}.pdf`);
// };












































































































































































import dayjs from "@/lib/dayjs";

export const generateReceipt = async ({
  order,
  session,
  paymentMethods = [],
  currency = "₦",
  company = {
    name: "Cusceda Store",
    tagline: "Your Trusted Online Marketplace",
    logo: null,
  },
}) => {
  const { default: jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;
  const QRCode = (await import("qrcode")).default;

  const doc = new jsPDF();

  // =========================
  // HELPERS
  // =========================
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const formatDate = (date) =>
    dayjs(date).tz(tz).format("dddd, DD MMM YYYY, hh:mm A");

  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;

  const invoiceNumber = `INV-${(order.orderId || order._id)
    .toString()
    .slice(-6)
    .toUpperCase()}`;

  const vatRate = 0.075;
  const subtotal = order.amount / (1 + vatRate);
  const vat = order.amount - subtotal;

  const method = paymentMethods.find((m) => m.id === order.paymentMethod);

    const money = (val) =>
    `${currency}${Number(val || 0).toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const items = order.items.map((i) => {
    const unitPrice = Number(i.price || i.product?.price || 0); // 🔥 FIX HERE
    const qty = Number(i.quantity || 0);
    const total = unitPrice * qty;

    return [
      i.product?.name || "Item",
      String(qty),
      money(unitPrice),
      money(total),
    ];
  });

  // 🔥 FIX: force clean number formatting (NO weird symbols)
  const cleanMoney = (val) =>
    `${currency}${Number(val || 0).toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const total = cleanMoney(order.amount);

  const trackingUrl = `https://yourdomain.com/order/${order.orderId || order._id}`;
  const qrDataUrl = await QRCode.toDataURL(trackingUrl);

  const primary = [255, 165, 0];
  const gray = [80, 80, 80];

  const safe = (v) => (v ? String(v) : "N/A");

  // =========================
  // HEADER
  // =========================
  const drawHeader = () => {
    if (company.logo) {
      try {
        doc.addImage(company.logo, "PNG", 14, 10, 18, 18);
      } catch {}
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(...primary);
    doc.text(company.name, 36, 18);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(company.tagline, 36, 24);

    doc.setDrawColor(...primary);
    doc.line(14, 28, 196, 28);
  };

  // =========================
  // WATERMARK (FIXED RELIABLE)
  // =========================
  const drawWatermark = () => {
    if (["Paid", "Completed"].includes(order.paymentStatus)) {
      doc.setFontSize(60);
      doc.setTextColor(220, 220, 220); // lighter = visible but subtle
      doc.setFont("helvetica", "bold");

      doc.text("PAID", 50, 160, { angle: 45 });

      doc.setTextColor(0); // reset
    }
  };

  // =========================
  // TABLE
  // =========================
  autoTable(doc, {
    startY: 105,
    head: [["Item", "Qty", "Unit Price"]],
    body: items,
    theme: "grid",
    pageBreak: "auto",
    showHead: "everyPage",

    styles: {
      fontSize: 10,
      cellPadding: 3,
      halign: "center",
      textColor: 50,
    },

    headStyles: {
      fillColor: primary,
      textColor: [255, 255, 255],
    },

    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },

    didDrawPage: () => {
      drawHeader();
      drawWatermark();

      const pageNumber = doc.internal.getCurrentPageInfo().pageNumber;
      const totalPages = doc.internal.getNumberOfPages();

      doc.setFontSize(9);
      doc.setTextColor(120);

      doc.text(
        `Page ${pageNumber} of ${totalPages}`,
        pageWidth - 20, // 🔥 FIX: more margin (prevents cut off)
        pageHeight - 10,
        { align: "right" }
      );
    },
  });

  const finalY = doc.lastAutoTable.finalY || 120;

  // =========================
  // ORDER DETAILS
  // =========================
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Order Details", 14, 40);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(80);

  doc.text(`Order ID: ${safe(order.orderId || order._id)}`, 14, 48);
  doc.text(`Invoice: ${invoiceNumber}`, 14, 54);
  doc.text(`Date: ${formatDate(order.createdAt)}`, 14, 60);
  doc.text(`Email: ${safe(session?.user?.email)}`, 14, 66);

  // =========================
  // SHIPPING (FIXED SAFE SPACING)
  // =========================
  doc.setFont("helvetica", "bold");
  doc.text("Shipping Address", 14, 76);

  doc.setFont("helvetica", "normal");
  doc.text(safe(order.address?.fullName), 14, 82);
  doc.text(
    `${safe(order.address?.state)}, ${safe(order.address?.city)}`,
    14,
    88
  );
  doc.text(safe(order.address?.country), 14, 94);
  doc.text(`Phone: ${safe(order.address?.phoneNumber)}`, 14, 100);

  // =========================
  // PAYMENT INFO
  // =========================
  doc.setFont("helvetica", "bold");
  doc.text("Payment Info", 120, 40);

  doc.setFont("helvetica", "normal");
  doc.text(`Method: ${method?.label || "N/A"}`, 120, 48);
  doc.text(`Status: ${order.paymentStatus || "Pending"}`, 120, 54);

  // =========================
  // SUMMARY (FIXED OVERFLOW)
  // =========================
  const rightX = pageWidth - 40; // 

  doc.setFontSize(10);
  doc.setTextColor(80);

  doc.text(`Subtotal: ${cleanMoney(subtotal)}`, rightX, finalY + 10, {
    align: "right",
  });

  doc.text(`VAT (7.5%): ${cleanMoney(vat)}`, rightX, finalY + 16, {
    align: "right",
  });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...primary);

  doc.text(`Total: ${total}`, rightX, finalY + 26, {
    align: "right",
  });

  // =========================
  // QR CODE
  // =========================
  doc.addImage(qrDataUrl, "PNG", 160, finalY + 32, 30, 30);

  doc.setFontSize(8);
  doc.setTextColor(120);
  doc.text("Scan to track order", 175, finalY + 65, {
    align: "center",
  });

  // =========================
  // FOOTER
  // =========================
  const footerY = finalY + 75;

  doc.setFontSize(9);
  doc.setTextColor(120);

  doc.text(
    "Thank you for your order. We appreciate your business.",
    105,
    footerY,
    { align: "center" }
  );

  doc.text(
    "If you have any questions, contact our support team.",
    105,
    footerY + 6,
    { align: "center" }
  );

  // =========================
  // DOWNLOAD
  // =========================
  doc.save(`Invoice-${invoiceNumber}.pdf`);
};