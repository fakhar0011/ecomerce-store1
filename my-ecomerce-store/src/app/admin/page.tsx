"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useAuthSelector } from "@/store/hooks";
import { toast } from "react-toastify";
import { useQuery, useMutation } from "@apollo/client/react";
import { GET_PRODUCTS, ProductsResponse } from "@/graphql/queries";
import {
  CREATE_PRODUCT,
  UPDATE_PRODUCT,
  DELETE_PRODUCT,
  CreateProductResponse,
  UpdateProductResponse,
  DeleteProductResponse,
} from "@/graphql/mutations";
import { Product } from "@/types";

interface ProductForm {
  name: string;
  price: number;
  category: string;
  stock: number;
  badge: string;
  rating: number;
  reviews: number;
}

const emptyForm: ProductForm = {
  name: "",
  price: 0,
  category: "",
  stock: 0,
  badge: "",
  rating: 0,
  reviews: 0,
};

export default function AdminPage() {
  const router = useRouter();
  const { isAdmin, isAuthenticated } = useAuthSelector();

  const {
    loading: queryLoading,
    error: queryError,
    data,
    refetch,
  } = useQuery<ProductsResponse>(GET_PRODUCTS);

  // ✅ Mutations with file upload support
  const [createProduct] = useMutation<CreateProductResponse>(CREATE_PRODUCT);
  const [updateProduct] = useMutation<UpdateProductResponse>(UPDATE_PRODUCT);
  const [deleteProduct] = useMutation<DeleteProductResponse>(DELETE_PRODUCT);

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ProductForm>({ defaultValues: emptyForm });

  useEffect(() => {
    if (!isAuthenticated) router.push("/login");
    else if (!isAdmin) router.push("/products");
  }, [isAuthenticated, isAdmin, router]);

  useEffect(() => {
    if (data?.products) {
      setProducts(data.products as Product[]);
    }
  }, [data]);

  if (!isAuthenticated || !isAdmin) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleEdit = (product: Product) => {
    setEditingId(product._id);
    setImagePreview(product.image || "");
    setImageFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
    setValue("name", product.name);
    setValue("price", product.price);
    setValue("category", product.category);
    setValue("stock", product.stock);
    setValue("badge", product.badge || "");
    setValue("rating", product.rating || 0);
    setValue("reviews", product.reviews || 0);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    setDeleteLoadingId(id);
    try {
      await deleteProduct({ variables: { id } });
      toast.success("✅ Product deleted successfully!");
      refetch();
    } catch (err: any) {
      toast.error(`❌ ${err.message}`);
    } finally {
      setDeleteLoadingId(null);
    }
  };

  const onSubmit = async (data: ProductForm) => {
    setLoading(true);
    setApiError("");

    try {
      // ✅ For edit: keep existing image URL if no new file selected
      let imageUrl = editingId
        ? products.find((p) => p._id === editingId)?.image || ""
        : "";

      const input = {
        name: data.name,
        price: Number(data.price),
        image: imageUrl,
        category: data.category,
        stock: Number(data.stock),
        badge: data.badge || "",
        rating: Number(data.rating) || 0,
        reviews: Number(data.reviews) || 0,
      };

      if (editingId) {
        // ✅ Update: pass file only if a new image is selected
        await updateProduct({
          variables: {
            id: editingId,
            input,
            file: imageFile,
          },
        });
        toast.success("✅ Product updated successfully!");
      } else {
        if (!imageFile) {
          setApiError("Please select an image");
          setLoading(false);
          return;
        }
        await createProduct({
          variables: {
            input,
            file: imageFile,
          },
        });
        toast.success("✅ Product added successfully!");
      }

      reset(emptyForm);
      setImageFile(null);
      setImagePreview("");
      setEditingId(null);
      refetch();
    } catch (err: any) {
      const errorMsg =
        err.graphQLErrors?.[0]?.message || err.message || "Operation failed";
      setApiError(errorMsg);
      toast.error(`❌ ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  // ---------- JSX ----------
  return (
    <main className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {editingId ? "Edit Product" : "Add New Product"}
            </h1>
            <p className="text-gray-500 mt-1">
              {editingId
                ? "Update product details"
                : "Add a new product to store"}
            </p>
          </div>
          {editingId && (
            <button
              onClick={() => {
                setEditingId(null);
                reset(emptyForm);
                setImagePreview("");
                setImageFile(null);
              }}
              className="text-sm text-red-500 border border-red-300 px-4 py-2 rounded-xl hover:bg-red-50 transition"
            >
              Cancel Edit
            </button>
          )}
        </div>

        {apiError && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6">
            ❌ {apiError}
          </div>
        )}

        {/* Form */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-10">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-5"
          >
            {/* Image Upload */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Product Image {!editingId && "*"}
              </label>
              <label
                htmlFor="image-upload"
                className="flex flex-col items-center justify-center w-full h-52 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition overflow-hidden"
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-6">
                    <p className="text-5xl mb-3">📁</p>
                    <p className="text-sm font-medium text-gray-600">
                      Click to upload product image
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      JPG, PNG, WEBP, AVIF — Max 10MB
                    </p>
                  </div>
                )}
              </label>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              {imageFile && (
                <p className="text-xs text-gray-500 mt-2">
                  ✅ Selected: {imageFile.name}
                </p>
              )}
            </div>

            {/* Name */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Product Name *
              </label>
              <input
                type="text"
                placeholder="iPhone 14 Pro Max"
                {...register("name", {
                  required: "Product name required",
                  minLength: { value: 2, message: "Minimum 2 characters" },
                })}
                className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                  errors.name ? "border-red-400 bg-red-50" : "border-gray-300"
                }`}
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Price & Stock */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Price (Rs) *
                </label>
                <input
                  type="number"
                  placeholder="4500"
                  {...register("price", {
                    required: "Price required",
                    min: { value: 1, message: "Price must be >0" },
                  })}
                  className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                    errors.price
                      ? "border-red-400 bg-red-50"
                      : "border-gray-300"
                  }`}
                />
                {errors.price && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.price.message}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Stock *
                </label>
                <input
                  type="number"
                  placeholder="10"
                  {...register("stock", {
                    required: "Stock required",
                    min: { value: 0, message: "Stock cannot be negative" },
                  })}
                  className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                    errors.stock
                      ? "border-red-400 bg-red-50"
                      : "border-gray-300"
                  }`}
                />
                {errors.stock && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.stock.message}
                  </p>
                )}
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Category *
              </label>
              <select
                {...register("category", { required: "Category required" })}
                className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                  errors.category
                    ? "border-red-400 bg-red-50"
                    : "border-gray-300"
                }`}
              >
                <option value="">Select Category</option>
                <option value="electronics">Electronics</option>
                <option value="fashion">Fashion</option>
                <option value="clothing">Clothing</option>
                <option value="accessories">Accessories</option>
              </select>
              {errors.category && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.category.message}
                </p>
              )}
            </div>

            {/* Badge */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Badge (Optional)
              </label>
              <input
                type="text"
                placeholder="Exclusive, New, Hot, Sale"
                {...register("badge")}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            {/* Rating & Reviews */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Rating (0-5)
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="4.5"
                  {...register("rating", { min: 0, max: 5 })}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Reviews Count
                </label>
                <input
                  type="number"
                  placeholder="128"
                  {...register("reviews", { min: 0 })}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl font-medium text-sm transition ${
                loading
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : editingId
                    ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                    : "bg-gray-900 hover:bg-gray-700 text-white"
              }`}
            >
              {loading
                ? "⏳ Processing..."
                : editingId
                  ? "Update Product →"
                  : "Add Product →"}
            </button>
          </form>
        </div>

        {/* Products List */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            All Products ({products.length})
          </h2>
          <div className="flex flex-col gap-4">
            {products.map((product) => (
              <div
                key={product._id}
                className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-4"
              >
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">
                      🛍️
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {product.name}
                  </p>
                  <p className="text-sm text-gray-500 capitalize">
                    {product.category} • Rs {product.price.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-400">
                    Stock: {product.stock}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="px-3 py-1.5 text-xs font-medium border border-indigo-300 text-indigo-600 rounded-lg hover:bg-indigo-50 transition"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product._id)}
                    disabled={deleteLoadingId === product._id}
                    className="px-3 py-1.5 text-xs font-medium border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition disabled:opacity-50"
                  >
                    {deleteLoadingId === product._id ? "..." : "🗑️ Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
