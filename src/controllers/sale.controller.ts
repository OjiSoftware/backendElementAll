import { Request, Response } from "express";
import * as saleService from "../services/sale.service";
// 🔥 IMPORTANTE: Agregamos el mail de confirmación
import {
    sendOrderCancellationEmail,
    sendOrderConfirmationEmail,
} from "../services/email.service";
import { SaleWithAll } from "../types/sale.types";

/**
 * Obtiene todas las ventas registradas
 */
export const getSales = async (_req: Request, res: Response) => {
    try {
        const sales = await saleService.getAllSales();
        res.json(sales);
    } catch (error: any) {
        res.status(500).json({ message: "Error al obtener las ventas" });
    }
};

/**
 * Obtiene una venta por ID
 */
export const getSale = async (req: Request, res: Response) => {
    try {
        const sale = await saleService.getSaleById(Number(req.params.id));
        res.json(sale);
    } catch (error: any) {
        if (error.message === "Venta no encontrada") {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: "Error al obtener la venta" });
    }
};

/**
 * Crea una nueva venta (Desde panel Admin)
 */
export const createSale = async (req: Request, res: Response) => {
    try {
        const result = await saleService.createSale(req.body);
        res.status(201).json(result);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * Actualiza una venta existente
 */
export const updateSale = async (req: Request, res: Response) => {
    try {
        const result = await saleService.updateSale(
            Number(req.params.id),
            req.body,
        );

        const saleData = result.sale as unknown as SaleWithAll;

        if (saleData?.client?.email) {
            if (req.body.status === "COMPLETED") {
                sendOrderConfirmationEmail(saleData.client.email, saleData)
                    .then(() =>
                        console.log(
                            `📧 Mail de CONFIRMACIÓN enviado vía PUT: ${saleData.client.email}`,
                        ),
                    )
                    .catch((err) =>
                        console.error(
                            "❌ Error mail confirmación en PUT:",
                            err,
                        ),
                    );
            }

            else if (req.body.status === "CANCELLED") {
                sendOrderCancellationEmail(saleData.client.email, saleData)
                    .then(() =>
                        console.log(
                            `📧 Mail de CANCELACIÓN enviado vía PUT: ${saleData.client.email}`,
                        ),
                    )
                    .catch((err) =>
                        console.error("❌ Error mail cancelación en PUT:", err),
                    );
            }
        }

        res.json(result);
    } catch (error: any) {
        if (error.message === "Venta no encontrada") {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: "Error al actualizar la venta" });
    }
};

/**
 * Elimina/Cancela una venta
 */
export const disableSale = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const result = await saleService.disableSale(id);
        const saleData = result.sale as unknown as SaleWithAll;

        if (saleData?.client?.email) {
            sendOrderCancellationEmail(saleData.client.email, saleData)
                .then(() =>
                    console.log(`📧 Mail enviado a: ${saleData.client.email}`),
                )
                .catch((err) => console.error("❌ Error mail:", err));
        }

        res.json(result);
    } catch (error: any) {
        if (error.message === "Venta no encontrada") {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: "Error al eliminar la venta" });
    }
};

/**
 * Crea una orden pendiente desde el carrito público (Guest Checkout)
 */
export const createGuestCheckout = async (req: Request, res: Response) => {
    try {
        const { clientData, items, total } = req.body;

        const result = await saleService.createGuestSale(
            clientData,
            items,
            total,
        );

        res.status(200).json({
            message: result.message,
            saleId: result.sale.id,
        });
    } catch (error: any) {
        console.error("❌ Error en createGuestCheckout:", error.message);
        res.status(500).json({
            message: error.message || "Error al preparar la orden",
        });
    }
};
