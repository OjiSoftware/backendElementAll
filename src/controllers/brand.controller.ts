import * as service from "../services/brand.service";

export const getBrand = async (req: any, res: any) => {
    try {
        const brand = await service.getBrand(Number(req.params.id));
        res.json(brand);
    } catch (e: any) {
        res.status(404).json({ error: e.message });
    }
};

export const listBrands = async (_req: any, res: any) => {
    try {
        const brandsList = await service.listBrands();
        res.json(brandsList);
    } catch (e: any) {
        res.status(404).json({ error: e.message });
    }
};

export const createBrand = async (req: any, res: any) => {
    try {
        const brand = await service.createBrand(req.body);
        res.status(201).json(brand);
    } catch (e: any) {
        res.status(400).json({ error: e.message });
    }
};

export const updateBrand = async (req: any, res: any) => {
    try {
        const updatedBrand = await service.updateBrand(
            Number(req.params.id),
            req.body
        );

        res.json(updatedBrand);
    } catch (e: any) {
        res.status(404).json({ error: e.message });
    }
};

export const deleteBrand = async (req: any, res: any) => {
    try {
        const deletedBrand = await service.deleteBrand(
            Number(req.params.id)
        );

        res.json(deletedBrand);
    } catch (e: any) {
        res.status(404).json({ error: e.message });
    }
};
