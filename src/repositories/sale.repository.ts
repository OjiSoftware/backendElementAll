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
            include: { client: true, details: true, transaction: true },
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
                transaction: true,
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

            // 1. Buscamos la dirección actual del cliente para sacar la "foto"
            // Suponemos que el admin seleccionó un cliente que ya existe
            const lastAddress = await tx.billAddress.findFirst({
                where: { clientId: data.clientId },
                orderBy: { id: "desc" }, // Traemos la última cargada
            });

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
                    throw new Error(`Stock insuficiente para: ${product.name}`);
                }

                await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { decrement: item.quantity } },
                });

                const priceInCents = Math.round(Number(product.price) * 100);
                totalInCents += priceInCents * item.quantity;

                detailsWithPrices.push({
                    productId: item.productId,
                    quantity: item.quantity,
                    unitaryPrice: product.price,
                });
            }

            const finalTotal = totalInCents / 100;

            // 2. Creamos la venta con el addressId vinculado
            return await tx.sale.create({
                data: {
                    clientId: data.clientId,
                    addressId: lastAddress?.id || null,
                    status: data.status ?? "PENDING",
                    total: finalTotal,
                    isStockDeducted: true, // ¡Admin creó la venta, restamos el stock acá!
                    details: {
                        create: detailsWithPrices,
                    },
                },
                include: { details: true, address: true },
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

            // Si el estado cambia a CANCELLED, devolvemos stock SOLO si fue descontado
            if (
                data.status === "CANCELLED" &&
                existingSale.status !== "CANCELLED"
            ) {
                if (existingSale.isStockDeducted) {
                    for (const item of existingSale.details) {
                        await tx.product.update({
                            where: { id: item.productId },
                            data: { stock: { increment: item.quantity } },
                        });
                    }
                }
                // Actualizamos registro
                return await tx.sale.update({
                    where: { id },
                    data: { ...restData, isStockDeducted: false }, // Devuelto
                    include: {
                        details: { include: { product: true } },
                        client: true,
                        address: true,
                        transaction: true,
                    },
                });
            }

            // 2. Si no hay detalles nuevos (y no estamos cancelando explícitamente arriba)
            if (!details) {
                // Si el gestor decide pasar a COMPLETED o IN_PROGRESS manualmente
                // y no se habia descontado el stock (ej: era una compra web re-aprobada manual)
                let shouldDeductStockNow = false;
                if (
                    (data.status === "COMPLETED" ||
                        data.status === "IN_PROGRESS") &&
                    !existingSale.isStockDeducted
                ) {
                    shouldDeductStockNow = true;
                    for (const item of existingSale.details) {
                        // Aca no validamos maxstock para forzar el admin, pero podrias agregar check
                        await tx.product.update({
                            where: { id: item.productId },
                            data: { stock: { decrement: item.quantity } },
                        });
                    }
                }

                return await tx.sale.update({
                    where: { id },
                    data: {
                        ...restData,
                        ...(shouldDeductStockNow
                            ? { isStockDeducted: true }
                            : {}),
                    },
                    include: {
                        details: { include: { product: true } },
                        client: true,
                        address: true,
                        transaction: true,
                    },
                });
            }

            // 3. Devolver el stock original a la base de datos (porque se van a cambiar los items)
            // Solo si la venta NO se está cancelando ahora (para no devolver stock dos veces)
            if (data.status !== "CANCELLED" && existingSale.isStockDeducted) {
                for (const oldItem of existingSale.details) {
                    await tx.product.update({
                        where: { id: oldItem.productId },
                        data: { stock: { increment: oldItem.quantity } },
                    });
                }
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

                // Solo descontamos stock si la venta NO está siendo cancelada
                if (data.status !== "CANCELLED") {
                    if (product.stock < item.quantity) {
                        throw new Error(
                            `Stock insuficiente para el producto: ${product.name}`,
                        );
                    }
                    await tx.product.update({
                        where: { id: item.productId },
                        data: { stock: { decrement: item.quantity } },
                    });
                }

                newTotal = newTotal + Number(product.price) * item.quantity;

                newDetailsToCreate.push({
                    productId: item.productId,
                    quantity: item.quantity,
                    unitaryPrice: product.price,
                });
            }

            // 5. Guardar los cambios finales
            return await tx.sale.update({
                where: { id },
                data: {
                    ...restData,
                    total: newTotal,
                    // Si llegamos hasta acá (no fue CANCELLED), como recorrimos details, se descontó stock
                    // Así que isStockDeducted es true.
                    isStockDeducted: data.status !== "CANCELLED",
                    details: {
                        deleteMany: {},
                        create: newDetailsToCreate,
                    },
                },
                include: {
                    details: { include: { product: true } },
                    client: true,
                    address: true,
                    transaction: true,
                },
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
        return await prisma.$transaction(async (tx) => {
            // 1. Traemos la venta con sus detalles
            const sale = await tx.sale.findUnique({
                where: { id },
                include: { details: true, client: true },
            });

            if (!sale) throw new Error("Venta no encontrada");
            if (sale.status === "CANCELLED") return sale;

            // 2. Devolvemos el stock (solo si estaba descontado)
            if (sale.isStockDeducted) {
                for (const item of sale.details) {
                    await tx.product.update({
                        where: { id: item.productId },
                        data: { stock: { increment: item.quantity } },
                    });
                }
            }

            // 3. Cambiamos el estado
            return await tx.sale.update({
                where: { id },
                data: { status: "CANCELLED", isStockDeducted: false },
                include: {
                    client: true,
                    address: true,
                    details: { include: { product: true } },
                    transaction: true,
                },
            });
        });
    } catch (error: any) {
        console.error("Error al cancelar venta:", error.message);
        throw new Error("No se pudo cancelar la venta");
    }
};

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

            // 2. Registramos la dirección y guardamos su ID
            let currentAddressId: number | null = null;

            if (clientData.addresses) {
                const newAddress = await tx.billAddress.create({
                    data: {
                        clientId: client.id,
                        street: clientData.addresses.street,
                        streetNum: clientData.addresses.streetNum,
                        floor: clientData.addresses.floor || null,
                        apartment: clientData.addresses.apartment || null,
                        locality: clientData.addresses.locality,
                        province: clientData.addresses.province,
                        postalCode: clientData.addresses.postalCode,
                        country: clientData.addresses.country,
                        reference: clientData.addresses.reference || null,
                    },
                });
                // Guardamos el ID para vincularlo a la Sale
                currentAddressId = newAddress.id;
            }

            // 3. Preparamos los detalles (SIN DESCONTAR STOCK AÚN)
            const saleDetailsData = items.map((item: any) => ({
                productId: Number(item.productId),
                quantity: Number(item.quantity),
                unitaryPrice: Number(item.price),
            }));

            // 4. Creamos la venta vinculándola a la dirección específica (la "foto")
            return await tx.sale.create({
                data: {
                    clientId: client.id,
                    addressId: currentAddressId,
                    total: Number(total),
                    status: "PENDING",
                    isStockDeducted: false, // Checkout Web NO resta stock hasta "Pagar de forma segura"
                    expiresAt: null,
                    details: {
                        create: saleDetailsData,
                    },
                },
                include: {
                    details: true,
                    address: true,
                },
            });
        });
    } catch (error: any) {
        console.error("Error al crear venta de invitado:", error);
        throw new Error(
            error.message || "No se pudo crear la orden del cliente invitado",
        );
    }
};

