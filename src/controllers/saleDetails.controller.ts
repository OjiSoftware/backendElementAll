import {Request, Response} from "express";
import * as saleDetailsService from "../services/saleDetails.service"; 

/**
 * Obtiene todos los detalles de venta.
 */
export const getAllSaleDetails = async (_req: Request, res: Response) => {
  try {
    const saleDetails = await saleDetailsService.getAllSaleDetails();
    res.status(201).json(saleDetails);
  } catch (error: any) {
    res.status(500).json({ message: "Error al obtener los detalles de venta" });
  }
};

/**
 * Obtiene un detalle de venta por ID.
 */
export const getSaleDetailById = async (_req: Request, res: Response) => {
  try {
    const saleDetail = await saleDetailsService.getSaleDetailsById(
      Number(_req.params.id)
    );
    res.status(201).json(saleDetail);
  } catch (error: any) {
    if (error.message === "Detalle de venta no encontrado") {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: "Error al obtener el detalle de venta" });
  }
}

/**
 * Crea un nuevo detalle de venta.
 */
export const createSaleDetail = async (_req: Request, res: Response) => {
  try {
    const result = await saleDetailsService.createSaleDetail(_req.body);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(500).json({ message: "Error al crear el detalle de venta" });
  }
};

/**
 * Modifica un detalle de venta.
 */
export const updateSaleDetail = async (_req: Request, res: Response) => {
  try {
    const result = await saleDetailsService.updateSaleDetails(
      Number(_req.params.id),
      _req.body
    );
    res.status(201).json(result);
  } catch (error: any) {
    if (error.message === "Detalle de venta no encontrado") {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: "Error al actualizar el detalle de venta" });
  }
};

/**
 * Elimina un detalle de venta.
 */
export const deleteSaleDetail = async (_req: Request, res: Response) => {
  try {
    const result = await saleDetailsService.deleteSaleDetails(
      Number(_req.params.id)
    );
    res.status(201).json(result);
  } catch (error: any) {
    if (error.message === "Detalle de venta no encontrado") {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: "Error al eliminar el detalle de venta" });
  }
};