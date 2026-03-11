import nodemailer from "nodemailer";

// Configuración universal basada en variables de entorno
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Formateador de moneda reutilizable
const formatMoney = (amount: number) => {
    return new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
    }).format(amount);
};

/**
 * Genera una cadena de fecha y hora en formato 24hs ajustada a Argentina
 */
const getArgentinaFormattedDate = (dateInput: string | Date) => {
    const dateObj = new Date(dateInput); // Ajuste manual a UTC-3 (Argentina)
    const arDate = new Date(dateObj.getTime() - 3 * 60 * 60 * 1000);

    const day = String(arDate.getUTCDate()).padStart(2, "0");
    const month = String(arDate.getUTCMonth() + 1).padStart(2, "0");
    const year = arDate.getUTCFullYear();
    const hours = String(arDate.getUTCHours()).padStart(2, "0");
    const minutes = String(arDate.getUTCMinutes()).padStart(2, "0");

    return `${day}/${month}/${year}, ${hours}:${minutes}`;
};

export const sendPasswordResetEmail = async (to: string, token: string) => {
    const baseUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetUrl = `${baseUrl}/auth/reset/${token}`;

    const mailOptions = {
        from: `"ElementAll" <${process.env.EMAIL_USER}>`,
        to,
        subject: "Recuperación de contraseña - ElementAll",
        html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 550px; margin: 40px auto; padding: 40px; border: 1px solid #e5e7eb; border-radius: 12px; color: #1f2937; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <div style="text-align: center; margin-bottom: 35px; padding-bottom: 25px; border-bottom: 1px solid #f3f4f6;">
          <h1 style="color: #4f46e5; margin: 0; font-size: 32px; font-weight: 800; letter-spacing: -0.5px;">ElementAll</h1>
          <p style="color: #6366f1; font-size: 11px; font-weight: 700; text-transform: uppercase; margin: 8px 0 0 0; letter-spacing: 2.5px;">
            Gestión Empresarial Integral
          </p>
        </div>

        <h2 style="color: #111827; font-size: 24px; text-align: center; margin-top: 0; font-weight: 700;">¿Olvidaste tu contraseña?</h2>

        <p style="font-size: 16px; line-height: 1.6; color: #4b5563; text-align: center; margin: 24px 0;">
          Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong>ElementAll</strong>.
        </p>

        <div style="text-align: center; margin: 40px 0;">
          <a href="${resetUrl}"
            style="background-color: #4f46e5; color: #ffffff; padding: 16px 36px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block;">
            Restablecer mi contraseña
          </a>
        </div>

        <p style="font-size: 14px; line-height: 1.5; color: #6b7280; text-align: center; background-color: #f9fafb; padding: 16px; border-radius: 8px;">
          Este enlace expirará en <strong>15 minutos</strong> por motivos de seguridad.<br>
          Si no solicitaste este cambio, podés ignorar este correo tranquilamente.
        </p>

        <div style="margin-top: 45px; padding-top: 25px; border-top: 1px solid #f3f4f6; text-align: center;">
          <p style="font-size: 13px; color: #9ca3af; line-height: 1.5;">
            Si tenés problemas haciendo clic en el botón, copiá y pegá la siguiente URL en tu navegador:<br>
            <a href="${resetUrl}" style="color: #4f46e5; text-decoration: underline;">${resetUrl}</a>
          </p>
          <p style="font-size: 12px; color: #9ca3af; margin-top: 25px; font-weight: 500;">
            © ${new Date().getFullYear()} OjiSoftware • ElementAll ERP
          </p>
        </div>
      </div>
    `,
    };

    await transporter.sendMail(mailOptions);
};

export const sendOrderConfirmationEmail = async (
    to: string,
    saleData: any,
    paymentInfo?: {
        id: string | number;
        method: string;
        type: string;
        lastFour?: string | null;
    },
) => {
    const emeraldGreen = "#059669";
    const totalFormatted = formatMoney(Number(saleData.total));
    const orderDate = saleData.createdAt
        ? getArgentinaFormattedDate(saleData.createdAt) + " hs"
        : "Fecha no disponible";

    const formatPaymentType = (type: string) => {
        const types: Record<string, string> = {
            credit_card: "Tarjeta de Crédito",
            debit_card: "Tarjeta de Débito",
            account_money: "Dinero en cuenta (Mercado Pago)",
            ticket: "Efectivo",
            bank_transfer: "Transferencia Bancaria",
        };
        return types[type] || type;
    };

    const mailOptions = {
        from: `"ElementAll" <${process.env.EMAIL_USER}>`,
        to,
        subject: `Confirmación de Pedido #${saleData.id} - ElementAll`,
        html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 40px auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; color: #1f2937; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <div style="background-color: ${emeraldGreen}; padding: 40px 30px; text-align: center; color: #ffffff;">
          <div style="width: 60px; height: 60px; line-height: 60px; background-color: rgba(255,255,255,0.2); border-radius: 50%; display: inline-block; margin: 0 auto 20px auto; text-align: center;">
            <span style="font-size: 30px; vertical-align: middle;">✓</span>
          </div>
          <h1 style="margin: 0; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">¡Pago Confirmado!</h1>
          <p style="margin: 10px 0 0; font-size: 16px; opacity: 0.9;">Tu pedido #${saleData.id} se encuentra en preparación.</p>
        </div>

        <div style="padding: 40px 30px;">
          <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-top: 0;">
            Hola <strong>${saleData.client?.name || "Cliente"}</strong>,<br>
            ¡Muchas gracias por elegirnos! Hemos recibido tu pago correctamente.
          </p>

          <h2 style="font-size: 18px; color: #111827; margin: 35px 0 15px 0; padding-bottom: 10px; border-bottom: 2px solid #f3f4f6; font-weight: 600;">Detalles de la Orden</h2>

          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; font-size: 14px; line-height: 1.6; border-left: 4px solid ${emeraldGreen}; color: #4b5563;">
            <p style="margin: 0 0 10px 0;"><strong>Fecha de compra:</strong> ${orderDate}</p>
            <p style="margin: 0;"><strong>Dirección de Entrega:</strong><br>
              <span style="color: #111827; font-weight: 500;">${saleData.client?.name || ""} ${saleData.client?.surname || ""}</span><br>
              ${saleData.address?.street || "Sin calle"} ${saleData.address?.streetNum || ""}
              ${saleData.address?.floor ? `Piso ${saleData.address.floor}` : ""}
              ${saleData.address?.apartment ? `Dpto ${saleData.address.apartment}` : ""}<br>
              ${saleData.address?.locality || "Sin localidad"}, ${saleData.address?.province || "Sin provincia"}
            </p>
          </div>

          ${
              paymentInfo
                  ? `
          <h2 style="font-size: 18px; color: #111827; margin: 35px 0 15px 0; padding-bottom: 10px; border-bottom: 2px solid #f3f4f6; font-weight: 600;">Detalles del Pago</h2>
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; font-size: 14px; line-height: 1.6; border-left: 4px solid ${emeraldGreen}; color: #000000;">
            <p style="margin: 0 0 10px 0;"><strong>N° de Comprobante (MP):</strong> <span style="font-family: monospace; font-size: 15px; color: #000000;">${paymentInfo.id}</span></p>
            <p style="margin: 0; color: #000000;">
              <strong>Medio de pago:</strong> ${formatPaymentType(paymentInfo.type)}
              <span style="text-transform: uppercase; font-weight: 700; font-size: 12px; background-color: #e5e7eb; padding: 2px 6px; border-radius: 4px; margin-left: 6px; color: #1f2937;">
                ${paymentInfo.method} ${paymentInfo.lastFour ? `**** ${paymentInfo.lastFour}` : ""}
              </span>
            </p>
          </div>
          `
                  : ""
          }

          <h2 style="font-size: 18px; color: #111827; margin: 35px 0 15px 0; padding-bottom: 10px; border-bottom: 2px solid #f3f4f6; font-weight: 600;">Resumen de Productos</h2>
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 14px;">
            <tbody>
              ${saleData.details
                  .map(
                      (item: any) => `
                <tr>
                  <td style="padding: 16px 0; border-bottom: 1px solid #f3f4f6; width: 64px; vertical-align: top;">
                    <div style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; width: 54px; height: 54px;">
                      <img src="${item.product?.imageUrl || "https://via.placeholder.com/54"}" alt="${item.product?.name || "Producto"}" style="width: 100%; height: 100%; object-fit: cover; display: block;" />
                    </div>
                  </td>
                  <td style="padding: 16px 12px; border-bottom: 1px solid #f3f4f6; vertical-align: top;">
                    <span style="font-weight: 600; color: #1f2937; display: block; margin-bottom: 4px;">${item.product?.name || "Producto eliminado"}</span>
                    <span style="color: #6b7280; font-size: 13px;">Cant: ${item.quantity} x ${formatMoney(Number(item.unitaryPrice))}</span>
                  </td>
                  <td style="padding: 16px 0; border-bottom: 1px solid #f3f4f6; text-align: right; font-weight: 600; color: #111827; vertical-align: top;">
                    ${formatMoney(Number(item.unitaryPrice) * item.quantity)}
                  </td>
                </tr>
              `,
                  )
                  .join("")}
            </tbody>
          </table>

          <div style="margin-top: 30px; padding: 20px; background-color: #f8fafc; border-radius: 8px; text-align: right;">
            <span style="font-size: 14px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Total Pagado</span><br>
            <span style="font-size: 28px; font-weight: 800; color: ${emeraldGreen}; display: inline-block; margin-top: 4px;">${totalFormatted}</span>
          </div>

          <div style="text-align: center; margin-top: 45px;">
            <a href="${process.env.FRONTEND_URL}" style="background-color: #111827; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block;">
              Volver a la tienda
            </a>
          </div>
        </div>

        <div style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0; color: #9ca3af; font-size: 13px;">© ${new Date().getFullYear()} OjiSoftware • ElementAll ERP</p>
        </div>
      </div>
    `,
    };

    await transporter.sendMail(mailOptions);
};

export const sendOrderCancellationEmail = async (to: string, saleData: any) => {
    const errorRed = "#dc2626";
    const totalFormatted = formatMoney(Number(saleData.total));
    const orderDate = saleData.createdAt
        ? getArgentinaFormattedDate(saleData.createdAt) + " hs"
        : "Fecha no disponible";

    const mailOptions = {
        from: `"ElementAll" <${process.env.EMAIL_USER}>`,
        to,
        subject: `Orden Anulada #${saleData.id} - ElementAll`,
        html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 40px auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; color: #1f2937; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">

        <div style="background-color: ${errorRed}; padding: 40px 30px; text-align: center; color: #ffffff;">
          <div style="width: 60px; height: 60px; line-height: 56px; background-color: rgba(255,255,255,0.2); border-radius: 50%; border: 3px solid rgba(255,255,255,0.3); display: inline-block; margin: 0 auto 20px auto; text-align: center;">
            <span style="font-size: 32px; font-family: Arial, sans-serif; vertical-align: middle;">✕</span>
          </div>
          <h1 style="margin: 0; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">¡Orden Anulada!</h1>
          <p style="margin: 10px 0 0; font-size: 16px; opacity: 0.9;">Tu pedido #${saleData.id} ha sido cancelado.</p>
        </div>

        <div style="padding: 40px 30px;">
          <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-top: 0;">
            Hola <strong>${saleData.client?.name || "Cliente"}</strong>,<br>
            Te informamos que tu orden ha sido <strong>cancelada</strong>. Si realizaste un pago, el reembolso se procesará según las políticas de tu entidad bancaria.
          </p>

          <h2 style="font-size: 18px; color: #111827; margin: 35px 0 15px 0; padding-bottom: 10px; border-bottom: 2px solid #f3f4f6; font-weight: 600;">Detalles de la Orden</h2>

          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; font-size: 14px; line-height: 1.6; border-left: 4px solid ${errorRed}; color: #4b5563;">
            <p style="margin: 0 0 10px 0;"><strong>Fecha de la orden:</strong> ${orderDate}</p>
            <p style="margin: 0;"><strong>Dirección Asociada:</strong><br>
              <span style="color: #111827; font-weight: 500;">${saleData.client?.name || ""} ${saleData.client?.surname || ""}</span><br>
              ${saleData.address?.street || "Sin calle"} ${saleData.address?.streetNum || ""}<br>
              ${saleData.address?.locality || "Sin localidad"}, ${saleData.address?.province || "Sin provincia"}
            </p>
          </div>

          <h2 style="font-size: 18px; color: #111827; margin: 35px 0 15px 0; padding-bottom: 10px; border-bottom: 2px solid #f3f4f6; font-weight: 600;">Productos Cancelados</h2>
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 14px;">
            <tbody>
              ${saleData.details
                  .map(
                      (item: any) => `
                <tr>
                  <td style="padding: 16px 0; border-bottom: 1px solid #f3f4f6; width: 64px; vertical-align: top;">
                    <div style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; width: 54px; height: 54px; background-color: #f9fafb; opacity: 0.6;">
                      <img src="${item.product?.imageUrl || "https://via.placeholder.com/54"}" alt="${item.product?.name || "Producto"}" style="width: 100%; height: 100%; object-fit: cover; display: block; filter: grayscale(100%);" />
                    </div>
                  </td>
                  <td style="padding: 16px 12px; border-bottom: 1px solid #f3f4f6; vertical-align: top;">
                    <span style="font-weight: 600; color: #1f2937; display: block; margin-bottom: 4px;">${item.product?.name || "Producto eliminado"}</span>
                    <span style="color: #6b7280; font-size: 13px;">Cant: ${item.quantity} x ${formatMoney(Number(item.unitaryPrice))}</span>
                  </td>
                  <td style="padding: 16px 0; border-bottom: 1px solid #f3f4f6; text-align: right; font-weight: 600; color: #111827; vertical-align: top; text-decoration: line-through;">
                    ${formatMoney(Number(item.unitaryPrice) * item.quantity)}
                  </td>
                </tr>
              `,
                  )
                  .join("")}
            </tbody>
          </table>

          <div style="margin-top: 30px; padding: 20px; background-color: #f8fafc; border-radius: 8px; text-align: right;">
            <span style="font-size: 14px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Total a Reembolsar</span><br>
            <span style="font-size: 28px; font-weight: 800; color: ${errorRed}; display: inline-block; margin-top: 4px;">${totalFormatted}</span>
          </div>

          <div style="text-align: center; margin-top: 45px;">
            <p style="font-size: 14px; color: #6b7280; margin-bottom: 20px;">Si tenés alguna duda sobre tu reembolso, estamos para ayudarte.</p>
            <a href="mailto:${process.env.EMAIL_USER}" style="border: 2px solid ${errorRed}; color: ${errorRed}; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block;">
              Contactar a Soporte
            </a>
          </div>
        </div>

        <div style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0; color: #9ca3af; font-size: 13px;">© ${new Date().getFullYear()} OjiSoftware • ElementAll ERP</p>
        </div>
      </div>
    `,
    };

    await transporter.sendMail(mailOptions);
};