/**
 * Reserva el stock para una venta ya creada.
 * Verifica disponibilidad y descuenta del inventario.
 */
export const reserveStock = async (id: number): Promise<SaleModel> => {
    try {
        return await prisma.$transaction(async (tx) => {
            const sale = await tx.sale.findUnique({
                where: { id },
                include: { details: true },
            });

            if (!sale) throw new Error("Venta no encontrada");
            if (sale.isStockDeducted) return sale; // Ya reservado

            // 1. Verificar y descontar stock
            for (const detail of sale.details) {
                const product = await tx.product.findUnique({
                    where: { id: detail.productId },
                });

                if (!product)
                    throw new Error(
                        `Producto ${detail.productId} no encontrado`,
                    );
                if (product.stock < detail.quantity) {
                    throw new Error(`Stock insuficiente para ${product.name}`);
                }

                await tx.product.update({
                    where: { id: product.id },
                    data: { stock: { decrement: detail.quantity } },
                });
            }

            // 2. Marcar como reservado y poner expiración
            const expiresAt = new Date();
            expiresAt.setMinutes(expiresAt.getMinutes() + 10);

            return await tx.sale.update({
                where: { id },
                data: {
                    isStockDeducted: true,
                    expiresAt: expiresAt,
                },
                include: {
                    details: { include: { product: true } },
                    client: true,
                },
            });
        });
    } catch (error: any) {
        console.error(
            `Error al reservar stock para venta ${id}:`,
            error.message,
        );
        throw new Error(error.message || "No se pudo reservar el stock");
    }
};
