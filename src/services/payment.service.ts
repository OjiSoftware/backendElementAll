import { MercadoPagoConfig, Preference } from "mercadopago";

const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN || "",
});

export interface PaymentItem {
    id: string | number;
    title: string;
    unit_price: number;
    quantity: number;
}

export class PaymentService {
    /**
     * Crea la preferencia de pago en Mercado Pago
     * @param items - Lista de productos mapeados
     * @param externalReference - ID de la venta en la DB
     * @param payerEmail - (Opcional) Email del cliente
     */
    async createPreference(
        items: PaymentItem[],
        externalReference: string,
        payerEmail?: string,
    ) {
        try {
            const preference = new Preference(client);
            const frontendUrl = (
                process.env.FRONTEND_URL || "http://localhost:5173"
            ).replace(/\/$/, "");

            const body: any = {
                items: items.map((item) => ({
                    id: item.id.toString(),
                    title: item.title,
                    unit_price: Number(item.unit_price.toFixed(2)),
                    quantity: Number(item.quantity),
                    currency_id: "ARS",
                })),
                payer: payerEmail ? { email: payerEmail } : undefined,

                back_urls: {
                    success: `${frontendUrl}/checkout/status`,
                    failure: `${frontendUrl}/checkout/status`,
                    pending: `${frontendUrl}/checkout/status`,
                },

                auto_return: "approved",

                binary_mode: true,
                external_reference: externalReference,
                statement_descriptor: "ElementAll",

                notification_url: `${process.env.BACKEND_TUNNEL_URL}/api/payments/webhook`,
            };

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
