import {Request, Response} from "express";
import * as billAddressService from "../services/billAddress.service";

/**
 * Obtener todas las direcciones activas.
 */
export const getAllBillAddresses = async (_req: Request, res: Response) => {
  try {
    const billAddresses = await billAddressService.getAllBillAddresses();
    res.json(billAddresses);
  } catch (error: any) {
    res.status(500).json({ message: "Error al obtener las direcciones" });
  }
};

/**
 * Obtener una dirección por ID.
 */
export const getBillAddressById = async (req: Request, res: Response) => {
  try {
    const billAddress = await billAddressService.getBillAddressById(Number(req.params.id));
    res.json(billAddress);
  } catch (error: any) {
    if (error.message === "Dirección no encontrada") {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: "Error al obtener la dirección" });
  }
};

/**
 * Crear una direccion.
 */
export const createBillAddress = async (req: Request, res: Response) => {
  try {
    const billAddress = await billAddressService.createBillAddress(req.body);
    res.status(201).json(billAddress);
  } catch (error: any) {
    res.status(500).json({ message: "Error al crear la direccion" });
  }
};

/**
 * Actualizar una direccion existente.
 */
export const updateBillAddress = async (req: Request, res: Response) => {
  try {
    const billAddress = await billAddressService.updateBillAddress(Number(req.params.id), req.body);
    res.json(billAddress);
  } catch (error: any) {
    if (error.message === "Dirección no encontrada") {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: "Error al actualizar la direccion" });
  }
};

/**
 * Eliminar una direccion.
 */
export const deleteBillAddress = async (req: Request, res: Response) => {
  try {
    const billAddress = await billAddressService.deleteBillAddress(Number(req.params.id));
    res.json(billAddress);
  } catch (error: any) {
    if (error.message === "Dirección no encontrada") {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: "Error al eliminar la direccion" });
  }
};