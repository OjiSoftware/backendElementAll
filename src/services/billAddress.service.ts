type BillAddress = {
    id: number,
    street: string,
    streetNum: number,
    floor: number,
    apartment: string,
    locality: string,
    province: string,
    reference?: string,
}

type CreateBillAddressInput = Omit<BillAddress, "id">;

type UpdateBillAddressInput = Partial<CreateBillAddressInput>;




export const getBillAddressService = (addressId: number) => {


    return [];
}

export const createBillAdressService = (data: CreateBillAddressInput) => {


    return data;
}

export const updateBillAddressService = (addressId: number, data: UpdateBillAddressInput) => {
    return [];
}


export const getProvincesService = () => {

    return [];
}
export const getLocalitiesService = (provinceId: number) => {

    return [];
}

