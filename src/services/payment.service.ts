import { MercadoPagoConfig, Preference } from "mercadopago";

// Inicializamos el cliente con el token de tu .env
const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN || "",
});

// Interfaz para tipar los items que recibe el servicio y ayudar a TypeScript
export interface PaymentItem {
    id: string | number;
    title: string;
    unit_price: number;
    quantity: number;
}

export class PaymentService {
    /**
     * Crea la preferencia de pago en Mercado Pago
     * @param items - Lista de productos mapeados desde el frontend
     * @param externalReference - ID de la venta en ElementAll
     * @param payerEmail - (Opcional) Email del cliente para el recibo de MP
     */
    async createPreference(
        items: PaymentItem[],
        externalReference: string,
        payerEmail?: string,
    ) {
        try {
            const preference = new Preference(client);

            const frontendUrl =
                process.env.FRONTEND_URL || "http://localhost:5173";

            const body: any = {
                items: items.map((item) => ({
                    id: item.id.toString(),
                    title: item.title,
                    unit_price: Number(item.unit_price.toFixed(2)), // Redondeo por seguridad con decimales
                    quantity: Number(item.quantity),
                    currency_id: "ARS",
                })),
                payer: payerEmail ? { email: payerEmail } : undefined,
                back_urls: {
                    success: `${frontendUrl}/management/sales?status=success`,
                    failure: `${frontendUrl}/management/sales?status=failure`,
                    pending: `${frontendUrl}/management/sales?status=pending`,
                },
                //auto_return: "approved",
                binary_mode: true, // Clave: evita pagos "pendientes" eternos en cajeros o rapipago si querés todo digital
                external_reference: externalReference,
                statement_descriptor: "ElementAll",
                // 🚀 La URL de tu webhook (VITAL para que ngrok y tu servidor reciban el aviso)
                notification_url: process.env.BACKEND_TUNNEL_URL
                    ? `${process.env.BACKEND_TUNNEL_URL}/api/payments/webhook`
                    : undefined,
            };

            console.log(
                "🚀 BODY QUE SE ENVÍA A MP:",
                JSON.stringify(body, null, 2),
            );

            const response = await preference.create({ body });

            return {
                id: response.id,
                init_point: response.init_point,
            };
        } catch (error) {
            console.error("❌ Error en PaymentService:", error);
            throw new Error(
                "No se pudo crear la preferencia de pago en Mercado Pago",
            );
        }
    }
}
