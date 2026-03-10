// src/repositories/sale.repository.ts
import { prisma } from "../prisma";
import {
    Sale as SaleModel,
    SaleDetails as SaleDetailsModel,
} from "../generated/prisma/client";
import { CreateSaleInput, UpdateSaleInput } from "../types/sale.types";

/**
 * Obtiene todas las ventas de la base de datos.
 * @returns Array de ventas.
 * @throws Error si falla la consulta a la base de datos.
 */
export const findAllSales = async (): Promise<SaleModel[]> => {
    try {
        return await prisma.sale.findMany({
            include: { client: true, details: true },
            orderBy: { id: "desc" },
        });
    } catch (error) {
        console.error("Error al obtener ventas:", error);
        throw new Error("No se pudieron obtener las ventas");
    }
};

/**
 * Busca una venta por su ID.
 * @param id - ID de la venta a buscar.
 * @returns Venta encontrada o null si no existe.
 * @throws Error si falla la consulta.
 */
export const findSaleById = async (id: number): Promise<SaleModel | null> => {
    try {
        return await prisma.sale.findUnique({
            where: { id },
            include: {
                client: {
                    include: {
                        addresses: true,
                    },
                },
                details: true,
            },
        });
    } catch (error) {
        console.error(`Error al buscar venta con id ${id}:`, error);
        throw new Error("No se pudo obtener la venta");
    }
};

/**
 * Crea una nueva venta manual desde el panel de administración.
 * Descuenta el stock de forma inmediata.
 * @param data - Objeto con los datos de la venta y sus detalles.
 * @returns Venta recién creada.
 * @throws Error si falla la inserción.
 */
export const insertSale = async (data: CreateSaleInput): Promise<SaleModel> => {
    try {
        return await prisma.$transaction(async (tx) => {
            const detailsWithPrices = [];
            let totalInCents = 0;

            for (const item of data.details) {
                const product = await tx.product.findUnique({
                    where: { id: item.productId },
                });
                if (!product) {
                    throw new Error(
                        `Producto con ID ${item.productId} no encontrado`,
                    );
                }
                if (product.stock < item.quantity) {
                    throw new Error(
                        `Stock insuficiente para el producto: ${product.name}`,
                    );
                }
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { decrement: item.quantity } },
                });

                const priceInCents = Math.round(Number(product.price) * 100);

                // Sumamos al total general
                totalInCents += priceInCents * item.quantity;

                detailsWithPrices.push({
                    productId: item.productId,
                    quantity: item.quantity,
                    unitaryPrice: product.price,
                });
            }

            const finalTotal = totalInCents / 100;

            return await tx.sale.create({
                data: {
                    clientId: data.clientId,
                    status: data.status ?? "PENDING",
                    total: finalTotal,
                    details: {
                        create: detailsWithPrices,
                    },
                },
                include: { details: true },
            });
        });
    } catch (error: any) {
        console.error("Error al crear venta:", error);
        throw new Error(error.message || "No se pudo crear la venta");
    }
};

/**
 * Actualiza una venta existente.
 * @param id - ID de la venta a actualizar.
 * @param data - Datos a actualizar.
 * @returns Venta actualizada o null si no existe.
 */
