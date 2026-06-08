import api from "./axios";

// ← Get all products
export const getProductsService = async (
    category?: string,
    page = 1,
    limit = 10
) => {
    const params = new URLSearchParams();
    if (category && category !== "all") params.append("category", category);
    params.append("page", String(page));
    params.append("limit", String(limit));

    const response = await api.get(`/products?${params.toString()}`);
    return response.data;
};

// ← Get single product
export const getProductService = async (id: string) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
};

// ← Create product — Admin
export const createProductService = async (formData: FormData) => {
    const response = await api.post("/products", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return response.data;
};

// ← Update product — Admin
export const updateProductService = async (
    id: string,
    formData: FormData
) => {
    const response = await api.put(`/products/${id}`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return response.data;
};

// ← Delete product — Admin
export const deleteProductService = async (id: string) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
};