import * as service from "../services/user.service";
import { Request, Response } from "express";


export const getUser = async (req: Request, res: Response) => {
    try {
        const user = await service.getUser(Number(req.params.id))
        res.json(user)
    } catch (e: any) {
        res.status(404).json({ error: e.message })
    }

}

export const listUsers = async (req: Request, res: Response) => {
    try {
        const list = await service.listUsers()
        res.json(list)
    } catch (e: any) {
        res.status(404).json({ error: e.message })
    }
}

export const createUser = async (req: Request, res: Response) => {
    try {
        const newUser = await service.createUser(req.body)

        res.status(201).json(newUser)
    } catch (e: any) {
        res.status(400).json({ error: e.message })
    }
}

export const updateUser = async (req: Request, res: Response) => {
    try {

        const updatedUser = await service.updateUser(Number(req.params.id), req.body)

        res.json(updatedUser)

    } catch (e: any) {
        res.status(404).json({ error: e.message })
    }
}


export const deleteUser = async (req: Request, res: Response) => {
    try {
        const deletedUser = await service.deleteUser(Number(req.params.id))
        res.json({ message: 'usuario eliminado con exito', deletedUser })
    } catch (e: any) {
        res.status(404).json({ error: e.message })
    }
}