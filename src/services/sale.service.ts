// src/services/sale.service.ts
import * as saleRepo from "../repositories/sale.repository";
import * as emailService from "./email.service";
import { Sale as SaleModel } from "../generated/prisma/client";
import {
    CreateSaleInput,
    UpdateSaleInput,
    SaleWithAll,
} from "../types/sale.types";

/**
 * Obtiene todas las ventas de la base de datos
 * @returns Lista de ventas con sus detalles
 */
export const getAllSales = async (): Promise<SaleModel[]> => {
    return saleRepo.findAllSales();
};

/**
 * Obtiene una venta por ID
 * @param id - ID de la venta
 * @returns La venta encontrada con sus detalles
 * @throws Error si la venta no existe
 */
export const getSaleById = async (id: number): Promise<SaleModel> => {
    const sale = await saleRepo.findSaleById(id);

    if (!sale) {
        throw new Error("Venta no encontrada");
    }

    return sale;
};

/**
 * Crea una nueva venta
 * @param data - Datos de la venta y lista de productos (detalles)
 * @returns Mensaje de confirmación y la venta creada
 */
export const createSale = async (
  data: CreateSaleInput,
): Promise<{ message: string; sale: SaleWithAll }> => {
  // 1. Solo notificamos si el admin marcó el checkbox Y la venta está COMPLETED
  const shouldNotify = data.sendEmail === true && data.status === 'COMPLETED';

  const sale = await saleRepo.insertSale(data);
  const saleWithAll = sale as SaleWithAll;

  if (shouldNotify) {
    const email = saleWithAll.client?.email;
    if (email) {
      console.log('🚀 Disparando confirmación para VENTA NUEVA...');

      emailService
        .sendOrderConfirmationEmail(email, saleWithAll)
        .then(() => console.log(`📧 Mail enviado con éxito a: ${email}`))
        .catch((err) => console.error('❌ Error mail confirmación:', err));
    }
  }

  return { message: 'Venta creada con éxito', sale: saleWithAll };
};

/**
 * Actualiza una venta existente
 * @param id - ID de la venta a actualizar
 * @param data - Datos a modificar (cliente, estado o detalles)
 * @returns Mensaje de confirmación y la venta actualizada
 * @throws Error si la venta no existe
 */
export const updateSale = async (id: number, data: UpdateSaleInput) => {
  const currentSale = await saleRepo.findSaleById(id);
  if (!currentSale) throw new Error('Venta no encontrada');
  const previousStatus = currentSale.status;

  const result = await saleRepo.updateSale(id, data);
  const saleWithAll = result as SaleWithAll;

  if (saleWithAll?.client?.email) {
    const email = saleWithAll.client.email;
    const isStatusChange = previousStatus !== saleWithAll.status;

    const paymentInfo = saleWithAll.transaction
      ? {
          id: saleWithAll.transaction.mpId || saleWithAll.transaction.id,
          method: saleWithAll.transaction.paymentMethod || '',
          type: saleWithAll.transaction.paymentType || '',
          lastFour: saleWithAll.transaction.cardLastFour,
        }
      : undefined;

    // LÓGICA DE CONFIRMACIÓN
    if (
      saleWithAll.status === 'COMPLETED' &&
      isStatusChange &&
      data.sendEmail !== false
    ) {
      console.log('🚀 Disparando email de confirmación...');
      emailService
        .sendOrderConfirmationEmail(email, saleWithAll, paymentInfo)
        .then(() =>
          console.log(`📧 Mail de CONFIRMACIÓN enviado vía PUT: ${email}`),
        )
        .catch((err) =>
          console.error('❌ Error mail confirmación en PUT:', err),
        );
    }
    // LÓGICA DE CANCELACIÓN
    else if (saleWithAll.status === 'CANCELLED' && isStatusChange) {
      if (data.silent) {
        console.log(
          `🤫 Cancelación silenciosa (MANUAL): Venta #${saleWithAll.id}. No se envía mail.`,
        );
      } else if (previousStatus === 'PENDING') {
        console.log(
          `🚫 Cancelación silenciosa (AUTO): La venta estaba PENDING, no se envió mail.`,
        );
      } else {
        emailService
          .sendOrderCancellationEmail(email, saleWithAll, paymentInfo)
          .then(() =>
            console.log(`📧 Mail de CANCELACIÓN enviado vía PUT: ${email}`),
          )
          .catch((err) =>
            console.error('❌ Error mail cancelación en PUT:', err),
          );
      }
    }
  }

  return { message: 'Venta actualizada con éxito', sale: saleWithAll };
};

/**
 * Elimina una venta de la base de datos
 * @param id - ID de la venta a eliminar
 * @returns Mensaje de confirmación y la venta eliminada
 * @throws Error si la venta no existe
 */
export const disableSale = async (
  id: number,
): Promise<{ message: string; sale: SaleWithAll }> => {
  const currentSale = await saleRepo.findSaleById(id);
  const wasPending = currentSale?.status === 'PENDING';

  const result = await saleRepo.disableSale(id);
  if (!result) throw new Error('Venta no encontrada');
  const saleData = result as SaleWithAll;

  if (saleData?.client?.email) {
    if (!wasPending) {
      const paymentInfo = saleData.transaction
        ? {
            id: saleData.transaction.mpId || saleData.transaction.id,
            method: saleData.transaction.paymentMethod || '',
            type: saleData.transaction.paymentType || '',
            lastFour: saleData.transaction.cardLastFour,
          }
        : undefined;

      emailService
        .sendOrderCancellationEmail(
          saleData.client.email,
          saleData,
          paymentInfo,
        )
        .then(() => console.log(`📧 Mail enviado a: ${saleData.client.email}`))
        .catch((err) => console.error('❌ Error mail:', err));
    } else {
      console.log(`🚫 Cancelación silenciosa (Trash): La venta era PENDING.`);
    }
  }

  return { message: 'Venta eliminada con éxito', sale: saleData };
};

/**
 * Crea una venta desde el carrito público (Guest Checkout)
 * @param clientData - Datos del formulario del cliente
 * @param items - Productos del carrito
 * @param total - Monto total
 * @returns La venta creada con su ID para Mercado Pago
 */
export const createGuestSale = async (
    clientData: any,
    items: any[],
    total: number,
): Promise<{ message: string; sale: SaleWithAll }> => {
    // Validaciones extra de negocio podrían ir acá antes de tocar la DB
    if (!clientData.dni || items.length === 0) {
        throw new Error("Faltan datos obligatorios para crear la orden");
    }

    // Delegamos la operación de base de datos al Repositorio
    const sale = await saleRepo.insertGuestSale(clientData, items, total);

    return {
        message: "Orden de invitado creada con éxito",
        sale: sale as SaleWithAll,
    };
};
