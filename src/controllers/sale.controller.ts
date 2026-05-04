import { Request, Response } from 'express';
import * as saleService from '../services/sale.service';
import {
  sendOrderCancellationEmail,
  sendOrderConfirmationEmail,
} from '../services/email.service';
import { SaleWithAll } from '../types/sale.types';

/**
 * Obtiene todas las ventas registradas
 */
export const getSales = async (_req: Request, res: Response) => {
  try {
    const sales = await saleService.getAllSales();
    res.json(sales);
  } catch (error: any) {
    res.status(500).json({ message: 'Error al obtener las ventas' });
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
    if (error.message === 'Venta no encontrada') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error al obtener la venta' });
  }
};

/**
 * Crea una nueva venta (Desde panel Admin)
 */
export const createSale = async (req: Request, res: Response) => {
  try {
    // Solo llamamos al service y devolvemos la respuesta.
    // El service ya tiene la lógica de if(COMPLETED && sendEmail)
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
    const id = Number(req.params.id);
    const result = await saleService.updateSale(id, req.body);

    res.json(result);
  } catch (error: any) {
    if (error.message === 'Venta no encontrada') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error al actualizar la venta' });
  }
};

/**
 * Elimina/Cancela una venta
 */
export const disableSale = async (req: Request, res: Response) => {
  try {
    const result = await saleService.disableSale(Number(req.params.id));
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Crea una orden pendiente desde el carrito público (Guest Checkout)
 */
export const createGuestCheckout = async (req: Request, res: Response) => {
  try {
    const { clientData, items, total } = req.body;

    const result = await saleService.createGuestSale(clientData, items, total);

    res.status(200).json({
      message: result.message,
      saleId: result.sale.id,
    });
  } catch (error: any) {
    console.error('❌ Error en createGuestCheckout:', error.message);
    res.status(500).json({
      message: error.message || 'Error al preparar la orden',
    });
  }
};
