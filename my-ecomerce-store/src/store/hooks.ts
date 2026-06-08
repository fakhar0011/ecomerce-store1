import { useDispatch, useSelector, TypedUseSelectorHook } from "react-redux";
import type { RootState, AppDispatch } from "./index";

// useDispatch ka typed version
export const useAppDispatch = () => useDispatch<AppDispatch>();

// useSelector ka typed version
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Cart ke liye shortcut hooks
export const useCartSelector = () => useAppSelector((state) => state.cart);

// Auth ke liye shortcut hooks
export const useAuthSelector = () => useAppSelector((state) => state.auth);

// Products ke liye shortcut hooks
export const useProductSelector = () =>
  useAppSelector((state) => state.products);