export const updateSale = async (
    id: number,
    data: UpdateSaleInput,
): Promise<SaleModel | null> => {
    try {
        return await prisma.$transaction(async (tx) => {
            // 1. Obtener la venta original
            const existingSale = await tx.sale.findUnique({
                where: { id },
                include: { details: true },
            });

            if (!existingSale) {
                throw new Error(`Venta con ID ${id} no encontrada`);
            }

            // Separamos los detalles del resto de la data (Spread Operator)
            const { details, ...restData } = data;

            // 2. Si no hay detalles nuevos, actualizamos solo la data básica (cliente, status, etc.)
            if (!details) {
                return await tx.sale.update({
                    where: { id },
                    data: { ...restData },
                    include: { details: true },
                });
            }

            // 3. Devolver el stock original a la base de datos
            for (const oldItem of existingSale.details) {
                await tx.product.update({
                    where: { id: oldItem.productId },
                    data: { stock: { increment: oldItem.quantity } },
                });
            }

            const newDetailsToCreate = [];
            let newTotal = 0;

            // 4. Validar nuevos detalles, descontar stock y calcular nuevo total
            for (const item of details) {
                const product = await tx.product.findUnique({
                    where: { id: item.productId },
                });

                item.quantity = item.quantity ?? 0;

                if (!product) {
                    throw new Error(
                        `Producto con ID ${item.productId} no encontrado`,
                    );
                }
                if (product.stock < item.quantity) {
                    throw new Error(
                        `Stock insuficiente para el producto: ${product.name}`,
                    );
                }

                await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { decrement: item.quantity } },
                });

                newTotal = newTotal + Number(product.price) * item.quantity;

                newDetailsToCreate.push({
                    productId: item.productId,
                    quantity: item.quantity,
                    unitaryPrice: product.price,
                });
            }

            // 5. Guardar los cambios finales (borrando detalles viejos y creando los nuevos)
            return await tx.sale.update({
                where: { id },
                data: {
                    ...restData, // Insertamos cliente, status, etc.
                    total: newTotal,
                    details: {
                        deleteMany: {},
                        create: newDetailsToCreate,
                    },
                },
                include: { details: true },
            });
        });
    } catch (error: any) {
        console.error(`Error al actualizar venta con id ${id}:`, error);
        throw new Error(error.message || "No se pudo actualizar la venta");
    }
};

/**
 * Elimina una venta de la base de datos.
 * @param id - ID de la venta a eliminar.
 * @returns Venta eliminada o null si no existe.
 */
export const disableSale = async (id: number): Promise<SaleModel | null> => {
    try {
        return await prisma.sale.update({
            where: { id },
            data: { status: "CANCELLED" },
            include: { details: true },
        });
    } catch (error) {
        console.warn(
            `Venta con id ${id} no encontrada o error al deshabilitar:`,
            error,
        );
        throw new Error("No se pudo deshabilitar la venta");
    }
};

/**
 * Crea una orden pendiente desde el carrito público (Guest Checkout).
 * NO descuenta stock, ya que eso se delega al webhook de Mercado Pago una vez aprobado.
 * @param clientData - Datos del formulario del cliente.
 * @param items - Productos del carrito.
 * @param total - Monto total calculado.
 * @returns Venta creada en estado PENDING.
 * @throws Error si falla la operación en base de datos.
 */
/**
 * Crea una orden pendiente desde el carrito público (Guest Checkout).
 * NO descuenta stock, ya que eso se delega al webhook de Mercado Pago.
 */
export const insertGuestSale = async (
    clientData: any,
    items: any[],
    total: number,
): Promise<SaleModel> => {
    try {
        return await prisma.$transaction(async (tx) => {
            // 1. Buscamos o creamos al cliente
            const client = await tx.client.upsert({
                where: { dni: clientData.dni },
                update: {
                    name: clientData.name,
                    surname: clientData.surname,
                    email: clientData.email,
                    phoneNumber: clientData.phone || "",
                },
                create: {
                    name: clientData.name,
                    surname: clientData.surname,
                    dni: clientData.dni,
                    email: clientData.email,
                    phoneNumber: clientData.phone || "",
                },
            });

            // 🔥 NUEVO: Registramos la dirección de facturación/envío
            if (clientData.addresses) {
                await tx.billAddress.create({
                    data: {
                        clientId: client.id,
                        street: clientData.addresses.street,
                        streetNum: clientData.addresses.streetNum,
                        floor: clientData.addresses.floor || null,
                        apartment: clientData.addresses.apartment || null,
                        locality: clientData.addresses.locality,
                        province: clientData.addresses.province,
                        reference: clientData.addresses.reference || null,
                    }
                });
            }

            // 3. Preparamos el array para crear los detalles anidados
            const saleDetailsData = items.map((item: any) => ({
                productId: Number(item.productId),
                quantity: Number(item.quantity),
                unitaryPrice: Number(item.price),
            }));

            // 4. Creamos la venta y los detalles
            return await tx.sale.create({
                data: {
                    clientId: client.id,
                    total: Number(total),
                    status: "PENDING",
                    details: {
                        create: saleDetailsData,
                    },
                },
                include: { details: true },
            });
        });
    } catch (error: any) {
        console.error("Error al crear venta de invitado:", error);
        throw new Error(
            error.message || "No se pudo crear la orden del cliente invitado",
        );
    }
};
